-- ============================================================
-- V1__init.sql  –  Leetly baseline schema
-- ============================================================

-- users
CREATE TABLE users (
    id                  BIGSERIAL    PRIMARY KEY,
    keycloak_id         VARCHAR(255) NOT NULL UNIQUE,
    created_date        TIMESTAMP    NOT NULL,
    last_modified_date  TIMESTAMP    NOT NULL
);
CREATE UNIQUE INDEX idx_user_keycloak_id ON users (keycloak_id);

-- themes
CREATE TABLE themes (
    id                  BIGSERIAL    PRIMARY KEY,
    name                VARCHAR(255) NOT NULL UNIQUE,
    properties          JSONB        NOT NULL,
    created_date        TIMESTAMP    NOT NULL,
    last_modified_date  TIMESTAMP    NOT NULL
);

-- topics
CREATE TABLE topics (
    id                  BIGSERIAL      PRIMARY KEY,
    name                VARCHAR(255)   NOT NULL UNIQUE,
    description         VARCHAR(1000),
    created_date        TIMESTAMP      NOT NULL,
    last_modified_date  TIMESTAMP      NOT NULL
);

-- patterns
CREATE TABLE patterns (
    id                  BIGSERIAL      PRIMARY KEY,
    name                VARCHAR(255)   NOT NULL UNIQUE,
    description         VARCHAR(1000),
    topic_id            BIGINT         REFERENCES topics (id),
    named_algorithm     BOOLEAN        NOT NULL DEFAULT FALSE,
    created_date        TIMESTAMP      NOT NULL,
    last_modified_date  TIMESTAMP      NOT NULL
);

-- problems
CREATE TABLE problems (
    id                  BIGSERIAL      PRIMARY KEY,
    leetcode_id         BIGINT         NOT NULL,
    title               VARCHAR(255)   NOT NULL,
    url                 VARCHAR(2048)  NOT NULL,
    difficulty          VARCHAR(50)    NOT NULL,
    status              VARCHAR(50)    NOT NULL,
    created_date        TIMESTAMP      NOT NULL,
    last_modified_date  TIMESTAMP      NOT NULL
);
CREATE UNIQUE INDEX idx_problem_leetcode_id ON problems (leetcode_id);

-- problem ↔ topic (many-to-many)
CREATE TABLE problem_topics (
    problem_id  BIGINT NOT NULL REFERENCES problems (id) ON DELETE CASCADE,
    topic_id    BIGINT NOT NULL REFERENCES topics   (id) ON DELETE CASCADE,
    PRIMARY KEY (problem_id, topic_id)
);

-- problem ↔ pattern (many-to-many)
CREATE TABLE problem_patterns (
    problem_id  BIGINT NOT NULL REFERENCES problems (id) ON DELETE CASCADE,
    pattern_id  BIGINT NOT NULL REFERENCES patterns (id) ON DELETE CASCADE,
    PRIMARY KEY (problem_id, pattern_id)
);

-- problem ↔ related problem (self-referencing many-to-many)
CREATE TABLE problem_related (
    problem_id          BIGINT NOT NULL REFERENCES problems (id) ON DELETE CASCADE,
    related_problem_id  BIGINT NOT NULL REFERENCES problems (id) ON DELETE CASCADE,
    PRIMARY KEY (problem_id, related_problem_id)
);

-- attempts
CREATE TABLE attempts (
    id                  BIGSERIAL      PRIMARY KEY,
    problem_id          BIGINT         NOT NULL REFERENCES problems (id) ON DELETE CASCADE,
    user_id             BIGINT         NOT NULL REFERENCES users    (id) ON DELETE CASCADE,
    attempt_number      INT            NOT NULL,
    language            VARCHAR(50)    NOT NULL,
    code                TEXT,
    outcome             VARCHAR(50)    NOT NULL,
    duration_minutes    INT,
    time_complexity     VARCHAR(255),
    space_complexity    VARCHAR(255),
    ai_review           TEXT,
    learned             TEXT,
    takeaways           TEXT,
    notes               VARCHAR(5000),
    created_date        TIMESTAMP      NOT NULL,
    last_modified_date  TIMESTAMP      NOT NULL
);
CREATE INDEX idx_attempt_problem_user ON attempts (problem_id, user_id);

