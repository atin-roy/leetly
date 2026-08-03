-- The ai_review columns were never surfaced in any UI (no form wrote to them,
-- no view read them); the write-only endpoint had no caller. Dropping as dead scope.
ALTER TABLE problems DROP COLUMN IF EXISTS ai_review;
ALTER TABLE attempts DROP COLUMN IF EXISTS ai_review;
