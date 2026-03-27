/// <reference types="jsr:@supabase/functions-js@^2.0.0/edge-runtime.d.ts" />
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LotteryConfig {
  code: string;
  schedule: {
    open: string;
    close: string;
    days: number[];
    timezone?: string;
    market_hours?: Array<{
      open: string;
      close: string;
      day_offset: number;
    }>;
  };
  status: string;
}

// Convert time string to minutes from midnight
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Get current time in specific timezone
function getCurrentTimeInTimezone(timezone: string): Date {
  return new Date().toLocaleString("en-US", { timeZone: timezone });
}

// Check if market should be open based on schedule
function isMarketOpen(config: LotteryConfig): boolean {
  const schedule = config.schedule;
  
  // Handle stock market hours
  if (schedule.market_hours) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    for (const hours of schedule.market_hours) {
      const effectiveDay = (dayOfWeek + hours.day_offset + 7) % 7;
      
      if (schedule.days.includes(effectiveDay)) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const openMinutes = timeToMinutes(hours.open);
        const closeMinutes = timeToMinutes(hours.close);
        
        if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
          return true;
        }
      }
    }
    return false;
  }
  
  // Handle regular lottery schedules
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  if (!schedule.days.includes(dayOfWeek)) {
    return false;
  }
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = timeToMinutes(schedule.open);
  const closeMinutes = timeToMinutes(schedule.close);
  
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active lottery configs
    const { data: configs, error: configError } = await supabase
      .from("lottery_configs")
      .select("*")
      .eq("is_active", true);

    if (configError) {
      throw configError;
    }

    const updates: string[] = [];

    for (const config of configs as LotteryConfig[]) {
      const shouldBeOpen = isMarketOpen(config);
      const currentStatus = config.status;
      
      let newStatus: string;
      
      if (shouldBeOpen) {
        newStatus = "opening";
      } else {
        // Check if there are pending results to settle
        const today = new Date().toISOString().split("T")[0];
        
        const { data: pendingBets } = await supabase
          .from("bets")
          .select("id")
          .eq("lottery_code", config.code)
          .eq("draw_date", today)
          .eq("status", "pending")
          .limit(1);
        
        if (pendingBets && pendingBets.length > 0) {
          newStatus = "closed";
        } else {
          newStatus = "opening";
        }
      }

      if (currentStatus !== newStatus) {
        await supabase
          .from("lottery_configs")
          .update({ status: newStatus })
          .eq("code", config.code);
        
        updates.push(`${config.code}: ${currentStatus} -> ${newStatus}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Market status updated",
        updates,
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
