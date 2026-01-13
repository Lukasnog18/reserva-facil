import { Reservation } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, DoorOpen, MessageSquare, Trash2, User } from 'lucide-react';

interface ReservationListProps {
  reservations: Reservation[];
  onDelete: (reservation: Reservation) => void;
}

export const ReservationList = ({ reservations, onDelete }: ReservationListProps) => {
  return (
    <div className="space-y-3">
      {reservations.map((reservation) => (
        <Card key={reservation.id} className="group hover:shadow-card transition-all duration-200 animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <DoorOpen className="h-4 w-4 text-primary" />
                    {reservation.roomName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {reservation.startTime} - {reservation.endTime}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {reservation.userName}
                  </div>
                </div>
                {reservation.observation && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{reservation.observation}</span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                onClick={() => onDelete(reservation)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
