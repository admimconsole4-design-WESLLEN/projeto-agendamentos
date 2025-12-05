import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import type { Equipment } from "@/lib/supabase";

interface EquipmentCardProps {
  equipment: Equipment;
  hasReservations: boolean;
  onReserve: (equipment: Equipment) => void;
}

export const EquipmentCard = ({ equipment, hasReservations, onReserve }: EquipmentCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow border-2 border-primary/20 hover:border-secondary">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-primary">{equipment.name}</CardTitle>
            {equipment.description && (
              <CardDescription className="mt-2">{equipment.description}</CardDescription>
            )}
          </div>
          <Badge
            variant={hasReservations ? "secondary" : "default"}
            className={hasReservations ? "bg-secondary text-secondary-foreground" : "bg-available text-available-foreground"}
          >
            {hasReservations ? "Parcialmente Ocupado" : "Livre"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => onReserve(equipment)}
          className="w-full bg-primary hover:bg-primary/90"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Reservar
        </Button>
      </CardContent>
    </Card>
  );
};
