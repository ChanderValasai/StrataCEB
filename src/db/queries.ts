import { asc, desc, eq } from 'drizzle-orm';
import { db } from './index.js';
import {
  faqs,
  galleryItems,
  inquiries,
  labReports,
  newsArticles,
  processSteps,
  productCategories,
  products,
  projects,
  qualityTests,
  rawMaterials,
  siteSettings,
  users,
} from './schema.js';
import { ensureSeeded } from './seed.js';

function dbError(message: string, error: unknown): Error {
  console.error(message, error);
  return new Error(message, { cause: error });
}

export async function getPublicSiteBundle() {
  try {
    await ensureSeeded();

    const [
      settingsRows,
      categoriesRows,
      productRows,
      materialRows,
      stepRows,
      testRows,
      reportRows,
      projectRows,
      galleryRows,
      faqRows,
      newsRows,
    ] = await Promise.all([
      db.select().from(siteSettings).limit(1),
      db.select().from(productCategories).orderBy(asc(productCategories.sortOrder)),
      db
        .select()
        .from(products)
        .where(eq(products.isPublished, true))
        .orderBy(asc(products.id)),
      db
        .select()
        .from(rawMaterials)
        .where(eq(rawMaterials.isPublished, true))
        .orderBy(asc(rawMaterials.sortOrder)),
      db.select().from(processSteps).orderBy(asc(processSteps.stepNumber)),
      db.select().from(qualityTests).orderBy(asc(qualityTests.sortOrder)),
      db.select().from(labReports).orderBy(desc(labReports.id)),
      db
        .select()
        .from(projects)
        .where(eq(projects.isPublished, true))
        .orderBy(desc(projects.id)),
      db
        .select()
        .from(galleryItems)
        .where(eq(galleryItems.isPublished, true))
        .orderBy(desc(galleryItems.id)),
      db
        .select()
        .from(faqs)
        .where(eq(faqs.isPublished, true))
        .orderBy(asc(faqs.sortOrder)),
      db
        .select()
        .from(newsArticles)
        .where(eq(newsArticles.isPublished, true))
        .orderBy(desc(newsArticles.id)),
    ]);

    return {
      settings: settingsRows[0] ?? null,
      categories: categoriesRows,
      products: productRows,
      rawMaterials: materialRows,
      processSteps: stepRows,
      qualityTests: testRows,
      labReports: reportRows,
      projects: projectRows,
      gallery: galleryRows,
      faqs: faqRows,
      news: newsRows,
    };
  } catch (error) {
    throw dbError('Failed to load public website content.', error);
  }
}

export async function getAdminOverviewBundle(includeUsers: boolean) {
  try {
    await ensureSeeded();

    const [
      settingsRows,
      categoriesRows,
      productRows,
      materialRows,
      stepRows,
      testRows,
      reportRows,
      projectRows,
      galleryRows,
      faqRows,
      newsRows,
      inquiryRows,
      userRows,
    ] = await Promise.all([
      db.select().from(siteSettings).limit(1),
      db.select().from(productCategories).orderBy(asc(productCategories.sortOrder)),
      db.select().from(products).orderBy(asc(products.id)),
      db.select().from(rawMaterials).orderBy(asc(rawMaterials.sortOrder)),
      db.select().from(processSteps).orderBy(asc(processSteps.stepNumber)),
      db.select().from(qualityTests).orderBy(asc(qualityTests.sortOrder)),
      db.select().from(labReports).orderBy(desc(labReports.id)),
      db.select().from(projects).orderBy(desc(projects.id)),
      db.select().from(galleryItems).orderBy(desc(galleryItems.id)),
      db.select().from(faqs).orderBy(asc(faqs.sortOrder)),
      db.select().from(newsArticles).orderBy(desc(newsArticles.id)),
      db.select().from(inquiries).orderBy(desc(inquiries.createdAt)),
      includeUsers ? db.select().from(users).orderBy(asc(users.id)) : Promise.resolve([]),
    ]);

    return {
      settings: settingsRows[0] ?? null,
      categories: categoriesRows,
      products: productRows,
      rawMaterials: materialRows,
      processSteps: stepRows,
      qualityTests: testRows,
      labReports: reportRows,
      projects: projectRows,
      gallery: galleryRows,
      faqs: faqRows,
      news: newsRows,
      inquiries: inquiryRows,
      users: userRows,
    };
  } catch (error) {
    throw dbError('Failed to load administrative overview.', error);
  }
}

