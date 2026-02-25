-- Prevent cross-user linkage across user-owned tables.

CREATE OR REPLACE FUNCTION enforce_attempt_problem_user_match()
RETURNS trigger AS $$
DECLARE
    owner_id BIGINT;
BEGIN
    SELECT p.user_id INTO owner_id
    FROM problems p
    WHERE p.id = NEW.problem_id;

    IF owner_id IS NULL OR owner_id <> NEW.user_id THEN
        RAISE EXCEPTION 'attempt user_id must match problem owner';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_attempt_problem_user_match ON attempts;
CREATE TRIGGER trg_attempt_problem_user_match
BEFORE INSERT OR UPDATE OF problem_id, user_id ON attempts
FOR EACH ROW
EXECUTE FUNCTION enforce_attempt_problem_user_match();

CREATE OR REPLACE FUNCTION enforce_note_problem_user_match()
RETURNS trigger AS $$
DECLARE
    owner_id BIGINT;
BEGIN
    IF NEW.problem_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT p.user_id INTO owner_id
    FROM problems p
    WHERE p.id = NEW.problem_id;

    IF owner_id IS NULL OR owner_id <> NEW.user_id THEN
        RAISE EXCEPTION 'note user_id must match problem owner';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_note_problem_user_match ON notes;
CREATE TRIGGER trg_note_problem_user_match
BEFORE INSERT OR UPDATE OF problem_id, user_id ON notes
FOR EACH ROW
EXECUTE FUNCTION enforce_note_problem_user_match();

CREATE OR REPLACE FUNCTION enforce_problem_list_problem_user_match()
RETURNS trigger AS $$
DECLARE
    list_owner_id BIGINT;
    problem_owner_id BIGINT;
BEGIN
    SELECT pl.user_id INTO list_owner_id
    FROM problem_lists pl
    WHERE pl.id = NEW.problem_list_id;

    SELECT p.user_id INTO problem_owner_id
    FROM problems p
    WHERE p.id = NEW.problem_id;

    IF list_owner_id IS NULL OR problem_owner_id IS NULL OR list_owner_id <> problem_owner_id THEN
        RAISE EXCEPTION 'problem list owner must match problem owner';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_problem_list_problem_user_match ON problem_list_problems;
CREATE TRIGGER trg_problem_list_problem_user_match
BEFORE INSERT OR UPDATE OF problem_list_id, problem_id ON problem_list_problems
FOR EACH ROW
EXECUTE FUNCTION enforce_problem_list_problem_user_match();

CREATE OR REPLACE FUNCTION enforce_problem_related_user_match()
RETURNS trigger AS $$
DECLARE
    left_owner_id BIGINT;
    right_owner_id BIGINT;
BEGIN
    SELECT p.user_id INTO left_owner_id
    FROM problems p
    WHERE p.id = NEW.problem_id;

    SELECT p.user_id INTO right_owner_id
    FROM problems p
    WHERE p.id = NEW.related_problem_id;

    IF left_owner_id IS NULL OR right_owner_id IS NULL OR left_owner_id <> right_owner_id THEN
        RAISE EXCEPTION 'related problems must belong to the same user';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_problem_related_user_match ON problem_related;
CREATE TRIGGER trg_problem_related_user_match
BEFORE INSERT OR UPDATE OF problem_id, related_problem_id ON problem_related
FOR EACH ROW
EXECUTE FUNCTION enforce_problem_related_user_match();
