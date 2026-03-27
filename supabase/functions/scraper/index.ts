/// <reference types="jsr:@supabase/functions-js@^2.0.0/edge-runtime.d.ts" />
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResultData {
  lottery_code: string;
  draw_date: string;
  raw_result?: string;
  u2_result?: string;
  f3_result?: string;
  b3_result?: string;
  stock_value?: string;
  stock_change?: string;
  youtube_url?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { csvUrl, results } = await req.json();

    if (!results || !Array.isArray(results)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid results data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const savedResults: ResultData[] = [];
    const errors: string[] = [];

    for (const result of results) {
      try {
        // Validate required fields
        if (!result.lottery_code || !result.draw_date || !result.raw_result) {
          errors.push(`Missing required fields for: ${JSON.stringify(result)}`);
          continue;
        }

        // Check if result already exists
        const { data: existing } = await supabase
          .from("lottery_results")
          .select("id")
          .eq("lottery_code", result.lottery_code)
          .eq("draw_date", result.draw_date)
          .single();

        const resultData: ResultData = {
          lottery_code: result.lottery_code,
          draw_date: result.draw_date,
          raw_result: result.raw_result,
          u2_result: result.u2_result || null,
          f3_result: result.f3_result || null,
          b3_result: result.b3_result || null,
          stock_value: result.stock_value || null,
          stock_change: result.stock_change || null,
          youtube_url: result.youtube_url || null,
        };

        if (existing) {
          // Update existing result
          await supabase
            .from("lottery_results")
            .update({
              ...resultData,
              is_live: true,
              published_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          savedResults.push({ ...resultData, lottery_code: result.lottery_code });
        } else {
          // Insert new result
          await supabase
            .from("lottery_results")
            .insert({
              ...resultData,
              is_live: true,
              published_at: new Date().toISOString(),
            });

          savedResults.push({ ...resultData, lottery_code: result.lottery_code });
        }
      } catch (err) {
        errors.push(`Error processing ${result.lottery_code}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${savedResults.length} results`,
        savedResults,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
