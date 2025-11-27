-- Corrigir função update_updated_at_column com search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Corrigir função check_reservation_conflict com search_path
CREATE OR REPLACE FUNCTION public.check_reservation_conflict(
  p_equipment_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_reservation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;