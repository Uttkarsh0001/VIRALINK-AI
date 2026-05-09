export type ToolType =
  | "hooks"
  | "titles"
  | "ctas"
  | "captions"
  | "hook_to_script"
  | "hook_analyzer"
  | "content_pack";

export type PlatformType =
  | "Instagram"
  | "YouTube"
  | "LinkedIn"
  | "X / Twitter";

export type StyleType =
  | "Curiosity"
  | "Bold"
  | "Authority"
  | "Emotional"
  | "Contrarian"
  | "Story"
  | "Aggressive"
  | "Minimal"
  | "Dark Psychology"
  | "Educational";

export type GenerationRecord = {
  id: string;
  tool: ToolType;
  niche: string;
  topic: string;
  style: string;
  platform: string;
  createdAt: string;
  preview: string;
};

export type VaultItem = {
  id: string;
  title: string;
  content: string;
  tool: ToolType;
  createdAt: string;
};