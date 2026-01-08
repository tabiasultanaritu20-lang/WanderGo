import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Keeps you logged in
import axios from "axios";

// --- CONFIGURATION ---
const SIZE = 400; 
const SPIN_DURATION = 3500; 

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", 
  "#96CEB4", "#D4A5A5", "#FF9F43", "#A3CB38"
];

// HUGE BACKUP LIST (Ensures shuffle works)
const BACKUP_DESTINATIONS = [
  // DOMESTIC
  { name: "Cox's Bazar", country: "Bangladesh", meta: "Beach" },
  { name: "Sylhet", country: "Bangladesh", meta: "Nature" },
  { name: "Sundarbans", country: "Bangladesh", meta: "Wildlife" },
  { name: "Sajek Valley", country: "Bangladesh", meta: "Hills" },
  { name: "Saint Martin", country: "Bangladesh", meta: "Island" },
  { name: "Bandarban", country: "Bangladesh", meta: "Adventure" },
  { name: "Kuakata", country: "Bangladesh", meta: "Sunrise" },
  { name: "Rangamati", country: "Bangladesh", meta: "Lake" },
  { name: "Srimangal", country: "Bangladesh", meta: "Tea Gardens" },
  { name: "Chittagong", country: "Bangladesh", meta: "Port City" },
  { name: "Sunamganj", country: "Bangladesh", meta: "Haor" },
  { name: "Barisal", country: "Bangladesh", meta: "River" },
  
  // INTERNATIONAL
  { name: "Bali", country: "Indonesia", meta: "Island" },
  { name: "Bangkok", country: "Thailand", meta: "City" },
  { name: "Dubai", country: "UAE", meta: "Desert" },
  { name: "Maldives", country: "Maldives", meta: "Ocean" },
  { name: "Kathmandu", country: "Nepal", meta: "Mountains" },
  { name: "Istanbul", country: "Turkey", meta: "History" },
  { name: "Singapore", country: "Singapore", meta: "Urban" },
  { name: "Kuala Lumpur", country: "Malaysia", meta: "City" },
  { name: "Cairo", country: "Egypt", meta: "Pyramids" }
];

