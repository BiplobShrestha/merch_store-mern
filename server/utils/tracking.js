// Read-time tracking calculation. No background jobs, no stored position —
// this derives "where is the shipment right now" purely from
// (Date.now() - order.approvedAt), recomputed fresh on every call.

const SPEED_FACTOR = 10; // 1 real hour = 10 "system" hours
const LEG1_SYSTEM_HOURS = 5; // Europe warehouse -> Kathmandu hub, fixed for every order

function computeTracking(order) {
  if (order.status === 'Cancelled') {
    return { stage: 'cancelled' };
  }
  if (!order.approvedAt) {
    return { stage: 'not-started' };
  }

  const region = order.region;
  const distanceKm = order.route?.distanceKm ?? 0;
  const edgeDistances = order.route?.edgeDistances ?? [];
  const waypoints = order.route?.waypoints ?? [region];

  const leg2DurationHours = region === 'Kathmandu' ? 0 : (distanceKm / 100) * 3;
  const totalSystemHours = LEG1_SYSTEM_HOURS + leg2DurationHours;

  const elapsedRealMs = Date.now() - new Date(order.approvedAt).getTime();
  const elapsedSystemHours = Math.max(0, (elapsedRealMs / 3600000) * SPEED_FACTOR);

  const etaSystemHoursRemaining = Math.max(0, totalSystemHours - elapsedSystemHours);
  const etaRealMinutesRemaining = Math.round((etaSystemHoursRemaining / SPEED_FACTOR) * 60);

  // still Delivered in status even though math would say arrived - respect admin's manual action
  if (order.status === 'Delivered') {
    return { stage: 'delivered', region, waypoints, distanceKm };
  }

  // Leg 1: Europe -> Kathmandu
  if (elapsedSystemHours < LEG1_SYSTEM_HOURS) {
    return {
      stage: 'leg1',
      region,
      waypoints,
      distanceKm,
      leg1Progress: elapsedSystemHours / LEG1_SYSTEM_HOURS,
      etaRealMinutesRemaining,
    };
  }

  // Kathmandu-bound orders are done after Leg 1
  if (region === 'Kathmandu') {
    return { stage: 'arrived-awaiting-confirmation', region, waypoints, distanceKm };
  }

  const leg2Elapsed = elapsedSystemHours - LEG1_SYSTEM_HOURS;

  // Leg 2 finished, waiting on admin to mark Delivered
  if (leg2Elapsed >= leg2DurationHours) {
    return { stage: 'arrived-awaiting-confirmation', region, waypoints, distanceKm };
  }

  // Leg 2 in progress: interpolate along the multi-hop path, proportioned by km per edge
  const leg2Fraction = leg2DurationHours > 0 ? leg2Elapsed / leg2DurationHours : 1;
  const targetKm = leg2Fraction * distanceKm;

  let cumulative = 0;
  let currentEdgeIndex = 0;
  let edgeProgress = 0;
  for (let i = 0; i < edgeDistances.length; i++) {
    const edgeDist = edgeDistances[i];
    const isLast = i === edgeDistances.length - 1;
    if (targetKm <= cumulative + edgeDist || isLast) {
      currentEdgeIndex = i;
      edgeProgress = edgeDist > 0 ? Math.min(1, (targetKm - cumulative) / edgeDist) : 1;
      break;
    }
    cumulative += edgeDist;
  }

  return {
    stage: 'leg2',
    region,
    waypoints,
    distanceKm,
    currentEdgeIndex,
    edgeProgress,
    etaRealMinutesRemaining,
  };
}

module.exports = { computeTracking };
