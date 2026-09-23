import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  firstName: string;
  lastName: string | null;
  whatsapp: string | null;
  avatarUrl: string | null;
}

interface UserState {
  profile: UserProfile | null;
  setProfile: (data: any) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (data) => set({ 
        profile: {
          firstName: data.first_name,
          lastName: data.last_name,
          whatsapp: data.whatsapp,
          avatarUrl: data.avatar_url
        } 
      }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'user-profile-storage', // Nome da chave no localStorage
    }
  )
);