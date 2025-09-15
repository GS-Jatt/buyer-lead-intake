"use server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type {
  Buyer,
  BuyerHistory,
  CreateBuyerForm,
  SearchFilters,
  UserProfile,
} from "@/lib/types";

export async function getUserData() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single<UserProfile>();

    if (profileError || !profile) {
      throw profileError;
    }

    return profile;
  } catch (error) {
    throw new Error("Unexpected error fetching User Data");
  }
}

export async function getBuyers(filters: SearchFilters = {}): Promise<Buyer[]> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    let query = supabase
      .from("buyers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters.search) {
      query = query.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`,
      );
    }

    if (filters.property_type) {
      query = query.eq("property_type", filters.property_type);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.timeline) {
      query = query.eq("timeline", filters.timeline);
    }

    if (filters.lead_source) {
      query = query.eq("lead_source", filters.lead_source);
    }

    if (filters.pre_approved !== undefined) {
      query = query.eq("pre_approved", filters.pre_approved);
    }

    if (filters.min_price) {
      query = query.gte("max_price", filters.min_price);
    }

    if (filters.max_price) {
      query = query.lte("min_price", filters.max_price);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error("Failed to fetch buyers", error);
    }

    return data || [];
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unexpected error fetching buyers");
  }
}

export async function getBuyer(id: string): Promise<Buyer | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("buyers")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error("Failed to fetch buyer", error);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unexpected error fetching buyer");
  }
}

export async function createBuyer(formData: CreateBuyerForm): Promise<Buyer> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error(userError?.message);
    }

    const buyerData = {
      ...formData,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("buyers")
      .insert(buyerData)
      .select()
      .single();

    if (error) {
      throw new Error("Failed to create buyer", error);
    }

    // Create history entry
    await createBuyerHistory({
      buyer_id: data.id,
      user_id: user.id,
      action_type: "created",
      notes: "Buyer lead created",
    });

    return data;
  } catch (error) {
    throw new Error("Unexpected error creating buyer");
  }
}

export async function updateBuyer(
  id: string,
  formData: Partial<CreateBuyerForm>,
): Promise<Buyer> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Get current buyer for history tracking
    const currentBuyer = await getBuyer(id);
    if (!currentBuyer) {
      throw new Error("Buyer not found");
    }

    const { data, error } = await supabase
      .from("buyers")
      .update(formData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw new Error("Failed to update buyer", error);
    }

    // Create history entry for significant changes
    if (formData.status && formData.status !== currentBuyer.status) {
      await createBuyerHistory({
        buyer_id: id,
        user_id: user.id,
        action_type: "status_changed",
        field_changed: "status",
        old_value: currentBuyer.status,
        new_value: formData.status,
        notes: `Status changed from ${currentBuyer.status} to ${formData.status}`,
      });
    } else {
      await createBuyerHistory({
        buyer_id: id,
        user_id: user.id,
        action_type: "updated",
        notes: "Buyer information updated",
      });
    }

    return data;
  } catch (error) {
    throw new Error("Unexpected error updating buyer");
  }
}

export async function deleteBuyer(id: string): Promise<void> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("buyers")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error("Failed to delete buyer", error);
    }
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unexpected error deleting buyer");
  }
}

export async function getBuyerHistory(
  buyerId: string,
): Promise<BuyerHistory[]> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("buyer_history")
      .select("*")
      .eq("buyer_id", buyerId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Failed to fetch buyer history", error);
    }

    return data || [];
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unexpected error fetching buyer history");
  }
}

export async function createBuyerHistory(
  historyData: Omit<BuyerHistory, "id" | "created_at">,
): Promise<BuyerHistory> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("buyer_history")
      .insert(historyData)
      .select()
      .single();

    if (error) {
      throw new Error("Failed to create buyer history", error);
    }

    return data;
  } catch (error) {
    throw new Error("Unexpected error creating buyer history");
  }
}

export async function createBuyersFromCSV(
  buyers: CreateBuyerForm[],
): Promise<{ success: number; errors: string[] }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const buyersWithUserId = buyers.map((buyer) => ({
      ...buyer,
      user_id: user.id,
    }));

    const { data, error } = await supabase
      .from("buyers")
      .insert(buyersWithUserId)
      .select();

    if (error) {
      throw new Error("Failed to import buyers", error);
    }

    // Create history entries for all imported buyers
    const historyEntries = data.map((buyer) => ({
      buyer_id: buyer.id,
      user_id: user.id,
      action_type: "created" as const,
      notes: "Imported from CSV",
    }));

    await supabase.from("buyer_history").insert(historyEntries);

    return { success: data.length, errors: [] };
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unexpected error importing buyers");
  }
}
