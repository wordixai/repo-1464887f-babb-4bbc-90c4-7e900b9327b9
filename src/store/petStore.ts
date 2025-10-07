import { create } from 'zustand';

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  color: string;
  gender: 'male' | 'female';
  imageUrl?: string;
  notes?: string;
  createdAt: Date;
}

interface PetStore {
  pets: Pet[];
  addPet: (pet: Omit<Pet, 'id' | 'createdAt'>) => void;
  updatePet: (id: string, pet: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  getPet: (id: string) => Pet | undefined;
}

export const usePetStore = create<PetStore>((set, get) => ({
  pets: [
    {
      id: '1',
      name: 'Max',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 3,
      weight: 30,
      color: 'Golden',
      gender: 'male',
      imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400',
      notes: 'Loves to play fetch',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Luna',
      species: 'Cat',
      breed: 'Persian',
      age: 2,
      weight: 4.5,
      color: 'White',
      gender: 'female',
      imageUrl: 'https://images.unsplash.com/photo-1573865526739-10c1d3a1abf8?w=400',
      notes: 'Very calm and loves cuddles',
      createdAt: new Date('2024-02-20')
    }
  ],
  addPet: (pet) => set((state) => ({
    pets: [...state.pets, { ...pet, id: Date.now().toString(), createdAt: new Date() }]
  })),
  updatePet: (id, updatedPet) => set((state) => ({
    pets: state.pets.map((pet) => pet.id === id ? { ...pet, ...updatedPet } : pet)
  })),
  deletePet: (id) => set((state) => ({
    pets: state.pets.filter((pet) => pet.id !== id)
  })),
  getPet: (id) => get().pets.find((pet) => pet.id === id)
}));