// Helper: Fixes "Bd" to "Bangladesh"
const formatCountry = (c) => {
  if (!c) return "Bangladesh";
  const lower = c.toLowerCase();
  if (lower === "bd" || lower === "bangla" || lower === "bangladesh") return "Bangladesh";
  return c.charAt(0).toUpperCase() + c.slice(1);
};

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export default function DestinationWheel() {
  const navigate = useNavigate(); // Correct hook for navigation

  // State
  const [allTours, setAllTours] = useState([]); 
  const [activeItems, setActiveItems] = useState([]); 
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [travelMode, setTravelMode] = useState("domestic"); 

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      let combined = [];
      try {
        const res = await axios.get("http://localhost:8080/api/tours");
        if (res.data && res.data.data) {
           const dbItems = res.data.data.map(t => ({
             name: t.location,
             country: formatCountry(t.country),
             meta: "Tour Package"
           }));
           combined = [...dbItems];
        }
      } catch (err) {
        console.log("Using backup data only.");
      }

      // Merge Real + Backup
      BACKUP_DESTINATIONS.forEach(backup => {
         const exists = combined.find(c => c.name.toLowerCase() === backup.name.toLowerCase());
         if (!exists) combined.push(backup);
      });

      setAllTours(combined);
    };
    fetchData();
  }, []);

  // --- 2. GENERATE WHEEL (SHUFFLE) ---
  const generateWheelItems = () => {
    if (allTours.length === 0) return;

    // Filter by Mode
    let filtered = allTours.filter(item => {
      const isDomestic = item.country === "Bangladesh";
      return travelMode === "domestic" ? isDomestic : !isDomestic;
    });

    // Force fill if list is small
    if (filtered.length < 6) {
        const extra = BACKUP_DESTINATIONS.filter(b => {
             const isDomestic = b.country === "Bangladesh";
             const matchMode = travelMode === "domestic" ? isDomestic : !isDomestic;
             return matchMode && !filtered.find(f => f.name === b.name);
        });
        filtered = [...filtered, ...extra];
    }

    // Shuffle and pick 8
    const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 8);
    
    // Assign Colors
    const finalItems = shuffled.map((item, i) => ({
      ...item,
      color: COLORS[i % COLORS.length]
    }));

    setActiveItems(finalItems);
    setResult(null); 
    setRotation(0); 
  };

  useEffect(() => {
    generateWheelItems();
  }, [allTours, travelMode]);

  // --- 3. SPIN LOGIC ---
  const spin = () => {
    if (isSpinning || activeItems.length === 0) return;

    const randomIndex = Math.floor(Math.random() * activeItems.length);
    const selected = activeItems[randomIndex];

    setIsSpinning(true);
    setResult(null);

    const sliceAngle = 360 / activeItems.length;
    const targetAngle = randomIndex * sliceAngle + sliceAngle / 2;
    
    const currentRot = rotation % 360; 
    const extraSpins = 5 * 360; 
    const newRotation = (rotation - currentRot) + extraSpins + (360 - targetAngle);

    setRotation(newRotation);

    setTimeout(() => {
      setResult(selected);
      setIsSpinning(false);
    }, SPIN_DURATION);
  };

  // --- 4. NAVIGATION ACTIONS ---
  
  const handleCheckTours = () => {
    // Uses React Router (keeps state)
    // IMPORTANT: This goes to 'http://localhost:5173/?search=PlaceName'
    navigate(`/?search=${result.name}`);
  };

  const handleMarkVisited = () => {
    if (!result) return;
    
    // Remove winner
    const updatedItems = activeItems.filter(item => item.name !== result.name);
    
    if (updatedItems.length < 3) {
        alert("Running low on options! Refreshing wheel...");
        generateWheelItems();
    } else {
        const reColored = updatedItems.map((item, i) => ({
             ...item,
             color: COLORS[i % COLORS.length]
        }));
        setActiveItems(reColored);
        setResult(null);
        setRotation(0);
    }
  };

  // --- RENDER ---
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = SIZE / 2 - 20; 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40, background: '#F8F9FA', minHeight: '100vh' }}>
      
      <h1 style={{ color: '#2C3E50', marginBottom: 20 }}>Spin & Go! 🌍</h1>
      
      {/* TOGGLES */}
      <div style={{ background: '#E9ECEF', padding: 5, borderRadius: 30, display: 'flex', gap: 5, marginBottom: 30 }}>
        <button 
          onClick={() => setTravelMode("domestic")}
          style={{
             padding: '10px 20px', borderRadius: 25, border: 'none', cursor: 'pointer', fontWeight: 'bold',
             background: travelMode === 'domestic' ? 'white' : 'transparent',
             boxShadow: travelMode === 'domestic' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          Inside Bangladesh
        </button>
        <button 
          onClick={() => setTravelMode("international")}
          style={{
             padding: '10px 20px', borderRadius: 25, border: 'none', cursor: 'pointer', fontWeight: 'bold',
             background: travelMode === 'international' ? 'white' : 'transparent',
             boxShadow: travelMode === 'international' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          International
        </button>
      </div>

      <div style={{ display: 'flex', gap: 50, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* WHEEL SVG */}
        <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
          <div style={{
            position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0, 
            borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderTop: '25px solid #2C3E50',
            zIndex: 10
          }} />

          <svg width={SIZE} height={SIZE} style={{ overflow: 'visible' }}>
            <g transform={`rotate(${rotation} ${CX} ${CY})`} style={{ transition: `transform ${SPIN_DURATION}ms cubic-bezier(0.2, 0.8, 0.2, 1)` }}>
              {activeItems.map((item, i) => {
                const angle = 360 / activeItems.length;
                const start = i * angle;
                const end = (i + 1) * angle;
                const mid = start + angle / 2;
                const { x, y } = polarToCartesian(CX, CY, R * 0.65, mid);
                let textRot = mid;
                if (textRot > 90 && textRot < 270) textRot += 180;

                return (
                  <g key={i}>
                    <path d={slicePath(CX, CY, R, start, end)} fill={item.color} stroke="white" strokeWidth="2" />
                    <text 
                      x={x} y={y} 
                      textAnchor="middle" dominantBaseline="middle" 
                      transform={`rotate(${textRot} ${x} ${y})`}
                      style={{ fill: 'white', fontWeight: 'bold', fontSize: 13, userSelect: 'none' }}
                    >
                      {item.name}
                    </text>
                  </g>
                );
              })}
            </g>
            
            <g onClick={spin} style={{ cursor: isSpinning ? 'default' : 'pointer' }}>
              <circle cx={CX} cy={CY} r={40} fill="white" stroke="#E9ECEF" strokeWidth="4" />
              <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" style={{ fontWeight: '900', fontSize: 14, fill: '#2C3E50' }}>
                {isSpinning ? "..." : "SPIN"}
              </text>
            </g>
          </svg>
        </div>

        {/* RESULT CARD */}
        <div style={{ width: 300, minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           {!result && !isSpinning && (
             <div style={{ textAlign: 'center', color: '#6C757D' }}>
               <h3>Ready?</h3>
               <p>Spin the wheel to decide where to go next!</p>
             </div>
           )}

           {isSpinning && (
              <div style={{ textAlign: 'center', color: '#6C757D' }}>
                <h3>Spinning...</h3>
                <p>Choosing your destiny! 🤞</p>
              </div>
           )}

           {result && (
             <div style={{ background: 'white', padding: 25, borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                <div style={{ fontSize: 12, color: '#ADB5BD', textTransform: 'uppercase', letterSpacing: 1 }}>Destination</div>
                <h2 style={{ color: '#2C3E50', fontSize: 28, margin: '10px 0' }}>{result.name}</h2>
                <span style={{ background: '#E9ECEF', padding: '5px 10px', borderRadius: 10, fontSize: 12, color: '#495057' }}>{result.country}</span>
                
                <div style={{ marginTop: 25, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button 
                    onClick={handleCheckTours}
                    style={{ padding: 12, borderRadius: 10, border: 'none', background: '#4F46E5', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Check Tours
                  </button>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button 
                        onClick={spin}
                        style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #DEE2E6', background: 'white', cursor: 'pointer', fontSize: 13 }}
                    >
                        Spin Again
                    </button>
                    <button 
                        onClick={handleMarkVisited}
                        style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #DEE2E6', background: 'white', cursor: 'pointer', fontSize: 13, color: '#e03131', fontWeight: 'bold' }}
                    >
                        Mark Visited
                    </button>
                  </div>
                </div>
             </div>
           )}
        </div>
      </div>
      
      <button 
        onClick={generateWheelItems} 
        disabled={isSpinning}
        style={{ marginTop: 50, background: 'transparent', border: 'none', color: '#6C757D', cursor: 'pointer', textDecoration: 'underline', fontSize: 14 }}
      >
        🔄 Shuffle / New Locations
      </button>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}