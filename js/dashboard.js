/**
 * THE CEO VAULT - Member Dashboard Controller
 */

const Dashboard = {
  init() {
    this.bindEvents();
    this.render();
    VaultState.subscribe(() => this.render());
  },

  bindEvents() {
    // Tab switching
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-dash-tab]');
      if (tabBtn) {
        const tabName = tabBtn.getAttribute('data-dash-tab');
        this.switchTab(tabName);
      }
    });

    // Create New Build Form
    const formNewBuild = document.getElementById('form-create-build');
    if (formNewBuild) {
      formNewBuild.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('build-input-name').value.trim();
        const pos = document.getElementById('build-input-position').value;
        const height = document.getElementById('build-input-height').value;
        const weight = document.getElementById('build-input-weight').value.trim() || '200 lbs';
        const wingspan = document.getElementById('build-input-wingspan').value.trim() || "6'10\"";
        const threePt = parseInt(document.getElementById('build-input-3pt').value) || 85;
        const dunk = parseInt(document.getElementById('build-input-dunk').value) || 80;
        const handle = parseInt(document.getElementById('build-input-handle').value) || 85;
        const perim = parseInt(document.getElementById('build-input-perim').value) || 85;
        const speed = parseInt(document.getElementById('build-input-speed').value) || 85;
        const cap = parseInt(document.getElementById('build-input-cap').value) || 5;
        const notes = document.getElementById('build-input-notes').value.trim() || 'Custom tuned meta build.';

        if (!name) {
          Toast.error('Please provide a build name.');
          return;
        }

        const newBuild = {
          id: 'build-' + Date.now(),
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

        VaultState.addBuild(newBuild);
        Modal.close('modal-create-build');
        Toast.success(`Build "${name}" saved to your personal vault!`);
        formNewBuild.reset();
      });
    }

    // Settings Profile Form
    const formSettings = document.getElementById('form-settings-profile');
    if (formSettings) {
      formSettings.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = VaultState.getState().user || {};
        user.gamertag = document.getElementById('settings-gamertag').value.trim();
        user.discordId = document.getElementById('settings-discord').value.trim();
        user.platform = document.getElementById('settings-platform').value;
        user.favScheme = document.getElementById('settings-scheme').value;
        user.favDefense = document.getElementById('settings-defense').value;

        VaultState.setUser(user);
        Toast.success('Gamer preferences and vault settings updated!');
      });
    }
  },

  switchTab(tabName) {
    VaultState.setActiveTab(tabName);
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
    const state = VaultState.state;
    

    // Synchronize active tab in UI
    this.switchTab(state.activeTab || 'builds');

    // Render User Header
    const userHeaderEl = document.getElementById('dashboard-user-header-content');
    if (userHeaderEl) {
      if (user) {
        userHeaderEl.innerHTML = `
          <div class="user-header-left">
            <div class="user-avatar-large">${(user.gamertag || user.name || 'U').charAt(0).toUpperCase()}</div>
            <div class="user-info-text">
              <h2>${user.gamertag || user.name} <span style="font-size: 1.1rem; color: var(--gold-light);">(${user.platform || 'Xbox Series X'})</span></h2>
              <div class="user-meta-tags">
                ${BadgeHelper.renderUserTierBadge(user.membershipTier)}
                <span class="badge-tag" style="background: rgba(255,255,255,0.08); color: var(--text-secondary);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Discord: ${user.discordId || 'Linked'}
                </span>
                <span class="badge-tag badge-tag-purple">Cap Breakers: +${user.capBreakersUnlocked || 5}</span>
              </div>
            </div>
          </div>
          <div class="user-header-stats">
            <div class="stat-pill">
              <div class="val">${state.savedBuilds.length}</div>
              <div class="lbl">Saved Builds</div>
            </div>
            <div class="stat-pill">
              <div class="val">${state.favoriteJumpshots.length}</div>
              <div class="lbl">Jumpshots</div>
            </div>
            <div class="stat-pill">
              <div class="val" style="color: var(--green-primary);">${user.membershipTier === 'vip' ? 'UNLIMITED' : (user.membershipTier === 'pro' ? 'PRO TIER' : '1/1 USED')}</div>
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
    this.renderBuilds(state.savedBuilds, user);

    // Render Jumpshots
    this.renderJumpshots(state.favoriteJumpshots);

    // Render Live Intel
    this.renderIntelFeed(state.liveIntelFeed);

    // Render Video Vault
    this.renderVideoVault(state.videoVault);

    // Populate Settings Inputs
    if (user) {
      const gtagInput = document.getElementById('settings-gamertag');
      const discInput = document.getElementById('settings-discord');
      const platSelect = document.getElementById('settings-platform');
      if (gtagInput) gtagInput.value = user.gamertag || '';
      if (discInput) discInput.value = user.discordId || '';
      if (platSelect && user.platform) platSelect.value = user.platform;
    }
  },

  renderBuilds(builds, user) {
    const container = document.getElementById('dashboard-builds-grid');
    if (!container) return;

    if (builds.length === 0) {
      container.innerHTML = `
        <div class="vault-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <p style="margin-bottom: 1.5rem;">No saved builds in your personal vault yet.</p>
          <button class="btn btn-primary" data-modal-target="modal-create-build">+ Create First Build</button>
        </div>
      `;
      return;
    }

    container.innerHTML = builds.map(b => {
      const badgeHtml = b.topBadges.map(bg => BadgeHelper.renderTierPill(bg.name, bg.tier)).join(' ');
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
              Key Meta Badges Unlocked (+${b.capBreakers} Cap Breakers)
            </div>
            <div class="build-badges-row">
              ${badgeHtml}
            </div>

            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem; font-style: italic;">
              "${b.notes}"
            </p>
          </div>

          <div style="display: flex; gap: 0.6rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
            <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="Dashboard.copyBuildShare('${b.name}', '${b.position}', '${b.height}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Share Build
            </button>
            <button class="btn btn-danger btn-sm" onclick="Dashboard.deleteBuild('${b.id}')" title="Delete Build">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

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

          <button class="btn btn-secondary btn-sm btn-full" onclick="Dashboard.copyJumpshotFormula('${j.name}', '${j.base}', '${j.upper1}', '${j.upper2}', '${j.blend}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Formula
          </button>
        </div>
      `;
    }).join('');
  },

  renderIntelFeed(intelFeed) {
    const container = document.getElementById('dashboard-intel-feed');
    if (!container) return;

    container.innerHTML = intelFeed.map(item => {
      let badgeClass = item.badgeType === 'critical' ? 'badge-tag-purple' : (item.badgeType === 'meta' ? 'badge-tag-gold' : 'badge-tag-cyan');
      return `
        <div class="intel-item">
          <div class="intel-item-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold-light)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div class="intel-item-content">
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
              <span class="badge-tag ${badgeClass}">${item.category}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${item.date}</span>
            </div>
            <h4>${item.title}</h4>
            <p>${item.content}</p>
            <div class="intel-item-meta">
              <span>Verified by: <strong>${item.author}</strong></span>
              <span>• Status: Live In Current Season</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderVideoVault(videos) {
    const container = document.getElementById('dashboard-video-vault');
    if (!container) return;

    container.innerHTML = videos.map(v => {
      return `
        <div class="video-card">
          <div class="video-thumbnail-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold-light)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="var(--gold-light)"/></svg>
            <div class="video-duration">${v.duration}</div>
          </div>
          <div class="video-info">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span class="badge-tag badge-tag-gold" style="font-size: 0.7rem;">${v.tag}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${v.category}</span>
            </div>
            <h4 style="font-size: 1.05rem; margin-bottom: 0.5rem;">${v.title}</h4>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
              <span>${v.views}</span>
              <span>${v.date}</span>
            </div>
            <button class="btn btn-secondary btn-sm btn-full" onclick="Toast.info('Loading VIP Masterclass Video Stream...')">
              Watch Session
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  deleteBuild(buildId) {
    if (confirm('Are you sure you want to delete this build from your vault?')) {
      VaultState.removeBuild(buildId);
      Toast.warning('Build removed from your vault.');
    }
  },

  copyBuildShare(name, pos, height) {
    const shareText = `Check out my CEO VAULT build: ${name} (${pos}, ${height}) optimized for NBA 2K27 meta! https://theceovault.com/builds`;
    navigator.clipboard.writeText(shareText).then(() => {
      Toast.success('Build share link copied to clipboard!');
    }).catch(() => {
      Toast.info('Build link: ' + shareText);
    });
  },

  copyJumpshotFormula(name, base, upper1, upper2, blend) {
    const formulaText = `[CEO VAULT JUMPSHOT] ${name} | Base: ${base} | Release 1: ${upper1} | Release 2: ${upper2} | Blend: ${blend}`;
    navigator.clipboard.writeText(formulaText).then(() => {
      Toast.success('Jumpshot formula copied to clipboard!');
    }).catch(() => {
      Toast.info(formulaText);
    });
  }
};

window.Dashboard = Dashboard;
