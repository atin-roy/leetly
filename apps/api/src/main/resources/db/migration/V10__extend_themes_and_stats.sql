ALTER TABLE user_stats
    ADD COLUMN IF NOT EXISTS pattern_breakdown jsonb;

INSERT INTO themes (id, name, properties, created_date, last_modified_date)
SELECT 9, 'Lagoon', '{}', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM themes WHERE id = 9);

INSERT INTO themes (id, name, properties, created_date, last_modified_date)
SELECT 10, 'Sunset', '{}', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM themes WHERE id = 10);

INSERT INTO themes (id, name, properties, created_date, last_modified_date)
SELECT 11, 'Graphite', '{}', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM themes WHERE id = 11);

INSERT INTO themes (id, name, properties, created_date, last_modified_date)
SELECT 12, 'Rose', '{}', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM themes WHERE id = 12);

SELECT setval('themes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM themes), true);
