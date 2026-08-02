-- Move authentication from Keycloak to locally issued JWTs.
--
-- The external identity provider is dropped, but the column that linked a user
-- row to their identity is kept and renamed. Existing rows keep their current
-- value as their token subject, so no data is orphaned and no re-linking is
-- needed at cutover.

ALTER TABLE users RENAME COLUMN keycloak_id TO subject_id;
ALTER INDEX idx_user_keycloak_id RENAME TO idx_user_subject_id;

ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);

-- Accounts that predate local auth have no password and cannot log in until one
-- is set. Email is the login identifier, so it must be unique where present.
CREATE UNIQUE INDEX idx_user_email_lower
    ON users (LOWER(email))
    WHERE email IS NOT NULL;

-- Refresh tokens are stored as SHA-256 digests: a database read cannot be
-- replayed as a valid token. Rotation is recorded via replaced_by so that
-- reuse of an already-rotated token is detectable.
CREATE TABLE refresh_tokens (
    id                 BIGSERIAL PRIMARY KEY,
    user_id            BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash         VARCHAR(64)  NOT NULL,
    expires_at         TIMESTAMP    NOT NULL,
    revoked_at         TIMESTAMP,
    replaced_by        VARCHAR(64),
    created_date       TIMESTAMP    NOT NULL,
    last_modified_date TIMESTAMP    NOT NULL
);

CREATE UNIQUE INDEX idx_refresh_token_hash ON refresh_tokens (token_hash);
CREATE INDEX idx_refresh_token_user ON refresh_tokens (user_id);
