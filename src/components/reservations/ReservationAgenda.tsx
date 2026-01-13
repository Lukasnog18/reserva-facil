import { Reservation, Room } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Clock, MessageSquare, User } from 'lucide-react';

interface ReservationAgendaProps {
  reservations: Reservation[];
  rooms: Room[];
  onDelete: (reservation: Reservation) => void;
}

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

export const ReservationAgenda = ({ reservations, rooms, onDelete }: ReservationAgendaProps) => {
  const getReservationsForSlot = (roomId: string, slot: string) => {
    const slotHour = parseInt(slot.split(':')[0]);
    
    return reservations.filter(res => {
      if (res.roomId !== roomId) return false;
      
      const startHour = parseInt(res.startTime.split(':')[0]);
      const endHour = parseInt(res.endTime.split(':')[0]);
      const endMinute = parseInt(res.endTime.split(':')[1]);
      
      // A reserva ocupa este slot se começa nele ou se está no meio dela
      return slotHour >= startHour && (slotHour < endHour || (slotHour === endHour && endMinute > 0));
    });
  };

  const getReservationSpan = (reservation: Reservation) => {
    const startHour = parseInt(reservation.startTime.split(':')[0]);
    const startMinute = parseInt(reservation.startTime.split(':')[1]);
    const endHour = parseInt(reservation.endTime.split(':')[0]);
    const endMinute = parseInt(reservation.endTime.split(':')[1]);
    
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    
    return Math.ceil((endInMinutes - startInMinutes) / 60);
  };

  const isReservationStart = (reservation: Reservation, slot: string) => {
    const slotHour = parseInt(slot.split(':')[0]);
    const startHour = parseInt(reservation.startTime.split(':')[0]);
    return slotHour === startHour;
  };

  if (rooms.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header com nomes das salas */}
        <div className="grid gap-2" style={{ gridTemplateColumns: `80px repeat(${rooms.length}, 1fr)` }}>
          <div className="sticky left-0 bg-background z-10"></div>
          {rooms.map(room => (
            <Card key={room.id} className="text-center">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium truncate">{room.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Time slots */}
        <div className="mt-2 space-y-1">
          {TIME_SLOTS.map(slot => {
            return (
              <div 
                key={slot} 
                className="grid gap-2" 
                style={{ gridTemplateColumns: `80px repeat(${rooms.length}, 1fr)` }}
              >
                <div className="sticky left-0 bg-background z-10 flex items-center justify-end pr-3 text-sm text-muted-foreground font-medium">
                  {slot}
                </div>
                {rooms.map(room => {
                  const slotReservations = getReservationsForSlot(room.id, slot);
                  const startingReservations = slotReservations.filter(r => isReservationStart(r, slot));
                  
                  if (startingReservations.length > 0) {
                    const reservation = startingReservations[0];
                    const span = getReservationSpan(reservation);
                    
                    return (
                      <Card 
                        key={`${room.id}-${slot}`}
                        className="group bg-primary/10 border-primary/20 hover:shadow-card transition-all duration-200"
                        style={{ 
                          gridRow: `span ${span}`,
                          minHeight: `${span * 44}px`
                        }}
                      >
                        <CardContent className="p-3 h-full flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-1">
                                <Clock className="h-3 w-3" />
                                {reservation.startTime} - {reservation.endTime}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                {reservation.userName}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive shrink-0"
                              onClick={() => onDelete(reservation)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {reservation.observation && (
                            <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                              <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                              <span className="line-clamp-2">{reservation.observation}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  } else if (slotReservations.length > 0) {
                    // Este slot faz parte de uma reserva mas não é o início
                    return <div key={`${room.id}-${slot}`} className="hidden"></div>;
                  }
                  
                  return (
                    <div 
                      key={`${room.id}-${slot}`}
                      className="h-11 border border-dashed border-border/50 rounded-lg"
                    ></div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
