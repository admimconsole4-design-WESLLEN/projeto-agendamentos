export * from './api';

export type Equipment = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TimeSlot = {
  id: string;
  startTime: string;
  endTime: string;
  label: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Reservation = {
  id: string;
  equipmentId: string;
  name: string;
  phone: string | null;
  date: string;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
  equipment?: Equipment;
};
