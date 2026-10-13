import { z } from 'zod';
import { LEAD_STATUSES } from '../types/lead';

const websiteSchema = z.string().trim().max(2048).optional().default('')
  .refine((v) => {
    if (!v) return true;
    try {
      const u = new URL(v.includes('://') ? v : `https://${v}`);
      return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('.');
    } catch { return false; }
  }, 'Enter a valid website URL');

export const leadFormSchema = z.object({
  title: z.string().trim().min(1, 'Lead name is required').max(200, 'Name is too long'),
  categoryName: z.string().trim().max(200).optional().default(''),
  address: z.string().trim().max(1000).optional().default(''),
  city: z.string().trim().max(120).optional().default(''),
  state: z.string().trim().max(120).optional().default(''),
  website: websiteSchema,
  phone: z.string().trim().max(40).optional().default(''),
  phoneUnformatted: z.string().trim().max(40).optional().default(''),
  status: z.enum(LEAD_STATUSES).optional().default('New'),
  placeId: z.string().trim().max(300).optional().default(''),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;
