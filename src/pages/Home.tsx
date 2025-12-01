import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { EquipmentCard } from "@/components/EquipmentCard";
import { ReservationModal } from "@/components/ReservationModal";
import { OccupiedTimeSlots } from "@/components/OccupiedTimeSlots";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { CalendarDays, LogIn, LogOut, Settings } from "lucide-react";
import {
  getEquipments,
  getReservations,
  createReservation,
  type Equipment,
  type Reservation,
} from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { signOut, isAdmin } from "@/lib/auth";

const Home = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [availableEquipments, setAvailableEquipments] = useState<Set<string>>(new Set());
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check admin status if user exists
      if (session?.user) {
        setTimeout(() => {
          isAdmin(session.user.id).then(setIsAdminUser);
        }, 0);
      } else {
        setIsAdminUser(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        isAdmin(session.user.id).then(setIsAdminUser);
      }
    });

    loadData();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (date) {
      loadReservations();
    }
  }, [date]);

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
      
      // Marcar equipamentos como ocupados apenas se tiverem reservas ativas
      const occupiedIds = new Set(activeReservations.map(r => r.equipment_id));
      const available = new Set<string>(
        equipments.filter(e => !occupiedIds.has(e.id)).map(e => e.id)
      );
      setAvailableEquipments(available);
    } catch (error: any) {
      toast.error("Erro ao carregar reservas: " + error.message);
    }
  };

  const handleReserve = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setModalOpen(true);
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Erro ao fazer logout");
    } else {
      toast.success("Logout realizado com sucesso!");
      navigate("/auth");
    }
  };

  const handleCreateReservation = async (data: {
    equipmentId: string;
    name: string;
    phone: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => {
    await createReservation(
      data.equipmentId,
      data.name,
      data.phone,
      data.date,
      data.startTime,
      data.endTime
    );
    await loadReservations();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sistema de Reserva de Equipamentos</h1>
              <p className="text-muted-foreground mt-1">Gerencie suas reservas de forma simples e eficiente</p>
            </div>
            <div className="flex gap-2">
              {user ? (
                <>
                  {isAdminUser && (
                    <Button variant="outline" onClick={() => navigate("/admin")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Admin
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate("/auth")}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="mr-2 h-5 w-5" />
                  Selecione a Data
                </CardTitle>
                <CardDescription>
                  Escolha uma data para ver a disponibilidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border"
                  locale={ptBR}
                />
                
                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold text-sm">Legenda:</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-available"></div>
                    <span className="text-sm">Disponível</span>
                  </div>
                  <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-occupied"></div>
                    <span className="text-sm">Ocupado</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <OccupiedTimeSlots
              reservations={reservations}
              equipments={equipments}
              selectedDate={date}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                Equipamentos Disponíveis
              </h2>
              <p className="text-muted-foreground">
                Selecione um equipamento para reservar. Escolha livremente o horário de início e fim.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {equipments.map((equipment) => (
                <EquipmentCard
                  key={equipment.id}
                  equipment={equipment}
                  isAvailable={availableEquipments.has(equipment.id)}
                  onReserve={handleReserve}
                />
              ))}
            </div>

            {equipments.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Nenhum equipamento cadastrado. Acesse o painel admin para adicionar equipamentos.
                  </p>
                  <Button className="mt-4" onClick={() => navigate("/admin")}>
                    Ir para Admin
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <ReservationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        equipment={selectedEquipment}
        onSubmit={handleCreateReservation}
      />
    </div>
  );
};

export default Home;
