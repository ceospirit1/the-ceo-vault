/**
 * THE CEO VAULT - Accessible Modal System
 */

(function() {
  const Modal = {
    activeModalId: null,

    open(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.activeModalId = modalId;

      // Focus first input if present
      const firstInput = modal.querySelector('input:not([type="hidden"]), button:not(.modal-close-btn)');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 50);
      }
    },

    close(modalId) {
      const id = modalId || this.activeModalId;
      if (!id) return;

      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.remove('active');
      }
      
      // Check if any modals remain open
      const openModals = document.querySelectorAll('.modal-backdrop.active');
      if (openModals.length === 0) {
        document.body.style.overflow = '';
        this.activeModalId = null;
      }
    },

    init() {
      // Backdrop click to dismiss
      document.addEventListener('click', (e) => {
        if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
          this.close(e.target.id);
        }
        const closeBtn = e.target.closest('[data-modal-close]');
        if (closeBtn) {
          const modal = closeBtn.closest('.modal-backdrop');
          if (modal) this.close(modal.id);
        }
        const openTrigger = e.target.closest('[data-modal-target]');
        if (openTrigger) {
          e.preventDefault();
          const targetId = openTrigger.getAttribute('data-modal-target');
          this.open(targetId);
        }
      });

      // Keyboard ESC key to dismiss
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.activeModalId) {
          this.close(this.activeModalId);
        }
      });
    }
  };

  window.Modal = Modal;
})();
