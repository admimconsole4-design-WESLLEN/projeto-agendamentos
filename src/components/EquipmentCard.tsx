import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import type { Equipment } from "@/lib/supabase";

interface EquipmentCardProps {
  equipment: Equipment;
  hasReservations: boolean;
  isInactive?: boolean;
  onReserve: (equipment: Equipment) => void;
}

export const EquipmentCard = ({ equipment, hasReservations, isInactive = false, onReserve }: EquipmentCardProps) => {
  return (
    <Card
      className={`transition-shadow border-2 ${
        isInactive
          ? "border-muted opacity-55 grayscale"
          : "border-primary/20 hover:border-secondary hover:shadow-lg"
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-primary">{equipment.name}</CardTitle>
            {equipment.description && (
              <CardDescription className="mt-2">{equipment.description}</CardDescription>
            )}
          </div>
          {isInactive ? (
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              Inativo
            </Badge>
          ) : (
            <Badge
              variant={hasReservations ? "secondary" : "default"}
              className={hasReservations ? "bg-secondary text-secondary-foreground" : "bg-available text-available-foreground"}
            >
              {hasReservations ? "Parcialmente Ocupado" : "Livre"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => onReserve(equipment)}
          disabled={isInactive}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Reservar
        </Button>
      </CardContent>
    </Card>
  );
};
