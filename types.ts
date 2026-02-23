import { LucideIcon } from 'lucide-react';

export interface ToolItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  isNew?: boolean;
  category: 'edit' | 'convert' | 'ai' | 'security';
  route: string;
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64?: string;
}

export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';
