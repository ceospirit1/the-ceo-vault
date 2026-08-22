/**
 * THE CEO VAULT - Centralized Reactive State Store
 * Production-grade state management for builds, jumpshots, live intel, video vault, user profile, and admin controls.
 */

(function() {
  const DEFAULT_BUILDS = [
    {
      id: 'build-1',
      name: "6'6\" 2-Way Shot Creating Guard",
      position: 'SG',
      height: "6'6\"",
      weight: '205 lbs',
      wingspan: "6'11\"",
      archetype: 'Shot Creating / Lock',
      overall: 99,
      gameVersion: 'NBA 2K27 / Current Meta',
      capBreakers: 5,
      keyAttributes: {
        threePoint: 93,
        drivingDunk: 87,
        ballHandle: 86,
        perimeterDef: 92,
        steal: 85,
        speed: 88,
        agility: 84
      },
      topBadges: [
        { name: 'Limitless Range', tier: 'gold' },
        { name: 'Set Shot Specialist', tier: 'legend' },
        { name: 'On-Ball Menace', tier: 'gold' },
        { name: 'Glove', tier: 'silver' },
        { name: 'Lightning Launch', tier: 'gold' }
      ],
      notes: 'Optimized for Pro-Am & 5v5 Rec. Hits max speed with 93 3PT threshold for elite green window.'
    },
    {
      id: 'build-2',
      name: "6'3\" Pure Floor General",
      position: 'PG',
      height: "6'3\"",
      weight: '185 lbs',
      wingspan: "6'6\"",
      archetype: 'Playmaking Sharp',
      overall: 98,
      gameVersion: 'NBA 2K27 / Current Meta',
      capBreakers: 5,
      keyAttributes: {
        threePoint: 96,
        drivingDunk: 75,
        ballHandle: 93,
        perimeterDef: 78,
        steal: 79,
        speed: 91,
        agility: 89
      },
      topBadges: [
        { name: 'Limitless Range', tier: 'hof' },
        { name: 'Ankle Assassin', tier: 'legend' },
        { name: 'Dimer', tier: 'legend' },
        { name: 'Deadeye', tier: 'hof' },
        { name: 'Handles For Days', tier: 'hof' }
      ],
      notes: 'Elite dribble animations unlocked at 92+ Handle. Dominates 3v3 Park and Stage.'
    },
    {
      id: 'build-3',
      name: "6'8\" Inside-Out Point Forward",
      position: 'SF',
      height: "6'8\"",
      weight: '220 lbs',
      wingspan: "7'1\"",
      archetype: 'Point Forward',
      overall: 99,
      gameVersion: 'NBA 2K27 / Current Meta',
      capBreakers: 4,
      keyAttributes: {
        threePoint: 89,
        drivingDunk: 90,
        ballHandle: 85,
        perimeterDef: 88,
        steal: 85,
        speed: 84,
        agility: 82
      },
      topBadges: [
        { name: 'Posterizer', tier: 'gold' },
        { name: 'Shifty Shooter', tier: 'gold' },
        { name: 'Unpluckable', tier: 'silver' },
        { name: 'Challenger', tier: 'gold' },
        { name: 'Interceptor', tier: 'gold' }
      ],
      notes: 'All-around iso threat with contact dunks and lethal transition defense.'
    },
    {
      id: 'build-4',
      name: "7'0\" 3-Level Anchor Big",
      position: 'C',
      height: "7'0\"",
      weight: '245 lbs',
      wingspan: "7'6\"",
      archetype: '3-Level Threat / Rim Protector',
      overall: 99,
      gameVersion: 'NBA 2K27 / Current Meta',
      capBreakers: 5,
      keyAttributes: {
        threePoint: 85,
        drivingDunk: 80,
        ballHandle: 60,
        perimeterDef: 70,
        steal: 68,
        speed: 73,
        agility: 68
      },
      topBadges: [
        { name: 'Paint Patroller', tier: 'legend' },
        { name: 'Rebound Chaser', tier: 'hof' },
        { name: 'Pick & Popper', tier: 'gold' },
        { name: 'Brick Wall', tier: 'hof' },
        { name: 'Post Lockdown', tier: 'gold' }
      ],
      notes: 'Spaces the floor with 85 3PT while locking down the paint against 7ft+ mashers.'
    }
  ];

  const DEFAULT_JUMPSHOTS = [
    {
      id: 'jump-1',
      name: 'CEO Elite Cash Jumper (6\'5" - 6\'9")',
      base: 'Tracy McGrady',
      upper1: 'Oscar Robertson',
      upper2: 'Kyle Korver',
      blend: '65% Oscar / 35% Korver',
      releaseSpeed: 'Very Quick (A+)',
      timingStability: 'A+',
      defensiveImmunity: 'A',
      heightRequirement: '6\'5" to 6\'9"',
      reqRating: '88+ 3PT or Mid',
      cue: 'Push Cue / Wrist flick apex'
    },
    {
      id: 'jump-2',
      name: 'Small Guard Quick Laser (< 6\'5")',
      base: 'Stephen Curry',
      upper1: 'Kyrie Irving',
      upper2: 'Darius Garland',
      blend: '50% Kyrie / 50% Garland',
      releaseSpeed: 'Max Speed (A+)',
      timingStability: 'A',
      defensiveImmunity: 'A+',
      heightRequirement: 'Under 6\'5"',
      reqRating: '92+ 3PT',
      cue: 'Set Point / Top of forehead'
    },
    {
      id: 'jump-3',
      name: 'Pure Green Big Man Release (6\'10"+)',
      base: 'Kevin Durant',
      upper1: 'Dirk Nowitzki',
      upper2: 'LaMarcus Aldridge',
      blend: '70% Dirk / 30% Aldridge',
      releaseSpeed: 'Quick (A-)',
      timingStability: 'A+',
      defensiveImmunity: 'A+',
      heightRequirement: '6\'10" to 7\'3"',
      reqRating: '83+ 3PT or Mid',
      cue: 'Release Cue / Ball leaves fingers'
    },
    {
      id: 'jump-4',
      name: 'Lockdown Spot-Up Sniper',
      base: 'JT Thor',
      upper1: 'Saddiq Bey',
      upper2: 'Troy Brown Jr.',
      blend: '60% Bey / 40% Brown',
      releaseSpeed: 'Quick (A)',
      timingStability: 'A+',
      defensiveImmunity: 'B+',
      heightRequirement: '6\'5" to 6\'10"',
      reqRating: '80+ 3PT',
      cue: 'Push Cue / Elbow snap'
    }
  ];

  const DEFAULT_INTEL_FEED = [
    {
      id: 'intel-1',
      title: 'Hotfix 1.04 Analysis: On-Ball Steal Success Angle Tuned',
      date: 'August 21, 2026',
      category: 'PATCH NOTES',
      badgeType: 'critical',
      summary: '2K Sports stealth tuned reach-in foul frequency on straight-on blitzes.',
      content: '2K Sports stealth tuned reach-in foul frequency on straight-on blitzes. Silver Glove now requires 45-degree angle positioning rather than face-up bumps. Lateral reach success dropped by 18% when out of defensive stance.',
      author: 'CEO Live Intel Team'
    },
    {
      id: 'intel-2',
      title: 'Cap Breaker Discovery: +5 Cap Breaker Path for 93 3PT Meta',
      date: 'August 20, 2026',
      category: 'META SHIFTS',
      badgeType: 'meta',
      summary: 'Save 14 attribute points in the builder with the 88->93 Cap Breaker shift.',
      content: 'By allocating initial 3PT to 88 and using 5 Cap Breakers, you save 14 attribute points in the builder to reinvest into 85 Steal and 88 Speed, hitting Legend Set Shot Specialist while keeping high defensive ratings.',
      author: 'THE CEO (@CHOSENGREATNESS)'
    },
    {
      id: 'intel-3',
      title: 'Badge Tier Threshold Confirmed: Legend Set Shot Specialist',
      date: 'August 19, 2026',
      category: 'STEALTH ALERTS',
      badgeType: 'update',
      summary: 'Confirmed green window expander: +12% make rate on contested catch-and-shoot jumpers.',
      content: 'Confirmed green window expander: +12% make rate on contested catch-and-shoot jumpers with 93 3PT minimum rating requirement. Lab testing shows 3-5ms wider green window even under 20% contest.',
      author: 'Vault Data Science'
    },
    {
      id: 'intel-4',
      title: 'Comp 5v5 Pro-Am Scheme: 6-1 Texas Front & 2-3 Matchup Rotation',
      date: 'August 18, 2026',
      category: 'PRO-AM SCHEMES',
      badgeType: 'meta',
      summary: 'Neutralizes 5-Out pick-and-fade in competitive leagues with stunt recovery.',
      content: 'The 6-1 front alignment forces secondary ball handlers into baseline traps. The corner lock rotates to the roll-man while the hash lock stunts at the top shooter.',
      author: 'CEO Defense Lab'
    }
  ];

  const DEFAULT_VIDEO_VAULT = [
    {
      id: 'vid-1',
      title: 'Complete 2K27 Cap Breaker Guide: Best Build Allocations (THE CEO)',
      duration: '18:42',
      category: 'Masterclasses',
      tag: 'VIP EXCLUSIVE',
      views: '42K views',
      date: '2 days ago',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'In-depth breakdown of how cap breakers calculate attribute weight, and how to maximize badge unlocks without wasting VC.',
      progress: 100,
      completed: true
    },
    {
      id: 'vid-2',
      title: 'Comp 5v5 Pro-Am Defensive Rotations & 6-1 Front Stunt (CEO SPIRIT)',
      duration: '14:15',
      category: 'Defensive Schemes',
      tag: 'VIP EXCLUSIVE',
      views: '35K views',
      date: '4 days ago',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'Masterclass on perimeter rotation rules, hash stunting, and communication protocols for elite Pro-Am squads.',
      progress: 65,
      completed: false
    },
    {
      id: 'vid-3',
      title: 'Secret Jumpshot Cues: How to Green Every Shot with No Meter (CHOSENGREATNESS)',
      duration: '22:05',
      category: 'Jumpshot Secrets',
      tag: 'VIP EXCLUSIVE',
      views: '68K views',
      date: '1 week ago',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'Frame-by-frame visual breakdown of Push, Release, Set Point, and Jump cues on the top 10 competitive bases.',
      progress: 30,
      completed: false
    },
    {
      id: 'vid-4',
      title: '6\'6" 2-Way Shot Creator Build Breakdown & Gameplay Showcase',
      duration: '16:30',
      category: 'Build Breakdowns',
      tag: 'VIP EXCLUSIVE',
      views: '29K views',
      date: '1 week ago',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'Live Stage and Rec gameplay breakdown showing badge triggers and iso scoring combos on this tier 1 build.',
      progress: 0,
      completed: false
    }
  ];

  const DEFAULT_MEMBERS = [
    { id: 'usr-001', gamertag: 'CHOSENGREATNESS', email: 'ceo.gaming@vaultintel.com', tier: 'founder', founderNumber: 1, platform: 'Xbox Series X', status: 'active', joined: '2026-08-01', discord: 'TheCEOCG#0001' },
    { id: 'usr-002', gamertag: 'ViperLock2K', email: 'viper@comp2k.net', tier: 'founder', founderNumber: 2, platform: 'PlayStation 5', status: 'active', joined: '2026-08-02', discord: 'ViperLock#9921' },
    { id: 'usr-003', gamertag: 'SplashGodPrime', email: 'splash@proam.gg', tier: 'founder', founderNumber: 3, platform: 'Xbox Series X', status: 'active', joined: '2026-08-03', discord: 'SplashGod#4412' },
    { id: 'usr-004', gamertag: 'PaintAnchor7ft', email: 'anchor@defense.io', tier: 'standard', founderNumber: null, platform: 'PlayStation 5', status: 'active', joined: '2026-08-15', discord: 'PaintAnchor#1029' },
    { id: 'usr-005', gamertag: 'IsoDemonNext', email: 'isodemon@stage2k.com', tier: 'founder', founderNumber: 4, platform: 'PC/Steam', status: 'active', joined: '2026-08-18', discord: 'IsoDemon#7734' }
  ];

  class StateStore {
    constructor() {
      this.storageKey = 'the_ceo_vault_production_state_v2';
      this.state = this.loadState();
      this.listeners = [];
    }

    loadState() {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Could not read from localStorage:', e);
      }

      return {
        isAuthenticated: true,
        user: {
          id: 'user-ceo-001',
          name: 'Jeremy Jr.',
          gamertag: 'CHOSENGREATNESS',
          platform: 'Xbox Series X',
          email: 'ceo.gaming@vaultintel.com',
          discordId: 'TheCEOCG#0001',
          membershipTier: 'founder',
          founderNumber: 1,
          founderLocked: true,
          status: 'active',
          role: 'admin',
          favScheme: 'Pistol / Spread Option (Oregon Ducks)',
          favDefense: '6-1 Front (Texas 4-Man Stunt)',
          capBreakersUnlocked: 5,
          savedBuildsCount: 4
        },
        billingCycle: 'monthly',
        founderSpotsClaimed: 84,
        founderSpotsTotal: 100,
        savedBuilds: DEFAULT_BUILDS,
        favoriteJumpshots: DEFAULT_JUMPSHOTS,
        liveIntelFeed: DEFAULT_INTEL_FEED,
        videoVault: DEFAULT_VIDEO_VAULT,
        membersList: DEFAULT_MEMBERS,
        activeTab: 'builds',
        adminSubTab: 'add-build',
        intelFilter: 'ALL',
        videoFilter: 'ALL',
        currentRoute: '#landing'
      };
    }

    saveState() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      } catch (e) {
        console.warn('Could not write to localStorage:', e);
      }
      this.notify();
    }

    getState() {
      return this.state;
    }

    subscribe(listener) {
      if (typeof listener === 'function') {
        this.listeners.push(listener);
      }
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }

    notify() {
      this.listeners.forEach(listener => {
        try {
          listener(this.state);
        } catch (err) {
          console.error('State subscriber callback error:', err);
        }
      });
    }

    // State Mutators
    setUser(user) {
      this.state.user = user;
      this.state.isAuthenticated = !!user;
      this.saveState();
    }

    setMembershipTier(tier) {
      if (this.state.user) {
        this.state.user.membershipTier = tier;
        if (tier === 'founder' && !this.state.user.founderNumber) {
          this.state.founderSpotsClaimed = Math.min(100, (this.state.founderSpotsClaimed || 84) + 1);
          this.state.user.founderNumber = this.state.founderSpotsClaimed;
          this.state.user.founderLocked = true;
        }
      }
      this.saveState();
    }

    setBillingCycle(cycle) {
      this.state.billingCycle = cycle;
      this.saveState();
    }

    setActiveTab(tabName) {
      this.state.activeTab = tabName;
      this.saveState();
    }

    setAdminSubTab(subTabName) {
      this.state.adminSubTab = subTabName;
      this.saveState();
    }

    setIntelFilter(filterName) {
      this.state.intelFilter = filterName;
      this.saveState();
    }

    setVideoFilter(filterName) {
      this.state.videoFilter = filterName;
      this.saveState();
    }

    // Builds
    addBuild(newBuild) {
      this.state.savedBuilds.unshift(newBuild);
      if (this.state.user) {
        this.state.user.savedBuildsCount = this.state.savedBuilds.length;
      }
      this.saveState();
    }

    updateBuild(updatedBuild) {
      const idx = this.state.savedBuilds.findIndex(b => b.id === updatedBuild.id);
      if (idx !== -1) {
        this.state.savedBuilds[idx] = updatedBuild;
        this.saveState();
      }
    }

    removeBuild(buildId) {
      this.state.savedBuilds = this.state.savedBuilds.filter(b => b.id !== buildId);
      if (this.state.user) {
        this.state.user.savedBuildsCount = this.state.savedBuilds.length;
      }
      this.saveState();
    }

    // Jumpshots
    addJumpshot(jumpshot) {
      this.state.favoriteJumpshots.unshift(jumpshot);
      this.saveState();
    }

    removeJumpshot(jumpId) {
      this.state.favoriteJumpshots = this.state.favoriteJumpshots.filter(j => j.id !== jumpId);
      this.saveState();
    }

    // Videos
    addVideo(newVideo) {
      this.state.videoVault.unshift(newVideo);
      this.saveState();
    }

    removeVideo(videoId) {
      this.state.videoVault = this.state.videoVault.filter(v => v.id !== videoId);
      this.saveState();
    }

    toggleVideoProgress(videoId) {
      const vid = this.state.videoVault.find(v => v.id === videoId);
      if (vid) {
        vid.completed = !vid.completed;
        vid.progress = vid.completed ? 100 : 0;
        this.saveState();
      }
    }

    // Intel
    addIntel(newIntel) {
      this.state.liveIntelFeed.unshift(newIntel);
      this.saveState();
    }

    removeIntel(intelId) {
      this.state.liveIntelFeed = this.state.liveIntelFeed.filter(i => i.id !== intelId);
      this.saveState();
    }

    // Member Management (Admin)
    updateMemberTier(memberId, newTier) {
      const mem = this.state.membersList.find(m => m.id === memberId);
      if (mem) {
        mem.tier = newTier;
        if (newTier === 'founder' && !mem.founderNumber) {
          mem.founderNumber = Math.floor(Math.random() * 90) + 10;
        } else if (newTier !== 'founder') {
          mem.founderNumber = null;
        }
        this.saveState();
      }
    }

    updateMemberStatus(memberId, newStatus) {
      const mem = this.state.membersList.find(m => m.id === memberId);
      if (mem) {
        mem.status = newStatus;
        this.saveState();
      }
    }

    logout() {
      this.state.isAuthenticated = false;
      this.state.user = null;
      this.saveState();
    }

    loginAsGuest() {
      this.state.isAuthenticated = true;
      this.state.user = {
        id: 'guest-' + Date.now(),
        name: 'Rookie Baller',
        gamertag: 'Guest2K',
        platform: 'PlayStation 5',
        email: 'guest@theceovault.com',
        discordId: 'Not Linked',
        membershipTier: 'free',
        status: 'active',
        role: 'user',
        favScheme: '5-Out Pick & Pop Spread',
        favDefense: '2-3 Zone Rotations',
        capBreakersUnlocked: 0,
        savedBuildsCount: 1
      };
      this.saveState();
    }
  }

  const vaultStateInstance = new StateStore();
  window.VaultState = vaultStateInstance;
})();
