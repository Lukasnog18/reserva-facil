import { useState, useEffect } from 'react';
import { Room } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ReservationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rooms: Room[];
  selectedDate?: Date;
  selectedRoomId?: string;
  onSubmit: (data: {
    roomId: string;
    roomName: string;
    date: string;
    startTime: string;
    endTime: string;
    observation: string;
  }) => boolean;
}

const generateTimeOptions = () => {
  const times = [];
  for (let hour = 6; hour <= 22; hour++) {
    times.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 22) {
      times.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

export const ReservationForm = ({
  open,
  onOpenChange,
  rooms,
  selectedDate,
  selectedRoomId,
  onSubmit,
}: ReservationFormProps) => {
  const { checkConflict } = useData();
  const [roomId, setRoomId] = useState('');
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [observation, setObservation] = useState('');
  const [errors, setErrors] = useState<{
    roomId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    conflict?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRoomId(selectedRoomId || '');
      setDate(selectedDate || undefined);
      setStartTime('');
      setEndTime('');
      setObservation('');
      setErrors({});
    }
  }, [open, selectedDate, selectedRoomId]);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!roomId) {
      newErrors.roomId = 'Selecione uma sala';
    }

    if (!date) {
      newErrors.date = 'Selecione uma data';
    } else if (isBefore(startOfDay(date), startOfDay(new Date()))) {
      newErrors.date = 'Não é possível reservar em datas passadas';
    }

    if (!startTime) {
      newErrors.startTime = 'Selecione o horário inicial';
    }

    if (!endTime) {
      newErrors.endTime = 'Selecione o horário final';
    } else if (startTime && endTime <= startTime) {
      newErrors.endTime = 'Horário final deve ser maior que o inicial';
    }

    if (roomId && date && startTime && endTime && endTime > startTime) {
      const dateStr = format(date, 'yyyy-MM-dd');
      if (checkConflict(roomId, dateStr, startTime, endTime)) {
        newErrors.conflict = 'Já existe uma reserva neste horário para esta sala';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const room = rooms.find(r => r.id === roomId);
    if (!room || !date) return;

    const success = onSubmit({
      roomId,
      roomName: room.name,
      date: format(date, 'yyyy-MM-dd'),
      startTime,
      endTime,
      observation: observation.trim(),
    });

    setIsSubmitting(false);

    if (success) {
      onOpenChange(false);
    } else {
      setErrors({ conflict: 'Ocorreu um conflito. Tente outro horário.' });
    }
  };

  const getAvailableEndTimes = () => {
    if (!startTime) return TIME_OPTIONS;
    return TIME_OPTIONS.filter(time => time > startTime);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Reserva</DialogTitle>
          <DialogDescription>
            Selecione a sala, data e horário para sua reserva.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Sala *</Label>
              <Select value={roomId} onValueChange={setRoomId}>
                <SelectTrigger className={errors.roomId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione uma sala" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} ({room.capacity} pessoas)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roomId && (
                <p className="text-sm text-destructive">{errors.roomId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground',
                      errors.date && 'border-destructive'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione uma data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => isBefore(startOfDay(d), startOfDay(new Date()))}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Horário Inicial *</Label>
                <Select value={startTime} onValueChange={(v) => { setStartTime(v); if (endTime && v >= endTime) setEndTime(''); }}>
                  <SelectTrigger className={errors.startTime ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Início" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.startTime && (
                  <p className="text-sm text-destructive">{errors.startTime}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Horário Final *</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger className={errors.endTime ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Fim" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableEndTimes().map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.endTime && (
                  <p className="text-sm text-destructive">{errors.endTime}</p>
                )}
              </div>
            </div>

            {errors.conflict && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {errors.conflict}
              </p>
            )}

            <div className="space-y-2">
              <Label>Observação</Label>
              <Textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ex: Reunião de equipe, apresentação, etc."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reservando...
                </>
              ) : (
                'Confirmar Reserva'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
