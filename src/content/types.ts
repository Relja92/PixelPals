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

export interface PetState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  eventTargetX: number | undefined;
  eventTargetY: number | undefined;
  speed: number;
  facingRight: boolean;
  currentAnimation: string;
  lastAnimationChange: number;
  idleUntil: number;
  type: string;
  color: string;
  isHovering: boolean;
  hoveredAt: number | null;
  element: HTMLDivElement;
  imgElement: HTMLImageElement;
  nextIdleSwitch: number;
}

export interface BubbleData {
  container: HTMLDivElement;
  updateInterval: ReturnType<typeof setInterval>;
}
