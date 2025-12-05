import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { Reservation, Equipment } from "@/lib/supabase";
import { format } from "date-fns";

interface OccupiedTimeSlotsProps {
  reservations: Reservation[];
  equipments: Equipment[];
  selectedDate: Date;
}

export const OccupiedTimeSlots = ({ reservations, equipments, selectedDate }: OccupiedTimeSlotsProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base">
          <Clock className="mr-2 h-4 w-4" />
          Horários Ocupados
        </CardTitle>
        <CardDescription>
          {format(selectedDate, "dd/MM/yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {reservations.map((reservation) => {
            const equipment = equipments.find(e => e.id === reservation.equipment_id);
            return (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-2 rounded-lg border border-amber-500/30 bg-amber-500/10"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{equipment?.name}</p>
                  <p className="text-xs text-muted-foreground">{reservation.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-600">
                    {reservation.start_time.substring(0, 5)} - {reservation.end_time.substring(0, 5)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
