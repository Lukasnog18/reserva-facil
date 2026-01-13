import React, { createContext, useContext, useState, useCallback } from 'react';
import { Room, Reservation } from '@/types';
import { useAuth } from './AuthContext';

interface DataContextType {
  rooms: Room[];
  reservations: Reservation[];
  addRoom: (room: Omit<Room, 'id' | 'createdAt'>) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'userId' | 'userName'>) => boolean;
  deleteReservation: (id: string) => void;
  checkConflict: (roomId: string, date: string, startTime: string, endTime: string, excludeId?: string) => boolean;
  getReservationsByDate: (date: string) => Reservation[];
  getReservationsByRoom: (roomId: string) => Reservation[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const addRoom = useCallback((roomData: Omit<Room, 'id' | 'createdAt'>) => {
    const newRoom: Room = {
      ...roomData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setRooms(prev => [...prev, newRoom]);
  }, []);

  const updateRoom = useCallback((id: string, roomData: Partial<Room>) => {
    setRooms(prev => prev.map(room => 
      room.id === id ? { ...room, ...roomData } : room
    ));
    // Atualiza nome da sala nas reservas
    if (roomData.name) {
      setReservations(prev => prev.map(res => 
        res.roomId === id ? { ...res, roomName: roomData.name! } : res
      ));
    }
  }, []);

  const deleteRoom = useCallback((id: string) => {
    setRooms(prev => prev.filter(room => room.id !== id));
    setReservations(prev => prev.filter(res => res.roomId !== id));
  }, []);

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

  const addReservation = useCallback((
    reservationData: Omit<Reservation, 'id' | 'createdAt' | 'userId' | 'userName'>
  ): boolean => {
    if (!user) return false;

    if (checkConflict(
      reservationData.roomId, 
      reservationData.date, 
      reservationData.startTime, 
      reservationData.endTime
    )) {
      return false;
    }

    const newReservation: Reservation = {
      ...reservationData,
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      createdAt: new Date(),
    };

    setReservations(prev => [...prev, newReservation]);
    return true;
  }, [user, checkConflict]);

  const deleteReservation = useCallback((id: string) => {
    setReservations(prev => prev.filter(res => res.id !== id));
  }, []);

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
      addRoom,
      updateRoom,
      deleteRoom,
      addReservation,
      deleteReservation,
      checkConflict,
      getReservationsByDate,
      getReservationsByRoom,
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
