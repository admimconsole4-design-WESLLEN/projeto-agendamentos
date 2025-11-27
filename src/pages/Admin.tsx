import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReservationsList } from "@/components/ReservationsList";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getEquipments,
  getTimeSlots,
  getReservations,
  createEquipment,
  deleteEquipment,
  createTimeSlot,
  deleteTimeSlot,
  deleteReservation,
  type Equipment,
  type TimeSlot,
  type Reservation,
} from "@/lib/supabase";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Admin = () => {
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  // Form states
  const [equipmentName, setEquipmentName] = useState("");
  const [equipmentDesc, setEquipmentDesc] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [slotLabel, setSlotLabel] = useState("");
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [equipmentsData, timeSlotsData, reservationsData] = await Promise.all([
        getEquipments(),
        getTimeSlots(),
        getReservations(),
      ]);
      setEquipments(equipmentsData);
      setTimeSlots(timeSlotsData);
      setReservations(reservationsData);
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    }
  };

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentName.trim()) {
      toast.error("Nome do equipamento é obrigatório");
      return;
    }

    try {
      await createEquipment(equipmentName.trim(), equipmentDesc.trim() || undefined);
      toast.success("Equipamento criado com sucesso!");
      setEquipmentName("");
      setEquipmentDesc("");
      await loadData();
    } catch (error: any) {
      toast.error("Erro ao criar equipamento: " + error.message);
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este equipamento?")) return;

    try {
      await deleteEquipment(id);
      toast.success("Equipamento removido!");
      await loadData();
    } catch (error: any) {
      if (error.message.includes("violates foreign key")) {
        toast.error("Não é possível remover: existem reservas para este equipamento");
      } else {
        toast.error("Erro ao remover equipamento: " + error.message);
      }
    }
  };

  const handleCreateTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotStart || !slotEnd) {
      toast.error("Horários são obrigatórios");
      return;
    }

    if (slotStart >= slotEnd) {
      toast.error("Horário de início deve ser antes do fim");
      return;
    }

    try {
      await createTimeSlot(slotStart + ":00", slotEnd + ":00", slotLabel.trim() || undefined);
      toast.success("Faixa horária criada!");
      setSlotStart("");
      setSlotEnd("");
      setSlotLabel("");
      await loadData();
    } catch (error: any) {
      toast.error("Erro ao criar faixa: " + error.message);
    }
  };

  const handleDeleteTimeSlot = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta faixa horária?")) return;

    try {
      await deleteTimeSlot(id);
      toast.success("Faixa horária removida!");
      await loadData();
    } catch (error: any) {
      toast.error("Erro ao remover faixa: " + error.message);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm("Tem certeza que deseja cancelar esta reserva?")) return;

    try {
      await deleteReservation(id);
      toast.success("Reserva cancelada!");
      await loadData();
    } catch (error: any) {
      toast.error("Erro ao cancelar reserva: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
              <p className="text-muted-foreground mt-1">Gerencie equipamentos, horários e reservas</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="equipments" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="equipments">Equipamentos</TabsTrigger>
            <TabsTrigger value="timeslots">Horários</TabsTrigger>
            <TabsTrigger value="reservations">Reservas</TabsTrigger>
          </TabsList>

          <TabsContent value="equipments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Equipamento</CardTitle>
                <CardDescription>Cadastre novos equipamentos no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateEquipment} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="eq-name">Nome *</Label>
                    <Input
                      id="eq-name"
                      value={equipmentName}
                      onChange={(e) => setEquipmentName(e.target.value)}
                      placeholder="Ex: Câmera Canon EOS R5"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="eq-desc">Descrição</Label>
                    <Textarea
                      id="eq-desc"
                      value={equipmentDesc}
                      onChange={(e) => setEquipmentDesc(e.target.value)}
                      placeholder="Descrição detalhada do equipamento..."
                      rows={3}
                    />
                  </div>
                  <Button type="submit">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Equipamento
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipamentos Cadastrados ({equipments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipments.map((eq) => (
                        <TableRow key={eq.id}>
                          <TableCell className="font-medium">{eq.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {eq.description || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEquipment(eq.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeslots" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Faixa Horária</CardTitle>
                <CardDescription>Configure os horários disponíveis para reserva</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTimeSlot} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="slot-start">Horário Início *</Label>
                      <Input
                        id="slot-start"
                        type="time"
                        value={slotStart}
                        onChange={(e) => setSlotStart(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="slot-end">Horário Fim *</Label>
                      <Input
                        id="slot-end"
                        type="time"
                        value={slotEnd}
                        onChange={(e) => setSlotEnd(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="slot-label">Etiqueta</Label>
                    <Input
                      id="slot-label"
                      value={slotLabel}
                      onChange={(e) => setSlotLabel(e.target.value)}
                      placeholder="Ex: Manhã, Tarde, Noite"
                    />
                  </div>
                  <Button type="submit">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Faixa
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Faixas Horárias ({timeSlots.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Início</TableHead>
                        <TableHead>Fim</TableHead>
                        <TableHead>Etiqueta</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeSlots.map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell>{slot.start_time.substring(0, 5)}</TableCell>
                          <TableCell>{slot.end_time.substring(0, 5)}</TableCell>
                          <TableCell>{slot.label || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTimeSlot(slot.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reservations">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Reservas ({reservations.length})</CardTitle>
                <CardDescription>Visualize e gerencie todas as reservas do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <ReservationsList
                  reservations={reservations}
                  equipments={equipments}
                  onDelete={handleDeleteReservation}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
