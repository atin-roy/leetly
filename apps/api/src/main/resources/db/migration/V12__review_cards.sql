-- V12__review_cards.sql

CREATE TABLE review_cards (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    problem_id      BIGINT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    state           VARCHAR(20) NOT NULL DEFAULT 'NEW',
    stability       DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    difficulty      DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    due             TIMESTAMP NOT NULL DEFAULT now(),
    last_review     TIMESTAMP,
    reps            INT NOT NULL DEFAULT 0,
    lapses          INT NOT NULL DEFAULT 0,
    scheduled_days  INT NOT NULL DEFAULT 0,
    elapsed_days    INT NOT NULL DEFAULT 0,
    created_date    TIMESTAMP NOT NULL DEFAULT now(),
    last_modified_date TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_review_card_problem_user UNIQUE (problem_id, user_id)
);

CREATE INDEX idx_review_cards_user_due ON review_cards (user_id, due);
CREATE INDEX idx_review_cards_user_state ON review_cards (user_id, state);

CREATE TABLE review_logs (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    review_card_id  BIGINT NOT NULL REFERENCES review_cards(id) ON DELETE CASCADE,
    rating          VARCHAR(10) NOT NULL,
    state           VARCHAR(20) NOT NULL,
    stability       DOUBLE PRECISION NOT NULL,
    difficulty      DOUBLE PRECISION NOT NULL,
    elapsed_days    INT NOT NULL,
    scheduled_days  INT NOT NULL,
    review_type     VARCHAR(20) NOT NULL,
    attempt_id      BIGINT REFERENCES attempts(id) ON DELETE SET NULL,
    reviewed_at     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_review_logs_card ON review_logs (review_card_id);