export async function createInquiryRecord(payload: {
  customerName: string;
  organizationName: string | null;
  email: string;
  phone: string;
  inquiryType: string;
  productInterest: string;
  estimatedQuantity: string | null;
  projectLocation: string;
  message: string;
}) {
  try {
    const inserted = await db.insert(inquiries).values(payload).returning();
    return inserted[0];
  } catch (error) {
    throw dbError('Failed to save customer inquiry.', error);
  }
}

export async function updateInquiryRecord(
  id: number,
  updates: { status?: string; adminNotes?: string | null }
) {
  try {
    const updated = await db
      .update(inquiries)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(inquiries.id, id))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    throw dbError('Failed to update inquiry record.', error);
  }
}

export async function deleteInquiryRecord(id: number) {
  try {
    const deleted = await db
      .delete(inquiries)
      .where(eq(inquiries.id, id))
      .returning();
    return deleted[0] ?? null;
  } catch (error) {
    throw dbError('Failed to delete inquiry record.', error);
  }
}

export async function createProductRecord(payload: {
  categoryId: number;
  name: string;
  slug: string;
  summary: string;
  description: string;
  dimensions: string;
  dimensionStatus: string;
  binderSpec: string;
  applications: string;
  features: string;
  imageUrl: string;
  technicalDocUrl: string | null;
  availabilityStatus: string;
  isPublished: boolean;
}) {
  try {
    const inserted = await db.insert(products).values(payload).returning();
    return inserted[0];
  } catch (error) {
    throw dbError('Failed to create product.', error);
  }
}

export async function updateProductRecord(
  id: number,
  payload: Partial<{
    categoryId: number;
    name: string;
    summary: string;
    description: string;
    dimensions: string;
    dimensionStatus: string;
    binderSpec: string;
    applications: string;
    features: string;
    imageUrl: string;
    technicalDocUrl: string | null;
    availabilityStatus: string;
    isPublished: boolean;
  }>
) {
  try {
    const updated = await db
      .update(products)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    throw dbError('Failed to update product.', error);
  }
}

export async function deleteProductRecord(id: number) {
  try {
    const deleted = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    return deleted[0] ?? null;
  } catch (error) {
    throw dbError('Failed to delete product.', error);
  }
}

export async function createLabReportRecord(payload: {
  title: string;
  reportCode: string;
  institution: string;
  testAgeDays: string;
  verificationStatus: string;
  summary: string;
  documentUrl: string | null;
  publishedDate: string;
}) {
  try {
    const inserted = await db.insert(labReports).values(payload).returning();
    return inserted[0];
  } catch (error) {
    throw dbError('Failed to create laboratory report.', error);
  }
}

export async function updateLabReportRecord(
  id: number,
  payload: Partial<{
    title: string;
    reportCode: string;
    institution: string;
    testAgeDays: string;
    verificationStatus: string;
    summary: string;
    documentUrl: string | null;
    publishedDate: string;
  }>
) {
  try {
    const updated = await db
      .update(labReports)
      .set(payload)
      .where(eq(labReports.id, id))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    throw dbError('Failed to update laboratory report.', error);
  }
}

export async function deleteLabReportRecord(id: number) {
  try {
    const deleted = await db
      .delete(labReports)
      .where(eq(labReports.id, id))
      .returning();
    return deleted[0] ?? null;
  } catch (error) {
    throw dbError('Failed to delete laboratory report.', error);
  }
}

