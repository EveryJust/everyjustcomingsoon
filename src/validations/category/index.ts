import * as z from 'zod';

export const categorySchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must not exceed 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens (e.g., my-category-123)'),
  
  description: z.string().optional(),
  
  parentId: z.string().nullable().optional(), // Support up to 3 levels of nesting
  
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')), // Optional, but usually a transparent PNG
  
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
