ALTER TABLE attempts
    ADD COLUMN approach TEXT,
    ADD COLUMN started_at TIMESTAMP,
    ADD COLUMN ended_at TIMESTAMP;
