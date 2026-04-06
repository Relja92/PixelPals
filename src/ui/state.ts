import type { ExtensionConfig } from './types';

export const state = {
  config: null as ExtensionConfig | null,
  currentPage: 'home',
  currentPetId: null as string | null,
  selectedPetType: null as string | null,
  selectedPetColor: null as string | null,
  addPetStep: 1,
};
