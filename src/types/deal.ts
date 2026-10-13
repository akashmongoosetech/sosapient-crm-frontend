export interface Attachment {
  filename: string;
  mime: string;
  size: number;
  url: string;
}

export interface Deal {
  id: string;
  sourceLeadId: string;
  title: string;
  categoryName: string;
  address: string;
  city: string;
  state: string;
  website: string;
  phone: string;
  phoneUnformatted: string;
  placeId: string;
  source: Record<string, unknown>;
  status: 'Converted';
  convertedAt: string;
  convertedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DealListItem extends Deal {
  entryCounts: { requirements: number; progress: number };
}

export interface DealListResponse {
  deals: DealListItem[];
  page: number;
  limit: number;
  total: number;
}

export type EntryKind = 'requirement' | 'progress';

export interface EntryCreator {
  firstName: string;
  lastName: string;
  profilePicUrl: string;
  role: 'admin' | 'manager';
}

export interface DealEntry {
  id: string;
  dealId: string;
  description: string;
  entryDate: string;
  attachments: Attachment[];
  createdBy: string | null;
  creator: EntryCreator | null;
  createdAt: string;
  updatedAt: string;
}

export interface EntryListResponse {
  entries: DealEntry[];
  page: number;
  limit: number;
  total: number;
}

export interface ConvertedResult {
  converted: true;
  deal: Deal;
}
