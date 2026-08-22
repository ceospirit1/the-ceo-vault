/**
 * THE CEO VAULT - Landing Page Interactive Logic
 * Controls dynamic founder counter, interactive attribute simulator with badge unlocks,
 * testimonials, and FAQ accordion.
 */

(function() {
  const Landing = {
    init() {
      this.bindEvents();
      this.updateSimulator(93, 87, 86);
      this.updateFounderCounter();
      if (window.VaultState && typeof VaultState.subscribe === 'function') {
        VaultState.subscribe(() => this.updateFounderCounter());
      }
    },

    bindEvents() {
      // Simulator Sliders
      const slider3pt = document.getElementById('sim-slider-3pt');
      const sliderDunk = document.getElementById('sim-slider-dunk');
      const sliderHandle = document.getElementById('sim-slider-handle');

      const updateFromSliders = () => {
        const v3pt = parseInt(slider3pt ? slider3pt.value : 93);
        const vDunk = parseInt(sliderDunk ? sliderDunk.value : 87);
        const vHandle = parseInt(sliderHandle ? sliderHandle.value : 86);
        this.updateSimulator(v3pt, vDunk, vHandle);
      };

      if (slider3pt) slider3pt.addEventListener('input', updateFromSliders);
      if (sliderDunk) sliderDunk.addEventListener('input', updateFromSliders);
      if (sliderHandle) sliderHandle.addEventListener('input', updateFromSliders);

      // FAQ Accordion
      document.addEventListener('click', (e) => {
        const faqHeader = e.target.closest('.faq-question');
        if (faqHeader) {
          const item = faqHeader.closest('.faq-item');
          if (item) {
            const wasActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!wasActive) {
              item.classList.add('active');
            }
          }
        }
      });
    },

    updateFounderCounter() {
      if (!window.VaultState) return;
      const state = VaultState.getState();
      const claimed = state.founderSpotsClaimed || 84;
      const total = state.founderSpotsTotal || 100;
      const remaining = Math.max(0, total - claimed);

      const spotsEl = document.getElementById('landing-founder-spots');
      const progressEl = document.getElementById('landing-founder-progress');

      if (spotsEl) spotsEl.textContent = remaining;
      if (progressEl) progressEl.style.width = `${Math.min(100, (claimed / total) * 100)}%`;
    },

    updateSimulator(v3pt, vDunk, vHandle) {
      // Update numerical readouts
      const txt3pt = document.getElementById('sim-val-3pt');
      const txtDunk = document.getElementById('sim-val-dunk');
      const txtHandle = document.getElementById('sim-val-handle');

      if (txt3pt) txt3pt.textContent = v3pt;
      if (txtDunk) txtDunk.textContent = vDunk;
      if (txtHandle) txtHandle.textContent = vHandle;

      // Update progress bars
      const fill3pt = document.getElementById('sim-fill-3pt');
      const fillDunk = document.getElementById('sim-fill-dunk');
      const fillHandle = document.getElementById('sim-fill-handle');

      if (fill3pt) fill3pt.style.width = `${v3pt}%`;
      if (fillDunk) fillDunk.style.width = `${vDunk}%`;
      if (fillHandle) fillHandle.style.width = `${vHandle}%`;

      // Dynamic Badge Unlocks Preview
      const previewBadgesEl = document.getElementById('sim-badge-unlocks');
      if (previewBadgesEl) {
        let badges = [];

        // 3PT Badges
        if (v3pt >= 96) {
          badges.push({ name: 'Limitless Range', tier: 'hof' });
          badges.push({ name: 'Set Shot Specialist', tier: 'legend' });
        } else if (v3pt >= 93) {
          badges.push({ name: 'Limitless Range', tier: 'gold' });
          badges.push({ name: 'Set Shot Specialist', tier: 'legend' });
        } else if (v3pt >= 89) {
          badges.push({ name: 'Limitless Range', tier: 'silver' });
          badges.push({ name: 'Set Shot Specialist', tier: 'gold' });
        } else if (v3pt >= 83) {
          badges.push({ name: 'Set Shot Specialist', tier: 'silver' });
        } else {
          badges.push({ name: 'Corner Specialist', tier: 'bronze' });
        }

        // Dunk Badges
        if (vDunk >= 93) {
          badges.push({ name: 'Posterizer', tier: 'hof' });
        } else if (vDunk >= 87) {
          badges.push({ name: 'Posterizer', tier: 'gold' });
        } else if (vDunk >= 75) {
          badges.push({ name: 'Posterizer', tier: 'silver' });
        }

        // Handle Badges
        if (vHandle >= 93) {
          badges.push({ name: 'Ankle Assassin', tier: 'legend' });
        } else if (vHandle >= 86) {
          badges.push({ name: 'Ankle Assassin', tier: 'gold' });
        } else {
          badges.push({ name: 'Unpluckable', tier: 'silver' });
        }

        previewBadgesEl.innerHTML = badges.map(b => {
          let tierClass = 'tier-silver';
          if (b.tier === 'gold') tierClass = 'tier-gold';
          if (b.tier === 'hof') tierClass = 'tier-hof';
          if (b.tier === 'legend') tierClass = 'tier-legend';
          return `<span class="tier-pill ${tierClass}">${b.name}</span>`;
        }).join(' ');
      }
    }
  };

  window.Landing = Landing;
})();
