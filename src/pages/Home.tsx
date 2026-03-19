import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { EquipmentCard } from "@/components/EquipmentCard";
import { ReservationModal } from "@/components/ReservationModal";

import { CalendarReservationModal } from "@/components/CalendarReservationModal";
import { OccupiedTimeSlots } from "@/components/OccupiedTimeSlots";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { CalendarDays, Settings } from "lucide-react";
import { ManageEquipmentModal } from "@/components/ManageEquipmentModal";
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
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [equipmentsWithReservations, setEquipmentsWithReservations] = useState<Set<string>>(new Set());
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  
  const [calendarReservationModalOpen, setCalendarReservationModalOpen] = useState(false);
  const [deleteEquipmentModalOpen, setDeleteEquipmentModalOpen] = useState(false);
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
      // Load all reservations (not filtered by date) for the management modal
      const allReservationsData = await getReservations();
      
      // Filter for the selected date for display
      const dateStr = format(date, "yyyy-MM-dd");
      const now = new Date();
      const today = format(now, "yyyy-MM-dd");
      const currentTime = format(now, "HH:mm:ss");
      
      const dateFilteredReservations = allReservationsData.filter(r => r.date === dateStr);
      
      const activeReservations = dateFilteredReservations.filter(reservation => {
        // Se a data selecionada é hoje, verificar se o horário já passou
        if (dateStr === today) {
          return reservation.endTime > currentTime;
        }
        // Se é data futura, todas as reservas são ativas
        return true;
      });
      
      setReservations(activeReservations);
      setAllReservations(allReservationsData);
      
      // Marcar equipamentos que têm alguma reserva (parcialmente ocupados)
      const occupiedIds = new Set<string>(activeReservations.map(r => r.equipmentId));
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
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <img 
                src={logoEscola} 
                alt="Brasão da Escola Municipal Antônio José da Rocha" 
                className="h-12 sm:h-16 w-auto rounded-lg shadow-lg"
              />
              <div className="text-primary-foreground text-center sm:text-left">
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
                  Escola Municipal Antônio José da Rocha
                </h1>
                <p className="text-secondary text-xs sm:text-sm font-medium">
                  Sistema de Reserva de Equipamentos
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setDeleteEquipmentModalOpen(true)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full sm:w-auto"
              size="sm"
            >
              <Settings className="mr-2 h-4 w-4" />
              Gerenciar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-1 order-1 lg:order-1">
            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-primary/5 p-4 sm:p-6">
                <CardTitle className="flex items-center text-primary text-base sm:text-lg">
                  <CalendarDays className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Selecione a Data
                </CardTitle>
                <CardDescription className="text-sm">
                  Escolha uma data para ver a disponibilidade
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 p-3 sm:p-6">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-md border border-primary/20"
                    locale={ptBR}
                  />
                </div>
                
                <p className="text-xs text-muted-foreground mt-2 text-center sm:text-left">
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
              <div className="mt-4 sm:mt-6">
                <OccupiedTimeSlots
                  reservations={reservations}
                  equipments={equipments}
                  selectedDate={date}
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-2 order-2 lg:order-2">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-primary">
                Equipamentos
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Selecione um equipamento para reservar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                <CardContent className="py-8 sm:py-12 text-center">
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Nenhum equipamento cadastrado. Clique no botão "Adicionar Equipamento" para começar.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="school-header border-t-4 border-secondary mt-auto py-3 sm:py-4">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <p className="text-xs sm:text-sm">
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


      <CalendarReservationModal
        open={calendarReservationModalOpen}
        onClose={() => setCalendarReservationModalOpen(false)}
        selectedDate={date}
        equipments={equipments}
        onSubmit={handleCreateReservation}
      />

      <ManageEquipmentModal
        isOpen={deleteEquipmentModalOpen}
        onClose={() => setDeleteEquipmentModalOpen(false)}
        equipments={equipments}
        reservations={allReservations}
        onEquipmentChanged={loadData}
      />
    </div>
  );
};

export default Home;
