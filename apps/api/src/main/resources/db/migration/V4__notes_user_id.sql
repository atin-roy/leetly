-- Add user ownership to notes (NOT NULL is safe: table has 0 rows in production)
ALTER TABLE notes ADD COLUMN user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE;
CREATE INDEX idx_notes_user_id ON notes (user_id);
