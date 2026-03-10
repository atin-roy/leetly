INSERT INTO themes (id, name, properties, created_date, last_modified_date)
VALUES
    (1, 'Default', '{}'::jsonb, NOW(), NOW()),
    (2, 'Void', '{}'::jsonb, NOW(), NOW()),
    (3, 'Ember', '{}'::jsonb, NOW(), NOW()),
    (4, 'Arctic', '{}'::jsonb, NOW(), NOW()),
    (5, 'Dusk', '{}'::jsonb, NOW(), NOW()),
    (6, 'Forest', '{}'::jsonb, NOW(), NOW()),
    (7, 'Signal', '{}'::jsonb, NOW(), NOW()),
    (8, 'Paper', '{}'::jsonb, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    properties = EXCLUDED.properties,
    last_modified_date = NOW();

SELECT setval('themes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM themes), true);
