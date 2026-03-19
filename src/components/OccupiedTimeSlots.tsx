import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
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
  const getPeriodName = (periodId: string) => {
    const period = periods.find(p => p.id === periodId);
    return period?.name || '';
  };

  const getLessonLabel = (periodId: string, lessonNumber: number) => {
    const period = periods.find(p => p.id === periodId);
    const lesson = period?.lessons?.find(l => l.lessonNumber === lessonNumber);
    return lesson?.label || `${lessonNumber}ª aula`;
  };

  // Agrupar reservas por equipamento e pessoa
  const groupedReservations = reservations.reduce((acc, reservation) => {
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base">
          <Clock className="mr-2 h-4 w-4" />
          Aulas Ocupadas
        </CardTitle>
        <CardDescription>
          {reservations.length > 0 
            ? `${reservations.length} aula(s) reservada(s)`
            : 'Nenhuma aula reservada'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {groupedList.map((group, idx) => {
            // Agrupar as aulas por período
            const lessonsByPeriod = group.lessons.reduce((acc, lesson) => {
              if (!acc[lesson.periodName]) {
                acc[lesson.periodName] = [];
              }
              acc[lesson.periodName].push(lesson.lessonNumber);
              return acc;
            }, {} as Record<string, number[]>);

            // Criar string formatada para cada período
            const periodStrings = Object.entries(lessonsByPeriod).map(([periodName, lessonNumbers]) => {
              // Ordenar números das aulas
              lessonNumbers.sort((a, b) => a - b);
              
              // Mostrar todas as aulas separadas por vírgula
              const lessonsList = lessonNumbers.map(n => `${n}ª`).join(', ');
              
              return `${periodName}: ${lessonsList}`;
            });

            return (
              <div
                key={idx}
                className="p-2 rounded-lg border border-amber-500/30 bg-amber-500/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{group.equipmentName}</p>
                    <p className="text-xs text-muted-foreground truncate">{group.personName}</p>
                  </div>
                  <div className="text-right text-xs">
                    {periodStrings.map((str, i) => (
                      <p key={i} className="text-amber-600 font-medium">{str}</p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
