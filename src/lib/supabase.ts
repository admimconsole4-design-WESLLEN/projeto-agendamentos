export * from './api';

export type Equipment = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Period = {
  id: string;
  name: string;
  order: number;
  lessons?: Lesson[];
  createdAt: Date;
  updatedAt: Date;
};

export type Lesson = {
  id: string;
  periodId: string;
  lessonNumber: number;
  label: string;
  order: number;
  period?: Period;
  createdAt: Date;
  updatedAt: Date;
};

export type Reservation = {
  id: string;
  equipmentId: string;
  name: string;
  phone: string | null;
  date: string;
  periodId: string;
  lessonNumber: number;
  createdAt: Date;
  updatedAt: Date;
  equipment?: Equipment;
};
