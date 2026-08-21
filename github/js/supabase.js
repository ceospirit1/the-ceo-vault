/**
 * THE CEO VAULT - Supabase Production Client & Configuration
 */

const SUPABASE_CONFIG = {
  url: window.ENV_SUPABASE_URL || 'https://vwmrqfeglkmvvwugxsyq.supabase.co',
  anonKey: window.ENV_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_client_initialization',
};

// Initialize client if @supabase/supabase-js CDN is available
let supabaseClient = null;
if (typeof supabase !== 'undefined' && supabase.createClient) {
  try {
    supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('Supabase client initialization fallback:', err);
  }
}

window.SupabaseService = {
  client: supabaseClient,

  async getSession() {
    if (!this.client) return null;
    try {
      const { data } = await this.client.auth.getSession();
      return data?.session || null;
    } catch {
      return null;
    }
  },

  async signUp(email, password, metadata = {}) {
    if (!this.client) {
      // Mock / Offline fallback
      return {
        user: {
          id: 'user-' + Date.now(),
          email: email,
          user_metadata: metadata,
        },
        session: { access_token: 'mock_jwt_token' },
      };
    }
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    if (!this.client) {
      // Mock / Offline fallback
      return {
        user: {
          id: 'user-' + Date.now(),
          email: email,
          user_metadata: { name: email.split('@')[0], gamertag: email.split('@')[0].toUpperCase() },
        },
        session: { access_token: 'mock_jwt_token' },
      };
    }
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signInWithOAuth(provider) {
    if (!this.client) {
      Toast.info(`Redirecting to ${provider} authentication...`);
      return;
    }
    const { error } = await this.client.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin + window.location.pathname + '#dashboard',
      },
    });
    if (error) throw error;
  },

  async signOut() {
    if (this.client) {
      try {
        await this.client.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
  },

  async fetchEntitlement(userId) {
    if (!this.client || !userId) return null;
    try {
      const { data, error } = await this.client.rpc('get_member_entitlement_status', { p_user_id: userId });
      if (!error && data) return data;
    } catch {
      // Fallback
    }
    return null;
  },

  async fetchFounderStatus() {
    if (!this.client) {
      return {
        spots_taken: 1,
        total_spots: 100,
        spots_remaining: 99,
        is_available: true,
        current_price: 14.99,
        next_badge_label: 'FOUNDER BADGE #002',
      };
    }
    try {
      const { count, error } = await this.client
        .from('founder_allocations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const spotsTaken = (!error && count !== null) ? count : 1;
      const spotsRemaining = Math.max(0, 100 - spotsTaken);
      const isAvailable = spotsTaken < 100;
      return {
        spots_taken: spotsTaken,
        total_spots: 100,
        spots_remaining: spotsRemaining,
        is_available: isAvailable,
        current_price: isAvailable ? 14.99 : 19.99,
        next_badge_label: isAvailable ? `FOUNDER BADGE #${String(spotsTaken + 1).padStart(3, '0')}` : 'STANDARD VIP MEMBER',
      };
    } catch {
      return {
        spots_taken: 1,
        total_spots: 100,
        spots_remaining: 99,
        is_available: true,
        current_price: 14.99,
        next_badge_label: 'FOUNDER BADGE #002',
      };
    }
  },
};
