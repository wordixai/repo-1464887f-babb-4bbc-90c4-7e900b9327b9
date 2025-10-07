import { useState, useEffect } from 'react';
import { usePetStore, Pet } from '@/store/petStore';
import { supabase } from '@/lib/supabase';
import { Auth } from '@/components/Auth';
import { PetCard } from '@/components/PetCard';
import { PetDialog } from '@/components/PetDialog';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { PlusCircle, Search, PawPrint, Weight, Calendar, LogOut, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { pets, fetchPets, addPet, updatePet, deletePet } = usePetStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        fetchPets();
        fetchWebhookLogs();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPets();
        fetchWebhookLogs();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchPets]);

  const fetchWebhookLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setWebhookLogs(data || []);
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <PawPrint className="h-12 w-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (petData: Omit<Pet, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingPet) {
        await updatePet(editingPet.id, petData);
        toast.success('Pet updated successfully!');
      } else {
        await addPet(petData);
        toast.success('Pet added successfully! Webhook triggered.');
        fetchWebhookLogs(); // Refresh webhook logs
      }
      setEditingPet(undefined);
    } catch (error) {
      toast.error('Failed to save pet');
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deletePet(deleteId);
        toast.success('Pet deleted successfully!');
        setDeleteId(null);
      } catch (error) {
        toast.error('Failed to delete pet');
      }
    }
  };

  const handleAddNew = () => {
    setEditingPet(undefined);
    setDialogOpen(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  };

  const totalWeight = pets.reduce((sum, pet) => sum + pet.weight, 0);
  const avgAge = pets.length > 0 ? (pets.reduce((sum, pet) => sum + pet.age, 0) / pets.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 pet-gradient rounded-lg">
                <PawPrint className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Pet Management
                </h1>
                <p className="text-muted-foreground">Manage and track your beloved pets</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLogsDialogOpen(true)}>
                <Activity className="h-4 w-4 mr-2" />
                Webhook Logs
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard 
            title="Total Pets" 
            value={pets.length} 
            icon={PawPrint}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatsCard 
            title="Total Weight" 
            value={`${totalWeight.toFixed(1)} kg`} 
            icon={Weight}
            color="bg-gradient-to-br from-pink-500 to-pink-600"
          />
          <StatsCard 
            title="Average Age" 
            value={`${avgAge} years`} 
            icon={Calendar}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pets by name, species, or breed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleAddNew} className="pet-gradient">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Pet
          </Button>
        </div>

        {filteredPets.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-4">
              <PawPrint className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No pets found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try a different search term' : 'Start by adding your first pet'}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddNew} className="pet-gradient">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Your First Pet
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <PetDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSave}
          pet={editingPet}
        />

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this pet from your records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Webhook Activity Logs</DialogTitle>
              <DialogDescription>
                Recent webhook events triggered by pet creation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {webhookLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No webhook logs yet</p>
              ) : (
                webhookLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{log.event_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View payload
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Toaster />
      </div>
    </div>
  );
};

export default Index;