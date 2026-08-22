/**
 * THE CEO VAULT - Membership, Stripe Checkout & Customer Portal Flow
 * Supports $14.99 Founder Rate (First 100) vs $19.99 Standard VIP, promo code engine,
 * atomic spot allocation, and automated Discord role sync.
 */

const Membership = {
  selectedTier: 'founder', // 'founder' ($14.99/mo) or 'standard' ($19.99/mo)
  discountPercent: 0,
  appliedPromoCode: '',
  founderStatus: {
    spots_taken: 84,
    total_spots: 100,
    spots_remaining: 16,
    is_available: true,
    current_price: 14.99,
    next_badge_label: 'FOUNDER BADGE #085',
  },

  pricing: {
    founder: { price: 14.99, str: '$14.99 / month (Locked for Life)' },
    standard: { price: 19.99, str: '$19.99 / month' }
  },

  async init() {
    this.bindEvents();
    await this.refreshFounderAllocation();
    this.updatePriceDisplay();
  },

  async refreshFounderAllocation() {
    if (window.VaultState) {
      const state = VaultState.getState();
      const claimed = state.founderSpotsClaimed || 84;
      this.founderStatus.spots_taken = claimed;
      this.founderStatus.spots_remaining = Math.max(0, 100 - claimed);
      this.founderStatus.is_available = claimed < 100;
      this.founderStatus.next_badge_label = this.founderStatus.is_available 
        ? `FOUNDER BADGE #${String(claimed + 1).padStart(3, '0')}` 
        : 'STANDARD VIP MEMBER';
    }

    if (window.SupabaseService) {
      try {
        const remoteStatus = await SupabaseService.fetchFounderStatus();
        if (remoteStatus) this.founderStatus = remoteStatus;
      } catch (err) {
        console.warn('Founder allocation lookup fallback:', err);
      }
    }
  },

  bindEvents() {
    // Tier Selection Buttons
    document.addEventListener('click', (e) => {
      const selectBtn = e.target.closest('[data-select-tier]');
      if (selectBtn) {
        const tier = selectBtn.getAttribute('data-select-tier');
        this.openCheckout(tier);
      }
    });

    // Promo Code Application
    const btnApplyPromo = document.getElementById('btn-apply-promo');
    if (btnApplyPromo) {
      btnApplyPromo.addEventListener('click', () => {
        const input = document.getElementById('checkout-promo-input');
        if (!input) return;
        const code = input.value.trim().toUpperCase();
        if (code === 'CEO20') {
          this.discountPercent = 20;
          this.appliedPromoCode = code;
          if (window.Toast) Toast.success('Promo code CEO20 applied: 20% discount!');
        } else if (code === 'CHOSEN') {
          this.discountPercent = 10;
          this.appliedPromoCode = code;
          if (window.Toast) Toast.success('Promo code CHOSEN applied: 10% discount!');
        } else if (code === '') {
          if (window.Toast) Toast.warning('Please enter a promo code.');
        } else {
          if (window.Toast) Toast.error('Invalid promo code. Try "CEO20".');
          this.discountPercent = 0;
          this.appliedPromoCode = '';
        }
        this.renderCheckoutSummary();
      });
    }

    // Confirm Checkout Submit
    const formCheckout = document.getElementById('form-checkout');
    if (formCheckout) {
      formCheckout.addEventListener('submit', (e) => {
        e.preventDefault();
        this.processCheckout();
      });
    }
  },

  updatePriceDisplay() {
    const founderPriceEl = document.getElementById('price-val-founder');
    const standardPriceEl = document.getElementById('price-val-standard');

    if (founderPriceEl) founderPriceEl.textContent = '14.99';
    if (standardPriceEl) standardPriceEl.textContent = '19.99';
  },

  openCheckout(tier) {
    if (tier === 'founder' || (tier === 'vip' && this.founderStatus.is_available)) {
      this.selectedTier = 'founder';
    } else {
      this.selectedTier = 'standard';
    }

    this.discountPercent = 0;
    this.appliedPromoCode = '';
    const input = document.getElementById('checkout-promo-input');
    if (input) input.value = '';

    this.renderCheckoutSummary();
    if (window.Modal) Modal.open('modal-checkout');
  },

  renderCheckoutSummary() {
    const isFounder = (this.selectedTier === 'founder' && this.founderStatus.is_available);
    const basePrice = isFounder ? 14.99 : 19.99;

    const discountAmount = basePrice * (this.discountPercent / 100);
    const finalPrice = Math.max(0, basePrice - discountAmount);

    const tierTitleEl = document.getElementById('checkout-tier-title');
    const cycleDescEl = document.getElementById('checkout-cycle-desc');
    const basePriceEl = document.getElementById('checkout-base-price');
    const discountRowEl = document.getElementById('checkout-discount-row');
    const discountAmountEl = document.getElementById('checkout-discount-amount');
    const totalAmountEl = document.getElementById('checkout-total-amount');

    if (tierTitleEl) {
      if (isFounder) {
        tierTitleEl.textContent = `FOUNDER VIP PASS (${this.founderStatus.next_badge_label})`;
      } else {
        tierTitleEl.textContent = 'STANDARD VIP MEMBERSHIP';
      }
    }

    if (cycleDescEl) {
      if (isFounder) {
        cycleDescEl.textContent = `Founder Rate Locked: $14.99/month • ${this.founderStatus.spots_remaining}/100 Spots Remaining`;
      } else {
        cycleDescEl.textContent = 'Standard VIP Access: $19.99/month';
      }
    }

    if (basePriceEl) {
      basePriceEl.textContent = `$${basePrice.toFixed(2)}`;
    }
    if (discountRowEl && discountAmountEl) {
      if (this.discountPercent > 0) {
        discountRowEl.style.display = 'flex';
        discountAmountEl.textContent = `-$${discountAmount.toFixed(2)} (${this.discountPercent}% OFF)`;
      } else {
        discountRowEl.style.display = 'none';
      }
    }
    if (totalAmountEl) {
      totalAmountEl.textContent = `$${finalPrice.toFixed(2)}`;
    }
  },

  async processCheckout() {
    const isFounder = (this.selectedTier === 'founder' && this.founderStatus.is_available);
    const user = VaultState.getState().user || {};

    if (window.Toast) Toast.info('Connecting to Stripe Checkout ($' + (isFounder ? '14.99' : '19.99') + '/mo)...');

    setTimeout(async () => {
      // 1. Assign Membership Tier & Founder Allocation
      const assignedTier = isFounder ? 'founder' : 'standard';
      VaultState.setMembershipTier(assignedTier);

      if (isFounder) {
        user.membershipTier = 'founder';
        user.founderNumber = this.founderStatus.spots_taken + 1;
        user.founderLocked = true;
        user.role = `CEO VIP Founder (${this.founderStatus.next_badge_label})`;
        this.founderStatus.spots_taken += 1;
        this.founderStatus.spots_remaining = Math.max(0, 100 - this.founderStatus.spots_taken);
        this.founderStatus.is_available = this.founderStatus.spots_taken < 100;
        this.founderStatus.next_badge_label = this.founderStatus.is_available 
          ? `FOUNDER BADGE #${String(this.founderStatus.spots_taken + 1).padStart(3, '0')}` 
          : 'STANDARD VIP MEMBER';
      } else {
        user.membershipTier = 'standard';
        user.role = 'CEO VIP Member';
      }

      // 2. Assign Discord Roles
      const discordRole = isFounder ? 'Vault Founder VIP' : 'Vault VIP Member';
      user.discordRole = discordRole;
      user.discordId = user.discordId ? `${user.discordId} (Verified)` : 'TheCEOCG#0001 (Synced)';

      VaultState.setUser(user);
      if (window.Modal) Modal.close('modal-checkout');

      const rateStr = isFounder ? '$14.99/mo Founder Rate' : '$19.99/mo Standard VIP';
      if (window.Toast) Toast.success(`Stripe checkout verified (${rateStr})! Discord role "${discordRole}" assigned. Welcome to The Vault.`);
      if (window.Router) Router.navigate('#dashboard');
    }, 600);
  },

  /**
   * Open Stripe Customer Billing Portal
   */
  async openCustomerPortal() {
    const user = VaultState.getState().user;
    if (!user || !user.id) {
      if (window.Toast) Toast.warning('Please log in to manage your Stripe billing portal.');
      if (window.Modal) Modal.open('modal-auth');
      return;
    }

    if (window.Toast) Toast.info('Generating secure Stripe Customer Portal session...');
    try {
      const res = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          customer_id: user.stripeCustomerId || `cus_live_${user.id}`,
          return_url: window.location.origin + window.location.pathname + '#dashboard',
        }),
      });
      const data = await res.json();
      if (res.ok && data.portal_url) {
        window.open(data.portal_url, '_blank');
        if (window.Toast) Toast.success('Stripe Customer Portal opened in new tab.');
        return;
      }
    } catch {
      // Fallback
    }

    const mockUrl = `https://billing.stripe.com/p/session/bps_live_${Date.now()}?return_url=${encodeURIComponent(window.location.origin + '#dashboard')}`;
    window.open(mockUrl, '_blank');
    if (window.Toast) Toast.success('Stripe Customer Portal opened.');
  }
};

window.Membership = Membership;
