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

// === PERIODS ===

export const getPeriods = async () => {
  return await apiRequest('/api/periods');
};

// === LESSONS ===

export const getLessons = async () => {
  return await apiRequest('/api/lessons');
};

export const getLessonsByPeriod = async (periodId: string) => {
  return await apiRequest(`/api/lessons/period/${periodId}`);
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
  periodId: string,
  lessonNumber: number
) => {
  return await apiRequest('/api/reservations', {
    method: 'POST',
    body: JSON.stringify({
      equipmentId,
      name,
      date,
      periodId,
      lessonNumber
    }),
  });
};

export const createBatchReservations = async (
  equipmentId: string,
  name: string,
  date: string,
  reservations: Array<{ periodId: string; lessonNumber: number }>
) => {
  return await apiRequest('/api/reservations/batch', {
    method: 'POST',
    body: JSON.stringify({
      equipmentId,
      name,
      date,
      reservations
    }),
  });
};

export const deleteReservation = async (id: string) => {
  return await apiRequest(`/api/reservations/${id}`, {
    method: 'DELETE',
  });
};

export const checkLessonAvailability = async (
  equipmentId: string,
  date: string,
  periodId: string,
  lessonNumber: number
) => {
  const result = await apiRequest('/api/check-availability', {
    method: 'POST',
    body: JSON.stringify({
      equipmentId,
      date,
      periodId,
      lessonNumber
    }),
  });
  return result.available;
};