export async function createProjectRecord(payload: {
  title: string;
  location: string;
  projectType: string;
  status: string;
  description: string;
  imageUrl: string;
  isPublished: boolean;
}) {
  try {
    const inserted = await db.insert(projects).values(payload).returning();
    return inserted[0];
  } catch (error) {
    throw dbError('Failed to create project.', error);
  }
}

export async function updateProjectRecord(
  id: number,
  payload: Partial<{
    title: string;
    location: string;
    projectType: string;
    status: string;
    description: string;
    imageUrl: string;
    isPublished: boolean;
  }>
) {
  try {
    const updated = await db
      .update(projects)
      .set(payload)
      .where(eq(projects.id, id))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    throw dbError('Failed to update project.', error);
  }
}

export async function deleteProjectRecord(id: number) {
  try {
    const deleted = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();
    return deleted[0] ?? null;
  } catch (error) {
    throw dbError('Failed to delete project.', error);
  }
}

export async function createFaqRecord(payload: {
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isPublished: boolean;
}) {
  try {
    const inserted = await db.insert(faqs).values(payload).returning();
    return inserted[0];
  } catch (error) {
    throw dbError('Failed to create FAQ.', error);
  }
}

export async function updateFaqRecord(
  id: number,
  payload: Partial<{
    question: string;
    answer: string;
    category: string;
    sortOrder: number;
    isPublished: boolean;
  }>
) {
  try {
    const updated = await db
      .update(faqs)
      .set(payload)
      .where(eq(faqs.id, id))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    throw dbError('Failed to update FAQ.', error);
  }
}

export async function deleteFaqRecord(id: number) {
  try {
    const deleted = await db.delete(faqs).where(eq(faqs.id, id)).returning();
    return deleted[0] ?? null;
  } catch (error) {
    throw dbError('Failed to delete FAQ.', error);
  }
}

export async function createNewsRecord(payload: {
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  publishedAt: string;
  isPublished: boolean;
}) {
  try {
    const inserted = await db.insert(newsArticles).values(payload).returning();
    return inserted[0];
  } catch (error) {
    throw dbError('Failed to create news update.', error);
  }
}

export async function updateNewsRecord(
  id: number,
  payload: Partial<{
    title: string;
    category: string;
    summary: string;
    content: string;
    publishedAt: string;
    isPublished: boolean;
  }>
) {
  try {
    const updated = await db
      .update(newsArticles)
      .set(payload)
      .where(eq(newsArticles.id, id))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    throw dbError('Failed to update news update.', error);
  }
}

export async function deleteNewsRecord(id: number) {
  try {
    const deleted = await db
      .delete(newsArticles)
      .where(eq(newsArticles.id, id))
      .returning();
    return deleted[0] ?? null;
  } catch (error) {
    throw dbError('Failed to delete news update.', error);
  }
}

export async function createGalleryRecord(payload: {
  title: string;
  category: string;
  caption: string;
  imageUrl: string;
  isPublished: boolean;
}) {
  try {
    const inserted = await db.insert(galleryItems).values(payload).returning();
    return inserted[0];
  } catch (error) {
    throw dbError('Failed to create gallery item.', error);
  }
}

export async function deleteGalleryRecord(id: number) {
  try {
    const deleted = await db
      .delete(galleryItems)
      .where(eq(galleryItems.id, id))
      .returning();
    return deleted[0] ?? null;
  } catch (error) {
    throw dbError('Failed to delete gallery item.', error);
  }
}

export async function updateSiteSettingsRecord(
  id: number,
  payload: Partial<{
    companyName: string;
    tagline: string;
    plantLocation: string;
    projectLead: string;
    contactEmail: string;
    contactPhone: string;
    solarCapacity: string;
    plannedMonthlyCapacity: string;
    teamSize: string;
    grantNote: string;
    disclaimerText: string;
  }>
) {
  try {
    const updated = await db
      .update(siteSettings)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(siteSettings.id, id))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    throw dbError('Failed to update site settings.', error);
  }
}
