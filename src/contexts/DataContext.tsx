import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Room, Reservation } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DataContextType {
  rooms: Room[];
  reservations: Reservation[];
  isLoading: boolean;
  addRoom: (room: Omit<Room, 'id' | 'createdAt'>) => Promise<void>;
  updateRoom: (id: string, room: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'userId' | 'userName'>) => Promise<boolean>;
  deleteReservation: (id: string) => Promise<void>;
  checkConflict: (roomId: string, date: string, startTime: string, endTime: string, excludeId?: string) => boolean;
  getReservationsByDate: (date: string) => Reservation[];
  getReservationsByRoom: (roomId: string) => Reservation[];
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRooms = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    const { data, error } = await supabase
      .from('salas')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching rooms:', error);
      return;
    }
    
    const mappedRooms: Room[] = data.map(sala => ({
      id: sala.id,
      name: sala.nome,
      description: sala.descricao || '',
      capacity: sala.capacidade,
      createdAt: new Date(sala.created_at),
    }));
    
    setRooms(mappedRooms);
  }, [isAuthenticated, user]);

  const fetchReservations = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        salas (nome)
      `)
      .order('data', { ascending: true });
    
    if (error) {
      console.error('Error fetching reservations:', error);
      return;
    }
    
    const mappedReservations: Reservation[] = data.map(reserva => ({
      id: reserva.id,
      roomId: reserva.sala_id,
      roomName: reserva.salas?.nome || 'Sala removida',
      date: reserva.data,
      startTime: reserva.hora_inicio.slice(0, 5),
      endTime: reserva.hora_fim.slice(0, 5),
      observation: reserva.observacao || '',
      userId: reserva.user_id,
      userName: user.name,
      createdAt: new Date(reserva.created_at),
    }));
    
    setReservations(mappedReservations);
  }, [isAuthenticated, user]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchRooms(), fetchReservations()]);
    setIsLoading(false);
  }, [fetchRooms, fetchReservations]);

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshData();
    } else {
      setRooms([]);
      setReservations([]);
    }
  }, [isAuthenticated, user, refreshData]);

  const addRoom = useCallback(async (roomData: Omit<Room, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('salas')
      .insert({
        user_id: user.id,
        nome: roomData.name,
        descricao: roomData.description,
        capacidade: roomData.capacity,
      });
    
    if (error) {
      console.error('Error adding room:', error);
      toast({
        title: 'Erro ao cadastrar sala',
        description: 'Não foi possível cadastrar a sala. Tente novamente.',
        variant: 'destructive',
      });
      return;
    }
    
    await fetchRooms();
  }, [user, fetchRooms, toast]);

  const updateRoom = useCallback(async (id: string, roomData: Partial<Room>) => {
    const updateData: Record<string, unknown> = {};
    if (roomData.name !== undefined) updateData.nome = roomData.name;
    if (roomData.description !== undefined) updateData.descricao = roomData.description;
    if (roomData.capacity !== undefined) updateData.capacidade = roomData.capacity;
    
    const { error } = await supabase
      .from('salas')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating room:', error);
      toast({
        title: 'Erro ao atualizar sala',
        description: 'Não foi possível atualizar a sala. Tente novamente.',
        variant: 'destructive',
      });
      return;
    }
    
    await fetchRooms();
  }, [fetchRooms, toast]);

  const deleteRoom = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('salas')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting room:', error);
      toast({
        title: 'Erro ao excluir sala',
        description: 'Não foi possível excluir a sala. Tente novamente.',
        variant: 'destructive',
      });
      return;
    }
    
    await Promise.all([fetchRooms(), fetchReservations()]);
  }, [fetchRooms, fetchReservations, toast]);

  const checkConflict = useCallback((
    roomId: string, 
    date: string, 
    startTime: string, 
    endTime: string,
    excludeId?: string
  ): boolean => {
    const roomReservations = reservations.filter(r => 
      r.roomId === roomId && 
      r.date === date &&
      r.id !== excludeId
    );

    const newStart = parseInt(startTime.replace(':', ''));
    const newEnd = parseInt(endTime.replace(':', ''));

    return roomReservations.some(res => {
      const existingStart = parseInt(res.startTime.replace(':', ''));
      const existingEnd = parseInt(res.endTime.replace(':', ''));

      return (newStart < existingEnd && newEnd > existingStart);
    });
  }, [reservations]);

  const addReservation = useCallback(async (
    reservationData: Omit<Reservation, 'id' | 'createdAt' | 'userId' | 'userName'>
  ): Promise<boolean> => {
    if (!user) return false;

    if (checkConflict(
      reservationData.roomId, 
      reservationData.date, 
      reservationData.startTime, 
      reservationData.endTime
    )) {
      return false;
    }

    const { error } = await supabase
      .from('reservas')
      .insert({
        user_id: user.id,
        sala_id: reservationData.roomId,
        data: reservationData.date,
        hora_inicio: reservationData.startTime,
        hora_fim: reservationData.endTime,
        observacao: reservationData.observation,
      });

    if (error) {
      console.error('Error adding reservation:', error);
      toast({
        title: 'Erro ao criar reserva',
        description: 'Não foi possível criar a reserva. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }

    await fetchReservations();
    return true;
  }, [user, checkConflict, fetchReservations, toast]);

  const deleteReservation = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('reservas')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting reservation:', error);
      toast({
        title: 'Erro ao cancelar reserva',
        description: 'Não foi possível cancelar a reserva. Tente novamente.',
        variant: 'destructive',
      });
      return;
    }
    
    await fetchReservations();
  }, [fetchReservations, toast]);

  const getReservationsByDate = useCallback((date: string) => {
    return reservations.filter(res => res.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [reservations]);

  const getReservationsByRoom = useCallback((roomId: string) => {
    return reservations.filter(res => res.roomId === roomId)
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        return dateCompare !== 0 ? dateCompare : a.startTime.localeCompare(b.startTime);
      });
  }, [reservations]);

  return (
    <DataContext.Provider value={{
      rooms,
      reservations,
      isLoading,
      addRoom,
      updateRoom,
      deleteRoom,
      addReservation,
      deleteReservation,
      checkConflict,
      getReservationsByDate,
      getReservationsByRoom,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
