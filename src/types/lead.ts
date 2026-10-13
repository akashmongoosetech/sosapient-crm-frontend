export const LEAD_STATUSES = ['New', 'Whatsapp', 'Message', 'Call', 'Converted'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface Lead {
  id: string;
  title: string;
  categoryName: string;
  address: string;
  city: string;
  state: string;
  website: string;
  phone: string;
  phoneUnformatted: string;
  status: LeadStatus;
  placeId: string;
  source: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LeadListParams {
  q?: string;
  category?: string;
  city?: string;
  status?: string;
  contact?: 'all' | 'phone' | 'website' | 'both' | 'neither' | 'mobileOnly' | 'websiteOnly';
  page?: number;
  limit?: number;
}

export interface LeadListResponse {
  leads: Lead[];
  page: number;
  limit: number;
  total: number;
}

export interface LeadFilterOptions {
  categories: string[];
  cities: string[];
}

export interface ImportPreview {
  total: number;
  new: number;
  dbDuplicates: number;
  fileDuplicates: number;
  invalid: number;
  duplicatesByRule: Record<string, number>;
  duplicateDetails: { index: number; title: string; rule: string; scope: string }[];
  invalidDetails: { index: number; reason: string }[];
  truncated: boolean;
}

export interface ImportResult {
  total: number;
  imported: number;
  skippedDuplicates: number;
  invalid: number;
  errors: { reason: string; count?: number }[];
}

export const STATUS_TONE: Record<LeadStatus, 'info' | 'success' | 'warning' | 'brand' | 'neutral'> = {
  New: 'info',
  Whatsapp: 'success',
  Message: 'warning',
  Call: 'brand',
  Converted: 'neutral',
};
