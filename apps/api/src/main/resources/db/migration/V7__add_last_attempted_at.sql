ALTER TABLE problems ADD COLUMN last_attempted_at TIMESTAMP;

UPDATE problems SET last_attempted_at = (
    SELECT MAX(a.created_date) FROM attempts a WHERE a.problem_id = problems.id
);

CREATE INDEX idx_problems_last_attempted_at ON problems (last_attempted_at DESC NULLS LAST);
