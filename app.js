/**
 * THE CEO VAULT - Main Application Bootstrap
 */

(function() {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 THE CEO VAULT Engine Initializing...');

    // Initialize core component libraries
    if (window.Toast && typeof Toast.init === 'function') Toast.init();
    if (window.Modal && typeof Modal.init === 'function') Modal.init();

    // Initialize feature modules safely
    if (window.Auth && typeof Auth.init === 'function') Auth.init();
    if (window.Membership && typeof Membership.init === 'function') Membership.init();
    if (window.Dashboard && typeof Dashboard.init === 'function') Dashboard.init();
    if (window.Landing && typeof Landing.init === 'function') Landing.init();
    if (window.Router && typeof Router.init === 'function') Router.init();

    // Mobile Drawer Toggle
    const btnHamburger = document.getElementById('nav-hamburger');
    const btnCloseDrawer = document.getElementById('drawer-close-btn');
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('drawer-overlay');

    if (btnHamburger && drawer && overlay) {
      btnHamburger.addEventListener('click', () => {
        drawer.classList.add('open');
        overlay.classList.add('active');
      });
    }

    if (btnCloseDrawer && drawer && overlay) {
      btnCloseDrawer.addEventListener('click', () => {
        drawer.classList.remove('open');
        overlay.classList.remove('active');
      });
    }

    if (overlay && drawer) {
      overlay.addEventListener('click', () => {
        drawer.classList.remove('open');
        overlay.classList.remove('active');
      });
    }

    // Navbar Dynamic Blur on Scroll
    const navbar = document.getElementById('vault-navbar');
    window.addEventListener('scroll', () => {
      if (navbar) {
        if (window.scrollY > 40) {
          navbar.style.background = 'rgba(7, 8, 13, 0.95)';
          navbar.style.borderBottomColor = 'rgba(255, 255, 255, 0.12)';
        } else {
          navbar.style.background = 'rgba(11, 13, 20, 0.85)';
          navbar.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
        }
      }
    });

    // Dynamic user profile button in navbar
    const updateNavUser = () => {
      if (!window.VaultState || typeof VaultState.getState !== 'function') return;
      const stateObj = VaultState.getState();
      const user = stateObj.user;
      const navUserContainer = document.getElementById('nav-user-container');

      if (navUserContainer) {
        if (user && stateObj.isAuthenticated) {
          navUserContainer.innerHTML = `
            <div class="nav-user-profile" onclick="if (window.Router) Router.navigate('#dashboard'); else window.location.hash = '#dashboard';" title="Open Member Dashboard">
              <div class="user-avatar">${(user.gamertag || user.name || 'U').charAt(0).toUpperCase()}</div>
              <span style="font-size: 0.85rem; font-weight: 600;">${user.gamertag || user.name}</span>
              <span class="brand-badge" style="font-size: 0.6rem;">${user.membershipTier ? user.membershipTier.toUpperCase() : 'VIP'}</span>
            </div>
            <button class="btn btn-outline btn-sm" onclick="if (window.Auth) Auth.logout();" title="Log out">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          `;
        } else {
          navUserContainer.innerHTML = `
            <button class="btn btn-secondary btn-sm" data-modal-target="modal-auth">Log In</button>
            <button class="btn btn-primary btn-sm" onclick="if (window.Router) Router.navigate('#membership'); else window.location.hash = '#membership';">Get VIP Access</button>
          `;
        }
      }
    };

    if (window.VaultState && typeof VaultState.subscribe === 'function') {
      VaultState.subscribe(updateNavUser);
    }
    updateNavUser();

    console.log('✅ THE CEO VAULT ready.');
  });
})();
