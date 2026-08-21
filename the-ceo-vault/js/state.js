/**
 * THE CEO VAULT - Centralized Reactive State Store
 */

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
    category: 'GAMEPLAY PATCH',
    badgeType: 'critical',
    content: '2K Sports stealth tuned reach-in foul frequency on straight-on blitzes. Silver Glove now requires 45-degree angle positioning rather than face-up bumps.',
    author: 'CEO Live Intel Team'
  },
  {
    id: 'intel-2',
    title: 'Cap Breaker Discovery: +5 Cap Breaker Path for 93 3PT Meta',
    date: 'August 20, 2026',
    category: 'LAB DISCOVERY',
    badgeType: 'meta',
    content: 'By allocating initial 3PT to 88 and using 5 Cap Breakers, you save 14 attribute points in the builder to reinvest into 85 Steal and 88 Speed.',
    author: 'THE CEO (@CHOSENGREATNESS)'
  },
  {
    id: 'intel-3',
    title: 'Badge Tier Threshold Confirmed: Legend Set Shot Specialist',
    date: 'August 19, 2026',
    category: 'BADGE THRESHOLD',
    badgeType: 'update',
    content: 'Confirmed green window expander: +12% make rate on contested catch-and-shoot jumpers with 93 3PT minimum rating requirement.',
    author: 'Vault Data Science'
  }
];

const DEFAULT_VIDEO_VAULT = [
  {
    id: 'vid-1',
    title: 'Complete 2K27 Cap Breaker Guide: Best Build Allocations (THE CEO)',
    duration: '18:42',
    category: 'BUILD MASTERY',
    tag: 'VIP EXCLUSIVE',
    views: '42K views',
    date: '2 days ago'
  },
  {
    id: 'vid-2',
    title: 'Comp 5v5 Pro-Am Defensive Rotations & 2-3 Matchup Scheme (CEO SPIRIT)',
    duration: '14:15',
    category: 'DEFENSIVE META',
    tag: 'VIP EXCLUSIVE',
    views: '35K views',
    date: '4 days ago'
  },
  {
    id: 'vid-3',
    title: 'Secret Jumpshot Cues: How to Green Every Shot with No Meter (CHOSENGREATNESS)',
    duration: '22:05',
    category: 'JUMPSHOT LAB',
    tag: 'PRO & VIP',
    views: '68K views',
    date: '1 week ago'
  }
];

class VaultState {
  constructor() {
    this.storageKey = 'ceo_vault_app_state_v1';
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
        membershipTier: 'vip', // 'free', 'pro', 'vip'
        tierExpiry: '2027-08-21',
        capBreakersUnlocked: 5,
        savedBuildsCount: 4,
        role: 'CEO VIP Founder'
      },
      billingCycle: 'annual', // 'monthly', 'annual'
      savedBuilds: DEFAULT_BUILDS,
      favoriteJumpshots: DEFAULT_JUMPSHOTS,
      liveIntelFeed: DEFAULT_INTEL_FEED,
      videoVault: DEFAULT_VIDEO_VAULT,
      activeTab: 'builds',
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
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
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

  addBuild(newBuild) {
    this.state.savedBuilds.unshift(newBuild);
    if (this.state.user) {
      this.state.user.savedBuildsCount = this.state.savedBuilds.length;
    }
    this.saveState();
  }

  removeBuild(buildId) {
    this.state.savedBuilds = this.state.savedBuilds.filter(b => b.id !== buildId);
    if (this.state.user) {
      this.state.user.savedBuildsCount = this.state.savedBuilds.length;
    }
    this.saveState();
  }

  addJumpshot(jumpshot) {
    this.state.favoriteJumpshots.unshift(jumpshot);
    this.saveState();
  }

  removeJumpshot(jumpId) {
    this.state.favoriteJumpshots = this.state.favoriteJumpshots.filter(j => j.id !== jumpId);
    this.saveState();
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
      tierExpiry: 'N/A',
      capBreakersUnlocked: 0,
      savedBuildsCount: 1,
      role: 'Rookie Member'
    };
    this.saveState();
  }
}

window.VaultState = new VaultState();
