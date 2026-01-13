import { useState, useEffect } from 'react';
import { Room } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface RoomFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: Room | null;
  onSubmit: (data: Omit<Room, 'id' | 'createdAt'>) => void;
}

export const RoomForm = ({ open, onOpenChange, room, onSubmit }: RoomFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [errors, setErrors] = useState<{ name?: string; capacity?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (room) {
      setName(room.name);
      setDescription(room.description);
      setCapacity(room.capacity.toString());
    } else {
      setName('');
      setDescription('');
      setCapacity('');
    }
    setErrors({});
  }, [room, open]);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres';
    }

    const capacityNum = parseInt(capacity);
    if (!capacity) {
      newErrors.capacity = 'Capacidade é obrigatória';
    } else if (isNaN(capacityNum) || capacityNum < 1) {
      newErrors.capacity = 'Capacidade deve ser um número maior que 0';
    } else if (capacityNum > 1000) {
      newErrors.capacity = 'Capacidade máxima é 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      capacity: parseInt(capacity),
    });

    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{room ? 'Editar Sala' : 'Nova Sala'}</DialogTitle>
          <DialogDescription>
            {room ? 'Altere os dados da sala abaixo.' : 'Preencha os dados para cadastrar uma nova sala.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Sala de Reuniões 1"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Sala equipada com projetor e ar-condicionado"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="1000"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Ex: 10"
                className={errors.capacity ? 'border-destructive' : ''}
              />
              {errors.capacity && (
                <p className="text-sm text-destructive">{errors.capacity}</p>
              )}
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
                  Salvando...
                </>
              ) : (
                room ? 'Salvar Alterações' : 'Cadastrar Sala'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
