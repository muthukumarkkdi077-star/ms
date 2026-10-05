export interface AccessibilityMetric {
  id: string;
  name: string;
  score: number; // 0-100
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  icon: string;
  description: string;
  trend: string;
}

export interface RouteAccessibilityComparison {
  routeId: string;
  routeName: string;
  accessibilityScore: number;
  elderlyFriendliness: number;
  wheelchairRampsCount: number;
  stairsDetectedCount: number;
  steepSlopesCount: number;
  accessibleCrossingsCount: number;
  audioSignalsPresent: boolean;
  tactilePavingRatioPercent: number;
  verdict: string;
  isBest: boolean;
}

export const accessibilityService = {
  getOverallCityScore() {
    return {
      overallScore: 91,
      maxScore: 100,
      classification: 'Grade A+ Highly Accessible Corridor',
      city: 'Coimbatore Metro & Urban Core',
      summary: 'RouteMind AI accessibility neural network audits 124 curb cuts, 18 audible pedestrian crossings, and 36 ramp accessways.'
    };
  },

  getAccessibilityCards(): AccessibilityMetric[] {
    return [
      {
        id: 'wheelchair',
        name: 'Wheelchair Friendly',
        score: 96,
        rating: 'Excellent',
        icon: 'Accessibility',
        description: 'Zero curb steps, 1:12 slope compliance, continuous flat asphalt sidewalks.',
        trend: '+4% this month'
      },
      {
        id: 'elderly',
        name: 'Elderly Friendly',
        score: 92,
        rating: 'Excellent',
        icon: 'HeartHandshake',
        description: 'Low-speed traffic buffers, frequent shaded benches every 150m, audible crosswalks.',
        trend: '+2% this month'
      },
      {
        id: 'pedestrian',
        name: 'Pedestrian Friendly',
        score: 89,
        rating: 'Good',
        icon: 'Footprints',
        description: 'High-visibility zebra crossings, sensor-timed pedestrian signals.',
        trend: '+5% this month'
      },
      {
        id: 'ramp_availability',
        name: 'Ramp Availability',
        score: 94,
        rating: 'Excellent',
        icon: 'CheckCircle2',
        description: 'Anti-slip textured concrete ramps on all primary road transitions.',
        trend: '94% coverage'
      },
      {
        id: 'sidewalk_availability',
        name: 'Sidewalk Availability',
        score: 88,
        rating: 'Good',
        icon: 'Compass',
        description: 'Unobstructed 2.2m average width with tactile directional tiles.',
        trend: '88% coverage'
      },
      {
        id: 'crossing_safety',
        name: 'Crossing Safety',
        score: 91,
        rating: 'Excellent',
        icon: 'ShieldCheck',
        description: 'Mid-block refuge islands and automated AI speed-calming alerts.',
        trend: 'Safe zone'
      },
      {
        id: 'slope_risk',
        name: 'Slope Risk',
        score: 14, // Low risk
        rating: 'Excellent',
        icon: 'TrendingDown',
        description: 'Low gradient (<3.2% maximum incline) along Route B corridor.',
        trend: 'Minimal risk'
      },
      {
        id: 'stair_risk',
        name: 'Stair Risk',
        score: 5, // Low risk
        rating: 'Excellent',
        icon: 'AlertTriangle',
        description: '0 mandatory stairs on Route B; elevators functional at flyover crossings.',
        trend: 'Step-free'
      }
    ];
  },

  getRouteComparison(): RouteAccessibilityComparison[] {
    return [
      {
        routeId: 'route_b',
        routeName: 'Route B (Smart Boulevard)',
        accessibilityScore: 94,
        elderlyFriendliness: 92,
        wheelchairRampsCount: 8,
        stairsDetectedCount: 0,
        steepSlopesCount: 0,
        accessibleCrossingsCount: 6,
        audioSignalsPresent: true,
        tactilePavingRatioPercent: 96,
        verdict: 'Recommended: 100% step-free, smooth surface, auditory assistance',
        isBest: true
      },
      {
        routeId: 'route_c',
        routeName: 'Route C (Heritage & DB Rd)',
        accessibilityScore: 72,
        elderlyFriendliness: 65,
        wheelchairRampsCount: 3,
        stairsDetectedCount: 1, // 14-step pedestrian bridge
        steepSlopesCount: 0,
        accessibleCrossingsCount: 2,
        audioSignalsPresent: false,
        tactilePavingRatioPercent: 54,
        verdict: 'Caution: 1 pedestrian overpass requires stair climbing',
        isBest: false
      },
      {
        routeId: 'route_a',
        routeName: 'Route A (Avinashi Arterial)',
        accessibilityScore: 68,
        elderlyFriendliness: 60,
        wheelchairRampsCount: 4,
        stairsDetectedCount: 0,
        steepSlopesCount: 2, // 7.8% incline near underpass
        accessibleCrossingsCount: 3,
        audioSignalsPresent: false,
        tactilePavingRatioPercent: 62,
        verdict: 'Moderate: Steep approach slope and high traffic curb exposure',
        isBest: false
      }
    ];
  },

  getAuditAlerts() {
    return [
      {
        type: 'warning',
        symbol: '⚠',
        title: 'Steep slope detected',
        location: 'Route A (Near Underpass Ch. 3.2 km)',
        detail: 'Grade exceeds 7.5% - manual wheelchair users will require assistance.'
      },
      {
        type: 'danger',
        symbol: '⚠',
        title: 'Stairs detected',
        location: 'Route C (Cross Cut Subway)',
        detail: '14 concrete stairs detected with no ramp bypass. Unsuitable for wheelchairs.'
      },
      {
        type: 'safe',
        symbol: '✓',
        title: 'Ramp available',
        location: 'Route B (North Flyover Ramp #2)',
        detail: 'ADA compliant 1:12 gradient with dual-height continuous stainless handrails.'
      },
      {
        type: 'safe',
        symbol: '✓',
        title: 'Accessible crossing available',
        location: 'Route B (Gandhipuram Junction)',
        detail: 'Audible chirp chirping + vibro-tactile push-button with 32s crossing window.'
      }
    ];
  }
};
