export interface Buyer {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string; // Owner of this lead

  // Contact Information
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;

  // Property Preferences
  property_type:
    | "single_family"
    | "condo"
    | "townhouse"
    | "multi_family"
    | "land"
    | "commercial"
    | "other";
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_bathrooms?: number;
  max_bathrooms?: number;
  preferred_locations: string[]; // Array of city/neighborhood names

  // Timeline and Status
  timeline: "immediate" | "3_months" | "6_months" | "1_year" | "flexible";
  status: "active" | "inactive" | "closed" | "nurturing";
  lead_source:
    | "website"
    | "referral"
    | "social_media"
    | "advertising"
    | "cold_call"
    | "other";

  // Financial Information
  pre_approved: boolean;
  financing_type?: "cash" | "conventional" | "fha" | "va" | "other";
  down_payment_amount?: number;

  // Additional Details
  notes?: string;
  tags: string[];
}

export interface BuyerHistory {
  id: string;
  buyer_id: string;
  created_at: string;
  user_id: string;
  action_type:
    | "created"
    | "updated"
    | "status_changed"
    | "note_added"
    | "contact_attempted";
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  created_at: string;
  updated_at: string;
  company?: string;

  // Contact Information
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

// Form types
export interface CreateBuyerForm {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  property_type: Buyer["property_type"];
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_bathrooms?: number;
  max_bathrooms?: number;
  preferred_locations: string[];
  timeline: Buyer["timeline"];
  status: Buyer["status"];
  lead_source: Buyer["lead_source"];
  pre_approved: boolean;
  financing_type?: Buyer["financing_type"];
  down_payment_amount?: number;
  notes?: string;
  tags: string[];
}

export interface SearchFilters {
  search?: string;
  property_type?: Buyer["property_type"];
  status?: Buyer["status"];
  timeline?: Buyer["timeline"];
  lead_source?: Buyer["lead_source"];
  min_price?: number;
  max_price?: number;
  pre_approved?: boolean;
  tags?: string[];
  location?: string;
}

// CSV export type
export interface BuyerCSVRow {
  "First Name": string;
  "Last Name": string;
  Email: string;
  Phone: string;
  "Property Type": string;
  "Min Price": string;
  "Max Price": string;
  "Min Bedrooms": string;
  "Max Bedrooms": string;
  "Min Bathrooms": string;
  "Max Bathrooms": string;
  "Preferred Locations": string;
  Timeline: string;
  Status: string;
  "Lead Source": string;
  "Pre-approved": string;
  "Financing Type": string;
  "Down Payment": string;
  Notes: string;
  Tags: string;
  "Created Date": string;
  "Updated Date": string;
}
