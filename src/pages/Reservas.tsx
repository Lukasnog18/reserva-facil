import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Reservation } from '@/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReservationForm } from '@/components/reservations/ReservationForm';
import { ReservationAgenda } from '@/components/reservations/ReservationAgenda';
import { ReservationList } from '@/components/reservations/ReservationList';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Plus, CalendarDays, List, DoorOpen } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const Reservas = () => {
  const { rooms, reservations, addReservation, deleteReservation, getReservationsByDate } = useData();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [viewMode, setViewMode] = useState<'agenda' | 'list'>('agenda');

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayReservations = getReservationsByDate(dateStr);

  const handleAddReservation = () => {
    if (rooms.length === 0) {
      toast({
        title: 'Nenhuma sala cadastrada',
        description: 'Cadastre uma sala antes de fazer reservas.',
        variant: 'destructive',
      });
      return;
    }
    setFormOpen(true);
  };

  const handleDeleteReservation = (reservation: Reservation) => {
    setReservationToDelete(reservation);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (reservationToDelete) {
      deleteReservation(reservationToDelete.id);
      toast({
        title: 'Reserva cancelada',
        description: 'A reserva foi cancelada com sucesso.',
      });
      setReservationToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleFormSubmit = (data: {
    roomId: string;
    roomName: string;
    date: string;
    startTime: string;
    endTime: string;
    observation: string;
  }) => {
    const success = addReservation(data);
    
    if (success) {
      toast({
        title: 'Reserva confirmada!',
        description: `Sala "${data.roomName}" reservada para ${format(new Date(data.date + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR })} das ${data.startTime} às ${data.endTime}.`,
      });
    }
    
    return success;
  };

  // Dias com reservas para destacar no calendário
  const reservationDates = [...new Set(reservations.map(r => r.date))];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reservas</h1>
          <p className="text-muted-foreground">Gerencie as reservas de salas</p>
        </div>
        <Button onClick={handleAddReservation} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Reserva
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Calendário */}
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="rounded-md"
              modifiers={{
                hasReservation: (date) => reservationDates.includes(format(date, 'yyyy-MM-dd'))
              }}
              modifiersClassNames={{
                hasReservation: 'bg-primary/20 font-semibold'
              }}
            />
          </CardContent>
        </Card>

        {/* Reservas do dia */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h2>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'agenda' | 'list')}>
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="agenda" className="gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Agenda
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  Lista
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {rooms.length === 0 ? (
            <EmptyState
              icon={DoorOpen}
              title="Nenhuma sala cadastrada"
              description="Cadastre salas para poder visualizar e criar reservas."
            />
          ) : dayReservations.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Nenhuma reserva neste dia"
              description="Não há reservas agendadas para esta data. Clique no botão acima para criar uma nova reserva."
              actionLabel="Criar Reserva"
              onAction={handleAddReservation}
            />
          ) : (
            <>
              {viewMode === 'agenda' ? (
                <ReservationAgenda
                  reservations={dayReservations}
                  rooms={rooms}
                  onDelete={handleDeleteReservation}
                />
              ) : (
                <ReservationList
                  reservations={dayReservations}
                  onDelete={handleDeleteReservation}
                />
              )}
            </>
          )}
        </div>
      </div>

      <ReservationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        rooms={rooms}
        selectedDate={selectedDate}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Cancelar Reserva"
        description={`Tem certeza que deseja cancelar a reserva da sala "${reservationToDelete?.roomName}" das ${reservationToDelete?.startTime} às ${reservationToDelete?.endTime}?`}
        confirmLabel="Cancelar Reserva"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Reservas;
