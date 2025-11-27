-- Tabela de equipamentos
CREATE TABLE public.equipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de faixas horárias configuráveis
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Tabela de reservas
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipments(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_reservation_time CHECK (end_time > start_time),
  CONSTRAINT no_past_reservations CHECK (date >= CURRENT_DATE)
);

-- Índice para otimizar consultas de disponibilidade
CREATE INDEX idx_reservations_lookup ON public.reservations(equipment_id, date, start_time, end_time);

-- Habilitar RLS (público por enquanto - sem autenticação)
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Políticas públicas de leitura
CREATE POLICY "Equipments are viewable by everyone" ON public.equipments FOR SELECT USING (true);
CREATE POLICY "Time slots are viewable by everyone" ON public.time_slots FOR SELECT USING (true);
CREATE POLICY "Reservations are viewable by everyone" ON public.reservations FOR SELECT USING (true);

-- Políticas públicas de escrita
CREATE POLICY "Anyone can create reservations" ON public.reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete reservations" ON public.reservations FOR DELETE USING (true);

-- Políticas de admin para equipamentos e time slots (público por enquanto)
CREATE POLICY "Anyone can create equipments" ON public.equipments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update equipments" ON public.equipments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete equipments" ON public.equipments FOR DELETE USING (true);

CREATE POLICY "Anyone can create time slots" ON public.time_slots FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete time slots" ON public.time_slots FOR DELETE USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_equipments_updated_at
  BEFORE UPDATE ON public.equipments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON public.time_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para verificar conflitos de reserva (com lock para evitar race conditions)
CREATE OR REPLACE FUNCTION public.check_reservation_conflict(
  p_equipment_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_reservation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_exists BOOLEAN;
BEGIN
  -- Lock na tabela para evitar race condition
  LOCK TABLE public.reservations IN SHARE ROW EXCLUSIVE MODE;
  
  -- Verifica sobreposição de horários
  SELECT EXISTS (
    SELECT 1
    FROM public.reservations
    WHERE equipment_id = p_equipment_id
      AND date = p_date
      AND (p_reservation_id IS NULL OR id != p_reservation_id)
      AND NOT (end_time <= p_start_time OR start_time >= p_end_time)
  ) INTO conflict_exists;
  
  RETURN conflict_exists;
END;
$$ LANGUAGE plpgsql;

-- Seed data: faixas horárias padrão
INSERT INTO public.time_slots (start_time, end_time, label) VALUES
  ('07:00:00', '11:20:00', 'Manhã'),
  ('13:00:00', '17:00:00', 'Tarde'),
  ('18:00:00', '21:00:00', 'Noite');

-- Seed data: equipamentos exemplo
INSERT INTO public.equipments (name, description) VALUES
  ('Câmera A', 'Câmera profissional Sony Alpha'),
  ('Câmera B', 'Câmera Canon EOS R5'),
  ('Microfone 1', 'Microfone condensador Shure SM7B'),
  ('Notebook', 'MacBook Pro 16" para edição'),
  ('Tripé', 'Tripé profissional Manfrotto');