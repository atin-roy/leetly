ALTER TABLE users
    ADD COLUMN IF NOT EXISTS username VARCHAR(100),
    ADD COLUMN IF NOT EXISTS email VARCHAR(255);

CREATE TABLE IF NOT EXISTS friendships (
    id BIGSERIAL PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT NOW(),
    last_modified_date TIMESTAMP NOT NULL DEFAULT NOW(),
    user_one_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_two_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    CONSTRAINT uk_friendships_pair UNIQUE (user_one_id, user_two_id),
    CONSTRAINT chk_friendships_distinct_users CHECK (user_one_id < user_two_id),
    CONSTRAINT chk_friendships_requested_by CHECK (requested_by_id = user_one_id OR requested_by_id = user_two_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user_one ON friendships(user_one_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user_two ON friendships(user_two_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
