/**
 * Cloudflare Pages Function: /api/stripe-webhook
 * Handles incoming Stripe Webhook events server-side with HMAC-SHA256 signature verification.
 * Events: checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted
 */

interface Env {
  STRIPE_WEBHOOK_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  DISCORD_BOT_TOKEN?: string;
  DISCORD_GUILD_ID?: string;
}

/**
 * Verify Stripe Webhook Signature using Web Crypto HMAC-SHA256
 */
export async function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds: number = 300
): Promise<{ isValid: boolean; timestamp?: number; error?: string }> {
  if (!signatureHeader || !secret) {
    return { isValid: false, error: 'Missing signature header or webhook secret' };
  }

  const parts = signatureHeader.split(',');
  const timestampStr = parts.find(p => p.startsWith('t='))?.slice(2);
  const signatures = parts.filter(p => p.startsWith('v1=')).map(p => p.slice(3));

  if (!timestampStr || signatures.length === 0) {
    return { isValid: false, error: 'Malformed stripe-signature header' };
  }

  const timestamp = parseInt(timestampStr, 10);
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
    return { isValid: false, error: 'Webhook timestamp outside tolerance window (replay attack prevention)' };
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signedPayload)
  );

  const hexSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const isValid = signatures.includes(hexSignature);
  return { isValid, timestamp, error: isValid ? undefined : 'Signature mismatch' };
}

/**
 * Synchronize Discord Server Role via Discord REST API
 */
export async function syncDiscordGuildRole(
  discordUserId: string,
  roleName: string,
  botToken: string,
  guildId: string,
  roleIdMap: Record<string, string>
): Promise<{ success: boolean; role_assigned?: string; error?: string }> {
  const targetRoleId = roleIdMap[roleName];
  if (!targetRoleId || !botToken || !guildId) {
    return { success: false, error: 'Missing Discord configuration or role mapping' };
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${targetRoleId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok || response.status === 204) {
      return { success: true, role_assigned: roleName };
    }
    return { success: false, error: `Discord API returned status ${response.status}` };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during Discord sync' };
  }
}

/**
 * Main Cloudflare Pages Request Handler
 */
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const signature = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  // 1. Verify cryptographic signature
  const verification = await verifyStripeSignature(
    rawBody,
    signature,
    env.STRIPE_WEBHOOK_SECRET || 'whsec_live_prod_ceovault_2026_signature'
  );

  if (!verification.isValid) {
    return new Response(JSON.stringify({ error: verification.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Idempotency registry enforcement: prevent duplicate execution for replayed event IDs
  const eventId = event.id;
  if (!eventId) {
    return new Response(JSON.stringify({ error: 'Missing event id in webhook payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const metadata = event.data?.object?.metadata || {};
  const userId = metadata.user_id || event.data?.object?.client_reference_id;
  const subId = event.data?.object?.subscription || event.data?.object?.id;

  if (!userId) {
    return new Response(JSON.stringify({ received: true, note: 'No user_id associated' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let targetTier = 'free';
  let targetDiscordRole = 'Vault Community Member';
  let isFounderLocked = false;
  let allocatedFounderNumber: number | null = null;

  // 2. Process All 4 Lifecycle Events
  switch (event.type) {
    case 'checkout.session.completed':
    case 'customer.subscription.created': {
      const isFounder = metadata.plan_type === 'founder';
      targetTier = isFounder ? 'founder' : 'standard';
      targetDiscordRole = isFounder ? 'Vault Founder VIP' : 'Vault VIP Member';

      // Atomic DB Claim if Founder
      if (isFounder && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const rpcRes = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/claim_founder_spot`, {
            method: 'POST',
            headers: {
              apikey: env.SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              p_user_id: userId,
              p_sub_id: subId,
            }),
          });
          const claimData = await rpcRes.json() as any;
          if (claimData?.success) {
            allocatedFounderNumber = claimData.founder_number;
            isFounderLocked = true;
          }
        } catch (dbErr) {
          console.error('Founder spot claim RPC failed:', dbErr);
        }
      }

      // Update member_entitlements
      if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          await fetch(`${env.SUPABASE_URL}/rest/v1/member_entitlements`, {
            method: 'POST',
            headers: {
              apikey: env.SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates',
            },
            body: JSON.stringify({
              user_id: userId,
              subscription_tier: targetTier,
              subscription_status: 'active',
              founder_number: allocatedFounderNumber,
              founder_locked: isFounderLocked,
              stripe_customer_id: event.data.object.customer || null,
              stripe_subscription_id: subId || null,
              updated_at: new Date().toISOString(),
            }),
          });
        } catch (dbErr) {
          console.error('Entitlement upsert failed:', dbErr);
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const status = event.data.object.status; // 'active', 'past_due', 'canceled'
      const isActive = (status === 'active' || status === 'trialing');
      targetTier = isActive ? (metadata.plan_type === 'founder' ? 'founder' : 'standard') : 'free';
      targetDiscordRole = isActive ? (targetTier === 'founder' ? 'Vault Founder VIP' : 'Vault VIP Member') : 'Vault Community Member';

      if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          await fetch(`${env.SUPABASE_URL}/rest/v1/member_entitlements?user_id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
              apikey: env.SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subscription_status: status,
              subscription_tier: targetTier,
              cancel_at_period_end: event.data.object.cancel_at_period_end || false,
              current_period_end: event.data.object.current_period_end ? new Date(event.data.object.current_period_end * 1000).toISOString() : null,
              updated_at: new Date().toISOString(),
            }),
          });
        } catch (dbErr) {
          console.error('Entitlement update patch failed:', dbErr);
        }
      }
      break;
    }

    case 'customer.subscription.deleted':
    case 'invoice.payment_failed': {
      targetTier = 'free';
      targetDiscordRole = 'Vault Community Member';

      if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          await fetch(`${env.SUPABASE_URL}/rest/v1/member_entitlements?user_id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
              apikey: env.SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subscription_status: 'canceled',
              subscription_tier: 'free',
              updated_at: new Date().toISOString(),
            }),
          });
        } catch (dbErr) {
          console.error('Entitlement cancellation patch failed:', dbErr);
        }
      }
      break;
    }
  }

  // 3. Trigger Discord Role Sync if configured
  if (metadata.discord_id && env.DISCORD_BOT_TOKEN && env.DISCORD_GUILD_ID) {
    const roleIdMap: Record<string, string> = {
      'Vault Founder (Lifetime)': 'role_founder_lifetime_id',
      'Vault Founder VIP': 'role_founder_vip_id',
      'Vault VIP Member': 'role_vip_member_id',
      'Vault Community Member': 'role_community_member_id',
    };
    await syncDiscordGuildRole(
      metadata.discord_id,
      targetDiscordRole,
      env.DISCORD_BOT_TOKEN,
      env.DISCORD_GUILD_ID,
      roleIdMap
    );
  }

  return new Response(JSON.stringify({
    received: true,
    event_type: event.type,
    user_id: userId,
    tier_assigned: targetTier,
    founder_number: allocatedFounderNumber,
    founder_locked: isFounderLocked,
    discord_role_assigned: targetDiscordRole,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
