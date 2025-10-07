import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Pet {
  id: string;
  user_id?: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  color: string;
  gender: 'male' | 'female';
  image_url?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface PetStore {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  fetchPets: () => Promise<void>;
  addPet: (pet: Omit<Pet, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePet: (id: string, pet: Partial<Pet>) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  getPet: (id: string) => Pet | undefined;
}

export const usePetStore = create<PetStore>((set, get) => ({
  pets: [],
  loading: false,
  error: null,

  fetchPets: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        set({ pets: [], loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ pets: data || [], loading: false });
    } catch (error: any) {
      console.error('Error fetching pets:', error);
      set({ error: error.message, loading: false });
    }
  },

  addPet: async (pet) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('pets')
        .insert([{ ...pet, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({ 
        pets: [data, ...state.pets], 
        loading: false 
      }));
    } catch (error: any) {
      console.error('Error adding pet:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updatePet: async (id, updatedPet) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('pets')
        .update({ ...updatedPet, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        pets: state.pets.map((pet) => pet.id === id ? data : pet),
        loading: false
      }));
    } catch (error: any) {
      console.error('Error updating pet:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deletePet: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        pets: state.pets.filter((pet) => pet.id !== id),
        loading: false
      }));
    } catch (error: any) {
      console.error('Error deleting pet:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getPet: (id) => get().pets.find((pet) => pet.id === id)
}));