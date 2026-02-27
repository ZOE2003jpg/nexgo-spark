import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function verifyKoraSignature(rawBody: string, signature: string, secret: string): boolean {
  const hash = createHmac("sha256", secret).update(rawBody).digest("hex");
  return hash === signature;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();

    // Verify KoraPay webhook signature
    const signature = req.headers.get("x-korapay-signature");
    const webhookSecret = Deno.env.get("KORAPAY_SECRET_KEY");

    if (!signature || !webhookSecret) {
      console.error("Missing webhook signature or secret");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!verifyKoraSignature(rawBody, signature, webhookSecret)) {
      console.error("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = JSON.parse(rawBody);
    const event = body.event;
    const data = body.data;

    if (event !== "charge.success") {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reference = data?.reference;
    const amount = data?.amount;
    const userId = data?.metadata?.user_id;

    if (!reference || !amount || !userId) {
      return new Response(JSON.stringify({ error: "Missing data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate amount is a positive integer within bounds
    const parsedAmount = Math.floor(Number(amount));
    if (parsedAmount <= 0 || parsedAmount > 10000000) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Idempotency check - look for existing transaction with this reference
    const { data: existing } = await supabase
      .from("wallet_transactions")
      .select("id")
      .eq("label", `KoraPay ${reference}`)
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use atomic topup_wallet RPC to prevent race conditions
    const { data: result, error: rpcError } = await supabase.rpc("topup_wallet", {
      _user_id: userId,
      _amount: parsedAmount,
    });

    if (rpcError || !result?.success) {
      console.error("Wallet topup failed:", rpcError || result?.message);
      return new Response(JSON.stringify({ error: result?.message || "Wallet topup failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ received: true, credited: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
