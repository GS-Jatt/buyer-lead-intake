"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import type { CreateBuyerForm } from "@/lib/types";
import { createBuyer } from "@/lib/database";

export default function CreateLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateBuyerForm>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    property_type: "single_family",
    min_price: undefined,
    max_price: undefined,
    min_bedrooms: undefined,
    max_bedrooms: undefined,
    min_bathrooms: undefined,
    max_bathrooms: undefined,
    preferred_locations: [],
    timeline: "3_months",
    status: "active",
    lead_source: "website",
    pre_approved: false,
    financing_type: undefined,
    down_payment_amount: undefined,
    notes: "",
    tags: [],
  });
  const [newLocation, setNewLocation] = useState("");
  const [newTag, setNewTag] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("start");
      await createBuyer(formData);
      router.push("/leads");
    } catch (error) {
      console.error("Failed to create lead:", error);
    } finally {
      setLoading(false);
    }
  };

  const addLocation = () => {
    if (
      newLocation.trim() &&
      !formData.preferred_locations.includes(newLocation.trim())
    ) {
      setFormData({
        ...formData,
        preferred_locations: [
          ...formData.preferred_locations,
          newLocation.trim(),
        ],
      });
      setNewLocation("");
    }
  };

  const removeLocation = (location: string) => {
    setFormData({
      ...formData,
      preferred_locations: formData.preferred_locations.filter(
        (l) => l !== location,
      ),
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/leads">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Create New Lead
              </h1>
              <p className="text-muted-foreground">
                Add a new buyer lead to your CRM
              </p>
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
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    required
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
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
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
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
                    value={formData.property_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, property_type: value as any })
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
                    value={formData.timeline}
                    onValueChange={(value) =>
                      setFormData({ ...formData, timeline: value as any })
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
                    placeholder="300000"
                    value={formData.min_price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
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
                    placeholder="500000"
                    value={formData.max_price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
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
                    value={formData.min_bedrooms || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
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
                    value={formData.max_bedrooms || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
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
                    value={formData.min_bathrooms || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
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
                    placeholder="Add location (e.g., Downtown, Westside)"
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
                {formData.preferred_locations.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {formData.preferred_locations.map((location) => (
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
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as any })
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
                    value={formData.lead_source}
                    onValueChange={(value) =>
                      setFormData({ ...formData, lead_source: value as any })
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
                    checked={formData.pre_approved}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, pre_approved: !!checked })
                    }
                  />
                  <Label htmlFor="pre_approved">
                    Pre-approved for financing
                  </Label>
                </div>
              </div>

              {formData.pre_approved && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="financing_type">Financing Type</Label>
                    <Select
                      value={formData.financing_type || ""}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          financing_type: value as any,
                        })
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
                      placeholder="60000"
                      value={formData.down_payment_amount || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
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
                  placeholder="Any additional notes about this buyer..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Add tag (e.g., first-time-buyer, investor)"
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
                {formData.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {formData.tags.map((tag) => (
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
              <Link href="/leads">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Creating..." : "Create Lead"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
