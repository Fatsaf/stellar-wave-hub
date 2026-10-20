import { getAuthUser, hasMinRole } from "@/lib/auth";
import { getSupabase } from "@/lib/firebase";
import { parseJsonBody } from "@/lib/validation/parse-body";
import { createPromoCodeSchema } from "@/lib/validation/schemas/promo-codes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = getAuthUser(request);
  if (!auth || !hasMinRole(auth.role, "admin")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return Response.json({ promoCodes: data || [] });
  } catch (err) {
    console.error("Fetch promo codes error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = getAuthUser(request);
  if (!auth || !hasMinRole(auth.role, "admin")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = await parseJsonBody(request, createPromoCodeSchema);
  if (!parsed.success) return parsed.response;

  try {
    const { code, percent_off, max_uses, expires_at } = parsed.data;

    const formattedCode = code.trim().toUpperCase();
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from("promo_codes")
      .select("*")
      .ilike("code", formattedCode)
      .maybeSingle();

    if (existing) {
      return Response.json({ error: "Promo code already exists" }, { status: 400 });
    }

    const parsedMaxUses = max_uses !== null && max_uses !== undefined ? max_uses : null;
    const parsedExpiresAt = expires_at ? expires_at : null;

    const { data, error } = await supabase
      .from("promo_codes")
      .insert({
        code: formattedCode,
        percent_off,
        max_uses: parsedMaxUses,
        uses: 0,
        expires_at: parsedExpiresAt,
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json({ promoCode: data }, { status: 201 });
  } catch (err) {
    console.error("Create promo code error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = getAuthUser(request);
  if (!auth || !hasMinRole(auth.role, "admin")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const code = url.searchParams.get("code");

    if (!id && !code) {
      return Response.json({ error: "Promo code ID or code is required" }, { status: 400 });
    }

    const supabase = getSupabase();
    let query = supabase.from("promo_codes").delete();

    if (code) {
      query = query.ilike("code", code.trim());
    } else if (id && !isNaN(Number(id))) {
      query = query.eq("id", Number(id));
    } else if (id) {
      query = query.ilike("code", id.trim());
    }

    const { error } = await query;
    if (error) throw error;

    return Response.json({ success: true });
  } catch (err) {
    console.error("Delete promo code error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
