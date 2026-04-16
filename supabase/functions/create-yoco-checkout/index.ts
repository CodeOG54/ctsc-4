import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const YOCO_SECRET_KEY = Deno.env.get("YOCO_SECRET_KEY");
    if (!YOCO_SECRET_KEY) {
      throw new Error("YOCO_SECRET_KEY not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { bookingId } = await req.json();
    if (!bookingId) {
      return new Response(JSON.stringify({ error: "bookingId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, price_estimate, pickup_location, dropoff_location, pickup_date, pickup_time, user_id, vehicles:vehicle_id(name)")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (booking.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Not your booking" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!booking.price_estimate || booking.price_estimate <= 0) {
      return new Response(JSON.stringify({ error: "No price estimate on booking" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Amount in cents for Yoco
    const amountInCents = Math.round(booking.price_estimate * 100);

    // Determine base URL from origin header or fallback
    const origin = req.headers.get("origin") || "https://id-preview--3a8218c7-4d78-4ddc-aa4e-a4b093dbb148.lovable.app";

    // Create Yoco checkout session
    const yocoResponse = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency: "ZAR",
        successUrl: `${origin}/payment-success?booking_id=${bookingId}`,
        cancelUrl: `${origin}/payment-cancelled?booking_id=${bookingId}`,
        failureUrl: `${origin}/payment-cancelled?booking_id=${bookingId}`,
        metadata: {
          bookingId: bookingId,
          userId: user.id,
        },
      }),
    });

    if (!yocoResponse.ok) {
      const errorBody = await yocoResponse.text();
      console.error("Yoco API error:", errorBody);
      throw new Error(`Yoco API error: ${yocoResponse.status}`);
    }

    const yocoData = await yocoResponse.json();

    // Store checkout ID on booking
    await supabase
      .from("bookings")
      .update({ yoco_checkout_id: yocoData.id })
      .eq("id", bookingId);

    return new Response(
      JSON.stringify({
        checkoutId: yocoData.id,
        redirectUrl: yocoData.redirectUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
