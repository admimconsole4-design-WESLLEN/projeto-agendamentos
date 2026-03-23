// Detecta automaticamente a URL da API baseada na origem da requisição
function getApiBaseUrl(): string {
  // Se estiver no navegador, detecta a origem
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    
    // Se estiver acessando via ngrok, usa a URL do ngrok
    if (origin.includes('ngrok') || origin.includes('ngrok-free.dev')) {
      return origin;
    }
    
    // Se estiver acessando localmente, usa localhost ou IP local
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return 'http://localhost:3001';
    }
    
    // Se for IP local (192.168.x.x), usa o mesmo IP na porta 3001
    if (origin.match(/^http:\/\/192\.168\.\d+\.\d+/)) {
      const ip = origin.replace(/^http:\/\/([^:]+).*/, '$1');
      return `http://${ip}:3001`;
    }
  }
  
  // Fallback para variável de ambiente ou localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
}

const API_BASE_URL = getApiBaseUrl();

async function apiRequest(endpoint: string, options?: RequestInit) {
  // Recalcula a URL da API a cada requisição para suportar ambos os acessos
  const apiBaseUrl = getApiBaseUrl();
  const url = `${apiBaseUrl}${endpoint}`;
  
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
