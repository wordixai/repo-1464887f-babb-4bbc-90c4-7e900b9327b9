import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Pet } from '@/store/petStore';

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
  onDelete: (id: string) => void;
}

export const PetCard = ({ pet, onEdit, onDelete }: PetCardProps) => {
  return (
    <Card className="card-hover overflow-hidden">
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
        {pet.imageUrl ? (
          <img 
            src={pet.imageUrl} 
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {pet.species === 'Dog' ? '🐕' : pet.species === 'Cat' ? '🐱' : '🐾'}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{pet.name}</h3>
            <p className="text-sm text-muted-foreground">{pet.breed}</p>
          </div>
          <Badge variant="secondary">{pet.species}</Badge>
        </div>
        <div className="space-y-1 text-sm mb-4">
          <p className="text-muted-foreground">Age: {pet.age} years</p>
          <p className="text-muted-foreground">Weight: {pet.weight} kg</p>
          <p className="text-muted-foreground">Color: {pet.color}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(pet)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(pet.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};