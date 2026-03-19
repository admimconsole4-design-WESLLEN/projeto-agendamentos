const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function apiRequest(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || 'Erro na requisição');
  }

  return response.json();
}

// === EQUIPMENTS ===

export const getEquipments = async () => {
  return await apiRequest('/api/equipments');
};

export const createEquipment = async (name: string, description?: string) => {
  return await apiRequest('/api/equipments', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
};

export const deleteEquipment = async (id: string) => {
  return await apiRequest(`/api/equipments/${id}`, {
    method: 'DELETE',
  });
};

// === TIME SLOTS ===

export const getTimeSlots = async () => {
  return await apiRequest('/api/time-slots');
};

export const createTimeSlot = async (startTime: string, endTime: string, label?: string) => {
  return await apiRequest('/api/time-slots', {
    method: 'POST',
    body: JSON.stringify({ startTime, endTime, label }),
  });
};

export const deleteTimeSlot = async (id: string) => {
  return await apiRequest(`/api/time-slots/${id}`, {
    method: 'DELETE',
  });
};

// === RESERVATIONS ===

export const getReservations = async (date?: string) => {
  const params = date ? `?date=${encodeURIComponent(date)}` : '';
  return await apiRequest(`/api/reservations${params}`);
};

export const createReservation = async (
  equipmentId: string,
  name: string,
  date: string,
  startTime: string,
  endTime: string
) => {
  return await apiRequest('/api/reservations', {
    method: 'POST',
    body: JSON.stringify({
      equipmentId,
      name,
      date,
      startTime,
      endTime,
    }),
  });
};

export const deleteReservation = async (id: string) => {
  return await apiRequest(`/api/reservations/${id}`, {
    method: 'DELETE',
  });
};

export const checkEquipmentAvailability = async (
  equipmentId: string,
  date: string,
  startTime: string,
  endTime: string
) => {
  const result = await apiRequest('/api/check-availability', {
    method: 'POST',
    body: JSON.stringify({
      equipmentId,
      date,
      startTime,
      endTime,
    }),
  });
  return result.available;
};
