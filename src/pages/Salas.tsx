import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Room } from '@/types';
import { Button } from '@/components/ui/button';
import { RoomCard } from '@/components/rooms/RoomCard';
import { RoomForm } from '@/components/rooms/RoomForm';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Plus, DoorOpen, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Salas = () => {
  const { rooms, isLoading, addRoom, updateRoom, deleteRoom } = useData();
  const { toast } = useToast();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRoom = () => {
    setEditingRoom(null);
    setFormOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setFormOpen(true);
  };

  const handleDeleteRoom = (room: Room) => {
    setRoomToDelete(room);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (roomToDelete) {
      setIsSubmitting(true);
      await deleteRoom(roomToDelete.id);
      toast({
        title: 'Sala excluída',
        description: `A sala "${roomToDelete.name}" foi excluída com sucesso.`,
      });
      setRoomToDelete(null);
      setIsSubmitting(false);
    }
    setDeleteConfirmOpen(false);
  };

  const handleFormSubmit = async (data: Omit<Room, 'id' | 'createdAt'>) => {
    setIsSubmitting(true);
    if (editingRoom) {
      await updateRoom(editingRoom.id, data);
      toast({
        title: 'Sala atualizada',
        description: `A sala "${data.name}" foi atualizada com sucesso.`,
      });
    } else {
      await addRoom(data);
      toast({
        title: 'Sala cadastrada',
        description: `A sala "${data.name}" foi cadastrada com sucesso.`,
      });
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Salas</h1>
          <p className="text-muted-foreground">Gerencie as salas disponíveis para reserva</p>
        </div>
        <Button onClick={handleAddRoom} className="gap-2" disabled={isSubmitting}>
          <Plus className="h-4 w-4" />
          Nova Sala
        </Button>
      </div>

      {rooms.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="Nenhuma sala cadastrada"
          description="Comece cadastrando a primeira sala para que ela fique disponível para reservas."
          actionLabel="Cadastrar Sala"
          onAction={handleAddRoom}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={handleEditRoom}
              onDelete={handleDeleteRoom}
            />
          ))}
        </div>
      )}

      <RoomForm
        open={formOpen}
        onOpenChange={setFormOpen}
        room={editingRoom}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir Sala"
        description={`Tem certeza que deseja excluir a sala "${roomToDelete?.name}"? Todas as reservas associadas também serão excluídas. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Salas;
