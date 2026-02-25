-- Scope problems to their owner user to prevent cross-account data sharing.
ALTER TABLE problems
    ADD COLUMN user_id BIGINT REFERENCES users (id) ON DELETE CASCADE;

CREATE INDEX idx_problem_user_id ON problems (user_id);

DROP INDEX IF EXISTS idx_problem_leetcode_id;

-- Build (problem, user) ownership pairs from all user-scoped relations.
CREATE TEMP TABLE problem_owner_pairs AS
SELECT DISTINCT a.problem_id, a.user_id
FROM attempts a
UNION
SELECT DISTINCT n.problem_id, n.user_id
FROM notes n
WHERE n.problem_id IS NOT NULL
UNION
SELECT DISTINCT plp.problem_id, pl.user_id
FROM problem_list_problems plp
JOIN problem_lists pl ON pl.id = plp.problem_list_id;

CREATE TEMP TABLE problem_id_map (
    old_problem_id BIGINT NOT NULL,
    user_id        BIGINT NOT NULL,
    new_problem_id BIGINT NOT NULL,
    PRIMARY KEY (old_problem_id, user_id)
);

-- Keep one original row per old problem and assign it to one owner.
WITH chosen_owner AS (
    SELECT problem_id AS old_problem_id, MIN(user_id) AS user_id
    FROM problem_owner_pairs
    GROUP BY problem_id
)
UPDATE problems p
SET user_id = c.user_id
FROM chosen_owner c
WHERE p.id = c.old_problem_id;

INSERT INTO problem_id_map (old_problem_id, user_id, new_problem_id)
SELECT c.old_problem_id, c.user_id, c.old_problem_id
FROM (
    SELECT problem_id AS old_problem_id, MIN(user_id) AS user_id
    FROM problem_owner_pairs
    GROUP BY problem_id
) c;

-- Clone problems for additional owners that previously shared the same row.
CREATE TEMP TABLE problem_extra_owners AS
SELECT pop.problem_id AS old_problem_id, pop.user_id
FROM problem_owner_pairs pop
LEFT JOIN problem_id_map m
    ON m.old_problem_id = pop.problem_id
   AND m.user_id = pop.user_id
WHERE m.old_problem_id IS NULL;

INSERT INTO problems (
    leetcode_id,
    title,
    url,
    difficulty,
    status,
    user_id,
    created_date,
    last_modified_date
)
SELECT
    p.leetcode_id,
    p.title,
    p.url,
    p.difficulty,
    p.status,
    e.user_id,
    p.created_date,
    p.last_modified_date
FROM problem_extra_owners e
JOIN problems p ON p.id = e.old_problem_id;

INSERT INTO problem_id_map (old_problem_id, user_id, new_problem_id)
SELECT
    e.old_problem_id,
    e.user_id,
    p_new.id AS new_problem_id
FROM problem_extra_owners e
JOIN problems p_old ON p_old.id = e.old_problem_id
JOIN problems p_new
    ON p_new.user_id = e.user_id
   AND p_new.leetcode_id = p_old.leetcode_id;

-- Copy topics/patterns from original problems to cloned problems.
INSERT INTO problem_topics (problem_id, topic_id)
SELECT m.new_problem_id, pt.topic_id
FROM problem_id_map m
JOIN problem_topics pt ON pt.problem_id = m.old_problem_id
WHERE m.new_problem_id <> m.old_problem_id
ON CONFLICT DO NOTHING;

INSERT INTO problem_patterns (problem_id, pattern_id)
SELECT m.new_problem_id, pp.pattern_id
FROM problem_id_map m
JOIN problem_patterns pp ON pp.problem_id = m.old_problem_id
WHERE m.new_problem_id <> m.old_problem_id
ON CONFLICT DO NOTHING;

-- Repoint attempts/notes/list links to the user-owned problem rows.
UPDATE attempts a
SET problem_id = m.new_problem_id
FROM problem_id_map m
WHERE a.problem_id = m.old_problem_id
  AND a.user_id = m.user_id
  AND a.problem_id <> m.new_problem_id;

UPDATE notes n
SET problem_id = m.new_problem_id
FROM problem_id_map m
WHERE n.problem_id = m.old_problem_id
  AND n.user_id = m.user_id
  AND n.problem_id <> m.new_problem_id;

CREATE TEMP TABLE remapped_problem_list_problems AS
SELECT DISTINCT
    plp.problem_list_id,
    m.new_problem_id AS problem_id
FROM problem_list_problems plp
JOIN problem_lists pl ON pl.id = plp.problem_list_id
JOIN problem_id_map m
    ON m.old_problem_id = plp.problem_id
   AND m.user_id = pl.user_id;

TRUNCATE TABLE problem_list_problems;

INSERT INTO problem_list_problems (problem_list_id, problem_id)
SELECT problem_list_id, problem_id
FROM remapped_problem_list_problems;

-- Rebuild related-problem edges within each user's cloned graph.
CREATE TEMP TABLE old_problem_related AS
SELECT problem_id, related_problem_id
FROM problem_related;

TRUNCATE TABLE problem_related;

INSERT INTO problem_related (problem_id, related_problem_id)
SELECT DISTINCT
    left_map.new_problem_id AS problem_id,
    right_map.new_problem_id AS related_problem_id
FROM old_problem_related r
JOIN problem_id_map left_map ON left_map.old_problem_id = r.problem_id
JOIN problem_id_map right_map ON right_map.old_problem_id = r.related_problem_id
WHERE left_map.user_id = right_map.user_id;

-- Remove any orphaned global rows that had no user ownership.
DELETE FROM problems
WHERE user_id IS NULL;

ALTER TABLE problems
    ALTER COLUMN user_id SET NOT NULL;

CREATE UNIQUE INDEX idx_problem_user_leetcode_id ON problems (user_id, leetcode_id);
