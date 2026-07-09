// --- Consent Banner ---
const allowBtn = document.getElementById('allow');
const declineBtn = document.getElementById('decline');
const consentBanner = document.getElementById('consent-banner');
let trackingEnabled = false;

allowBtn?.addEventListener('click', () => {
  trackingEnabled = true;
  consentBanner.classList.add('hidden');
});
declineBtn?.addEventListener('click', () => {
  trackingEnabled = false;
  consentBanner.classList.add('hidden');
});

// --- Metrics ---
let mouseMoves = 0;
let totalDistance = 0;
let lastX = null, lastY = null;
let keyTimes = [];
let scrolls = 0;
let focusSwitches = 0;
let sessionId = "sess-" + Math.random().toString(36).substr(2,6);

// Mouse tracking
document.addEventListener("mousemove", e => {
  if (!trackingEnabled) return;
  mouseMoves++;
  if (lastX !== null && lastY !== null) {
    totalDistance += Math.hypot(e.clientX - lastX, e.clientY - lastY);
  }
  lastX = e.clientX;
  lastY = e.clientY;
});

// Keyboard tracking
document.addEventListener("keydown", () => { if (!trackingEnabled) return; keyTimes.push(Date.now()); });

// Scroll tracking
document.addEventListener("scroll", () => { if (!trackingEnabled) return; scrolls++; }, { passive: true });

// Focus/blur
window.addEventListener("focus", () => { if (trackingEnabled) focusSwitches++; });
window.addEventListener("blur", () => { if (trackingEnabled) focusSwitches++; });

// --- Helpers ---
function avgKeyInterval() {
  if (keyTimes.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < keyTimes.length; i++) sum += keyTimes[i]-keyTimes[i-1];
  return sum/(keyTimes.length-1);
}

// --- Aadhaar input formatting ---
const aadhaarInput = document.getElementById('aadhaar');
aadhaarInput.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g,'').substr(0,12);
  e.target.value = v.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_,a,b,c) => [a,b,c].filter(Boolean).join(' '));
});

// --- Date input DD-MM-YYYY formatting ---
const dateInput = document.getElementById('date');
dateInput.addEventListener('input', e => {
  let v = e.target.value.replace(/[^\d]/g,'').substr(0,8);
  if(v.length >= 2) v = v.slice(0,2) + '-' + v.slice(2);
  if(v.length >= 5) v = v.slice(0,5) + '-' + v.slice(5);
  e.target.value = v;
});

// --- Form submit ---
const form = document.getElementById("aadhaar-form");
const stages = document.getElementById("aadhaar-stages");

form?.addEventListener('submit', async e => {
  e.preventDefault();
  if(!trackingEnabled) return;

  const features = {
    mouseMoves,
    totalDistance: parseFloat(totalDistance.toFixed(2)),
    avgKeyInterval: parseFloat(avgKeyInterval().toFixed(2)),
    scrolls,
    focusSwitches
  };

  const isBot = (features.mouseMoves === 0 && features.scrolls === 0 && keyTimes.length <= 1 && features.focusSwitches === 0);
  if(isBot) { alert("Bot detected. Interaction not logged."); return; }

  // Show verification stages
  stages.classList.remove('hidden');
  document.getElementById('stage1').classList.add('completed');
  setTimeout(()=> document.getElementById('stage2').classList.add('completed'),1000);
  setTimeout(()=> document.getElementById('stage3').classList.add('completed'),2000);

  // Build payload (no date)
  const payload = {
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    ...features,
    label:"human"
  };

  try {
    await fetch("http://localhost:5002/save", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
    });
    console.log("✅ Human data saved:", payload);
  } catch(err) { console.error("❌ Error saving data:",err); }

  // Reset metrics
  mouseMoves=0; totalDistance=0; lastX=null; lastY=null;
  keyTimes=[]; scrolls=0; focusSwitches=0;
  sessionId = "sess-"+Math.random().toString(36).substr(2,6);
});
