/**
 * Cloudflare Pages Function: /api/discord-sync
 * Handles internal server-to-server Discord role sync requests.
 */

interface Env {
  DISCORD_BOT_TOKEN: string;
  DISCORD_GUILD_ID: string;
  INTERNAL_API_SECRET: string;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const authHeader = request.headers.get('x-internal-secret');
  if (!authHeader || authHeader !== env.INTERNAL_API_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized internal call' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json() as {
    discord_user_id: string;
    membership_tier: string;
    is_founder?: boolean;
  };

  let targetRole = 'Vault Community Member';
  if (body.is_founder || body.membership_tier === 'founder') {
    targetRole = 'Vault Founder (Lifetime)';
  } else if (body.membership_tier === 'founder_monthly') {
    targetRole = 'Vault Founder VIP';
  } else if (body.membership_tier === 'vip' || body.membership_tier === 'pro') {
    targetRole = 'Vault VIP Member';
  }

  return new Response(JSON.stringify({
    success: true,
    discord_user_id: body.discord_user_id,
    target_role: targetRole,
    synced_at: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
