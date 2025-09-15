"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, X } from "lucide-react";
import {
  PROPERTY_TYPES,
  TIMELINES,
  STATUSES,
  LEAD_SOURCES,
  FINANCING_TYPES,
} from "@/lib/constants";
import type { Buyer } from "@/lib/types";
import { getBuyer, updateBuyer } from "@/lib/database";

export default function EditLeadPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lead, setLead] = useState<Buyer | null>(null);
  const [newLocation, setNewLocation] = useState("");
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (params.id) {
      loadLead(params.id as string);
    }
  }, [params.id]);

  const loadLead = async (id: string) => {
    try {
      const data = await getBuyer(id);
      setLead(data);
    } catch (error) {
      console.error("Failed to load lead:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    setSaving(true);
    try {
      await updateBuyer(lead.id, lead);
      router.push(`/leads/${lead.id}`);
    } catch (error) {
      console.error("Failed to update lead:", error);
    } finally {
      setSaving(false);
    }
  };

  const addLocation = () => {
    if (
      newLocation.trim() &&
      lead &&
      !lead.preferred_locations.includes(newLocation.trim())
    ) {
      setLead({
        ...lead,
        preferred_locations: [...lead.preferred_locations, newLocation.trim()],
      });
      setNewLocation("");
    }
  };

  const removeLocation = (location: string) => {
    if (lead) {
      setLead({
        ...lead,
        preferred_locations: lead.preferred_locations.filter(
          (l) => l !== location,
        ),
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && lead && !lead.tags.includes(newTag.trim())) {
      setLead({
        ...lead,
        tags: [...lead.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    if (lead) {
      setLead({
        ...lead,
        tags: lead.tags.filter((t) => t !== tag),
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading lead...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Lead not found</p>
          <Button asChild>
            <Link href="/leads">Back to Leads</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/leads/${lead.id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Edit {lead.first_name} {lead.last_name}
              </h1>
              <p className="text-muted-foreground">Update lead information</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Basic contact details for the buyer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    required
                    value={lead.first_name}
                    onChange={(e) =>
                      setLead({ ...lead, first_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    required
                    value={lead.last_name}
                    onChange={(e) =>
                      setLead({ ...lead, last_name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={lead.email}
                    onChange={(e) =>
                      setLead({ ...lead, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={lead.phone || ""}
                    onChange={(e) =>
                      setLead({ ...lead, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Property Preferences</CardTitle>
              <CardDescription>
                What type of property is the buyer looking for?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="property_type">Property Type *</Label>
                  <Select
                    value={lead.property_type}
                    onValueChange={(value) =>
                      setLead({ ...lead, property_type: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timeline">Timeline *</Label>
                  <Select
                    value={lead.timeline}
                    onValueChange={(value) =>
                      setLead({ ...lead, timeline: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMELINES.map((timeline) => (
                        <SelectItem key={timeline.value} value={timeline.value}>
                          {timeline.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="min_price">Minimum Price</Label>
                  <Input
                    id="min_price"
                    type="number"
                    value={lead.min_price || ""}
                    onChange={(e) =>
                      setLead({
                        ...lead,
                        min_price: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="max_price">Maximum Price</Label>
                  <Input
                    id="max_price"
                    type="number"
                    value={lead.max_price || ""}
                    onChange={(e) =>
                      setLead({
                        ...lead,
                        max_price: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="min_bedrooms">Min Bedrooms</Label>
                  <Input
                    id="min_bedrooms"
                    type="number"
                    min="0"
                    max="10"
                    value={lead.min_bedrooms || ""}
                    onChange={(e) =>
                      setLead({
                        ...lead,
                        min_bedrooms: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="max_bedrooms">Max Bedrooms</Label>
                  <Input
                    id="max_bedrooms"
                    type="number"
                    min="0"
                    max="10"
                    value={lead.max_bedrooms || ""}
                    onChange={(e) =>
                      setLead({
                        ...lead,
                        max_bedrooms: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="min_bathrooms">Min Bathrooms</Label>
                  <Input
                    id="min_bathrooms"
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={lead.min_bathrooms || ""}
                    onChange={(e) =>
                      setLead({
                        ...lead,
                        min_bathrooms: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>

              {/* Preferred Locations */}
              <div>
                <Label>Preferred Locations</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Add location"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addLocation())
                    }
                  />
                  <Button type="button" onClick={addLocation}>
                    Add
                  </Button>
                </div>
                {lead.preferred_locations.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {lead.preferred_locations.map((location) => (
                      <Badge
                        key={location}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {location}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeLocation(location)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lead Details */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Details</CardTitle>
              <CardDescription>
                Status, source, and financial information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={lead.status}
                    onValueChange={(value) =>
                      setLead({ ...lead, status: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lead_source">Lead Source *</Label>
                  <Select
                    value={lead.lead_source}
                    onValueChange={(value) =>
                      setLead({ ...lead, lead_source: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_SOURCES.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="pre_approved"
                    checked={lead.pre_approved}
                    onCheckedChange={(checked) =>
                      setLead({ ...lead, pre_approved: !!checked })
                    }
                  />
                  <Label htmlFor="pre_approved">
                    Pre-approved for financing
                  </Label>
                </div>
              </div>

              {lead.pre_approved && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="financing_type">Financing Type</Label>
                    <Select
                      value={lead.financing_type || ""}
                      onValueChange={(value) =>
                        setLead({ ...lead, financing_type: value as any })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select financing type" />
                      </SelectTrigger>
                      <SelectContent>
                        {FINANCING_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="down_payment">Down Payment Amount</Label>
                    <Input
                      id="down_payment"
                      type="number"
                      value={lead.down_payment_amount || ""}
                      onChange={(e) =>
                        setLead({
                          ...lead,
                          down_payment_amount: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Notes and tags for this lead</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={lead.notes || ""}
                  onChange={(e) => setLead({ ...lead, notes: e.target.value })}
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <Button type="button" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {lead.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {lead.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" asChild>
              <Link href={`/leads/${lead.id}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
