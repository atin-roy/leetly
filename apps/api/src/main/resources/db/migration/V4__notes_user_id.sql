-- Add user ownership to notes (nullable to preserve any existing rows)
ALTER TABLE notes ADD COLUMN user_id BIGINT REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX idx_notes_user_id ON notes (user_id);
