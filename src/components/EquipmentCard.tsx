import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import type { Equipment } from "@/lib/supabase";

interface EquipmentCardProps {
  equipment: Equipment;
  isAvailable: boolean;
  onReserve: (equipment: Equipment) => void;
}

export const EquipmentCard = ({ equipment, isAvailable, onReserve }: EquipmentCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{equipment.name}</CardTitle>
            {equipment.description && (
              <CardDescription className="mt-2">{equipment.description}</CardDescription>
            )}
          </div>
          <Badge
            variant={isAvailable ? "default" : "destructive"}
            className={isAvailable ? "bg-available" : "bg-occupied"}
          >
            {isAvailable ? "Disponível" : "Ocupado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => onReserve(equipment)}
          disabled={!isAvailable}
          className="w-full"
          variant={isAvailable ? "default" : "outline"}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {isAvailable ? "Reservar" : "Indisponível"}
        </Button>
      </CardContent>
    </Card>
  );
};
