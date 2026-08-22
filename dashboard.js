/**
 * THE CEO VAULT - Member Dashboard Controller
 * Handles Build Vault (CRUD + Share), Jumpshot Lab (Curated + Custom Creator + Filtering),
 * Live Intel (Feed + Filtering + Detail Modal), Video Vault (Player + Progress Tracking),
 * Settings (Profile + Account + Discord), and Admin Command Center.
 */

(function() {
  const Dashboard = {
    editingBuildId: null,

    init() {
      this.bindEvents();
      this.render();
      if (window.VaultState && typeof VaultState.subscribe === 'function') {
        VaultState.subscribe(() => this.render());
      }
    },

    bindEvents() {
      // Tab switching
      document.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('[data-dash-tab]');
        if (tabBtn) {
          const tabName = tabBtn.getAttribute('data-dash-tab');
          this.switchTab(tabName);
        }

        // Admin sub-tab switching
        const adminTabBtn = e.target.closest('[data-admin-subtab]');
        if (adminTabBtn) {
          const subTabName = adminTabBtn.getAttribute('data-admin-subtab');
          if (window.VaultState) VaultState.setAdminSubTab(subTabName);
          this.renderAdminSubTabs(subTabName);
        }

        // Intel filter pills
        const intelFilterBtn = e.target.closest('[data-intel-filter]');
        if (intelFilterBtn) {
          const filter = intelFilterBtn.getAttribute('data-intel-filter');
          if (window.VaultState) VaultState.setIntelFilter(filter);
        }

        // Video filter pills
        const videoFilterBtn = e.target.closest('[data-video-filter]');
        if (videoFilterBtn) {
          const filter = videoFilterBtn.getAttribute('data-video-filter');
          if (window.VaultState) VaultState.setVideoFilter(filter);
        }
      });

      // Create / Edit Build Form
      const formBuild = document.getElementById('form-create-build');
      if (formBuild) {
        formBuild.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleSaveBuild();
        });
      }

      // Custom Jumpshot Form
      const formJumpshot = document.getElementById('form-create-jumpshot');
      if (formJumpshot) {
        formJumpshot.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleSaveCustomJumpshot();
        });
      }

      // Settings Profile Form
      const formSettings = document.getElementById('form-settings-profile');
      if (formSettings) {
        formSettings.addEventListener('submit', (e) => {
          e.preventDefault();
          if (window.VaultState) {
            const user = VaultState.getState().user || {};
            const gtag = document.getElementById('settings-gamertag');
            const disc = document.getElementById('settings-discord');
            const plat = document.getElementById('settings-platform');
            const scheme = document.getElementById('settings-scheme');
            const defense = document.getElementById('settings-defense');

            if (gtag) user.gamertag = gtag.value.trim();
            if (disc) user.discordId = disc.value.trim();
            if (plat) user.platform = plat.value;
            if (scheme) user.favScheme = scheme.value;
            if (defense) user.favDefense = defense.value;

            VaultState.setUser(user);
          }
          if (window.Toast) Toast.success('Gamer preferences and vault settings updated successfully!');
        });
      }

      // Admin Forms
      const formAdminBuild = document.getElementById('form-admin-add-build');
      if (formAdminBuild) {
        formAdminBuild.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleAdminAddBuild();
        });
      }

      const formAdminVideo = document.getElementById('form-admin-add-video');
      if (formAdminVideo) {
        formAdminVideo.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleAdminAddVideo();
        });
      }

      const formAdminIntel = document.getElementById('form-admin-add-intel');
      if (formAdminIntel) {
        formAdminIntel.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleAdminAddIntel();
        });
      }

      // Search Members in Admin
      const inputSearchMembers = document.getElementById('admin-search-members');
      if (inputSearchMembers) {
        inputSearchMembers.addEventListener('input', (e) => {
          this.renderMembersTable(e.target.value.trim().toLowerCase());
        });
      }

      // Jumpshot Live Filters
      const inputSearchJump = document.getElementById('search-jumpshots-input');
      const selectJumpHeight = document.getElementById('filter-jump-height');
      const selectJumpCue = document.getElementById('filter-jump-cue');

      const applyJumpFilters = () => {
        const query = inputSearchJump ? inputSearchJump.value.trim().toLowerCase() : '';
        const height = selectJumpHeight ? selectJumpHeight.value : 'ALL';
        const cue = selectJumpCue ? selectJumpCue.value : 'ALL';
        this.filterAndRenderJumpshots(query, height, cue);
      };

      if (inputSearchJump) inputSearchJump.addEventListener('input', applyJumpFilters);
      if (selectJumpHeight) selectJumpHeight.addEventListener('change', applyJumpFilters);
      if (selectJumpCue) selectJumpCue.addEventListener('change', applyJumpFilters);
    },

    isAdminUser() {
      if (!window.VaultState || typeof VaultState.getState !== 'function') return false;
      const user = VaultState.getState().user;
      return !!user && user.role === 'admin';
    },

    requireAdminAction() {
      if (this.isAdminUser()) return true;
      if (window.Toast) Toast.error('AI Operator access is restricted to admin users.');
      return false;
    },

    escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char]));
    },

    switchTab(tabName, persist = true) {
      if (tabName === 'admin' && !this.isAdminUser()) {
        tabName = 'builds';
        if (window.Toast) Toast.error('Admin Command Center is restricted to admin users.');
      }

      if (persist && window.VaultState && typeof VaultState.setActiveTab === 'function') {
        VaultState.setActiveTab(tabName);
      }
      const tabBtns = document.querySelectorAll('[data-dash-tab]');
      const tabPanes = document.querySelectorAll('.dashboard-tab-pane');

      tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-dash-tab') === tabName);
      });

      tabPanes.forEach(pane => {
        pane.classList.toggle('active', pane.id === `tab-pane-${tabName}`);
      });
    },

    render() {
      if (!window.VaultState || typeof VaultState.getState !== 'function') return;
      const stateObj = VaultState.getState();
      const user = stateObj.user;

      // Synchronize active tab in UI
      this.switchTab(stateObj.activeTab || 'builds', false);

      const adminTabBtn = document.getElementById('dash-tab-btn-admin');
      if (adminTabBtn) {
        adminTabBtn.style.display = this.isAdminUser() ? '' : 'none';
      }

      // Render User Header
      const userHeaderEl = document.getElementById('dashboard-user-header-content');
      if (userHeaderEl) {
        if (user) {
          const founderBadge = user.membershipTier === 'founder' 
            ? `<span class="badge-tag badge-tag-gold" style="box-shadow: 0 0 10px rgba(245,158,11,0.4);"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> FOUNDER #${String(user.founderNumber || 1).padStart(3, '0')}</span>`
            : (user.membershipTier === 'vip' || user.membershipTier === 'standard'
              ? `<span class="badge-tag badge-tag-purple">👑 VIP MEMBER</span>`
              : `<span class="badge-tag" style="background: rgba(255,255,255,0.1); color: var(--text-secondary);">ROOKIE TIER</span>`);

          userHeaderEl.innerHTML = `
            <div class="user-header-left">
              <div class="user-avatar-large">${(user.gamertag || user.name || 'U').charAt(0).toUpperCase()}</div>
              <div class="user-info-text">
                <h2>${user.gamertag || user.name} <span style="font-size: 1.05rem; color: var(--gold-light); font-weight: 500;">(${user.platform || 'Xbox Series X'})</span></h2>
                <div class="user-meta-tags">
                  ${founderBadge}
                  <span class="badge-tag" style="background: rgba(255,255,255,0.08); color: var(--text-secondary);">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Discord: ${user.discordId || 'Linked'}
                  </span>
                  <span class="badge-tag badge-tag-purple">Cap Breakers: +${user.capBreakersUnlocked || 5}</span>
                  ${user.role === 'admin' ? '<span class="badge-tag badge-tag-green">ADMIN ACCESS</span>' : ''}
                </div>
              </div>
            </div>
            <div class="user-header-stats">
              <div class="stat-pill">
                <div class="val">${stateObj.savedBuilds ? stateObj.savedBuilds.length : 0}</div>
                <div class="lbl">Saved Builds</div>
              </div>
              <div class="stat-pill">
                <div class="val">${stateObj.favoriteJumpshots ? stateObj.favoriteJumpshots.length : 0}</div>
                <div class="lbl">Jumpshots</div>
              </div>
              <div class="stat-pill">
                <div class="val" style="color: var(--green-primary);">${user.membershipTier === 'vip' || user.membershipTier === 'founder' ? 'UNLIMITED' : '1/1 USED'}</div>
                <div class="lbl">Vault Status</div>
              </div>
            </div>
          `;
        } else {
          userHeaderEl.innerHTML = `
            <div class="user-header-left">
              <div class="user-avatar-large">G</div>
              <div class="user-info-text">
                <h2>Guest / Visitor Mode</h2>
                <p>Log in or link your Gamertag to access saved cloud builds and custom jumpers.</p>
              </div>
            </div>
            <div>
              <button class="btn btn-primary btn-sm" data-modal-target="modal-auth">Log In / Sign Up</button>
            </div>
          `;
        }
      }

      // Render Saved Builds
      this.renderBuilds(stateObj.savedBuilds || [], user);

      // Render Jumpshots
      this.renderJumpshots(stateObj.favoriteJumpshots || []);

      // Render Live Intel
      this.renderIntelFeed(stateObj.liveIntelFeed || [], stateObj.intelFilter || 'ALL');

      // Render Video Vault
      this.renderVideoVault(stateObj.videoVault || [], stateObj.videoFilter || 'ALL', user);

      // Render Admin Section if visible
      this.renderAdminSection(stateObj);

      // Populate Settings Inputs
      if (user) {
        const gtagInput = document.getElementById('settings-gamertag');
        const discInput = document.getElementById('settings-discord');
        const platSelect = document.getElementById('settings-platform');
        const schemeSelect = document.getElementById('settings-scheme');
        const defenseSelect = document.getElementById('settings-defense');
        const tierBadgeEl = document.getElementById('settings-tier-badge');
        const founderNumEl = document.getElementById('settings-founder-num');

        if (gtagInput) gtagInput.value = user.gamertag || '';
        if (discInput) discInput.value = user.discordId || '';
        if (platSelect && user.platform) platSelect.value = user.platform;
        if (schemeSelect && user.favScheme) schemeSelect.value = user.favScheme;
        if (defenseSelect && user.favDefense) defenseSelect.value = user.favDefense;
        if (tierBadgeEl) {
          tierBadgeEl.textContent = user.membershipTier === 'founder' ? 'Founder VIP ($14.99/mo Locked)' : (user.membershipTier === 'vip' || user.membershipTier === 'standard' ? 'Standard VIP ($19.99/mo)' : 'Rookie Tier ($0/mo)');
        }
        if (founderNumEl) {
          founderNumEl.textContent = user.founderNumber ? `#${String(user.founderNumber).padStart(3, '0')}` : 'N/A';
        }
      }
    },

    // -------------------------------------------------------------
    // BUILD VAULT
    // -------------------------------------------------------------
    renderBuilds(builds, user) {
      const container = document.getElementById('dashboard-builds-grid');
      if (!container) return;

      if (builds.length === 0) {
        container.innerHTML = `
          <div class="vault-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">No saved builds in your personal vault yet.</p>
            <button class="btn btn-primary" onclick="Dashboard.openCreateBuildModal()">+ Create First Build</button>
          </div>
        `;
        return;
      }

      container.innerHTML = builds.map(b => {
        const badgeHtml = b.topBadges ? b.topBadges.map(bg => {
          let tierClass = 'tier-silver';
          if (bg.tier === 'gold') tierClass = 'tier-gold';
          if (bg.tier === 'hof') tierClass = 'tier-hof';
          if (bg.tier === 'legend') tierClass = 'tier-legend';
          return `<span class="tier-pill ${tierClass}">${bg.name}</span>`;
        }).join(' ') : '';

        const attr = b.keyAttributes || {};

        return `
          <div class="build-card" id="card-${b.id}">
            <div>
              <div class="build-card-header">
                <div>
                  <h3 class="build-title">${b.name}</h3>
                  <div class="build-specs">${b.position} • ${b.height} • ${b.weight} • ${b.wingspan}</div>
                </div>
                <span class="badge-tag badge-tag-gold" style="font-size: 0.8rem;">${b.overall} OVR</span>
              </div>

              <div class="build-stats-mini-grid">
                <div class="build-mini-stat">
                  <span class="val" style="color: #fbbf24;">${attr.threePoint || '--'}</span>
                  <span class="lbl">3PT RATING</span>
                </div>
                <div class="build-mini-stat">
                  <span class="val" style="color: #06b6d4;">${attr.drivingDunk || '--'}</span>
                  <span class="lbl">DRIVING DUNK</span>
                </div>
                <div class="build-mini-stat">
                  <span class="val" style="color: #a855f7;">${attr.ballHandle || '--'}</span>
                  <span class="lbl">BALL HANDLE</span>
                </div>
                <div class="build-mini-stat">
                  <span class="val" style="color: #10b981;">${attr.perimeterDef || '--'}</span>
                  <span class="lbl">PERIMETER DEF</span>
                </div>
                <div class="build-mini-stat">
                  <span class="val" style="color: #f43f5e;">${attr.steal || '--'}</span>
                  <span class="lbl">STEAL</span>
                </div>
                <div class="build-mini-stat">
                  <span class="val" style="color: #38bdf8;">${attr.speed || '--'}</span>
                  <span class="lbl">SPEED</span>
                </div>
              </div>

              <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.35rem;">
                Key Meta Badges Unlocked (+${b.capBreakers || 5} Cap Breakers)
              </div>
              <div class="build-badges-row">
                ${badgeHtml}
              </div>

              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem; font-style: italic;">
                "${b.notes || 'Optimized telemetry build.'}"
              </p>
            </div>

            <div style="display: flex; gap: 0.5rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="Dashboard.openEditBuildModal('${b.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Edit
              </button>
              <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="Dashboard.copyBuildShare('${b.name}', '${b.position}', '${b.height}', '${attr.threePoint || 85}', '${attr.drivingDunk || 80}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Share
              </button>
              <button class="btn btn-danger btn-sm" onclick="Dashboard.deleteBuild('${b.id}')" title="Delete Build">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `;
      }).join('');
    },

    openCreateBuildModal() {
      this.editingBuildId = null;
      const modalTitle = document.getElementById('modal-build-title');
      const submitBtn = document.getElementById('modal-build-submit-btn');
      if (modalTitle) modalTitle.textContent = 'Create New Meta Build';
      if (submitBtn) submitBtn.textContent = 'Save Build to Personal Vault';

      const form = document.getElementById('form-create-build');
      if (form) form.reset();

      if (window.Modal) Modal.open('modal-create-build');
    },

    openEditBuildModal(buildId) {
      if (!window.VaultState) return;
      const build = VaultState.getState().savedBuilds.find(b => b.id === buildId);
      if (!build) return;

      this.editingBuildId = buildId;
      const modalTitle = document.getElementById('modal-build-title');
      const submitBtn = document.getElementById('modal-build-submit-btn');
      if (modalTitle) modalTitle.textContent = 'Edit Saved Build: ' + build.name;
      if (submitBtn) submitBtn.textContent = 'Update Build in Vault';

      // Fill form values
      const nameInput = document.getElementById('build-input-name');
      const posSelect = document.getElementById('build-input-position');
      const heightSelect = document.getElementById('build-input-height');
      const weightInput = document.getElementById('build-input-weight');
      const wingspanInput = document.getElementById('build-input-wingspan');
      const threePtInput = document.getElementById('build-input-3pt');
      const dunkInput = document.getElementById('build-input-dunk');
      const handleInput = document.getElementById('build-input-handle');
      const perimInput = document.getElementById('build-input-perim');
      const speedInput = document.getElementById('build-input-speed');
      const capInput = document.getElementById('build-input-cap');
      const notesInput = document.getElementById('build-input-notes');

      if (nameInput) nameInput.value = build.name;
      if (posSelect) posSelect.value = build.position;
      if (heightSelect) heightSelect.value = build.height;
      if (weightInput) weightInput.value = build.weight;
      if (wingspanInput) wingspanInput.value = build.wingspan;
      if (threePtInput) threePtInput.value = build.keyAttributes?.threePoint || 85;
      if (dunkInput) dunkInput.value = build.keyAttributes?.drivingDunk || 80;
      if (handleInput) handleInput.value = build.keyAttributes?.ballHandle || 85;
      if (perimInput) perimInput.value = build.keyAttributes?.perimeterDef || 85;
      if (speedInput) speedInput.value = build.keyAttributes?.speed || 85;
      if (capInput) capInput.value = build.capBreakers || 5;
      if (notesInput) notesInput.value = build.notes || '';

      if (window.Modal) Modal.open('modal-create-build');
    },

    handleSaveBuild() {
      const nameInput = document.getElementById('build-input-name');
      const posSelect = document.getElementById('build-input-position');
      const heightSelect = document.getElementById('build-input-height');
      const weightInput = document.getElementById('build-input-weight');
      const wingspanInput = document.getElementById('build-input-wingspan');
      const threePtInput = document.getElementById('build-input-3pt');
      const dunkInput = document.getElementById('build-input-dunk');
      const handleInput = document.getElementById('build-input-handle');
      const perimInput = document.getElementById('build-input-perim');
      const speedInput = document.getElementById('build-input-speed');
      const capInput = document.getElementById('build-input-cap');
      const notesInput = document.getElementById('build-input-notes');

      const name = nameInput ? nameInput.value.trim() : '';
      const pos = posSelect ? posSelect.value : 'SG';
      const height = heightSelect ? heightSelect.value : "6'6\"";
      const weight = weightInput ? (weightInput.value.trim() || '205 lbs') : '205 lbs';
      const wingspan = wingspanInput ? (wingspanInput.value.trim() || "6'11\"") : "6'11\"";
      const threePt = threePtInput ? (parseInt(threePtInput.value) || 85) : 85;
      const dunk = dunkInput ? (parseInt(dunkInput.value) || 80) : 80;
      const handle = handleInput ? (parseInt(handleInput.value) || 85) : 85;
      const perim = perimInput ? (parseInt(perimInput.value) || 85) : 85;
      const speed = speedInput ? (parseInt(speedInput.value) || 85) : 85;
      const cap = capInput ? (parseInt(capInput.value) || 5) : 5;
      const notes = notesInput ? (notesInput.value.trim() || 'Custom tuned meta build.') : 'Custom tuned meta build.';

      if (!name) {
        if (window.Toast) Toast.error('Please provide a build name.');
        return;
      }

      const buildData = {
        id: this.editingBuildId || ('build-' + Date.now()),
        name: name,
        position: pos,
        height: height,
        weight: weight,
        wingspan: wingspan,
        archetype: 'Custom ' + pos + ' Specialist',
        overall: 99,
        gameVersion: 'NBA 2K27 / Current Meta',
        capBreakers: cap,
        keyAttributes: {
          threePoint: threePt,
          drivingDunk: dunk,
          ballHandle: handle,
          perimeterDef: perim,
          steal: Math.min(99, perim - 5),
          speed: speed,
          agility: Math.max(65, speed - 4)
        },
        topBadges: [
          { name: 'Limitless Range', tier: threePt >= 96 ? 'hof' : (threePt >= 89 ? 'gold' : 'silver') },
          { name: 'On-Ball Menace', tier: perim >= 92 ? 'gold' : 'silver' },
          { name: 'Posterizer', tier: dunk >= 87 ? 'gold' : 'silver' },
          { name: 'Lightning Launch', tier: speed >= 88 ? 'gold' : 'silver' }
        ],
        notes: notes
      };

      if (this.editingBuildId) {
        if (window.VaultState) VaultState.updateBuild(buildData);
        if (window.Toast) Toast.success(`Build "${name}" updated in your vault!`);
      } else {
        if (window.VaultState) VaultState.addBuild(buildData);
        if (window.Toast) Toast.success(`Build "${name}" saved to your personal vault!`);
      }

      this.editingBuildId = null;
      if (window.Modal) Modal.close('modal-create-build');
    },

    deleteBuild(buildId) {
      if (confirm('Are you sure you want to remove this build from your vault?')) {
        if (window.VaultState) VaultState.removeBuild(buildId);
        if (window.Toast) Toast.info('Build removed from personal vault.');
      }
    },

    copyBuildShare(name, pos, height, threePt, dunk) {
      const shareText = `🏀 THE CEO VAULT META BUILD: ${name} (${pos} • ${height})\n🔥 3PT: ${threePt} | Dunk: ${dunk} | 99 OVR\nVerified Telemetry & Cap Breaker Strategy:\n👉 https://theceovault.com/#dashboard`;
      navigator.clipboard.writeText(shareText).then(() => {
        if (window.Toast) Toast.success('Shareable build card copied to clipboard!');
      }).catch(() => {
        if (window.Toast) Toast.info('Build details copied!');
      });
    },

    // -------------------------------------------------------------
    // JUMPSHOT LAB
    // -------------------------------------------------------------
    renderJumpshots(jumpshots) {
      const container = document.getElementById('dashboard-jumpshots-grid');
      if (!container) return;

      container.innerHTML = jumpshots.map(j => {
        return `
          <div class="jumpshot-card">
            <div class="jumpshot-header">
              <div>
                <h3 style="font-size: 1.2rem;">${j.name}</h3>
                <div style="font-size: 0.82rem; color: var(--text-muted); font-family: var(--font-mono);">${j.heightRequirement} • ${j.reqRating}</div>
              </div>
              <span class="badge-tag badge-tag-green">GREEN WINDOW: A+</span>
            </div>

            <div class="jumpshot-formula">
              <div class="formula-row">
                <span>Jumpshot Base:</span>
                <span class="val">${j.base}</span>
              </div>
              <div class="formula-row">
                <span>Upper Release 1:</span>
                <span class="val">${j.upper1}</span>
              </div>
              <div class="formula-row">
                <span>Upper Release 2:</span>
                <span class="val">${j.upper2}</span>
              </div>
              <div class="formula-row">
                <span>Blending & Speed:</span>
                <span class="val">${j.blend} • ${j.releaseSpeed}</span>
              </div>
              <div class="formula-row">
                <span>Recommended Cue:</span>
                <span class="val" style="color: var(--cyan-primary);">${j.cue}</span>
              </div>
            </div>

            <button class="btn btn-secondary btn-sm btn-full" onclick="Dashboard.copyJumpshotFormula('${j.name}', '${j.base}', '${j.upper1}', '${j.upper2}', '${j.blend}', '${j.cue}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Formula
            </button>
          </div>
        `;
      }).join('');
    },

    filterAndRenderJumpshots(query, heightFilter, cueFilter) {
      if (!window.VaultState) return;
      const allJumpshots = VaultState.getState().favoriteJumpshots || [];
      const filtered = allJumpshots.filter(j => {
        const matchesQuery = !query || j.name.toLowerCase().includes(query) || j.base.toLowerCase().includes(query) || j.upper1.toLowerCase().includes(query);
        const matchesHeight = heightFilter === 'ALL' || j.heightRequirement.toLowerCase().includes(heightFilter.toLowerCase());
        const matchesCue = cueFilter === 'ALL' || j.cue.toLowerCase().includes(cueFilter.toLowerCase());
        return matchesQuery && matchesHeight && matchesCue;
      });
      this.renderJumpshots(filtered);
    },

    copyJumpshotFormula(name, base, upper1, upper2, blend, cue) {
      const formula = `🎯 CEO VAULT JUMPSHOT FORMULA: ${name}\n- Base: ${base}\n- Upper 1: ${upper1}\n- Upper 2: ${upper2}\n- Blend: ${blend}\n- Visual Cue: ${cue || 'Push'}\nVerified Pure Green Window at https://theceovault.com/#dashboard`;
      navigator.clipboard.writeText(formula).then(() => {
        if (window.Toast) Toast.success(`Jumpshot formula "${name}" copied to clipboard!`);
      }).catch(() => {
        if (window.Toast) Toast.info('Formula copied!');
      });
    },

    handleSaveCustomJumpshot() {
      const nameInput = document.getElementById('custom-jump-name');
      const baseInput = document.getElementById('custom-jump-base');
      const upper1Input = document.getElementById('custom-jump-upper1');
      const upper2Input = document.getElementById('custom-jump-upper2');
      const blendInput = document.getElementById('custom-jump-blend');
      const cueSelect = document.getElementById('custom-jump-cue');
      const heightInput = document.getElementById('custom-jump-height');
      const ratingInput = document.getElementById('custom-jump-rating');

      const name = nameInput ? nameInput.value.trim() : 'Custom Pure Green Formula';
      const base = baseInput ? baseInput.value.trim() : 'Tracy McGrady';
      const upper1 = upper1Input ? upper1Input.value.trim() : 'Oscar Robertson';
      const upper2 = upper2Input ? upper2Input.value.trim() : 'Kyle Korver';
      const blend = blendInput ? blendInput.value : '60% / 40%';
      const cue = cueSelect ? cueSelect.value : 'Push Cue / Wrist flick apex';
      const heightReq = heightInput ? heightInput.value.trim() : "6'5\" to 6'9\"";
      const reqRating = ratingInput ? ratingInput.value.trim() : "85+ 3PT";

      const newJump = {
        id: 'jump-' + Date.now(),
        name: name,
        base: base,
        upper1: upper1,
        upper2: upper2,
        blend: blend,
        releaseSpeed: 'Very Quick (A+)',
        timingStability: 'A+',
        defensiveImmunity: 'A',
        heightRequirement: heightReq,
        reqRating: reqRating,
        cue: cue
      };

      if (window.VaultState) VaultState.addJumpshot(newJump);
      if (window.Modal) Modal.close('modal-create-jumpshot');
      if (window.Toast) Toast.success(`Custom jumpshot "${name}" added to Jumpshot Lab!`);
      document.getElementById('form-create-jumpshot').reset();
    },

    // -------------------------------------------------------------
    // LIVE INTEL FEED
    // -------------------------------------------------------------
    renderIntelFeed(intelFeed, activeFilter) {
      const container = document.getElementById('dashboard-intel-feed');
      if (!container) return;

      const filtered = activeFilter === 'ALL' 
        ? intelFeed 
        : intelFeed.filter(item => item.category.toUpperCase() === activeFilter.toUpperCase());

      // Update Filter Pill Active States
      const filterPills = document.querySelectorAll('[data-intel-filter]');
      filterPills.forEach(pill => {
        pill.classList.toggle('active', pill.getAttribute('data-intel-filter') === activeFilter);
      });

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="vault-card" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No intel reports found in category: ${activeFilter}
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(item => {
        let badgeClass = item.badgeType === 'critical' ? 'badge-tag-purple' : (item.badgeType === 'meta' ? 'badge-tag-gold' : 'badge-tag-cyan');
        return `
          <div class="intel-item">
            <div class="intel-item-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold-light)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="intel-item-content" style="flex: 1;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
                <span class="badge-tag ${badgeClass}">${item.category}</span>
                <span class="intel-item-meta">${item.date}</span>
              </div>
              <h4 style="font-size: 1.1rem; margin-bottom: 0.4rem;">${item.title}</h4>
              <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 0.75rem;">
                ${item.content}
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted);">
                <span>Verified by: <strong style="color: var(--gold-light);">${item.author || 'THE CEO VAULT Team'}</strong></span>
                <button class="btn btn-secondary btn-sm" onclick="Dashboard.openIntelModal('${item.id}')">View Full Analysis</button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    },

    openIntelModal(intelId) {
      if (!window.VaultState) return;
      const item = VaultState.getState().liveIntelFeed.find(i => i.id === intelId);
      if (!item) return;

      const titleEl = document.getElementById('intel-modal-title');
      const catEl = document.getElementById('intel-modal-category');
      const dateEl = document.getElementById('intel-modal-date');
      const contentEl = document.getElementById('intel-modal-body');
      const authorEl = document.getElementById('intel-modal-author');

      if (titleEl) titleEl.textContent = item.title;
      if (catEl) catEl.textContent = item.category;
      if (dateEl) dateEl.textContent = item.date;
      if (contentEl) contentEl.textContent = item.content;
      if (authorEl) authorEl.textContent = item.author || 'THE CEO VAULT Intelligence Lab';

      if (window.Modal) Modal.open('modal-intel-detail');
    },

    // -------------------------------------------------------------
    // VIDEO VAULT
    // -------------------------------------------------------------
    renderVideoVault(videos, activeFilter, user) {
      const container = document.getElementById('dashboard-video-vault-grid');
      if (!container) return;

      const isVIP = user && (user.membershipTier === 'founder' || user.membershipTier === 'vip' || user.membershipTier === 'standard');

      const filtered = activeFilter === 'ALL'
        ? videos
        : videos.filter(v => v.category.toLowerCase().includes(activeFilter.toLowerCase()));

      // Update Filter Pill Active States
      const filterPills = document.querySelectorAll('[data-video-filter]');
      filterPills.forEach(pill => {
        pill.classList.toggle('active', pill.getAttribute('data-video-filter') === activeFilter);
      });

      container.innerHTML = filtered.map(v => {
        const completedBadge = v.completed 
          ? '<span class="badge-tag badge-tag-green">✓ COMPLETED</span>'
          : `<span class="badge-tag" style="background: rgba(255,255,255,0.08); color: var(--text-muted);">${v.progress || 0}% WATCHED</span>`;

        return `
          <div class="video-card">
            <div class="video-thumbnail-placeholder" onclick="Dashboard.openVideoPlayer('${v.id}')" style="cursor: pointer;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold-light)" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <div class="video-duration">${v.duration}</div>
              <div style="position: absolute; top: 0.5rem; left: 0.5rem;">
                <span class="badge-tag badge-tag-gold">${v.tag || 'VIP MASTERCLASS'}</span>
              </div>
            </div>
            <div class="video-info">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                <span style="font-size: 0.78rem; font-weight: 700; color: var(--cyan-primary); text-transform: uppercase;">${v.category}</span>
                ${completedBadge}
              </div>
              <h4 style="font-size: 1.05rem; margin-bottom: 0.5rem; line-height: 1.35;">${v.title}</h4>
              <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.75rem; line-height: 1.4;">
                ${v.description || 'Exclusive executive breakdown for competitive 2K players.'}
              </p>
              
              <!-- Progress Bar -->
              <div class="progress-bar-wrap" style="height: 4px; background: var(--bg-darkest); border-radius: 2px; overflow: hidden; margin-bottom: 0.75rem;">
                <div style="height: 100%; width: ${v.progress || 0}%; background: var(--gold-primary);"></div>
              </div>

              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <button class="btn btn-primary btn-sm btn-full" onclick="Dashboard.openVideoPlayer('${v.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Watch Video
                </button>
                <button class="btn btn-secondary btn-sm" onclick="Dashboard.toggleVideoCompletion('${v.id}')" title="Toggle Completed">
                  ${v.completed ? '✓' : 'Mark'}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    },

    openVideoPlayer(videoId) {
      if (!window.VaultState) return;
      const video = VaultState.getState().videoVault.find(v => v.id === videoId);
      if (!video) return;

      const titleEl = document.getElementById('video-modal-title');
      const catEl = document.getElementById('video-modal-category');
      const durEl = document.getElementById('video-modal-duration');
      const descEl = document.getElementById('video-modal-desc');
      const playerFrame = document.getElementById('video-modal-player-frame');

      if (titleEl) titleEl.textContent = video.title;
      if (catEl) catEl.textContent = video.category;
      if (durEl) durEl.textContent = video.duration;
      if (descEl) descEl.textContent = video.description || 'In-depth VIP breakdown for competitive players.';

      if (window.Modal) Modal.open('modal-video-player');
    },

    toggleVideoCompletion(videoId) {
      if (window.VaultState) {
        VaultState.toggleVideoProgress(videoId);
        if (window.Toast) Toast.success('Video watch progress updated!');
      }
    },

    // -------------------------------------------------------------
    // ADMIN COMMAND CENTER
    // -------------------------------------------------------------
    renderAdminSection(stateObj) {
      const adminContainer = document.getElementById('tab-pane-admin');
      if (!adminContainer) return;
      if (!this.isAdminUser()) return;

      this.renderAdminSubTabs(stateObj.adminSubTab || 'add-build');
      this.renderMembersTable();
    },

    renderAdminSubTabs(activeSubTab) {
      const buttons = document.querySelectorAll('[data-admin-subtab]');
      const panes = document.querySelectorAll('.admin-subtab-pane');

      buttons.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-admin-subtab') === activeSubTab);
      });

      panes.forEach(p => {
        const paneName = p.dataset.adminPane || p.id.replace(/^admin-pane-/, '').replace(/^admin-subpane-/, '');
        const isActive = paneName === activeSubTab;
        p.classList.toggle('active', isActive);
        p.style.display = isActive ? '' : 'none';
      });
    },

    renderMembersTable(query = '') {
      const tbody = document.getElementById('admin-members-tbody');
      if (!tbody || !window.VaultState) return;

      const members = VaultState.getState().membersList || [];
      const filtered = query 
        ? members.filter(m => m.gamertag.toLowerCase().includes(query) || m.email.toLowerCase().includes(query) || m.discord.toLowerCase().includes(query))
        : members;

      tbody.innerHTML = filtered.map(m => {
        return `
          <tr>
            <td>
              <div style="font-weight: 700; color: var(--text-primary);">${m.gamertag}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${m.email}</div>
            </td>
            <td>
              <span class="badge-tag ${m.tier === 'founder' ? 'badge-tag-gold' : (m.tier === 'standard' ? 'badge-tag-purple' : 'badge-tag')}">
                ${m.tier === 'founder' ? `Founder #${String(m.founderNumber || 1).padStart(3, '0')}` : (m.tier === 'standard' ? 'Standard VIP' : 'Rookie Free')}
              </span>
            </td>
            <td>${m.platform}</td>
            <td><span style="font-family: var(--font-mono); font-size: 0.8rem;">${m.discord}</span></td>
            <td><span class="badge-tag badge-tag-green">${m.status.toUpperCase()}</span></td>
            <td>
              <div style="display: flex; gap: 0.4rem;">
                <button class="btn btn-secondary btn-sm" onclick="Dashboard.adminChangeTier('${m.id}')" title="Change Membership Tier">Tier</button>
                <button class="btn btn-danger btn-sm" onclick="Dashboard.adminToggleStatus('${m.id}')" title="Toggle Member Status">Status</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    },

    adminChangeTier(memberId) {
      const newTier = prompt('Enter new membership tier (founder / standard / free):', 'founder');
      if (newTier && ['founder', 'standard', 'free'].includes(newTier.toLowerCase())) {
        if (window.VaultState) VaultState.updateMemberTier(memberId, newTier.toLowerCase());
        if (window.Toast) Toast.success('Member tier updated successfully!');
      }
    },

    adminToggleStatus(memberId) {
      if (!window.VaultState) return;
      const mem = VaultState.getState().membersList.find(m => m.id === memberId);
      if (mem) {
        const nextStatus = mem.status === 'active' ? 'suspended' : 'active';
        VaultState.updateMemberStatus(memberId, nextStatus);
        if (window.Toast) Toast.info(`Member status set to: ${nextStatus}`);
      }
    },

    refreshAiExecutiveBriefing() {
      if (!this.requireAdminAction() || !window.VaultState) return;
      const state = VaultState.getState();
      const report = window.AiExecutiveReporter
        ? AiExecutiveReporter.getReport(VaultState)
        : (window.AiCeoControlCenter ? AiCeoControlCenter.generateDailyBriefing(state) : null);

      if (!report) {
        if (window.Toast) Toast.error('AI Operator engine is not loaded.');
        return;
      }

      const healthEl = document.getElementById('ai-ops-health-val');
      const foundersEl = document.getElementById('ai-ops-founders-val');
      const mrrEl = document.getElementById('ai-ops-mrr-val');

      if (healthEl) healthEl.textContent = report.websiteHealth || report.websiteStatus;
      if (foundersEl) foundersEl.textContent = report.founderSpotsClaimed;
      if (mrrEl) mrrEl.textContent = report.mrrStatus;

      this.renderAiActionItems(report.recommendedActions || []);
      this.renderAiUxProposals(window.AiWebsiteAnalyst ? AiWebsiteAnalyst.getProposals() : []);

      if (window.Toast) Toast.success('AI Executive Brief refreshed.');
    },

    runAiHealthScan() {
      if (!this.requireAdminAction() || !window.VaultState) return;
      const scan = window.AiHealthMonitor ? AiHealthMonitor.runDiagnosticScan(VaultState) : null;
      const audit = window.AiAutoAuditSystem ? AiAutoAuditSystem.runFullAudit(VaultState.getState()) : null;
      const status = scan ? scan.overallStatus : (audit ? audit.overallSeverity : 'UNKNOWN');

      const healthEl = document.getElementById('ai-ops-health-val');
      if (healthEl) healthEl.textContent = status === 'PASS' ? 'HEALTHY (100%)' : status;

      const actionItems = [];
      if (scan) {
        scan.issues.forEach((issue, index) => {
          actionItems.push({
            id: `SCAN-${index + 1}`,
            priority: issue.severity,
            title: `${issue.area}: ${issue.message}`,
            type: 'HEALTH_SCAN'
          });
        });
      }
      if (audit) {
        audit.results.filter(item => item.severity !== 'PASS').forEach((item, index) => {
          actionItems.push({
            id: `AUDIT-${index + 1}`,
            priority: item.severity,
            title: `${item.check}: ${item.details}`,
            type: 'AUTO_AUDIT'
          });
        });
      }

      this.renderAiActionItems(actionItems.length ? actionItems : [{ id: 'SCAN-PASS', priority: 'PASS', title: 'All AI Operator health checks passed.', type: 'STATUS_CHECK' }]);
      if (window.Toast) Toast.success(`AI health scan completed: ${status}`);
    },

    renderAiActionItems(items) {
      const container = document.getElementById('ai-ops-action-items-container');
      if (!container) return;

      container.innerHTML = items.map(item => `
        <div style="background: rgba(0,0,0,0.35); border: 1px solid var(--border-subtle); border-radius: var(--border-radius-sm); padding: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <span class="badge-tag ${item.priority === 'HIGH' || item.priority === 'CRITICAL' ? 'badge-tag-gold' : 'badge-tag-green'}" style="font-size: 0.7rem;">${this.escapeHtml(item.priority || 'INFO')}</span>
            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.9rem; margin-top: 0.25rem;">${this.escapeHtml(item.title)}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">AI Operator - ${this.escapeHtml(item.type || item.actionType || 'REVIEW')}</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="Dashboard.openDraftReviewModal('${this.escapeHtml(item.id || 'AI-ACTION')}')">Inspect</button>
        </div>
      `).join('');
    },

    renderAiUxProposals(proposals) {
      const container = document.getElementById('ai-ops-ux-proposals-container');
      if (!container) return;

      container.innerHTML = proposals.map(proposal => `
        <div style="background: rgba(0,0,0,0.35); border: 1px solid var(--border-subtle); border-radius: var(--border-radius-sm); padding: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; gap: 0.75rem; flex-wrap: wrap;">
            <span class="brand-badge" style="font-size: 0.7rem;">PROPOSAL: ${this.escapeHtml(proposal.id)}</span>
            <span style="font-size: 0.72rem; color: var(--green-primary); font-weight: 700;">${this.escapeHtml(proposal.risk)}</span>
          </div>
          <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">${this.escapeHtml(proposal.area)}</div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0 0 0.75rem 0;">
            <strong>Recommendation</strong>: ${this.escapeHtml(proposal.recommendation)}
          </p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" onclick="Dashboard.approveUxProposal('${this.escapeHtml(proposal.id)}')">Approve Change</button>
            <button class="btn btn-secondary btn-sm" onclick="Dashboard.rejectUxProposal('${this.escapeHtml(proposal.id)}')">Reject</button>
            <button class="btn btn-outline btn-sm" onclick="Dashboard.saveUxProposalForLater('${this.escapeHtml(proposal.id)}')">Save for Later</button>
          </div>
        </div>
      `).join('');
    },

    openDraftReviewModal(draftId) {
      if (!this.requireAdminAction()) return;
      const draft = window.AiContentOperator
        ? AiContentOperator.draftPatchIntelSummary('1.04')
        : { title: 'Patch 1.04 Strategic Meta Breakdown', highlights: ['AI Operator draft engine unavailable.'] };

      alert([
        `Draft Review: ${draftId}`,
        '',
        draft.title,
        '',
        ...(draft.highlights || [])
      ].join('\n'));
    },

    approveAndPublishDraft(draftId) {
      if (!this.requireAdminAction() || !window.VaultState || !window.AiContentManager) return;
      const confirmed = confirm(`Approve and publish ${draftId}? This will add the AI-drafted patch summary to Live Intel.`);
      if (!confirmed) return;

      const draft = AiContentManager.createDraft(
        'PATCH_SUMMARY',
        '[VERIFIED] Patch 1.04 Green-Window Telemetry Update',
        'AI Operator draft approved by CEO review flow.',
        {
          keyTakeaways: [
            'Patch 1.04 telemetry remains verified through the Gameplay Controller Lab.',
            'Jumpshot cue guidance should stay labeled as verified only after CEO review.',
            'Members should inspect Cap Breaker thresholds before spending VC.'
          ]
        },
        'VERIFIED'
      );

      AiContentManager.approveDraft(draft, 'ceo_admin');
      AiContentManager.publishDraft(draft, VaultState);
      if (window.Toast) Toast.success(`${draftId} approved and published to Live Intel.`);
    },

    approveUxProposal(proposalId) {
      if (!this.requireAdminAction() || !window.AiChangeApproval) return;
      const proposal = AiChangeApproval.createProposal(
        'Mobile Founder VIP CTA Optimization',
        'UX_OPTIMIZATION',
        'Improve checkout initiation on mobile viewports.',
        'LOW_RISK',
        'Higher Founder VIP checkout initiation.',
        { proposalId }
      );
      AiChangeApproval.approveProposal(proposal.id);
      if (window.Toast) Toast.success(`${proposalId} approved as a low-risk UX proposal.`);
    },

    rejectUxProposal(proposalId) {
      if (!this.requireAdminAction()) return;
      if (window.Toast) Toast.info(`${proposalId} rejected. No site changes were applied.`);
    },

    saveUxProposalForLater(proposalId) {
      if (!this.requireAdminAction()) return;
      if (window.Toast) Toast.info(`${proposalId} saved for later CEO review.`);
    },

    handleAdminAddBuild() {
      const name = document.getElementById('admin-build-name').value.trim();
      const pos = document.getElementById('admin-build-pos').value;
      const height = document.getElementById('admin-build-height').value;
      const threePt = parseInt(document.getElementById('admin-build-3pt').value) || 85;
      const dunk = parseInt(document.getElementById('admin-build-dunk').value) || 80;
      const notes = document.getElementById('admin-build-notes').value.trim();

      if (!name) {
        if (window.Toast) Toast.error('Please provide a build name.');
        return;
      }

      const newBuild = {
        id: 'build-admin-' + Date.now(),
        name: name,
        position: pos,
        height: height,
        weight: '210 lbs',
        wingspan: "6'11\"",
        archetype: 'Official Meta ' + pos,
        overall: 99,
        gameVersion: 'NBA 2K27 / Current Meta',
        capBreakers: 5,
        keyAttributes: {
          threePoint: threePt,
          drivingDunk: dunk,
          ballHandle: 85,
          perimeterDef: 88,
          steal: 85,
          speed: 86,
          agility: 82
        },
        topBadges: [
          { name: 'Limitless Range', tier: threePt >= 93 ? 'gold' : 'silver' },
          { name: 'On-Ball Menace', tier: 'gold' }
        ],
        notes: notes || 'Official verified meta build curated by THE CEO.'
      };

      if (window.VaultState) VaultState.addBuild(newBuild);
      if (window.Toast) Toast.success(`Official Meta Build "${name}" published!`);
      document.getElementById('form-admin-add-build').reset();
    },

    handleAdminAddVideo() {
      const title = document.getElementById('admin-video-title').value.trim();
      const category = document.getElementById('admin-video-category').value;
      const duration = document.getElementById('admin-video-duration').value.trim() || '15:00';
      const desc = document.getElementById('admin-video-desc').value.trim();

      if (!title) {
        if (window.Toast) Toast.error('Please enter a video title.');
        return;
      }

      const newVideo = {
        id: 'vid-admin-' + Date.now(),
        title: title,
        category: category,
        duration: duration,
        tag: 'VIP EXCLUSIVE',
        views: '1.2K views',
        date: 'Just now',
        description: desc || 'Official Masterclass video published by THE CEO VAULT team.',
        progress: 0,
        completed: false
      };

      if (window.VaultState) VaultState.addVideo(newVideo);
      if (window.Toast) Toast.success(`VIP Video "${title}" published to Video Vault!`);
      document.getElementById('form-admin-add-video').reset();
    },

    handleAdminAddIntel() {
      const title = document.getElementById('admin-intel-title').value.trim();
      const category = document.getElementById('admin-intel-category').value;
      const badgeType = document.getElementById('admin-intel-badge').value;
      const content = document.getElementById('admin-intel-content').value.trim();

      if (!title || !content) {
        if (window.Toast) Toast.error('Please fill in intel title and analysis content.');
        return;
      }

      const newIntel = {
        id: 'intel-admin-' + Date.now(),
        title: title,
        category: category,
        badgeType: badgeType,
        date: 'August 21, 2026',
        summary: title,
        content: content,
        author: 'THE CEO VAULT Master Intel'
      };

      if (window.VaultState) VaultState.addIntel(newIntel);
      if (window.Toast) Toast.success(`Live Intel Report "${title}" posted to member feed!`);
      document.getElementById('form-admin-add-intel').reset();
    }
  };

  window.Dashboard = Dashboard;
  document.addEventListener('DOMContentLoaded', () => Dashboard.init());
})();
