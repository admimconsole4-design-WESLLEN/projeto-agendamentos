import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { EquipmentCard } from "@/components/EquipmentCard";
import { ReservationModal } from "@/components/ReservationModal";
import { AddEquipmentModal } from "@/components/AddEquipmentModal";
import { CalendarReservationModal } from "@/components/CalendarReservationModal";
import { OccupiedTimeSlots } from "@/components/OccupiedTimeSlots";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { CalendarDays, Plus } from "lucide-react";
import logoEscola from "@/assets/logo-escola.jpg";
import {
  getEquipments,
  getReservations,
  createReservation,
  createEquipment,
  type Equipment,
  type Reservation,
} from "@/lib/supabase";
import { toast } from "sonner";

const Home = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [equipmentsWithReservations, setEquipmentsWithReservations] = useState<Set<string>>(new Set());
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [addEquipmentModalOpen, setAddEquipmentModalOpen] = useState(false);
  const [calendarReservationModalOpen, setCalendarReservationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastClickTime = useRef<number>(0);
  const lastClickedDate = useRef<Date | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (date) {
      loadReservations();
    }
  }, [date, equipments]);

  const loadData = async () => {
    try {
      const equipmentsData = await getEquipments();
      setEquipments(equipmentsData);
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const reservationsData = await getReservations(dateStr);
      
      // Filtrar apenas reservas ativas (que ainda não passaram)
      const now = new Date();
      const today = format(now, "yyyy-MM-dd");
      const currentTime = format(now, "HH:mm:ss");
      
      const activeReservations = reservationsData.filter(reservation => {
        // Se a data selecionada é hoje, verificar se o horário já passou
        if (dateStr === today) {
          return reservation.end_time > currentTime;
        }
        // Se é data futura, todas as reservas são ativas
        return true;
      });
      
      setReservations(activeReservations);
      
      // Marcar equipamentos que têm alguma reserva (parcialmente ocupados)
      const occupiedIds = new Set(activeReservations.map(r => r.equipment_id));
      setEquipmentsWithReservations(occupiedIds);
    } catch (error: any) {
      toast.error("Erro ao carregar reservas: " + error.message);
    }
  };

  const handleReserve = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setReservationModalOpen(true);
  };

  const handleCreateReservation = async (data: {
    equipmentId: string;
    name: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => {
    await createReservation(
      data.equipmentId,
      data.name,
      data.date,
      data.startTime,
      data.endTime
    );
    await loadReservations();
  };

  const handleAddEquipment = async (name: string, description?: string) => {
    await createEquipment(name, description);
    await loadData();
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    
    const now = Date.now();
    const isSameDate = lastClickedDate.current && 
      format(lastClickedDate.current, "yyyy-MM-dd") === format(newDate, "yyyy-MM-dd");
    
    // Detectar duplo clique (menos de 300ms entre cliques na mesma data)
    if (isSameDate && now - lastClickTime.current < 300) {
      setCalendarReservationModalOpen(true);
    }
    
    lastClickTime.current = now;
    lastClickedDate.current = newDate;
    setDate(newDate);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="school-header border-b-4 border-secondary">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={logoEscola} 
                alt="Brasão da Escola Municipal Antônio José da Rocha" 
                className="h-16 w-auto rounded-lg shadow-lg"
              />
              <div className="text-primary-foreground">
                <h1 className="text-2xl font-bold tracking-tight">
                  Escola Municipal Antônio José da Rocha
                </h1>
                <p className="text-secondary text-sm font-medium">
                  Sistema de Reserva de Equipamentos
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setAddEquipmentModalOpen(true)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Equipamento
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center text-primary">
                  <CalendarDays className="mr-2 h-5 w-5" />
                  Selecione a Data
                </CardTitle>
                <CardDescription>
                  Escolha uma data para ver a disponibilidade
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border border-primary/20"
                  locale={ptBR}
                />
                
                <p className="text-xs text-muted-foreground mt-2">
                  Duplo clique na data para agendar
                </p>
                
                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold text-sm text-primary">Legenda:</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-available"></div>
                    <span className="text-sm">Livre</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                    <span className="text-sm">Parcialmente Ocupado</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {reservations.length > 0 && (
              <div className="mt-6">
                <OccupiedTimeSlots
                  reservations={reservations}
                  equipments={equipments}
                  selectedDate={date}
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-primary">
                Equipamentos
              </h2>
              <p className="text-muted-foreground">
                Selecione um equipamento para reservar. Verifique os horários ocupados ao lado.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {equipments.map((equipment) => (
                <EquipmentCard
                  key={equipment.id}
                  equipment={equipment}
                  hasReservations={equipmentsWithReservations.has(equipment.id)}
                  onReserve={handleReserve}
                />
              ))}
            </div>

            {equipments.length === 0 && (
              <Card className="border-2 border-dashed border-primary/30">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Nenhum equipamento cadastrado. Clique no botão "Adicionar Equipamento" para começar.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="school-header border-t-4 border-secondary mt-auto py-4">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <p className="text-sm">
            Escola Municipal Antônio José da Rocha - Major Sales/RN
          </p>
          <p className="text-xs text-secondary mt-1">
            Ensino Fundamental
          </p>
        </div>
      </footer>

      <ReservationModal
        open={reservationModalOpen}
        onClose={() => setReservationModalOpen(false)}
        equipment={selectedEquipment}
        onSubmit={handleCreateReservation}
      />

      <AddEquipmentModal
        open={addEquipmentModalOpen}
        onClose={() => setAddEquipmentModalOpen(false)}
        onSubmit={handleAddEquipment}
      />

      <CalendarReservationModal
        open={calendarReservationModalOpen}
        onClose={() => setCalendarReservationModalOpen(false)}
        selectedDate={date}
        equipments={equipments}
        onSubmit={handleCreateReservation}
      />
    </div>
  );
};

export default Home;
