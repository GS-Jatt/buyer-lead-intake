"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Download, Eye, Edit, Trash2, Upload } from "lucide-react";
import { getBuyers, deleteBuyer } from "@/lib/database";
import { STATUS_COLORS, TIMELINE_COLORS } from "@/lib/constants";
import { AdvancedSearch } from "@/components/advanced-search";
import { buyersToCSV, downloadCSV } from "@/lib/csv-utils";
import type { Buyer, SearchFilters } from "@/lib/types";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [exporting, setExporting] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/sigin");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadLeads();
    }
  }, [user, filters]);

  const loadLeads = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await getBuyers(filters);
      setLeads(data);
    } catch (error) {
      console.error("Failed to load leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadLeads();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const allLeads = await getBuyers({});
      const csvContent = buyersToCSV(allLeads);
      const timestamp = new Date().toISOString().split("T")[0];
      downloadCSV(csvContent, `buyer-leads-${timestamp}.csv`);
    } catch (error) {
      console.error("Failed to export leads:", error);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      await deleteBuyer(id);
      setLeads(leads.filter((lead) => lead.id !== id));
    } catch (error) {
      console.error("Failed to delete lead:", error);
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
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Buyer Leads</h1>
            <p className="text-muted-foreground">
              Manage and track your buyer leads
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting}
            >
              <Download className="mr-2 h-4 w-4" />
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/leads/import">
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Link>
            </Button>
            <Button asChild>
              <Link href="/leads/create">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Lead
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <AdvancedSearch
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
          />
        </div>

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Leads ({leads.length})</CardTitle>
                <CardDescription>
                  {loading ? "Loading..." : `Showing ${leads.length} leads`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading leads...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No leads found matching your criteria.
                </p>
                <Button asChild>
                  <Link href="/leads/create">Add Your First Lead</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {lead.first_name} {lead.last_name}
                          </h3>
                          <Badge className={STATUS_COLORS[lead.status]}>
                            {lead.status.charAt(0).toUpperCase() +
                              lead.status.slice(1)}
                          </Badge>
                          <Badge
                            className={TIMELINE_COLORS[lead.timeline]}
                            variant="outline"
                          >
                            {lead.timeline.replace("_", " ")}
                          </Badge>
                        </div>

                        <div className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
                          <div>
                            <p>
                              <strong>Email:</strong> {lead.email}
                            </p>
                            <p>
                              <strong>Phone:</strong>{" "}
                              {lead.phone || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Property Type:</strong>{" "}
                              {lead.property_type.replace("_", " ")}
                            </p>
                            <p>
                              <strong>Budget:</strong>{" "}
                              {formatCurrency(lead.min_price)} -{" "}
                              {formatCurrency(lead.max_price)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>
                            <strong>Locations:</strong>{" "}
                            {lead.preferred_locations.join(", ")}
                          </p>
                          <p>
                            <strong>Created:</strong>{" "}
                            {formatDate(lead.created_at)}
                          </p>
                        </div>

                        {lead.tags.length > 0 && (
                          <div className="mt-2 flex gap-1 flex-wrap">
                            {lead.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/leads/${lead.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/leads/${lead.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive bg-transparent"
                          onClick={() => handleDelete(lead.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
