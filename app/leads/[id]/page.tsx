"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";
import { STATUS_COLORS, TIMELINE_COLORS } from "@/lib/constants";
import type { Buyer, BuyerHistory } from "@/lib/types";
import { getBuyer, getBuyerHistory, updateBuyer } from "@/lib/database";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Buyer | null>(null);
  const [history, setHistory] = useState<BuyerHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadLead(params.id as string);
      loadHistory(params.id as string);
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

  const loadHistory = async (id: string) => {
    try {
      const data = await getBuyerHistory(id);
      setHistory(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !lead) return;

    setAddingNote(true);
    try {
      await updateBuyer(lead.id, {
        notes: newNote.trim(),
      });
      setNewNote("");
      loadHistory(lead.id);
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setAddingNote(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading lead details...</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/leads">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {lead.first_name} {lead.last_name}
                </h1>
                <p className="text-muted-foreground">Lead Details</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href={`/leads/${lead.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Lead
                </Link>
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive bg-transparent"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Lead Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">
                        {lead.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Property Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Property Type
                    </p>
                    <p className="font-medium capitalize">
                      {lead.property_type.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <Badge
                      className={TIMELINE_COLORS[lead.timeline]}
                      variant="outline"
                    >
                      {lead.timeline.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Price Range</p>
                    <p className="font-medium">
                      {formatCurrency(lead.min_price)} -{" "}
                      {formatCurrency(lead.max_price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="font-medium">
                      {lead.min_bedrooms || "Any"} -{" "}
                      {lead.max_bedrooms || "Any"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="font-medium">
                      {lead.min_bathrooms || "Any"}+
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Preferred Locations
                  </p>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {lead.preferred_locations.map((location) => (
                      <Badge key={location} variant="secondary">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pre-approved
                    </p>
                    <Badge
                      variant={lead.pre_approved ? "default" : "secondary"}
                    >
                      {lead.pre_approved ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {lead.financing_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Financing Type
                      </p>
                      <p className="font-medium capitalize">
                        {lead.financing_type.replace("_", " ")}
                      </p>
                    </div>
                  )}
                  {lead.down_payment_amount && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Down Payment
                      </p>
                      <p className="font-medium">
                        {formatCurrency(lead.down_payment_amount)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {lead.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{lead.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Status</p>
                  <Badge className={STATUS_COLORS[lead.status]}>
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Lead Source
                  </p>
                  <p className="font-medium capitalize">
                    {lead.lead_source.replace("_", " ")}
                  </p>
                </div>

                {lead.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tags</p>
                    <div className="flex gap-1 flex-wrap">
                      {lead.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="text-sm text-muted-foreground">
                  <p>Created: {formatDate(lead.created_at)}</p>
                  <p>Updated: {formatDate(lead.updated_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Add Note */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Add Note
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add a note about this lead..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button
                  onClick={addNote}
                  disabled={!newNote.trim() || addingNote}
                  className="w-full"
                >
                  {addingNote ? "Adding..." : "Add Note"}
                </Button>
              </CardContent>
            </Card>

            {/* Activity History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Activity History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No activity recorded yet.
                    </p>
                  ) : (
                    history.map((entry) => (
                      <div
                        key={entry.id}
                        className="border-l-2 border-muted pl-4 pb-4"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium capitalize">
                            {entry.action_type.replace("_", " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(entry.created_at)}
                          </p>
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground">
                            {entry.notes}
                          </p>
                        )}
                        {entry.field_changed && (
                          <p className="text-xs text-muted-foreground">
                            {entry.field_changed}: {entry.old_value} →{" "}
                            {entry.new_value}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
