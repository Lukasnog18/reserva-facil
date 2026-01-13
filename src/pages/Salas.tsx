import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Room } from '@/types';
import { Button } from '@/components/ui/button';
import { RoomCard } from '@/components/rooms/RoomCard';
import { RoomForm } from '@/components/rooms/RoomForm';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Plus, DoorOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Salas = () => {
  const { rooms, addRoom, updateRoom, deleteRoom } = useData();
  const { toast } = useToast();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

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

  const confirmDelete = () => {
    if (roomToDelete) {
      deleteRoom(roomToDelete.id);
      toast({
        title: 'Sala excluída',
        description: `A sala "${roomToDelete.name}" foi excluída com sucesso.`,
      });
      setRoomToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleFormSubmit = (data: Omit<Room, 'id' | 'createdAt'>) => {
    if (editingRoom) {
      updateRoom(editingRoom.id, data);
      toast({
        title: 'Sala atualizada',
        description: `A sala "${data.name}" foi atualizada com sucesso.`,
      });
    } else {
      addRoom(data);
      toast({
        title: 'Sala cadastrada',
        description: `A sala "${data.name}" foi cadastrada com sucesso.`,
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Salas</h1>
          <p className="text-muted-foreground">Gerencie as salas disponíveis para reserva</p>
        </div>
        <Button onClick={handleAddRoom} className="gap-2">
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
