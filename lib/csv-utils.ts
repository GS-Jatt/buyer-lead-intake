import type { Buyer, BuyerCSVRow } from "./types"

// Convert buyer data to CSV format
export function buyersToCSV(buyers: Buyer[]): string {
  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Property Type",
    "Min Price",
    "Max Price",
    "Min Bedrooms",
    "Max Bedrooms",
    "Min Bathrooms",
    "Max Bathrooms",
    "Preferred Locations",
    "Timeline",
    "Status",
    "Lead Source",
    "Pre-approved",
    "Financing Type",
    "Down Payment",
    "Notes",
    "Tags",
    "Created Date",
    "Updated Date",
  ]

  const rows = buyers.map((buyer) => {
    const row: BuyerCSVRow = {
      "First Name": buyer.first_name,
      "Last Name": buyer.last_name,
      Email: buyer.email,
      Phone: buyer.phone || "",
      "Property Type": buyer.property_type.replace("_", " "),
      "Min Price": buyer.min_price?.toString() || "",
      "Max Price": buyer.max_price?.toString() || "",
      "Min Bedrooms": buyer.min_bedrooms?.toString() || "",
      "Max Bedrooms": buyer.max_bedrooms?.toString() || "",
      "Min Bathrooms": buyer.min_bathrooms?.toString() || "",
      "Max Bathrooms": buyer.max_bathrooms?.toString() || "",
      "Preferred Locations": buyer.preferred_locations.join("; "),
      Timeline: buyer.timeline.replace("_", " "),
      Status: buyer.status,
      "Lead Source": buyer.lead_source.replace("_", " "),
      "Pre-approved": buyer.pre_approved ? "Yes" : "No",
      "Financing Type": buyer.financing_type?.replace("_", " ") || "",
      "Down Payment": buyer.down_payment_amount?.toString() || "",
      Notes: buyer.notes || "",
      Tags: buyer.tags.join("; "),
      "Created Date": new Date(buyer.created_at).toLocaleDateString(),
      "Updated Date": new Date(buyer.updated_at).toLocaleDateString(),
    }
    return row
  })

  // Convert to CSV string
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof BuyerCSVRow]
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(","),
    ),
  ].join("\n")

  return csvContent
}

// Download CSV file
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Parse CSV content to buyer data
export function parseCSVToBuyers(csvContent: string): Partial<Buyer>[] {
  const lines = csvContent.split("\n").filter((line) => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
  const buyers: Partial<Buyer>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length !== headers.length) continue

    const buyer: Partial<Buyer> = {
      user_id: "user1", // Will be set by auth system
    }

    headers.forEach((header, index) => {
      const value = values[index]?.trim()
      if (!value) return

      switch (header) {
        case "First Name":
          buyer.first_name = value
          break
        case "Last Name":
          buyer.last_name = value
          break
        case "Email":
          buyer.email = value
          break
        case "Phone":
          buyer.phone = value
          break
        case "Property Type":
          buyer.property_type = value.toLowerCase().replace(" ", "_") as any
          break
        case "Min Price":
          buyer.min_price = Number.parseFloat(value) || undefined
          break
        case "Max Price":
          buyer.max_price = Number.parseFloat(value) || undefined
          break
        case "Min Bedrooms":
          buyer.min_bedrooms = Number.parseInt(value) || undefined
          break
        case "Max Bedrooms":
          buyer.max_bedrooms = Number.parseInt(value) || undefined
          break
        case "Min Bathrooms":
          buyer.min_bathrooms = Number.parseFloat(value) || undefined
          break
        case "Max Bathrooms":
          buyer.max_bathrooms = Number.parseFloat(value) || undefined
          break
        case "Preferred Locations":
          buyer.preferred_locations = value
            .split(";")
            .map((l) => l.trim())
            .filter((l) => l)
          break
        case "Timeline":
          buyer.timeline = value.toLowerCase().replace(" ", "_") as any
          break
        case "Status":
          buyer.status = value.toLowerCase() as any
          break
        case "Lead Source":
          buyer.lead_source = value.toLowerCase().replace(" ", "_") as any
          break
        case "Pre-approved":
          buyer.pre_approved = value.toLowerCase() === "yes" || value.toLowerCase() === "true"
          break
        case "Financing Type":
          buyer.financing_type = value.toLowerCase().replace(" ", "_") as any
          break
        case "Down Payment":
          buyer.down_payment_amount = Number.parseFloat(value) || undefined
          break
        case "Notes":
          buyer.notes = value
          break
        case "Tags":
          buyer.tags = value
            .split(";")
            .map((t) => t.trim())
            .filter((t) => t)
          break
      }
    })

    // Only add if we have required fields
    if (buyer.first_name && buyer.last_name && buyer.email) {
      buyers.push(buyer)
    }
  }

  return buyers
}

