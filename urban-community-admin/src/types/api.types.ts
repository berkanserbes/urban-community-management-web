export type UserRole = 'Admin' | 'Official' | 'Citizen'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  neighborhoodId?: string | null
  neighborhoodName?: string | null
  phoneNumber?: string | null
  bio?: string | null
  profileImageUrl?: string | null
  departmentId?: string | null
  departmentName?: string | null
  organizationDepartmentId?: string | null
  organizationId?: string | null
  organizationName?: string | null
  mustChangePassword?: boolean
  provinceId?: string | null
  provinceName?: string | null
  districtId?: string | null
  districtName?: string | null
  officialJurisdictionLevel?: 'Province' | 'District' | 'Neighborhood' | null
  officialJurisdictionId?: string | null
  officialJurisdictionName?: string | null
  officialProvinceId?: string | null
  officialProvinceName?: string | null
  officialDistrictId?: string | null
  officialDistrictName?: string | null
  isActive?: boolean
  fullName?: string
  createdAt?: string
  updatedAt?: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ApiResult<T> {
  isSuccess: boolean
  data: T | null
  errors: string[]
}

export interface LoginResponseData {
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
  userId: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  neighborhoodId?: string | null
  mustChangePassword: boolean
}

export type LoginResponse = ApiResult<LoginResponseData>

export interface RefreshTokenResponseData {
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
  userId: string
  email: string
  firstName: string
  lastName: string
  role: string
  mustChangePassword: boolean
}

export type RefreshTokenResponse = ApiResult<RefreshTokenResponseData>

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  title: string
  status: number
  errors?: Record<string, string[]>
}

// Reports
export type ReportStatus =
  | 'PendingReview'
  | 'AiReview'
  | 'Confirmed'
  | 'InProgress'
  | 'Resolved'
  | 'Rejected'

export type ReportPriority = 'Low' | 'Medium' | 'High' | 'Urgent'

export interface ReportDto {
  id: string
  title: string
  description: string
  status: ReportStatus
  priority: ReportPriority
  categoryId: string
  categoryName: string
  neighborhoodId: string
  neighborhoodName: string
  latitude?: number | null
  longitude?: number | null
  createdAt: string
  updatedAt?: string
  resolvedAt?: string | null
  reporterName: string
  assignedOrganizationDepartmentId?: string | null
  assignedOrganizationId?: string | null
  assignedOrganizationName?: string | null
  assignedDepartmentId?: string | null
  assignedDepartmentName?: string | null
  assignedDepartmentContactEmail?: string | null
  assignedDepartmentContactPhone?: string | null
  assignmentNeedsReview?: boolean
  similarReportCount?: number
}

// Users
export interface UserDto {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  role: UserRole
  neighborhoodId?: string
  neighborhoodName?: string
  departmentId?: string
  departmentName?: string
  organizationDepartmentId?: string | null
  organizationId?: string | null
  organizationName?: string | null
  officialJurisdictionLevel?: 'Province' | 'District' | 'Neighborhood' | null
  officialJurisdictionId?: string | null
  officialJurisdictionName?: string | null
  officialProvinceId?: string | null
  officialProvinceName?: string | null
  officialDistrictId?: string | null
  officialDistrictName?: string | null
  mustChangePassword?: boolean
  fullName?: string
  isActive: boolean
  bio?: string | null
  profileImageUrl?: string | null
  createdAt: string
}

// Categories
export interface CategoryDto {
  id: string
  name: string
  description?: string
  iconUrl?: string
  reportCount: number
}

// Suggestions
export type SuggestionStatus = 'Active' | 'Reviewing' | 'Implementation' | 'Closed'

export interface SuggestionDto {
  id: string
  title: string
  content: string
  officialResponse?: string | null
  status: SuggestionStatus
  voteScore: number
  upVotes: number
  downVotes: number
  userId: string
  userFullName: string
  createdAt: string
  updatedAt?: string | null
}

// Provinces
export interface ProvinceDto {
  id: string
  name: string
}

// Districts
export interface DistrictDto {
  id: string
  name: string
  provinceId: string
}

// Neighborhoods
export interface NeighborhoodDto {
  id: string
  name: string
  districtId?: string | null
  districtName?: string | null
  provinceId?: string | null
  provinceName?: string | null
}

// Departments
export interface DepartmentDto {
  id: string
  name: string
  description?: string
}

export interface DepartmentWithStatsDto extends DepartmentDto {
  officialCount: number
  assignedReportCount: number
}

export type OrganizationJurisdictionLevel = 'Province' | 'District' | 'Neighborhood'

export interface OrganizationDto {
  id: string
  name: string
  jurisdictionLevel: OrganizationJurisdictionLevel
  provinceId: string
  provinceName: string
  districtId?: string | null
  districtName?: string | null
  neighborhoodId?: string | null
  neighborhoodName?: string | null
  isActive: boolean
  departmentCount: number
  officialCount: number
}

export interface OrganizationDepartmentDto {
  id: string
  organizationId: string
  organizationName: string
  departmentId: string
  departmentName: string
  displayName: string
  contactEmail?: string | null
  contactPhone?: string | null
  isActive: boolean
  categoryIds: string[]
  officialCount: number
  assignedReportCount: number
}

// Announcements
export type AnnouncementScope = 'All' | 'Province' | 'District' | 'Neighborhood'

// Notifications
export type NotificationRelatedEntityType = 'Report' | 'Suggestion' | 'CommunityPost' | 'Announcement'

export interface NotificationDto {
  id: string
  title: string
  message: string
  isRead: boolean
  relatedEntityType?: NotificationRelatedEntityType | null
  relatedEntityId?: string | null
  createdAt: string
}

export interface AnnouncementDto {
  id: string
  title: string
  content: string
  userId: string
  userFullName: string
  scope: AnnouncementScope
  provinceId?: string | null
  provinceName?: string | null
  districtId?: string | null
  districtName?: string | null
  neighborhoodId?: string | null
  neighborhoodName?: string | null
  isActive: boolean
  expiresAt?: string | null
  createdAt: string
  updatedAt?: string | null
}
