import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('editor'), // 'admin' | 'editor'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const productCategories = pgTable('product_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id')
    .references(() => productCategories.id, { onDelete: 'restrict' })
    .notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  summary: text('summary').notNull(),
  description: text('description').notNull(),
  dimensions: text('dimensions').notNull(),
  dimensionStatus: text('dimension_status')
    .notNull()
    .default('pending_confirmation'), // 'confirmed' | 'pending_confirmation'
  binderSpec: text('binder_spec').notNull(),
  applications: text('applications').notNull(),
  features: text('features').notNull(),
  imageUrl: text('image_url').notNull(),
  technicalDocUrl: text('technical_doc_url'),
  availabilityStatus: text('availability_status')
    .notNull()
    .default('planned_production'), // 'planned_production' | 'trial_phase' | 'available'
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const rawMaterials = pgTable('raw_materials', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  sourceLocation: text('source_location').notNull(),
  purpose: text('purpose').notNull(),
  technicalNotes: text('technical_notes').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
});

export const processSteps = pgTable('process_steps', {
  id: serial('id').primaryKey(),
  stepNumber: integer('step_number').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  qualityControlNote: text('quality_control_note').notNull(),
  keyParameter: text('key_parameter').notNull(),
});

export const qualityTests = pgTable('quality_tests', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  methodology: text('methodology').notNull(),
  targetStandard: text('target_standard').notNull(),
  verificationStatus: text('verification_status').notNull().default('planned'), // 'planned' | 'verified'
  institution: text('institution').notNull(),
  notes: text('notes').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const labReports = pgTable('lab_reports', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  reportCode: text('report_code').notNull(),
  institution: text('institution').notNull(),
  testAgeDays: text('test_age_days').notNull(),
  verificationStatus: text('verification_status').notNull().default('planned'), // 'planned' | 'verified'
  summary: text('summary').notNull(),
  documentUrl: text('document_url'),
  publishedDate: text('published_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  location: text('location').notNull(),
  projectType: text('project_type').notNull(),
  status: text('status').notNull().default('planned_demo'), // 'planned_demo' | 'in_progress' | 'completed'
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const galleryItems = pgTable('gallery_items', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(), // 'product' | 'manufacturing' | 'machinery' | 'demonstration' | 'testing' | 'community'
  caption: text('caption').notNull(),
  imageUrl: text('image_url').notNull(),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const faqs = pgTable('faqs', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category').notNull().default('General'),
  sortOrder: integer('sort_order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
});

export const newsArticles = pgTable('news_articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(),
  summary: text('summary').notNull(),
  content: text('content').notNull(),
  publishedAt: text('published_at').notNull(),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const inquiries = pgTable('inquiries', {
  id: serial('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  organizationName: text('organization_name'),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  inquiryType: text('inquiry_type').notNull(),
  productInterest: text('product_interest').notNull(),
  estimatedQuantity: text('estimated_quantity'),
  projectLocation: text('project_location').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('new'), // 'new' | 'reviewed' | 'responded' | 'archived'
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  companyName: text('company_name').notNull(),
  tagline: text('tagline').notNull(),
  plantLocation: text('plant_location').notNull(),
  projectLead: text('project_lead').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone').notNull(),
  solarCapacity: text('solar_capacity').notNull(),
  plannedMonthlyCapacity: text('planned_monthly_capacity').notNull(),
  teamSize: text('team_size').notNull(),
  grantNote: text('grant_note').notNull(),
  disclaimerText: text('disclaimer_text').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productCategoriesRelations = relations(
  productCategories,
  ({ many }) => ({
    products: many(products),
  })
);

export const productsRelations = relations(products, ({ one }) => ({
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
}));
