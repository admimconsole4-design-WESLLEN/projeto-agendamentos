-- =============================================
-- MIGRAÇÃO: Sistema de Agendamento de Equipamentos
-- Execute este SQL no Supabase: SQL Editor > New query
-- =============================================

-- Tabela de períodos (Manhã, Tarde, Noite)
CREATE TABLE IF NOT EXISTS periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de aulas (vinculadas ao período)
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  label TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de equipamentos
CREATE TABLE IF NOT EXISTS equipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de reservas
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  date DATE NOT NULL,
  period_id UUID NOT NULL REFERENCES periods(id),
  lesson_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Garante que o mesmo equipamento não pode ser reservado duas vezes na mesma aula/dia
  UNIQUE(equipment_id, date, period_id, lesson_number)
);

-- Permitir acesso público (sem autenticação) via anon key
ALTER TABLE periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_periods" ON periods FOR SELECT USING (true);
CREATE POLICY "public_read_lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "public_all_equipments" ON equipments FOR ALL USING (true);
CREATE POLICY "public_all_reservations" ON reservations FOR ALL USING (true);

-- =============================================
-- DADOS INICIAIS: Períodos e Aulas
-- Ajuste os horários conforme a grade da sua escola
-- =============================================

WITH manha AS (
  INSERT INTO periods (name, "order") VALUES ('Manhã', 1) RETURNING id
),
tarde AS (
  INSERT INTO periods (name, "order") VALUES ('Tarde', 2) RETURNING id
),
noite AS (
  INSERT INTO periods (name, "order") VALUES ('Noite', 3) RETURNING id
)
INSERT INTO lessons (period_id, lesson_number, label, "order")
SELECT id, 1, '1ª Aula', 1 FROM manha UNION ALL
SELECT id, 2, '2ª Aula', 2 FROM manha UNION ALL
SELECT id, 3, '3ª Aula', 3 FROM manha UNION ALL
SELECT id, 4, '4ª Aula', 4 FROM manha UNION ALL
SELECT id, 5, '5ª Aula', 5 FROM manha UNION ALL
SELECT id, 1, '1ª Aula', 1 FROM tarde UNION ALL
SELECT id, 2, '2ª Aula', 2 FROM tarde UNION ALL
SELECT id, 3, '3ª Aula', 3 FROM tarde UNION ALL
SELECT id, 4, '4ª Aula', 4 FROM tarde UNION ALL
SELECT id, 5, '5ª Aula', 5 FROM tarde UNION ALL
SELECT id, 1, '1ª Aula', 1 FROM noite UNION ALL
SELECT id, 2, '2ª Aula', 2 FROM noite UNION ALL
SELECT id, 3, '3ª Aula', 3 FROM noite UNION ALL
SELECT id, 4, '4ª Aula', 4 FROM noite UNION ALL
SELECT id, 5, '5ª Aula', 5 FROM noite;
