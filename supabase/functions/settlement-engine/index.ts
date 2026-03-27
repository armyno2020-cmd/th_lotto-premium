/// <reference types="jsr:@supabase/functions-js@^2.0.0/edge-runtime.d.ts" />
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Bet {
  id: number;
  user_id: string;
  lottery_code: string;
  draw_date: string;
  bet_type: string;
  number: string;
  amount: number;
  payout_rate: number;
}

interface Result {
  lottery_code: string;
  draw_date: string;
  raw_result: string;
  u2_result: string;
  f3_result: string;
  b3_result: string;
}

// Check if 3-digit permutation matches (for 3ตัวโต๊ด)
function check3DigitPermutation(betNumber: string, drawnDigits: string): boolean {
  if (betNumber.length !== 3 || drawnDigits.length !== 3) return false;
  
  const betChars = betNumber.split("").sort();
  const drawnChars = drawnDigits.split("").sort();
  
  return betChars.every((char, i) => char === drawnChars[i]);
}

// Main win checking logic
function checkWin(
  betType: string,
  betNumber: string,
  rawResult: string,
  u2Result: string,
  f3Result: string,
  b3Result: string
): { isWin: boolean; multiplier?: number } {
  const result = rawResult || "";
  const last2 = u2Result || "";
  const last3 = result.slice(-3);
  const last4 = result.slice(-4);

  switch (betType) {
    case "4top":
      // 4 ตัวตรง: ต้องตรงทุกตำแหน่ง
      return { isWin: last4 === betNumber, multiplier: 1 };

    case "3top":
      // 3 ตัวบน: 3 ตัวสุดท้ายตรงกัน
      return { isWin: last3 === betNumber, multiplier: 1 };

    case "3tod":
      // 3 ตัวโต๊ด: 3 ตัวเหมือนกันแต่สลับตำแหน่งได้
      return { isWin: check3DigitPermutation(betNumber, last3), multiplier: 1 };

    case "2top":
      // 2 ตัวบน: 2 ตัวสุดท้ายตรงกัน
      return { isWin: result.slice(-2) === betNumber, multiplier: 1 };

    case "2under":
      // 2 ตัวล่าง: ตรงกับเลขท้าย 2 ตัว
      return { isWin: last2 === betNumber, multiplier: 1 };

    case "run_top":
      // วิ่งบน: เลขใดก็ได้อยู่ใน 3 ตัวสุดท้าย
      return {
        isWin: last3.includes(betNumber) || last4.includes(betNumber),
        multiplier: 1
      };

    case "run_under":
      // วิ่งล่าง: เลขอยู่ใน 2 ตัวท้าย
      return { isWin: last2.includes(betNumber), multiplier: 1 };

    // Stock market types (using last 3 digits as 3-top, last 2 as 2-under)
    case "stock_3top":
      return { isWin: last3 === betNumber, multiplier: 1 };

    case "stock_2under":
      return { isWin: last2 === betNumber, multiplier: 1 };

    default:
      return { isWin: false };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all unprocessed results with pending bets
    const { data: results, error: resultsError } = await supabase
      .from("lottery_results")
      .select("*")
      .eq("is_settled", false)
      .not("raw_result", "is", null);

    if (resultsError) {
      throw resultsError;
    }

    const settlementReport = {
      resultsProcessed: 0,
      betsProcessed: 0,
      winnersPaid: 0,
      totalPayout: 0,
      losersProcessed: 0,
      errors: [] as string[],
    };

    for (const result of results as Result[]) {
      try {
        // Get all pending bets for this lottery and date
        const { data: bets, error: betsError } = await supabase
          .from("bets")
          .select("*")
          .eq("lottery_code", result.lottery_code)
          .eq("draw_date", result.draw_date)
          .eq("status", "pending");

        if (betsError) {
          settlementReport.errors.push(`Error fetching bets for ${result.lottery_code}: ${betsError.message}`);
          continue;
        }

        if (!bets || bets.length === 0) {
          continue;
        }

        settlementReport.resultsProcessed++;

        for (const bet of bets as Bet[]) {
          try {
            const winCheck = checkWin(
              bet.bet_type,
              bet.number,
              result.raw_result,
              result.u2_result,
              result.f3_result,
              result.b3_result
            );

            if (winCheck.isWin) {
              // Calculate winnings
              const winAmount = bet.amount * bet.payout_rate;

              // Get user balance before update
              const { data: userBefore } = await supabase
                .from("profiles")
                .select("balance")
                .eq("id", bet.user_id)
                .single();

              // Update user balance
              await supabase.rpc("add_balance", {
                user_uuid: bet.user_id,
                amount: winAmount,
                transaction_type: "win",
                reference_id: bet.id.toString(),
              });

              // Update bet status
              await supabase
                .from("bets")
                .update({
                  status: "won",
                  win_amount: winAmount,
                  settled_at: new Date().toISOString(),
                })
                .eq("id", bet.id);

              settlementReport.winnersPaid++;
              settlementReport.totalPayout += winAmount;
            } else {
              // Update bet status to lost
              await supabase
                .from("bets")
                .update({
                  status: "lost",
                  settled_at: new Date().toISOString(),
                })
                .eq("id", bet.id);

              settlementReport.losersProcessed++;
            }

            settlementReport.betsProcessed++;
          } catch (betError) {
            settlementReport.errors.push(`Error processing bet ${bet.id}: ${betError.message}`);
          }
        }

        // Mark result as settled
        await supabase
          .from("lottery_results")
          .update({ is_settled: true })
          .eq("lottery_code", result.lottery_code)
          .eq("draw_date", result.draw_date);

      } catch (resultError) {
        settlementReport.errors.push(`Error processing result ${result.lottery_code}: ${resultError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Settlement completed",
        report: settlementReport,
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
