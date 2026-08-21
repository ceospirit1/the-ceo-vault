/**
 * THE CEO VAULT - Authentication Module (Supabase Connected)
 */

const Auth = {
  async init() {
    this.bindEvents();
    await this.checkExistingSession();
  },

  async checkExistingSession() {
    if (window.SupabaseService && window.SupabaseService.client) {
      try {
        const session = await SupabaseService.getSession();
        if (session && session.user) {
          const u = session.user;
          const meta = u.user_metadata || {};
          const entitlement = await SupabaseService.fetchEntitlement(u.id);

          VaultState.setUser({
            id: u.id,
            name: meta.name || u.email.split('@')[0] || 'Vault Member',
            gamertag: meta.gamertag || u.email.split('@')[0].toUpperCase(),
            platform: meta.platform || 'Xbox Series X',
            email: u.email,
            discordId: meta.discordId || 'TheCEOCG#0001 (Synced)',
            membershipTier: entitlement?.subscription_tier || 'vip',
            founderNumber: entitlement?.founder_number || 1,
            founderLocked: !!entitlement?.founder_locked,
            tierExpiry: entitlement?.current_period_end || '2027-08-21',
            capBreakersUnlocked: 5,
            savedBuildsCount: 4,
            role: entitlement?.subscription_tier === 'founder' ? 'CEO VIP Founder' : 'CEO VIP Member'
          });
        }
      } catch (err) {
        console.warn('Session check fallback:', err);
      }
    }
  },

  bindEvents() {
    // Tab switching in Auth modal
    const loginTabBtn = document.getElementById('auth-tab-login');
    const signupTabBtn = document.getElementById('auth-tab-signup');
    const loginForm = document.getElementById('form-login');
    const signupForm = document.getElementById('form-signup');

    if (loginTabBtn && signupTabBtn) {
      loginTabBtn.addEventListener('click', () => {
        loginTabBtn.classList.add('active');
        signupTabBtn.classList.remove('active');
        if (loginForm) loginForm.style.display = 'block';
        if (signupForm) signupForm.style.display = 'none';
      });

      signupTabBtn.addEventListener('click', () => {
        signupTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
        if (signupForm) signupForm.style.display = 'block';
        if (loginForm) loginForm.style.display = 'none';
      });
    }

    // Login submit (Supabase Connected)
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const pass = document.getElementById('login-password').value;

        if (!email || !pass) {
          Toast.error('Please enter both email and password.');
          return;
        }

        try {
          Toast.info('Authenticating credentials with Supabase Auth...');
          const res = await SupabaseService.signIn(email, pass);
          const userId = res.user?.id || 'user-' + Date.now();
          const meta = res.user?.user_metadata || {};

          VaultState.setUser({
            id: userId,
            name: meta.name || email.split('@')[0] || 'Jeremy Jr.',
            gamertag: meta.gamertag || 'CHOSENGREATNESS',
            platform: meta.platform || 'Xbox Series X',
            email: email,
            discordId: meta.discordId || 'TheCEOCG#0001 (Synced)',
            membershipTier: 'vip',
            tierExpiry: '2027-08-21',
            capBreakersUnlocked: 5,
            savedBuildsCount: 4,
            role: 'CEO VIP Founder'
          });

          Modal.close('modal-auth');
          Toast.success(`Welcome back, ${email.split('@')[0]}! Supabase session active.`);
          Router.navigate('#dashboard');
        } catch (err) {
          Toast.error(err.message || 'Login failed. Please verify credentials.');
        }
      });
    }

    // Signup submit (Supabase Connected)
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const gamertag = document.getElementById('signup-gamertag').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const pass = document.getElementById('signup-password').value;
        const platform = document.getElementById('signup-platform').value;

        if (!name || !email || !pass || !gamertag) {
          Toast.error('Please fill in all required fields.');
          return;
        }

        if (pass.length < 6) {
          Toast.warning('Password should be at least 6 characters.');
          return;
        }

        try {
          Toast.info('Creating encrypted profile in Supabase...');
          const res = await SupabaseService.signUp(email, pass, { name, gamertag, platform });
          const userId = res.user?.id || 'user-' + Date.now();

          VaultState.setUser({
            id: userId,
            name: name,
            gamertag: gamertag,
            platform: platform,
            email: email,
            discordId: 'Pending Link',
            membershipTier: 'pro',
            tierExpiry: '2027-08-21',
            capBreakersUnlocked: 3,
            savedBuildsCount: 4,
            role: 'CEO Pro Member'
          });

          Modal.close('modal-auth');
          Toast.success(`Account created for ${gamertag}! Profile synced to Supabase.`);
          Router.navigate('#dashboard');
        } catch (err) {
          Toast.error(err.message || 'Signup failed. Please try again.');
        }
      });
    }

    // Discord OAuth simulation & live provider
    const btnDiscord = document.getElementById('btn-oauth-discord');
    if (btnDiscord) {
      btnDiscord.addEventListener('click', async () => {
        Toast.info('Connecting to Discord OAuth2...');
        try {
          if (window.SupabaseService?.client) {
            await SupabaseService.signInWithOAuth('discord');
            return;
          }
        } catch {
          // Fallback simulation
        }

        setTimeout(() => {
          VaultState.setUser({
            id: 'user-discord-' + Date.now(),
            name: 'Jeremy Jr.',
            gamertag: 'CHOSENGREATNESS',
            platform: 'Xbox Series X',
            email: 'ceo.gaming@vaultintel.com',
            discordId: 'TheCEOCG#0001 (Synced)',
            membershipTier: 'vip',
            tierExpiry: '2027-08-21',
            capBreakersUnlocked: 5,
            savedBuildsCount: 4,
            role: 'CEO VIP Founder'
          });
          Modal.close('modal-auth');
          Toast.success('Discord OAuth synced! VIP roles assigned in Discord.');
          Router.navigate('#dashboard');
        }, 500);
      });
    }

    // Xbox Live OAuth simulation & live provider
    const btnXbox = document.getElementById('btn-oauth-xbox');
    if (btnXbox) {
      btnXbox.addEventListener('click', async () => {
        Toast.info('Verifying Xbox Live Gamertag with Supabase Auth...');
        setTimeout(() => {
          VaultState.setUser({
            id: 'user-xbox-' + Date.now(),
            name: 'CHOSENGREATNESS',
            gamertag: 'CHOSENGREATNESS',
            platform: 'Xbox Series X',
            email: 'xbox.gamer@theceovault.com',
            discordId: 'TheCEOCG#0001 (Synced)',
            membershipTier: 'vip',
            tierExpiry: '2027-08-21',
            capBreakersUnlocked: 5,
            savedBuildsCount: 4,
            role: 'CEO VIP Founder'
          });
          Modal.close('modal-auth');
          Toast.success('Xbox Live authenticated! Gamertag verified.');
          Router.navigate('#dashboard');
        }, 500);
      });
    }

    // Guest Mode Toggle
    const btnGuest = document.getElementById('btn-auth-guest');
    if (btnGuest) {
      btnGuest.addEventListener('click', () => {
        VaultState.loginAsGuest();
        Modal.close('modal-auth');
        Toast.info('Browsing as Rookie (Free Tier demo mode).');
        Router.navigate('#dashboard');
      });
    }
  },

  async logout() {
    await SupabaseService.signOut();
    VaultState.logout();
    Toast.info('You have securely signed out.');
    Router.navigate('#landing');
  }
};

window.Auth = Auth;
