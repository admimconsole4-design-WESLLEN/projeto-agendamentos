-- Permitir que qualquer pessoa crie equipamentos
DROP POLICY IF EXISTS "Only admins can create equipments" ON public.equipments;
DROP POLICY IF EXISTS "Only admins can update equipments" ON public.equipments;
DROP POLICY IF EXISTS "Only admins can delete equipments" ON public.equipments;

CREATE POLICY "Anyone can create equipments" 
ON public.equipments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update equipments" 
ON public.equipments 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete equipments" 
ON public.equipments 
FOR DELETE 
USING (true);

-- Tornar o campo phone opcional nas reservas
ALTER TABLE public.reservations 
ALTER COLUMN phone DROP NOT NULL;