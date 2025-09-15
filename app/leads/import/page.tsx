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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  FileText,
  Users,
} from "lucide-react";
import {
  parseCSVToBuyers,
  validateCSVData,
  buyersToCSV,
  downloadCSV,
  CSVValidationResult,
} from "@/lib/csv-utils";
import type { Buyer } from "@/lib/types";
import { createBuyer } from "@/lib/database";

export default function ImportLeadsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<Partial<Buyer>[]>([]);
  const [validation, setValidation] = useState<CSVValidationResult | null>(
    null,
  );
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<"upload" | "validate" | "import">("upload");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      readFile(selectedFile);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const buyers = parseCSVToBuyers(content);
      setCsvData(buyers);

      const validationResult = validateCSVData(buyers);
      setValidation(validationResult);
      setStep("validate");
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!validation?.valid || csvData.length === 0) return;

    setImporting(true);
    try {
      // Import each valid buyer
      const promises = csvData
        .filter((buyer) => buyer.first_name && buyer.last_name && buyer.email)
        .map((buyer) =>
          createBuyer(buyer as Omit<Buyer, "id" | "created_at" | "updated_at">),
        );

      await Promise.all(promises);
      setStep("import");

      // Redirect after successful import
      setTimeout(() => {
        router.push("/leads");
      }, 2000);
    } catch (error) {
      console.error("Failed to import leads:", error);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const templateData: Partial<Buyer>[] = [
      {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        phone: "(555) 123-4567",
        property_type: "single_family",
        min_price: 300000,
        max_price: 500000,
        min_bedrooms: 3,
        max_bedrooms: 4,
        min_bathrooms: 2,
        preferred_locations: ["Downtown", "Westside"],
        timeline: "3_months",
        status: "active",
        lead_source: "website",
        pre_approved: true,
        financing_type: "conventional",
        down_payment_amount: 60000,
        notes: "Looking for move-in ready homes",
        tags: ["first-time-buyer", "family"],
      },
    ];

    const csvContent = buyersToCSV(templateData as Buyer[]);
    downloadCSV(csvContent, "buyer-leads-template.csv");
  };

  const resetImport = () => {
    setFile(null);
    setCsvData([]);
    setValidation(null);
    setStep("upload");
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
                Import Leads
              </h1>
              <p className="text-muted-foreground">
                Upload buyer leads from CSV file
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center space-x-2 ${step === "upload" ? "text-primary" : step === "validate" || step === "import" ? "text-green-600" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "upload" ? "bg-primary text-primary-foreground" : step === "validate" || step === "import" ? "bg-green-600 text-white" : "bg-muted"}`}
              >
                1
              </div>
              <span className="font-medium">Upload</span>
            </div>
            <div className="w-8 h-px bg-border"></div>
            <div
              className={`flex items-center space-x-2 ${step === "validate" ? "text-primary" : step === "import" ? "text-green-600" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "validate" ? "bg-primary text-primary-foreground" : step === "import" ? "bg-green-600 text-white" : "bg-muted"}`}
              >
                2
              </div>
              <span className="font-medium">Validate</span>
            </div>
            <div className="w-8 h-px bg-border"></div>
            <div
              className={`flex items-center space-x-2 ${step === "import" ? "text-green-600" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "import" ? "bg-green-600 text-white" : "bg-muted"}`}
              >
                3
              </div>
              <span className="font-medium">Import</span>
            </div>
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload CSV File
                </CardTitle>
                <CardDescription>
                  Select a CSV file containing your buyer leads data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Only CSV files are supported. Maximum file size: 10MB
                  </p>
                </div>

                {file && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Selected file: <strong>{file.name}</strong> (
                      {(file.size / 1024).toFixed(1)} KB)
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Need a Template?
                </CardTitle>
                <CardDescription>
                  Download a sample CSV file to see the expected format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CSV Format Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Required columns:</strong> First Name, Last Name,
                    Email
                  </p>
                  <p>
                    <strong>Optional columns:</strong> Phone, Property Type, Min
                    Price, Max Price, Min Bedrooms, Max Bedrooms, Min Bathrooms,
                    Preferred Locations, Timeline, Status, Lead Source,
                    Pre-approved, Financing Type, Down Payment, Notes, Tags
                  </p>
                  <p>
                    <strong>Notes:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      Use semicolons (;) to separate multiple locations or tags
                    </li>
                    <li>Pre-approved should be "Yes" or "No"</li>
                    <li>
                      Property types: Single Family Home, Condominium,
                      Townhouse, Multi-Family, Land/Lot, Commercial, Other
                    </li>
                    <li>
                      Timelines: Immediate (0-30 days), 3 Months, 6 Months, 1
                      Year, Flexible
                    </li>
                    <li>Statuses: Active, Inactive, Closed, Nurturing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Validate */}
        {step === "validate" && validation && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {validation.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  Validation Results
                </CardTitle>
                <CardDescription>
                  Review the validation results before importing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {validation.totalRows}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Rows</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {validation.validRows}
                    </div>
                    <p className="text-sm text-muted-foreground">Valid Rows</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">
                      {validation.errors.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Errors</p>
                  </div>
                </div>

                {validation.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-2">Errors found:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {validation.errors.slice(0, 5).map((error, index) => (
                          <li key={index} className="text-sm">
                            {error}
                          </li>
                        ))}
                        {validation.errors.length > 5 && (
                          <li className="text-sm">
                            ... and {validation.errors.length - 5} more errors
                          </li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {validation.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-2">Warnings:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {validation.warnings
                          .slice(0, 5)
                          .map((warning, index) => (
                            <li key={index} className="text-sm">
                              {warning}
                            </li>
                          ))}
                        {validation.warnings.length > 5 && (
                          <li className="text-sm">
                            ... and {validation.warnings.length - 5} more
                            warnings
                          </li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <Separator />

                <div className="flex gap-4">
                  <Button variant="outline" onClick={resetImport}>
                    Upload Different File
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={
                      !validation.valid ||
                      validation.validRows === 0 ||
                      importing
                    }
                  >
                    <Users className="mr-2 h-4 w-4" />
                    {importing
                      ? "Importing..."
                      : `Import ${validation.validRows} Leads`}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview of data */}
            {csvData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Data Preview</CardTitle>
                  <CardDescription>First 3 rows of your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {csvData.slice(0, 3).map((buyer, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">
                            {buyer.first_name} {buyer.last_name}
                          </h4>
                          {buyer.status && (
                            <Badge variant="outline">
                              {buyer.status.charAt(0).toUpperCase() +
                                buyer.status.slice(1)}
                            </Badge>
                          )}
                        </div>
                        <div className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
                          <p>
                            <strong>Email:</strong> {buyer.email}
                          </p>
                          <p>
                            <strong>Phone:</strong>{" "}
                            {buyer.phone || "Not provided"}
                          </p>
                          <p>
                            <strong>Property Type:</strong>{" "}
                            {buyer.property_type?.replace("_", " ") ||
                              "Not specified"}
                          </p>
                          <p>
                            <strong>Timeline:</strong>{" "}
                            {buyer.timeline?.replace("_", " ") ||
                              "Not specified"}
                          </p>
                        </div>
                      </div>
                    ))}
                    {csvData.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center">
                        ... and {csvData.length - 3} more rows
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 3: Import Complete */}
        {step === "import" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Import Complete!
              </CardTitle>
              <CardDescription>
                Your leads have been successfully imported
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Successfully imported {validation?.validRows} buyer leads. You
                  will be redirected to the leads page shortly.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/leads">View All Leads</Link>
                </Button>
                <Button variant="outline" onClick={resetImport}>
                  Import More Leads
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
