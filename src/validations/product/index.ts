import * as z from 'zod';

export const productSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must not exceed 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens (e.g., my-product-123)'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters'),
  
  categoryId: z.string().min(1, 'Please select a category'),
  brandId: z.string().min(1, 'Please select a brand'),
  
  price: z.coerce.number()
    .min(0.01, 'Price must be greater than 0'),
    
  offerPrice: z.coerce.number()
    .min(0, 'Offer price cannot be negative')
    .optional()
    .or(z.literal(0)), // Allow empty/0 
    
  images: z.array(z.string().url('Invalid image URL'))
    .min(1, 'At least one product image is required')
    .max(10, 'You can upload a maximum of 10 images'),
    
  status: z.enum(['active', 'draft']),
  
  sizeVariants: z.array(z.object({
    size: z.string().min(1, 'Size is required'),
    sku: z.string().min(3, 'SKU must be at least 3 characters'),
    quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  })),
  
  highlights: z.array(z.object({
    name: z.string().min(1, 'Highlight name is required'),
    value: z.string().min(1, 'Highlight value is required'),
  })),
  
  additionalDetails: z.array(z.object({
    name: z.string().min(1, 'Detail name is required'),
    value: z.string().min(1, 'Detail value is required'),
  })),
  
  moreInfo: z.object({
    manufactureInfo: z.string().min(2, 'Manufacture info is required'),
    importerInfo: z.string().min(2, 'Importer info is required'),
    packerInfo: z.string().min(2, 'Packer info is required'),
    netWeightValue: z.coerce.number().min(0.1, 'Weight must be greater than 0'),
    netWeightUnit: z.enum(['g', 'kg', 'ml', 'l']),
    supplierInfo: z.string().optional(),
    contactInfo: z.string().optional(),
    legalDisclaimer: z.string().optional(),
  })
}).refine(data => {
  if (data.offerPrice && data.offerPrice >= data.price) {
    return false;
  }
  return true;
}, {
  message: "Offer price must be less than the regular price",
  path: ["offerPrice"] // Target the error to the offerPrice field
});

export type ProductFormValues = z.infer<typeof productSchema>;
