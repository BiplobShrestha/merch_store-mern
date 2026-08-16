// Fixed delivery region graph. Kathmandu is the single hub/source.
// Distances are approximate highway km, used only for relative timing —
// not for real-world routing/logistics.

const EDGES = [
  ['Kathmandu', 'Mugling', 110],
  ['Kathmandu', 'Narayanghat', 145],
  ['Kathmandu', 'Dhalkebar', 180],
  ['Mugling', 'Pokhara', 90],
  ['Mugling', 'Narayanghat', 55],
  ['Narayanghat', 'Butwal', 120],
  ['Narayanghat', 'Birgunj', 90],
  ['Dhalkebar', 'Biratnagar', 130],
  ['Dhalkebar', 'Itahari', 110],
  ['Butwal', 'Nepalgunj', 190],
];

// Regions a customer can actually pick at checkout (delivery endpoints).
// Kathmandu is both the hub and a valid delivery region (arrives after Leg 1 only).
const DELIVERY_REGIONS = [
  'Kathmandu',
  'Pokhara',
  'Butwal',
  'Birgunj',
  'Biratnagar',
  'Itahari',
  'Nepalgunj',
];

function buildAdjacencyList() {
  const adj = {};
  for (const [a, b, dist] of EDGES) {
    if (!adj[a]) adj[a] = [];
    if (!adj[b]) adj[b] = [];
    adj[a].push({ node: b, dist });
    adj[b].push({ node: a, dist });
  }
  return adj;
}

// Dijkstra's algorithm — single source 'Kathmandu' to a target region.
// Returns { waypoints: [...cityNames], edgeDistances: [...km per hop], distanceKm: total }
function shortestPathFromKathmandu(target) {
  if (target === 'Kathmandu') {
    return { waypoints: ['Kathmandu'], edgeDistances: [], distanceKm: 0 };
  }

  const adj = buildAdjacencyList();
  const dist = { Kathmandu: 0 };
  const prev = {};
  const visited = new Set();
  const queue = new Set(Object.keys(adj));

  while (queue.size > 0) {
    // pick unvisited node with smallest known distance
    let current = null;
    let currentDist = Infinity;
    for (const node of queue) {
      const d = dist[node] ?? Infinity;
      if (d < currentDist) {
        currentDist = d;
        current = node;
      }
    }
    if (current === null) break; // remaining nodes unreachable
    queue.delete(current);
    visited.add(current);

    if (current === target) break;

    for (const { node: neighbor, dist: edgeDist } of adj[current] || []) {
      if (visited.has(neighbor)) continue;
      const candidate = currentDist + edgeDist;
      if (candidate < (dist[neighbor] ?? Infinity)) {
        dist[neighbor] = candidate;
        prev[neighbor] = current;
      }
    }
  }

  if (!(target in dist)) {
    throw new Error(`No route found to ${target}`);
  }

  // reconstruct path
  const path = [];
  let node = target;
  while (node) {
    path.unshift(node);
    node = prev[node];
  }

  const edgeDistances = [];
  for (let i = 0; i < path.length - 1; i++) {
    edgeDistances.push(dist[path[i + 1]] - dist[path[i]]);
  }

  return { waypoints: path, edgeDistances, distanceKm: dist[target] };
}

module.exports = { shortestPathFromKathmandu, DELIVERY_REGIONS };
