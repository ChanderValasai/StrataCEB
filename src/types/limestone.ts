export interface SiteSettings {
  id: number;
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
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
}

export interface ProductItem {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  summary: string;
  description: string;
  dimensions: string;
  dimensionStatus: 'confirmed' | 'pending_confirmation' | string;
  binderSpec: string;
  applications: string;
  features: string;
  imageUrl: string;
  technicalDocUrl: string | null;
  availabilityStatus: string;
  isPublished: boolean;
}

export interface RawMaterial {
  id: number;
  name: string;
  sourceLocation: string;
  purpose: string;
  technicalNotes: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface ProcessStep {
  id: number;
  stepNumber: number;
  title: string;
  description: string;
  qualityControlNote: string;
  keyParameter: string;
}

export interface QualityTest {
  id: number;
  title: string;
  category: string;
  methodology: string;
  targetStandard: string;
  verificationStatus: 'planned' | 'verified' | string;
  institution: string;
  notes: string;
  sortOrder: number;
}

export interface LabReport {
  id: number;
  title: string;
  reportCode: string;
  institution: string;
  testAgeDays: string;
  verificationStatus: 'planned' | 'verified' | string;
  summary: string;
  documentUrl: string | null;
  publishedDate: string;
}

export interface ProjectItem {
  id: number;
  title: string;
  location: string;
  projectType: string;
  status: string;
  description: string;
  imageUrl: string;
  isPublished: boolean;
}

export interface GalleryItem {
  id: number;
  title: string;
  category: string;
  caption: string;
  imageUrl: string;
  isPublished: boolean;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  publishedAt: string;
  isPublished: boolean;
}

export interface InquiryItem {
  id: number;
  customerName: string;
  organizationName: string | null;
  email: string;
  phone: string;
  inquiryType: string;
  productInterest: string;
  estimatedQuantity: string | null;
  projectLocation: string;
  message: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  role: 'admin' | 'editor' | string;
  createdAt: string;
}

export interface PublicSiteBundle {
  settings: SiteSettings | null;
  categories: ProductCategory[];
  products: ProductItem[];
  rawMaterials: RawMaterial[];
  processSteps: ProcessStep[];
  qualityTests: QualityTest[];
  labReports: LabReport[];
  projects: ProjectItem[];
  gallery: GalleryItem[];
  faqs: FaqItem[];
  news: NewsArticle[];
}

export interface AdminOverviewBundle extends PublicSiteBundle {
  inquiries: InquiryItem[];
  users: AdminUser[];
  currentUser: AdminUser;
}