-- attempt mistakes (element collection)
CREATE TABLE attempt_mistakes (
    attempt_id  BIGINT       NOT NULL REFERENCES attempts (id) ON DELETE CASCADE,
    mistake     VARCHAR(100) NOT NULL
);

-- notes
CREATE TABLE notes (
    id                  BIGSERIAL    PRIMARY KEY,
    problem_id          BIGINT       REFERENCES problems (id) ON DELETE SET NULL,
    date_time           TIMESTAMP    NOT NULL,
    tag                 VARCHAR(50)  NOT NULL,
    title               VARCHAR(255) NOT NULL,
    content             TEXT         NOT NULL,
    created_date        TIMESTAMP    NOT NULL,
    last_modified_date  TIMESTAMP    NOT NULL
);

-- user_settings (one-to-one with users)
CREATE TABLE user_settings (
    id                  BIGSERIAL    PRIMARY KEY,
    user_id             BIGINT       NOT NULL UNIQUE REFERENCES users  (id) ON DELETE CASCADE,
    preferred_language  VARCHAR(50),
    daily_goal          INT          NOT NULL DEFAULT 1,
    timezone            VARCHAR(100) NOT NULL DEFAULT 'UTC',
    theme_id            BIGINT       REFERENCES themes (id) ON DELETE SET NULL,
    created_date        TIMESTAMP    NOT NULL,
    last_modified_date  TIMESTAMP    NOT NULL
);

-- user_stats (one-to-one with users)
CREATE TABLE user_stats (
    id                        BIGSERIAL  PRIMARY KEY,
    user_id                   BIGINT     NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    total_solved              INT        NOT NULL DEFAULT 0,
    total_solved_with_help    INT        NOT NULL DEFAULT 0,
    total_mastered            INT        NOT NULL DEFAULT 0,
    total_attempted           INT        NOT NULL DEFAULT 0,
    easy_solved               INT        NOT NULL DEFAULT 0,
    medium_solved             INT        NOT NULL DEFAULT 0,
    hard_solved               INT        NOT NULL DEFAULT 0,
    total_attempts            INT        NOT NULL DEFAULT 0,
    first_attempt_solves      INT        NOT NULL DEFAULT 0,
    total_time_minutes        INT        NOT NULL DEFAULT 0,
    current_streak            INT        NOT NULL DEFAULT 0,
    longest_streak            INT        NOT NULL DEFAULT 0,
    last_solved_date          DATE,
    solved_this_week          INT        NOT NULL DEFAULT 0,
    solved_this_month         INT        NOT NULL DEFAULT 0,
    distinct_topics_covered   INT        NOT NULL DEFAULT 0,
    distinct_patterns_covered INT        NOT NULL DEFAULT 0,
    mistake_breakdown         JSONB,
    created_date              TIMESTAMP  NOT NULL,
    last_modified_date        TIMESTAMP  NOT NULL
);

-- daily_stats
CREATE TABLE daily_stats (
    id                  BIGSERIAL  PRIMARY KEY,
    user_id             BIGINT     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    date                DATE       NOT NULL,
    solved              INT        NOT NULL DEFAULT 0,
    attempted           INT        NOT NULL DEFAULT 0,
    time_minutes        INT        NOT NULL DEFAULT 0,
    created_date        TIMESTAMP  NOT NULL,
    last_modified_date  TIMESTAMP  NOT NULL
);
CREATE UNIQUE INDEX idx_daily_stat_user_date ON daily_stats (user_id, date);

-- problem_lists
CREATE TABLE problem_lists (
    id                  BIGSERIAL    PRIMARY KEY,
    user_id             BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    is_default          BOOLEAN      NOT NULL DEFAULT FALSE,
    created_date        TIMESTAMP    NOT NULL,
    last_modified_date  TIMESTAMP    NOT NULL
);

-- problem_list ↔ problem (many-to-many)
CREATE TABLE problem_list_problems (
    problem_list_id  BIGINT NOT NULL REFERENCES problem_lists (id) ON DELETE CASCADE,
    problem_id       BIGINT NOT NULL REFERENCES problems      (id) ON DELETE CASCADE,
    PRIMARY KEY (problem_list_id, problem_id)
);
