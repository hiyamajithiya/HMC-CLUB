export interface User {
  id: string
  email: string | null
  name: string | null
  phone: string | null
  role: 'ADMIN' | 'CLIENT'
  isActive: boolean
  services: string[]
  loginId: string | null
  dateOfBirth: string | null
  groupId: string | null
  createdAt: string
}

export interface UserProfile extends User {
  _count: {
    documents: number
    appointments: number
  }
  upcomingAppointments: number
}

export interface Document {
  id: string
  title: string
  description: string | null
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  category: DocCategory
  financialYear: string | null
  folderId: string | null
  uploadedBy: string
  userId: string
  createdAt: string
  updatedAt: string
  user: { name: string; email: string }
  folder: { id: string; name: string } | null
}

export type DocCategory =
  | 'TAX_RETURNS'
  | 'AUDIT_REPORTS'
  | 'GST_RETURNS'
  | 'COMPLIANCE'
  | 'INVOICES'
  | 'OTHER'

export interface DocumentFolder {
  id: string
  name: string
  parentId: string | null
  userId: string
  createdAt: string
  updatedAt: string
  _count: {
    documents: number
    children: number
  }
}

export interface Appointment {
  id: string
  userId: string | null
  name: string
  email: string
  phone: string
  service: string
  date: string
  timeSlot: string
  message: string | null
  status: AppointmentStatus
  googleEventId: string | null
  createdAt: string
  updatedAt: string
}

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string | null
  service: string | null
  message: string
  isRead: boolean
  isReplied: boolean
  createdAt: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string | null
  category: string
  tags: string[]
  isPublished: boolean
  publishedAt: string | null
  viewCount: number
  authorId: string | null
  createdAt: string
  updatedAt: string
}

export interface Tool {
  id: string
  name: string
  slug: string
  shortDescription: string
  longDescription: string
  version: string
  category: string
  toolType: string
  price: number | null
  licenseType: string
  downloadUrl: string | null
  requirements: string[]
  features: string[]
  iconImage: string | null
  downloadCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Download {
  id: string
  title: string
  description: string | null
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  category: string
  sortOrder: number
  isActive: boolean
  downloadCount: number
  createdAt: string
  updatedAt: string
}

export interface DownloadLead {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  toolId: string
  verified: boolean
  downloadedAt: string | null
  createdAt: string
}

export interface ClientGroup {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalUsers: number
  totalDocuments: number
  totalAppointments: number
  totalContacts: number
  totalBlogPosts: number
  totalTools: number
  pendingAppointments: number
  unreadContacts: number
  recentUsers: User[]
  recentAppointments: Appointment[]
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: {
    id: string
    email: string | null
    name: string | null
    role: string
  }
}

export interface MultiAccountResponse {
  multiAccount: true
  accounts: {
    id: string
    name: string | null
    loginId: string | null
    role: string
  }[]
}

export type LoginResponse = AuthResponse | MultiAccountResponse

export function isMultiAccount(res: LoginResponse): res is MultiAccountResponse {
  return 'multiAccount' in res && res.multiAccount === true
}
