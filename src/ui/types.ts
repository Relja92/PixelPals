export interface PetConfig {
  id: string;
  type: string;
  color?: string;
  enabled: boolean;
  watches: string[];
  name?: string;
  speed?: number;
}

export interface ExtensionConfig {
  pets: PetConfig[];
  domainRules: Record<string, { blocked?: boolean }>;
  version: number;
}
