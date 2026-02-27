import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const testUsers = [
    { email: "student@nexgo.test", password: "Test1234!", full_name: "Chioma Student", role: "student" },
    { email: "vendor@nexgo.test", password: "Test1234!", full_name: "Fatima Vendor", role: "vendor" },
    { email: "rider@nexgo.test", password: "Test1234!", full_name: "Emeka Rider", role: "rider" },
    { email: "admin@nexgo.test", password: "Test1234!", full_name: "David Admin", role: "admin" },
  ];

  const results = [];
  let vendorId: string | null = null;

  for (const u of testUsers) {
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
    const found = existing?.users?.find((x: any) => x.email === u.email);
    if (found) {
      results.push({ email: u.email, status: "already exists", id: found.id });
      if (u.role === "vendor") vendorId = found.id;
      continue;
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, role: u.role },
    });

    if (error) {
      results.push({ email: u.email, status: "error", error: error.message });
    } else {
      results.push({ email: u.email, status: "created", id: data.user.id });
      if (u.role === "vendor") vendorId = data.user.id;
    }
  }

  // Seed restaurant and menu items for vendor
  if (vendorId) {
    const { data: existingRestaurant } = await supabaseAdmin
      .from("restaurants")
      .select("id")
      .eq("owner_id", vendorId)
      .limit(1);

    if (!existingRestaurant || existingRestaurant.length === 0) {
      const { data: restaurant, error: rErr } = await supabaseAdmin
        .from("restaurants")
        .insert({
          owner_id: vendorId,
          name: "Fatima's Kitchen",
          cuisine: "Nigerian",
          delivery_time: "20-30 min",
          is_open: true,
          image: "🍲",
          rating: 4.5,
          tag: "Popular",
          price_range: "₦500–₦3,000",
        })
        .select("id")
        .single();

      if (restaurant && !rErr) {
        await supabaseAdmin.from("menu_items").insert([
          { restaurant_id: restaurant.id, name: "Jollof Rice", price: 1500, description: "Smoky party jollof with chicken", image: "🍚", available: true },
          { restaurant_id: restaurant.id, name: "Fried Rice", price: 1500, description: "Nigerian fried rice with mixed veggies", image: "🍛", available: true },
          { restaurant_id: restaurant.id, name: "Pounded Yam & Egusi", price: 2000, description: "With assorted meat", image: "🥘", available: true },
          { restaurant_id: restaurant.id, name: "Suya", price: 800, description: "Spicy grilled beef skewers", image: "🥩", available: true },
          { restaurant_id: restaurant.id, name: "Chapman", price: 500, description: "Classic Nigerian cocktail drink", image: "🍹", available: true },
        ]);
        results.push({ restaurant: restaurant.id, status: "created with 5 menu items" });
      } else {
        results.push({ restaurant: "error", error: rErr?.message });
      }
    } else {
      results.push({ restaurant: existingRestaurant[0].id, status: "already exists" });
    }

    // Give student a wallet balance for testing
    const studentResult = results.find((r: any) => r.email === "student@nexgo.test");
    if (studentResult?.id) {
      const { data: wallet } = await supabaseAdmin
        .from("wallets")
        .select("id, balance")
        .eq("user_id", studentResult.id)
        .single();

      if (wallet && wallet.balance < 5000) {
        await supabaseAdmin
          .from("wallets")
          .update({ balance: 10000 })
          .eq("id", wallet.id);
        results.push({ wallet: "topped up to ₦10,000" });
      }
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
