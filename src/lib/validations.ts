import { z } from 'zod';

// User validation schemas
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['PUBLIC', 'COLLECTION', 'PRODUCTION', 'ADMIN']).default('PUBLIC'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

// Client validation schemas
export const clientSchema = z.object({
  code: z.string().min(1, 'Client code is required'),
  name: z.string().min(1, 'Client name is required'),
  regions: z.array(z.string()).default([]),
  departments: z.array(z.string()).default([]),
});

// Product Collection validation schemas
export const productCollectionSchema = z.object({
  // Basic Information
  collectCode: z.string().min(1, 'Collection code is required'),
  designCode: z.string().min(1, 'Design code is required'),
  nameCode: z.string().min(1, 'Name code is required'),
  categoryCode: z.string().min(1, 'Category code is required'),
  sizeCode: z.string().min(1, 'Size code is required'),
  textureCode: z.string().min(1, 'Texture code is required'),
  colorCode: z.string().min(1, 'Color code is required'),
  materialCode: z.string().min(1, 'Material code is required'),

  // Client association
  clientId: z.string().optional(),
  clientDescription: z.string().optional(),

  // Dates
  collectDate: z.string().optional(),
  techDraw: z.string().optional(),
  refId: z.string().optional(),

  // Collection type with exclusivity handling
  collectionType: z.enum(['EXCLUSIVE', 'EXCLUSIVE_GROUP', 'GENERAL']).default('GENERAL'),

  // Clay & Build
  clay: z.string().optional(),
  clayKG: z.number().positive().optional(),
  clayNote: z.string().optional(),
  buildTech: z.string().optional(),
  buildTechNote: z.string().optional(),
  rim: z.string().optional(),
  feet: z.string().optional(),

  // Casting
  casting1: z.string().optional(),
  casting2: z.string().optional(),
  casting3: z.string().optional(),
  casting4: z.string().optional(),
  castingNote: z.string().optional(),

  // Extruder
  extruder1: z.string().optional(),
  extruder2: z.string().optional(),
  extruder3: z.string().optional(),
  extruder4: z.string().optional(),
  extruderNote: z.string().optional(),

  // Texture
  texture1: z.string().optional(),
  texture2: z.string().optional(),
  texture3: z.string().optional(),
  texture4: z.string().optional(),
  textureNote: z.string().optional(),

  // Tools
  tools1: z.string().optional(),
  tools2: z.string().optional(),
  tools3: z.string().optional(),
  tools4: z.string().optional(),
  toolsNote: z.string().optional(),

  // Engobe
  engobe1: z.string().optional(),
  engobe2: z.string().optional(),
  engobe3: z.string().optional(),
  engobe4: z.string().optional(),
  engobeNote: z.string().optional(),

  // Bisque
  bisqueTemp: z.number().min(0).max(1500).optional(),
  bisqueTempNote: z.string().optional(),

  // Stain & Oxide
  stainOxide1: z.string().optional(),
  stainOxide2: z.string().optional(),
  stainOxide3: z.string().optional(),
  stainOxide4: z.string().optional(),
  stainOxideNote: z.string().optional(),

  // Lustre
  lustre1: z.string().optional(),
  lustre2: z.string().optional(),
  lustre3: z.string().optional(),
  lustre4: z.string().optional(),
  lustreTemp: z.number().min(0).max(1500).optional(),
  lustreTempNote: z.string().optional(),
  lustreNote: z.string().optional(),

  // Glaze
  glaze1: z.string().optional(),
  glaze2: z.string().optional(),
  glaze3: z.string().optional(),
  glaze4: z.string().optional(),
  glazeDensity1: z.string().optional(),
  glazeDensity2: z.string().optional(),
  glazeDensity3: z.string().optional(),
  glazeDensity4: z.string().optional(),
  glazeTechnique: z.string().optional(),
  glazeTemp: z.number().min(0).max(1500).optional(),
  glazeTempNote: z.string().optional(),
  glazeNote: z.string().optional(),

  // Firing
  firing: z.string().optional(),
  firingNote: z.string().optional(),

  // Dimensions
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  length: z.number().positive().optional(),
  diameter: z.number().positive().optional(),
  finalSizeNote: z.string().optional(),
});

// Exclusivity validation helpers
export const validateCollectionExclusivity = (
  collectionType: 'EXCLUSIVE' | 'EXCLUSIVE_GROUP' | 'GENERAL',
  clientId?: string
) => {
  if (collectionType === 'EXCLUSIVE' || collectionType === 'EXCLUSIVE_GROUP') {
    if (!clientId) {
      throw new Error(`${collectionType} collections must be associated with a client`);
    }
  }
  return true;
};

// Duplicate collection validation
export const duplicateCollectionSchema = z.object({
  originalId: z.string().min(1, 'Original collection ID is required'),
  newCode: z.string().min(1, 'New collection code is required'),
});

// API response validation schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const collectionsResponseSchema = z.object({
  collections: z.array(z.any()),
  total: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

// Type exports
export type UserInput = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ProductCollectionInput = z.infer<typeof productCollectionSchema>;
export type DuplicateCollectionInput = z.infer<typeof duplicateCollectionSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type CollectionsResponse = z.infer<typeof collectionsResponseSchema>;