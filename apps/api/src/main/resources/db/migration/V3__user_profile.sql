CREATE TABLE user_profile (
    id                  BIGSERIAL    PRIMARY KEY,
    user_id             BIGINT       NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    display_name        VARCHAR(100),
    bio                 VARCHAR(500),
    progress_public     BOOLEAN      NOT NULL DEFAULT TRUE,
    streak_public       BOOLEAN      NOT NULL DEFAULT TRUE,
    lists_public        BOOLEAN      NOT NULL DEFAULT FALSE,
    notes_public        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_date        TIMESTAMP    NOT NULL,
    last_modified_date  TIMESTAMP    NOT NULL
);
