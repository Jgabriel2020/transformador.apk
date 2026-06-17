import { NextResponse } from "next/server";

export async function GET() {
  const webhookTest = await fetch("https://webhook.jbrenno.cloud/webhook/convert-apk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ test: true }),
  }).then(r => ({ status: r.status, ok: r.ok })).catch(e => ({ error: e.message }));

  return NextResponse.json({
    ok: true,
    webhook_convert: webhookTest,
    env: {
      hasN8nConvert: "hardcoded: https://webhook.jbrenno.cloud/webhook/convert-apk",
      hasSupabase: "hardcoded: edegxmnfvffxvjscllxh.supabase.co",
    }
  });
}
