/**
 * THE CEO VAULT - Client-side Router (Protected Routes Enforced)
 */

(function() {
  const Router = {
    routes: ['#landing', '#tools', '#membership', '#dashboard', '#pricing', '#faq', '#admin'],

    init() {
      window.addEventListener('hashchange', () => this.handleRoute());

      // Intercept navigation links for smooth in-page transitions
      document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (anchor) {
          const href = anchor.getAttribute('href');
          if (href === '#tools' || href === '#section-tools' || href === '#intel-tools') {
            e.preventDefault();
            this.navigateToTools();
          } else if (href === '#landing' || href === '#home') {
            e.preventDefault();
            this.navigateToLanding();
          } else if (href === '#membership' || href === '#pricing' || href === '#vip') {
            e.preventDefault();
            this.navigateToMembership();
          } else if (href === '#faq') {
            e.preventDefault();
            this.navigateToFaq();
          } else if (href === '#dashboard') {
            e.preventDefault();
            this.navigateToDashboard();
          }
        }
      });

      this.handleRoute();
    },

    navigateToLanding() {
      if (window.location.hash !== '#landing') {
        window.location.hash = '#landing';
      } else {
        this.handleRoute();
      }
    },

    navigateToTools() {
      if (window.location.hash !== '#section-tools') {
        window.location.hash = '#section-tools';
      } else {
        this.handleRoute();
      }
    },

    navigateToFaq() {
      if (window.location.hash !== '#faq') {
        window.location.hash = '#faq';
      } else {
        this.handleRoute();
      }
    },

    navigateToMembership() {
      if (window.location.hash !== '#membership') {
        window.location.hash = '#membership';
      } else {
        this.handleRoute();
      }
    },

    navigateToDashboard() {
      if (window.location.hash !== '#dashboard') {
        window.location.hash = '#dashboard';
      } else {
        this.handleRoute();
      }
    },

    handleRoute() {
      let hash = window.location.hash || '#landing';

      // Normalize route aliases
      let targetSection = null;
      if (hash === '#tools' || hash === '#intel-tools' || hash === '#section-tools') {
        targetSection = 'section-tools';
        hash = '#landing';
      } else if (hash === '#faq') {
        targetSection = 'faq';
        hash = '#landing';
      } else if (hash === '#home' || hash === '' || hash === '#') {
        hash = '#landing';
      } else if (hash === '#pricing' || hash === '#vip') {
        hash = '#membership';
      } else if (hash === '#builds') {
        if (window.VaultState && typeof VaultState.setActiveTab === 'function') VaultState.setActiveTab('builds');
        hash = '#dashboard';
      } else if (hash === '#jumpshots') {
        if (window.VaultState && typeof VaultState.setActiveTab === 'function') VaultState.setActiveTab('jumpshots');
        hash = '#dashboard';
      } else if (hash === '#intel') {
        if (window.VaultState && typeof VaultState.setActiveTab === 'function') VaultState.setActiveTab('intel');
        hash = '#dashboard';
      } else if (hash === '#videos') {
        if (window.VaultState && typeof VaultState.setActiveTab === 'function') VaultState.setActiveTab('videos');
        hash = '#dashboard';
      } else if (hash === '#settings') {
        if (window.VaultState && typeof VaultState.setActiveTab === 'function') VaultState.setActiveTab('settings');
        hash = '#dashboard';
      } else if (hash === '#admin') {
        if (window.VaultState && typeof VaultState.setActiveTab === 'function') VaultState.setActiveTab('admin');
        hash = '#dashboard';
      } else if (!this.routes.includes(hash)) {
        hash = '#landing';
      }

      // Protected Route Guard: Check authentication for Dashboard
      if (hash === '#dashboard') {
        const stateObj = (window.VaultState && typeof VaultState.getState === 'function') ? VaultState.getState() : {};
        if (!stateObj.isAuthenticated) {
          if (window.Modal) Modal.open('modal-auth');
          if (window.Toast) Toast.warning('Please sign in or continue as guest to access Member Dashboard.');
          this.navigate('#landing');
          return;
        }
      }

      // Toggle views
      const viewLanding = document.getElementById('view-landing');
      const viewMembership = document.getElementById('view-membership');
      const viewDashboard = document.getElementById('view-dashboard');

      if (viewLanding) viewLanding.style.display = (hash === '#landing') ? 'block' : 'none';
      if (viewMembership) viewMembership.style.display = (hash === '#membership') ? 'block' : 'none';
      if (viewDashboard) viewDashboard.style.display = (hash === '#dashboard') ? 'block' : 'none';

      // Update active nav links
      const currentHash = window.location.hash || '#landing';
      document.querySelectorAll('.nav-link, .drawer-link').forEach(link => {
        const href = link.getAttribute('href');
        if (targetSection && (href === '#tools' || href === '#section-tools' || href === '#intel-tools' || href === '#faq')) {
          link.classList.add('active');
        } else if (!targetSection && (href === hash || href === currentHash)) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Close mobile drawer on route change
      const drawer = document.getElementById('mobile-drawer');
      const overlay = document.getElementById('drawer-overlay');
      if (drawer) drawer.classList.remove('open');
      if (overlay) overlay.classList.remove('active');

      // Handle scroll target
      if (targetSection) {
        const sectionEl = document.getElementById(targetSection);
        if (sectionEl) {
          setTimeout(() => {
            sectionEl.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Re-render dashboard if navigated to dashboard
      if (hash === '#dashboard' && window.Dashboard && typeof Dashboard.render === 'function') {
        Dashboard.render();
      }
    },

    navigate(hash) {
      window.location.hash = hash;
    }
  };

  window.Router = Router;
})();
