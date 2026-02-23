-- Prevent duplicate attempt numbers per user per problem.
-- A pessimistic row-lock on the problem record in application code serialises
-- concurrent inserts, but this constraint is the last line of defence.
ALTER TABLE attempts
    ADD CONSTRAINT uq_attempt_problem_user_number
        UNIQUE (problem_id, user_id, attempt_number);
