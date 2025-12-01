import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WeeklyAccessData {
  access_date: string;
  access_count: number;
}

interface WeeklySummary {
  userIdentifier: string;
  weekStart: string;
  weekEnd: string;
  totalAccesses: number;
  dailyBreakdown: WeeklyAccessData[];
  averageAccessesPerDay: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { userIdentifier, startDate, endDate } = await req.json();

    if (!userIdentifier || !startDate || !endDate) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/app_access_logs?user_identifier=eq.${userIdentifier}&access_date=gte.${startDate}&access_date=lte.${endDate}&order=access_date.asc`, {
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
        apikey: supabaseServiceKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch access logs: ${response.statusText}`);
    }

    const dailyBreakdown = await response.json() as WeeklyAccessData[];
    const totalAccesses = dailyBreakdown.reduce((sum, day) => sum + day.access_count, 0);
    const daysWithData = dailyBreakdown.length;
    const averageAccessesPerDay = daysWithData > 0 ? Math.round((totalAccesses / daysWithData) * 10) / 10 : 0;

    const summary: WeeklySummary = {
      userIdentifier,
      weekStart: startDate,
      weekEnd: endDate,
      totalAccesses,
      dailyBreakdown,
      averageAccessesPerDay,
    };

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating weekly summary:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
