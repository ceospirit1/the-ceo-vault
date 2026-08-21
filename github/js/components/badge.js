/**
 * Badge Helper Utilities
 */

const BadgeHelper = {
  renderTierPill(name, tier) {
    const t = (tier || 'bronze').toLowerCase();
    return `<span class="tier-pill tier-${t}" title="${name} (${t.toUpperCase()})">${name} • ${t.toUpperCase()}</span>`;
  },

  renderUserTierBadge(tier) {
    const t = (tier || 'free').toLowerCase();
    if (t === 'vip') {
      return `<span class="badge-tag badge-tag-gold"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> CEO ELITE VIP</span>`;
    }
    if (t === 'pro') {
      return `<span class="badge-tag badge-tag-cyan"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> PRO MEMBER</span>`;
    }
    return `<span class="badge-tag" style="background: rgba(255,255,255,0.1); color: #cbd5e1;">ROOKIE FREE</span>`;
  }
};

window.BadgeHelper = BadgeHelper;
