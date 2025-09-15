"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, X, Search } from "lucide-react"
import { PROPERTY_TYPES, TIMELINES, STATUSES, LEAD_SOURCES } from "@/lib/constants"
import type { SearchFilters } from "@/lib/types"

interface AdvancedSearchProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onSearch: () => void
}

export function AdvancedSearch({ filters, onFiltersChange, onSearch }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newTag, setNewTag] = useState("")

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const addTag = () => {
    if (newTag.trim() && (!filters.tags || !filters.tags.includes(newTag.trim()))) {
      const currentTags = filters.tags || []
      updateFilter("tags", [...currentTags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    if (filters.tags) {
      updateFilter(
        "tags",
        filters.tags.filter((t) => t !== tag),
      )
    }
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof SearchFilters]
    return value !== undefined && value !== "" && (Array.isArray(value) ? value.length > 0 : true)
  })

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Advanced Search & Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {
                      Object.keys(filters).filter((key) => {
                        const value = filters[key as keyof SearchFilters]
                        return value !== undefined && value !== "" && (Array.isArray(value) ? value.length > 0 : true)
                      }).length
                    }{" "}
                    active
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Basic Search */}
            <div>
              <Label htmlFor="search">Search by name or email</Label>
              <Input
                id="search"
                placeholder="Enter name or email..."
                value={filters.search || ""}
                onChange={(e) => updateFilter("search", e.target.value)}
              />
            </div>

            {/* Status and Property Type */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status || ""}
                  onValueChange={(value) => updateFilter("status", value === "all" ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Status</SelectItem>
                    {STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="property_type">Property Type</Label>
                <Select
                  value={filters.property_type || ""}
                  onValueChange={(value) => updateFilter("property_type", value === "all" ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Type</SelectItem>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Select
                  value={filters.timeline || ""}
                  onValueChange={(value) => updateFilter("timeline", value === "all" ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Timeline</SelectItem>
                    {TIMELINES.map((timeline) => (
                      <SelectItem key={timeline.value} value={timeline.value}>
                        {timeline.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="min_price">Minimum Price</Label>
                <Input
                  id="min_price"
                  type="number"
                  placeholder="e.g., 300000"
                  value={filters.min_price || ""}
                  onChange={(e) => updateFilter("min_price", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label htmlFor="max_price">Maximum Price</Label>
                <Input
                  id="max_price"
                  type="number"
                  placeholder="e.g., 500000"
                  value={filters.max_price || ""}
                  onChange={(e) => updateFilter("max_price", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="lead_source">Lead Source</Label>
                <Select
                  value={filters.lead_source || ""}
                  onValueChange={(value) => updateFilter("lead_source", value === "all" ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Source</SelectItem>
                    {LEAD_SOURCES.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Downtown, Westside"
                  value={filters.location || ""}
                  onChange={(e) => updateFilter("location", e.target.value)}
                />
              </div>
            </div>

            {/* Pre-approved Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pre_approved"
                checked={filters.pre_approved || false}
                onCheckedChange={(checked) => updateFilter("pre_approved", checked ? true : undefined)}
              />
              <Label htmlFor="pre_approved">Pre-approved buyers only</Label>
            </div>

            {/* Tags Filter */}
            <div>
              <Label>Filter by Tags</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Add tag to filter by..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {filters.tags && filters.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {filters.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={onSearch} className="flex-1">
                <Search className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