// Helper function to parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  // Add final field
  result.push(current)

  return result
}

// Validate CSV data
export interface CSVValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  validRows: number
  totalRows: number
}

export function validateCSVData(buyers: Partial<Buyer>[]): CSVValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let validRows = 0

  buyers.forEach((buyer, index) => {
    const rowNum = index + 2 // +2 because index starts at 0 and we skip header

    // Required field validation
    if (!buyer.first_name) {
      errors.push(`Row ${rowNum}: First Name is required`)
    }
    if (!buyer.last_name) {
      errors.push(`Row ${rowNum}: Last Name is required`)
    }
    if (!buyer.email) {
      errors.push(`Row ${rowNum}: Email is required`)
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email)) {
      errors.push(`Row ${rowNum}: Invalid email format`)
    }

    // Property type validation
    const validPropertyTypes = ["single_family", "condo", "townhouse", "multi_family", "land", "commercial", "other"]
    if (buyer.property_type && !validPropertyTypes.includes(buyer.property_type)) {
      warnings.push(`Row ${rowNum}: Invalid property type "${buyer.property_type}", will default to "other"`)
      buyer.property_type = "other"
    }

    // Timeline validation
    const validTimelines = ["immediate", "3_months", "6_months", "1_year", "flexible"]
    if (buyer.timeline && !validTimelines.includes(buyer.timeline)) {
      warnings.push(`Row ${rowNum}: Invalid timeline "${buyer.timeline}", will default to "flexible"`)
      buyer.timeline = "flexible"
    }

    // Status validation
    const validStatuses = ["active", "inactive", "closed", "nurturing"]
    if (buyer.status && !validStatuses.includes(buyer.status)) {
      warnings.push(`Row ${rowNum}: Invalid status "${buyer.status}", will default to "active"`)
      buyer.status = "active"
    }

    // Lead source validation
    const validLeadSources = ["website", "referral", "social_media", "advertising", "cold_call", "other"]
    if (buyer.lead_source && !validLeadSources.includes(buyer.lead_source)) {
      warnings.push(`Row ${rowNum}: Invalid lead source "${buyer.lead_source}", will default to "other"`)
      buyer.lead_source = "other"
    }

    // Price validation
    if (buyer.min_price && buyer.max_price && buyer.min_price > buyer.max_price) {
      warnings.push(`Row ${rowNum}: Minimum price is greater than maximum price`)
    }

    // Bedroom validation
    if (buyer.min_bedrooms && buyer.max_bedrooms && buyer.min_bedrooms > buyer.max_bedrooms) {
      warnings.push(`Row ${rowNum}: Minimum bedrooms is greater than maximum bedrooms`)
    }

    // Set defaults for missing optional fields
    if (!buyer.property_type) buyer.property_type = "single_family"
    if (!buyer.timeline) buyer.timeline = "flexible"
    if (!buyer.status) buyer.status = "active"
    if (!buyer.lead_source) buyer.lead_source = "other"
    if (!buyer.preferred_locations) buyer.preferred_locations = []
    if (!buyer.tags) buyer.tags = []
    if (buyer.pre_approved === undefined) buyer.pre_approved = false

    if (buyer.first_name && buyer.last_name && buyer.email) {
      validRows++
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    validRows,
    totalRows: buyers.length,
  }
}
