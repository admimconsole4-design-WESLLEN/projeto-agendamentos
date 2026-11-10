-- =============================================
-- MIGRAÇÃO: Equipamento ativo/inativo
-- Execute este SQL no Supabase: SQL Editor > New query
-- =============================================

-- Adiciona coluna de status (true = ativo, false = inativo)
ALTER TABLE equipments ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Equipamentos já cadastrados permanecem ativos
UPDATE equipments SET active = true WHERE active IS NULL;
