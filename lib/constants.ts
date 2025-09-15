export const PROPERTY_TYPES = [
  { value: "single_family", label: "Single Family Home" },
  { value: "condo", label: "Condominium" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi_family", label: "Multi-Family" },
  { value: "land", label: "Land/Lot" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
] as const

export const TIMELINES = [
  { value: "immediate", label: "Immediate (0-30 days)" },
  { value: "3_months", label: "3 Months" },
  { value: "6_months", label: "6 Months" },
  { value: "1_year", label: "1 Year" },
  { value: "flexible", label: "Flexible" },
] as const

export const STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "closed", label: "Closed" },
  { value: "nurturing", label: "Nurturing" },
] as const

export const LEAD_SOURCES = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "social_media", label: "Social Media" },
  { value: "advertising", label: "Advertising" },
  { value: "cold_call", label: "Cold Call" },
  { value: "other", label: "Other" },
] as const

export const FINANCING_TYPES = [
  { value: "cash", label: "Cash" },
  { value: "conventional", label: "Conventional" },
  { value: "fha", label: "FHA" },
  { value: "va", label: "VA" },
  { value: "other", label: "Other" },
] as const

export const STATUS_COLORS = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  closed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  nurturing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
} as const

export const TIMELINE_COLORS = {
  immediate: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  "3_months": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  "6_months": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  "1_year": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  flexible: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
} as const
