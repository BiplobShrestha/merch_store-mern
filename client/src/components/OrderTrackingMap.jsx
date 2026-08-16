// Schematic (not geographically accurate) diagram of the delivery graph.
// Renders the fixed road network plus a marker interpolated along the
// order's actual computed path, based on tracking data from the backend.

const NODE_COORDS = {
  Europe: { x: 60, y: 50 },
  Kathmandu: { x: 380, y: 170 },
  Mugling: { x: 260, y: 210 },
  Narayanghat: { x: 250, y: 285 },
  Dhalkebar: { x: 520, y: 195 },
  Pokhara: { x: 140, y: 245 },
  Butwal: { x: 195, y: 345 },
  Birgunj: { x: 305, y: 385 },
  Biratnagar: { x: 635, y: 265 },
  Itahari: { x: 560, y: 290 },
  Nepalgunj: { x: 90, y: 395 },
};

// All fixed roads (static background, always drawn faint)
const ALL_EDGES = [
  ['Kathmandu', 'Mugling'],
  ['Kathmandu', 'Narayanghat'],
  ['Kathmandu', 'Dhalkebar'],
  ['Mugling', 'Pokhara'],
  ['Mugling', 'Narayanghat'],
  ['Narayanghat', 'Butwal'],
  ['Narayanghat', 'Birgunj'],
  ['Dhalkebar', 'Biratnagar'],
  ['Dhalkebar', 'Itahari'],
  ['Butwal', 'Nepalgunj'],
];

function lerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function stageLabel(stage) {
  switch (stage) {
    case 'leg1': return 'In transit — international leg';
    case 'leg2': return 'In transit — domestic leg';
    case 'arrived-awaiting-confirmation': return 'Arrived — awaiting confirmation';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Tracking unavailable';
    case 'not-started': return 'Not yet dispatched';
    default: return '';
  }
}

export default function OrderTrackingMap({ tracking }) {
  if (tracking?.stage === 'error') {
    return (
      <div className="tracking-empty tracking-error">
        Couldn't load tracking: {tracking.message}
      </div>
    );
  }

  if (!tracking || tracking.stage === 'not-started' || tracking.stage === 'cancelled') {
    return (
      <div className="tracking-empty">
        {tracking?.stage === 'cancelled' ? 'Tracking unavailable for cancelled orders.' : 'Tracking will appear once this order is being processed.'}
      </div>
    );
  }

  const waypoints = tracking.waypoints || ['Kathmandu'];
  let markerPos = NODE_COORDS.Kathmandu;
  let highlightPath = [];

  if (tracking.stage === 'leg1') {
    markerPos = lerp(NODE_COORDS.Europe, NODE_COORDS.Kathmandu, tracking.leg1Progress ?? 0);
    highlightPath = [];
  } else if (tracking.stage === 'leg2') {
    const idx = tracking.currentEdgeIndex ?? 0;
    const from = NODE_COORDS[waypoints[idx]];
    const to = NODE_COORDS[waypoints[idx + 1]];
    markerPos = lerp(from, to, tracking.edgeProgress ?? 0);
    highlightPath = waypoints;
  } else {
    // arrived / delivered — marker sits at the final destination
    const last = waypoints[waypoints.length - 1];
    markerPos = NODE_COORDS[last] || NODE_COORDS.Kathmandu;
    highlightPath = waypoints;
  }

  const highlightSegments = [];
  for (let i = 0; i < highlightPath.length - 1; i++) {
    highlightSegments.push([highlightPath[i], highlightPath[i + 1]]);
  }

  return (
    <div className="tracking-map-wrap">
      <svg viewBox="0 0 700 430" className="tracking-map-svg">
        {/* faint static road network */}
        {ALL_EDGES.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={NODE_COORDS[a].x} y1={NODE_COORDS[a].y}
            x2={NODE_COORDS[b].x} y2={NODE_COORDS[b].y}
            stroke="#e3ddc9" strokeWidth="2"
          />
        ))}

        {/* Europe -> Kathmandu leg, dashed */}
        <line
          x1={NODE_COORDS.Europe.x} y1={NODE_COORDS.Europe.y}
          x2={NODE_COORDS.Kathmandu.x} y2={NODE_COORDS.Kathmandu.y}
          stroke={tracking.stage === 'leg1' ? '#97f000' : '#d8d0b8'}
          strokeWidth="2.5" strokeDasharray="6 5"
        />

        {/* highlighted active route */}
        {highlightSegments.map(([a, b], i) => (
          <line
            key={`hl-${a}-${b}`}
            x1={NODE_COORDS[a].x} y1={NODE_COORDS[a].y}
            x2={NODE_COORDS[b].x} y2={NODE_COORDS[b].y}
            stroke="#97f000" strokeWidth="4" strokeLinecap="round"
          />
        ))}

        {/* Europe marker */}
        <circle cx={NODE_COORDS.Europe.x} cy={NODE_COORDS.Europe.y} r="7" fill="#17140f" />
        <text x={NODE_COORDS.Europe.x} y={NODE_COORDS.Europe.y - 14} textAnchor="middle" className="tracking-node-label">Warehouse</text>

        {/* all city nodes */}
        {Object.entries(NODE_COORDS).filter(([name]) => name !== 'Europe').map(([name, pos]) => {
          const isHub = name === 'Kathmandu';
          const onPath = waypoints.includes(name);
          return (
            <g key={name}>
              <circle
                cx={pos.x} cy={pos.y}
                r={isHub ? 8 : 5.5}
                fill={onPath ? '#17140f' : '#fff'}
                stroke={onPath ? '#97f000' : '#d8d0b8'}
                strokeWidth="2"
              />
              <text x={pos.x} y={pos.y - (isHub ? 16 : 12)} textAnchor="middle" className="tracking-node-label">
                {name}
              </text>
            </g>
          );
        })}

        {/* moving position marker */}
        <circle cx={markerPos.x} cy={markerPos.y} r="9" fill="#97f000" stroke="#17140f" strokeWidth="2">
          {(tracking.stage === 'leg1' || tracking.stage === 'leg2') && (
            <animate attributeName="r" values="8;10;8" dur="1.6s" repeatCount="indefinite" />
          )}
        </circle>
      </svg>

      <div className="tracking-status-row">
        <span className={`tracking-stage-badge stage-${tracking.stage}`}>{stageLabel(tracking.stage)}</span>
        {typeof tracking.etaRealMinutesRemaining === 'number' && tracking.etaRealMinutesRemaining > 0 && (
          <span className="tracking-eta">~{tracking.etaRealMinutesRemaining} min remaining</span>
        )}
      </div>
    </div>
  );
}
