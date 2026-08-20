-- Adiciona a 5ª Aula ao turno Noite (caso já exista no banco)
INSERT INTO lessons (period_id, lesson_number, label, "order")
SELECT id, 5, '5ª Aula', 5
FROM periods
WHERE name = 'Noite'
  AND NOT EXISTS (
    SELECT 1 FROM lessons
    WHERE period_id = periods.id AND lesson_number = 5
  );

-- =============================================
-- Exclui a 3ª, 4ª e 5ª Aula apenas do turno Manhã
-- =============================================
DELETE FROM lessons
WHERE period_id = (SELECT id FROM periods WHERE name = 'Manhã')
  AND lesson_number IN (3, 4, 5);
