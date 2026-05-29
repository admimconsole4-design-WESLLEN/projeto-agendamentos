import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarCheck, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Reservation, Equipment, Period } from "@/lib/supabase";

interface OccupiedTimeSlotsProps {
  reservations: Reservation[];
  equipments: Equipment[];
  periods: Period[];
  selectedDate: Date;
}

interface GroupedReservation {
  equipmentId: string;
  equipmentName: string;
  personName: string;
  lessons: Array<{ periodId: string; lessonNumber: number; periodName: string; lessonLabel: string }>;
}

export const OccupiedTimeSlots = ({ reservations, equipments, periods, selectedDate }: OccupiedTimeSlotsProps) => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("all");

  const getPeriodName = (periodId: string) => {
    const period = periods.find(p => p.id === periodId);
    return period?.name || '';
  };

  const getLessonLabel = (periodId: string, lessonNumber: number) => {
    const period = periods.find(p => p.id === periodId);
    const lesson = period?.lessons?.find(l => l.lessonNumber === lessonNumber);
    return lesson?.label || `${lessonNumber}ª aula`;
  };

  // Filtrar reservas por equipamento selecionado
  const filteredReservations = selectedEquipmentId === "all" 
    ? reservations 
    : reservations.filter(r => r.equipmentId === selectedEquipmentId);

  // Agrupar reservas por equipamento e pessoa
  const groupedReservations = filteredReservations.reduce((acc, reservation) => {
    const equipment = equipments.find(e => e.id === reservation.equipmentId);
    if (!equipment) return acc;

    const key = `${reservation.equipmentId}-${reservation.name}`;
    
    if (!acc[key]) {
      acc[key] = {
        equipmentId: reservation.equipmentId,
        equipmentName: equipment.name,
        personName: reservation.name,
        lessons: []
      };
    }

    acc[key].lessons.push({
      periodId: reservation.periodId,
      lessonNumber: reservation.lessonNumber,
      periodName: getPeriodName(reservation.periodId),
      lessonLabel: getLessonLabel(reservation.periodId, reservation.lessonNumber)
    });

    return acc;
  }, {} as Record<string, GroupedReservation>);

  // Ordenar as aulas dentro de cada grupo
  Object.values(groupedReservations).forEach(group => {
    group.lessons.sort((a, b) => {
      const periodA = periods.find(p => p.id === a.periodId);
      const periodB = periods.find(p => p.id === b.periodId);
      const orderA = (periodA?.order || 0) * 100 + a.lessonNumber;
      const orderB = (periodB?.order || 0) * 100 + b.lessonNumber;
      return orderA - orderB;
    });
  });

  const groupedList = Object.values(groupedReservations);

  const dateLabel = format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-primary/5 pb-3 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center text-primary text-base sm:text-lg">
              <CalendarCheck className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Horários Agendados
            </CardTitle>
            <CardDescription className="mt-1 capitalize">
              {dateLabel} &mdash;{" "}
              {filteredReservations.length > 0
                ? `${filteredReservations.length} aula(s) reservada(s)`
                : "Nenhuma aula reservada"}
            </CardDescription>
          </div>
          <div className="w-full sm:w-56">
            <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por equipamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Equipamentos</SelectItem>
                {equipments.map((equipment) => (
                  <SelectItem key={equipment.id} value={equipment.id}>
                    {equipment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {groupedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
            <Clock className="h-8 w-8 opacity-30" />
            <p className="text-sm">
              {selectedEquipmentId === "all"
                ? "Nenhuma aula reservada nesta data"
                : "Nenhuma aula reservada para este equipamento nesta data"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {groupedList.map((group, idx) => {
              const lessonsByPeriod = group.lessons.reduce((acc, lesson) => {
                if (!acc[lesson.periodName]) {
                  acc[lesson.periodName] = [];
                }
                acc[lesson.periodName].push(lesson.lessonNumber);
                return acc;
              }, {} as Record<string, number[]>);

              const periodStrings = Object.entries(lessonsByPeriod).map(([periodName, lessonNumbers]) => {
                lessonNumbers.sort((a, b) => a - b);
                const lessonsList = lessonNumbers.map(n => `${n}ª`).join(', ');
                return `${periodName}: ${lessonsList}`;
              });

              return (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{group.equipmentName}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{group.personName}</p>
                    </div>
                    <div className="text-right text-xs shrink-0">
                      {periodStrings.map((str, i) => (
                        <p key={i} className="text-amber-600 font-medium">{str}</p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
