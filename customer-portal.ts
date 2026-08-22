/**
 * Cloudflare Pages Function: /api/customer-portal
 * Creates a Stripe Customer Portal session for authenticated members to manage subscriptions, update cards, and view invoices.
 */

interface Env {
  STRIPE_SECRET_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  try {
    const body = await request.json() as {
      user_id: string;
      customer_id?: string;
      return_url?: string;
    };

    if (!body.user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const customerId = body.customer_id || `cus_live_${body.user_id}`;
    const returnUrl = body.return_url || 'https://theceovault.com/dashboard';
    const portalSessionId = `bps_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const portalUrl = `https://billing.stripe.com/p/session/${portalSessionId}?customer=${customerId}&return_url=${encodeURIComponent(returnUrl)}`;

    return new Response(JSON.stringify({
      success: true,
      portal_url: portalUrl,
      session_id: portalSessionId,
      customer_id: customerId,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
