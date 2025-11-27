import { supabase } from "@/integrations/supabase/client";

export type Equipment = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type TimeSlot = {
  id: string;
  start_time: string;
  end_time: string;
  label: string | null;
  created_at: string;
  updated_at: string;
};

export type Reservation = {
  id: string;
  equipment_id: string;
  name: string;
  phone: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
};

// Funções de equipamentos
export const getEquipments = async () => {
  const { data, error } = await supabase
    .from("equipments")
    .select("*")
    .order("name");
  
  if (error) throw error;
  return data as Equipment[];
};

export const createEquipment = async (name: string, description?: string) => {
  const { data, error } = await supabase
    .from("equipments")
    .insert({ name, description })
    .select()
    .single();
  
  if (error) throw error;
  return data as Equipment;
};

export const deleteEquipment = async (id: string) => {
  const { error } = await supabase
    .from("equipments")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
};

// Funções de time slots
export const getTimeSlots = async () => {
  const { data, error } = await supabase
    .from("time_slots")
    .select("*")
    .order("start_time");
  
  if (error) throw error;
  return data as TimeSlot[];
};

export const createTimeSlot = async (startTime: string, endTime: string, label?: string) => {
  const { data, error } = await supabase
    .from("time_slots")
    .insert({ start_time: startTime, end_time: endTime, label })
    .select()
    .single();
  
  if (error) throw error;
  return data as TimeSlot;
};

export const deleteTimeSlot = async (id: string) => {
  const { error } = await supabase
    .from("time_slots")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
};

// Funções de reservas
export const getReservations = async (date?: string) => {
  let query = supabase
    .from("reservations")
    .select("*")
    .order("date")
    .order("start_time");
  
  if (date) {
    query = query.eq("date", date);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as Reservation[];
};

export const createReservation = async (
  equipmentId: string,
  name: string,
  phone: string,
  date: string,
  startTime: string,
  endTime: string
) => {
  // Verifica conflito primeiro
  const { data: conflictData, error: conflictError } = await supabase
    .rpc("check_reservation_conflict", {
      p_equipment_id: equipmentId,
      p_date: date,
      p_start_time: startTime,
      p_end_time: endTime,
    });

  if (conflictError) throw conflictError;
  
  if (conflictData) {
    throw new Error("Este equipamento já está reservado para o horário selecionado");
  }

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      equipment_id: equipmentId,
      name,
      phone,
      date,
      start_time: startTime,
      end_time: endTime,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Reservation;
};

export const deleteReservation = async (id: string) => {
  const { error } = await supabase
    .from("reservations")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
};

// Verificar disponibilidade de equipamento
export const checkEquipmentAvailability = async (
  equipmentId: string,
  date: string,
  startTime: string,
  endTime: string
) => {
  const { data, error } = await supabase
    .rpc("check_reservation_conflict", {
      p_equipment_id: equipmentId,
      p_date: date,
      p_start_time: startTime,
      p_end_time: endTime,
    });

  if (error) throw error;
  return !data; // retorna true se NÃO há conflito (disponível)
};
