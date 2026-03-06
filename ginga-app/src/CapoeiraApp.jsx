import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./context/AuthContext";
import { api } from "./lib/api";
import LoginScreen from "./components/LoginScreen";
import { usePremium } from "./context/PremiumContext";
import PremiumLock from "./components/PremiumLock";
import UpgradeModal from "./components/UpgradeModal";
import SettingsPanel from "./components/SettingsPanel";
import PrivacyPolicy from "./components/PrivacyPolicy";
import InstallPrompt from "./components/InstallPrompt";

/* ═══════════════════════════════════════════════════════════════
   AXÉ — Capoeira Progression Guide
   Aesthetic: Kinetic Brazilian street energy, warm & alive
   For all capoeira practitioners
   ═══════════════════════════════════════════════════════════════ */

// ── Category keywords for auto-classifying custom training ──
const CATEGORY_KEYWORDS = {
  kicks: ["kick", "chute", "golpe", "bênção", "bencao", "martelo", "meia lua", "queixada", "armada", "ponteira", "parafuso", "strike", "rabo de arraia", "gancho", "pisão", "chapa", "cotovelada", "joelhada", "esquiva"],
  acrobatics: ["flip", "acrobat", "floreio", "aú", "au", "bananeira", "macaco", "mortal", "handstand", "cartwheel", "backflip", "frontflip", "s-dobrado", "parafuso", "aerial", "salto", "ponte", "bridge", "balance", "invert"],
  ground: ["ground", "chão", "chao", "rasteira", "negativa", "rolê", "role", "sweep", "tesoura", "queda", "takedown", "cocorinha", "resistência", "resistencia", "cabeçada", "cabecada", "vingativa", "cruz", "banda"],
  music: ["music", "música", "musica", "berimbau", "pandeiro", "atabaque", "agogô", "agogo", "reco", "canto", "song", "corrido", "ladainha", "chula", "palma", "clap", "rhythm", "ritmo", "toque", "instrument", "sing", "history", "história", "historia", "cultura", "culture"]
};

function classifyCustomTraining(text) {
  const lower = text.toLowerCase();
  let best = null, bestScore = 0;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) { bestScore = score; best = category; }
  }
  // Default heuristics if no keyword matched
  if (!best) {
    if (/move|movement|technique|combo|drill/.test(lower)) best = "kicks";
    else if (/flex|stretch|strength|condition|train|workout|fitness/.test(lower)) best = "ground";
    else best = "kicks"; // default to kicks
  }
  return best;
}


const PATHS = {
  kicks: {
    name: "Golpes",
    subtitle: "Kicks & Strikes",
    icon: "⚡",
    hue: 25,
    accent: "#E8652B",
    accentAlt: "#FF8C42",
    glow: "rgba(232,101,43,0.3)",
    description: "Master every kick from bênção to parafuso — power, precision & malícia",
    levels: [
      {
        name: "Fundamentos",
        subtitle: "The Essential Kicks",
        skills: [
          {
            name: "Ginga",
            pt: "The Swing",
            description: "Everything starts here. The ginga is your signature, your rhythm, your deception. It's not just a stance — it's a conversation. A good ginga makes you unpredictable, a bad one makes you a target.",
            cues: ["Back leg steps behind at 45° — not straight back", "Opposite arm protects face, other arm guards body", "Stay on the balls of your feet — never flat-footed", "Make it YOUR ginga — let your body find its own cadence"],
            milestone: "Smooth, rhythmic ginga for 3 min with natural quebradas (rhythm breaks) mixed in",
          },
          {
            name: "Bênção",
            pt: "Blessing / Front Push Kick",
            description: "The most fundamental kick. A straight push kick aimed at the chest or stomach. It's the 'jab' of capoeira — fast, direct, and always a threat.",
            cues: ["Chamber the knee high before extending", "Push through with the ball of the foot or whole sole", "Hips face forward — power comes from hip extension", "Retract fast — a slow bênção gets you swept"],
            milestone: "Clean bênção from ginga to both sides, chest height, with control",
          },
          {
            name: "Meia Lua de Frente",
            pt: "Half Moon to the Front",
            description: "A crescent kick sweeping inward. Your first circular kick. The leg draws a half-moon arc from outside to inside, striking with the instep or shin.",
            cues: ["Keep the kicking leg mostly straight", "Arc comes from the hip — let it swing like a pendulum", "Supporting foot pivots slightly", "Return to ginga position — don't let the kick carry you off balance"],
            milestone: "Fluid meia lua de frente from ginga, both sides, head height",
          },
          {
            name: "Martelo",
            pt: "Hammer / Roundhouse",
            description: "The power kick. A roundhouse delivered with the instep or shin. Chamber, pivot, and unleash. This is the kick that ends games.",
            cues: ["Chamber the knee high, pointing at your target", "Pivot hard on the support foot — hips must turn over", "Strike with instep (for range) or shin (for power)", "Snap it back — don't leave your leg hanging out there"],
            milestone: "Fast, snapping martelo to head height from both sides",
          }
        ]
      },
      {
        name: "Spinning Kicks",
        subtitle: "Adding Rotation",
        skills: [
          {
            name: "Queixada",
            pt: "Jawbreaker / Outside Crescent",
            description: "Step across the body, then release the front leg in an outward crescent. The first spinning/stepping kick. Deceptive because the step looks like a retreat.",
            cues: ["Cross-step deep behind your front leg", "Let the torso wind up during the step", "Release the kick with the hip — leg follows naturally", "Eyes track the target through the turn"],
            milestone: "Smooth queixada from ginga into both directions with flow",
          },
          {
            name: "Armada",
            pt: "Fleet / Spinning Back Kick",
            description: "The classic capoeira spinning kick. Full 360° rotation with the leg sweeping at head height. Beautiful, powerful, and iconic.",
            cues: ["Spot your target — look over your shoulder as you spin", "The power comes from hip rotation, not the leg", "Keep the kicking leg mostly straight for range", "Land back in ginga — control the momentum"],
            milestone: "Clean armada with full rotation and control, landing balanced",
          },
          {
            name: "Meia Lua de Compasso",
            pt: "Compass Half Moon",
            description: "THE signature capoeira kick. Step across, plant both hands, and sweep the leg in a massive arc. One hand on the ground, your body forms a compass. Devastating reach and power.",
            cues: ["Step across at 45°, plant one or both hands firmly", "Look through your legs at your target", "The kick sweeps at head height — hip drives the arc", "Keep the supporting hand active — you may need to adjust"],
            milestone: "Controlled compasso from ginga, both sides, touching the ground with one hand only",
          },
          {
            name: "Gancho",
            pt: "Hook Kick",
            description: "A hook kick, often following armada or compasso. The leg extends then snaps back with the heel as the striking surface. Catches people who duck under spinning kicks.",
            cues: ["Usually follows a spinning kick that misses", "Extend the leg straight, then snap-hook the heel back", "The target is usually the face or back of the head", "Don't telegraph — let it flow from the previous movement"],
            milestone: "Gancho as a follow-up to armada, landing clean",
          }
        ]
      },
      {
        name: "Intermediate",
        subtitle: "Power & Deception",
        skills: [
          {
            name: "Martelo do Chão",
            pt: "Hammer from the Ground",
            description: "A roundhouse kick thrown from a crouched or ground position. Unexpected and devastating because it comes from below.",
            cues: ["Drop low first — cocorinha or negativa position", "Explode upward, pivoting on the support foot", "Strike at head height even though you started low", "This is pure surprise — timing is everything"],
            milestone: "Explosive martelo do chão from negativa, both sides",
          },
          {
            name: "Chapa",
            pt: "Sole Kick / Side Kick",
            description: "A powerful side kick or back kick using the sole of the foot. Can be thrown standing, from the ground, or from handstand. The stopping power is immense.",
            cues: ["Chamber, rotate hips sideways, extend through the heel/sole", "Can be thrown forward, sideways, or backward", "From the ground: cocorinha → explode into side kick", "Keep core tight — the power comes from the hip, not the knee"],
            milestone: "Chapa from standing AND from ground position, strong and controlled",
          },
          {
            name: "Martelo Cruzado",
            pt: "Crossed Hammer",
            description: "A martelo thrown with the rear leg, crossing over. Generates huge power because of the extra rotation. Unexpected angle.",
            cues: ["Step across like queixada, but chamber for roundhouse", "Extra hip rotation creates devastating power", "Don't over-rotate — control your landing", "Great follow-up after a feinted queixada"],
            milestone: "Martelo cruzado with power and landing in ginga",
          },
          {
            name: "Ponteira",
            pt: "Snap Kick / Tip",
            description: "A fast front snap kick using the ball of the foot or toes. Quick jab to the face or body. Less power than bênção, but much faster.",
            cues: ["Snap from the knee — minimal wind-up", "Ball of the foot or toes as striking surface", "Think 'flick' not 'push'", "Retract immediately — in and out"],
            milestone: "Lightning-fast ponteira from ginga, catching the rhythm break",
          }
        ]
      },
      {
        name: "Advanced",
        subtitle: "Flying & Exotic Kicks",
        skills: [
          {
            name: "Parafuso",
            pt: "Corkscrew Kick",
            description: "A jumping, spinning kick that corkscrews through the air. One of capoeira's most spectacular kicks. The body twists as you jump and kick simultaneously.",
            cues: ["Wind up with a turning step — same as armada entry", "Jump off both feet as you spin", "The kick fires at the peak of the jump", "Land on the kicking leg — absorb with bent knee"],
            milestone: "Parafuso with good height and clean landing",
          },
          {
            name: "Armada Dupla",
            pt: "Double Fleet",
            description: "A jumping double kick — two armadas in the air. Both legs fire in succession while airborne. Incredibly athletic and crowd-pleasing.",
            cues: ["Jump high — you need airtime for both kicks", "First kick with lead leg, second with rear", "Scissor the legs — one fires as the other retracts", "Land controlled — don't sacrifice balance for height"],
            milestone: "Both kicks connecting at target height, clean landing",
          },
          {
            name: "Meia Lua Solta / Parafuso de Lado",
            pt: "Released Half Moon",
            description: "An aerial kick from compasso position — both hands release from the ground. You're airborne in a horizontal spin. Pure malícia and athleticism.",
            cues: ["Enter like compasso, but push off with hands", "Body goes horizontal as you spin", "Kick connects at peak of the rotation", "Land on both feet or transition to the ground"],
            milestone: "Airborne horizontal spin kick with controlled landing",
          },
          {
            name: "S-Dobrado",
            pt: "S-Fold / Butterfly Kick",
            description: "A no-hand aerial that traces an S-shape. Both legs sweep through the air in a butterfly motion. One of the most beautiful movements in capoeira.",
            cues: ["Swing arms for momentum as you jump", "First leg kicks up, body follows, second leg sweeps over", "Keep looking forward — don't tuck the chin", "Think 'sweeping' not 'flipping' — it's horizontal rotation"],
            milestone: "Clean s-dobrado with both legs sweeping at head height",
          }
        ]
      }
    ]
  },
  acrobatics: {
    name: "Floreios",
    subtitle: "Acrobatics & Flow",
    icon: "🌀",
    hue: 165,
    accent: "#0DAA8A",
    accentAlt: "#3EDBB8",
    glow: "rgba(13,170,138,0.3)",
    description: "Aú, macaco, mortal — the beautiful movements that make capoeira fly",
    levels: [
      {
        name: "Fundamentos",
        subtitle: "Ground & Inversion Basics",
        skills: [
          {
            name: "Aú (Cartwheel)",
            pt: "Cartwheel",
            description: "The most fundamental acrobatic movement. But in capoeira, always face your opponent — you don't just flip over blindly. The aú is mobility, escape, and setup all in one.",
            cues: ["Head stays turned toward your opponent throughout", "Hands go down one at a time — not together", "Legs pass overhead, slightly bent or straight", "Land light, ready to ginga or attack"],
            milestone: "Fluid aú in both directions while watching a partner",
          },
          {
            name: "Rolê",
            pt: "Ground Spin",
            description: "A low spin on the ground used to reposition, escape, or transition. You stay close to the floor, weight on hands and one foot, spinning to a new position.",
            cues: ["Start from negativa or cocorinha", "Weight on both hands, one foot — other leg sweeps", "Stay LOW — your head should barely rise", "Always watch your opponent through the movement"],
            milestone: "Smooth rolê in both directions, transitioning into ginga or negativa",
          },
          {
            name: "Queda de Rins",
            pt: "Kidney Drop / Elbow Balance",
            description: "Balance on your hands with your hip resting on one elbow. Legs can be tucked, split, or extended. The foundation of many ground floreios.",
            cues: ["Hands and head form a tripod on the floor", "Twist hips and rest one hip on the same-side elbow", "Slowly lift legs off the ground", "Build hold time — strength and balance develop together"],
            milestone: "Hold 15 seconds with legs extended, both sides",
          },
          {
            name: "Bananeira (Handstand)",
            pt: "Banana Tree",
            description: "The capoeira handstand. Unlike gymnastic handstands, you may have a slight arch — it looks different and that's okay. Used for mobility, pauses, and kicks.",
            cues: ["Kick up and hold — don't worry about perfect straight line", "Hands shoulder-width, fingers spread", "Slight arch is natural in capoeira — embrace it", "Practice against a wall first, then freestanding"],
            milestone: "Freestanding bananeira hold, 10 seconds",
          }
        ]
      },
      {
        name: "Essential Floreios",
        subtitle: "The Crowd Pleasers",
        skills: [
          {
            name: "Macaco",
            pt: "Monkey / Standing Back Handspring",
            description: "From standing, reach one hand back and flip over backward. Not a full back handspring — one hand leads. It's the monkey flip, and it's the gateway to aerial acrobatics.",
            cues: ["Look back over your shoulder, reach one hand to the ground", "Push off the legs and let the hips go over", "Second hand can touch or not (macaco sem mão = no hands)", "Land on both feet, facing where you started"],
            milestone: "Clean macaco from standing, both sides",
          },
          {
            name: "Aú Batido",
            pt: "Struck Cartwheel",
            description: "A cartwheel interrupted by a kick in the air. Mid-aú, one leg fires a chapa while you're inverted. Attack from an unexpected angle.",
            cues: ["Start a normal aú", "At the top, fire one leg outward as a chapa/kick", "The other leg continues over", "Land facing your opponent with momentum absorbed"],
            milestone: "Aú batido with a convincing kick, both directions",
          },
          {
            name: "Aú Sem Mão",
            pt: "No-Hands Cartwheel / Aerial",
            description: "A cartwheel without hands touching the ground. The classic aerial. Requires explosive leg drive and commitment.",
            cues: ["Swing arms hard for momentum", "Drive the lead leg UP aggressively", "Commit — half-attempts are more dangerous than full ones", "Land on one foot, then the other"],
            milestone: "Consistent aú sem mão landing on both feet",
          },
          {
            name: "Pião de Mão",
            pt: "Hand Spin",
            description: "A one-handed spin while in a handstand or queda de rins-like position. The legs spin around while one or both hands are on the ground.",
            cues: ["Start from queda de rins or bananeira", "Whip the legs to initiate the spin", "Shift weight to one hand", "Use momentum — don't muscle it"],
            milestone: "Full 360° spin on one hand, landing controlled",
          }
        ]
      },
      {
        name: "Intermediate",
        subtitle: "Aerial & Dynamic Flow",
        skills: [
          {
            name: "Mortal (Back Flip)",
            pt: "Backflip",
            description: "The standing back flip. In capoeira, timing matters — you don't just throw mortals randomly. It should flow from the game or punctuate a moment.",
            cues: ["Jump UP not back — height is safety", "Tuck knees to chest aggressively at the peak", "Spot the ground before you land", "Land on the balls of your feet, knees absorbing"],
            milestone: "Consistent standing back flip from flat ground",
          },
          {
            name: "Mortal de Frente (Front Flip)",
            pt: "Front Flip",
            description: "Standing front flip. Less common than back flip in the roda but impressive and useful for entering or dramatic emphasis.",
            cues: ["Swing arms up for height", "Tuck chin, drive knees to chest", "Rotate around your center — don't dive forward", "Spot the landing — open up from the tuck before contact"],
            milestone: "Clean standing front tuck from flat ground",
          },
          {
            name: "Aú de Coluna (Back Walkover)",
            pt: "Spine Cartwheel",
            description: "A slow, arching back walkover through handstand. Requires good backbend flexibility. Elegant and controlled.",
            cues: ["Reach back, bridge through handstand", "Pass through bananeira position with an arched back", "Legs go one at a time — slow and controlled", "Requires solid back and shoulder flexibility"],
            milestone: "Smooth back walkover from standing",
          },
          {
            name: "Reversão",
            pt: "Reversal / Kip-Up",
            description: "From your back, explode up to standing in one motion. Getting up off the ground with style and speed.",
            cues: ["Roll back slightly to load the spring", "Throw arms and legs simultaneously", "Hip thrust provides the lift", "Land with feet under you, ready to ginga"],
            milestone: "Kip-up from flat on back to standing, no hesitation",
          }
        ]
      },
      {
        name: "Advanced",
        subtitle: "Mastery of Flight",
        skills: [
          {
            name: "Parafuso (Corkscrew)",
            pt: "Corkscrew",
            description: "A twisting aerial that corkscrews through the air. Can be done as kick or as pure floreio. One of the most impressive movements in capoeira.",
            cues: ["Wind up with a strong step and arm swing", "Jump and twist simultaneously", "The body corkscrews — legs follow the torso", "Land facing the direction you started — complete the rotation"],
            milestone: "Full parafuso with clean rotation and landing",
          },
          {
            name: "Mortal de Costas com Pirueta",
            pt: "Back Flip with Twist",
            description: "A back flip with a full 360° twist added. Combines height, rotation, and spatial awareness.",
            cues: ["Get maximum height first — twist comes second", "Initiate twist with shoulders and head turn", "Spot your landing through the twist", "Master the backflip completely before adding twist"],
            milestone: "Back full with consistent landing",
          },
          {
            name: "Folha Seca",
            pt: "Dry Leaf",
            description: "A falling leaf — a no-hand trick where the body arcs backward and the legs sweep overhead like a leaf falling from a tree. Hypnotic and beautiful.",
            cues: ["Similar to a gainer from standing", "Arch back and let the legs sweep over", "Arms stay wide like a falling leaf", "Landing requires spotting the ground through the arch"],
            milestone: "Controlled folha seca with soft landing",
          },
          {
            name: "Aú Chibata",
            pt: "Whip Cartwheel",
            description: "A fast, low cartwheel that whips through with incredible speed, often incorporating a kick. The body barely goes vertical — it's a horizontal whip.",
            cues: ["Stay low — don't go fully vertical", "Speed is everything — drive through fast", "Can include a kick mid-rotation", "Land ready to continue the flow"],
            milestone: "Fast aú chibata transitioning immediately into a kick or ginga",
          }
        ]
      }
    ]
  },
  ground: {
    name: "Jogo de Chão",
    subtitle: "Ground Game & Esquivas",
    icon: "🌍",
    hue: 45,
    accent: "#C4943F",
    accentAlt: "#E8B84F",
    glow: "rgba(196,148,63,0.3)",
    description: "Esquivas, rasteiras, sweeps & the art of playing low — where malícia lives",
    levels: [
      {
        name: "Fundamentos",
        subtitle: "Learning to Dodge",
        skills: [
          {
            name: "Cocorinha",
            pt: "Squat Dodge",
            description: "The most basic esquiva (dodge). A deep squat with one arm protecting the face. Simple, effective, and fundamental to every game.",
            cues: ["Drop straight down — fast", "One hand protects the face, other can touch the ground", "Feet flat if possible — stay stable", "Eyes on your opponent — always"],
            milestone: "Instant cocorinha reaction to kicks from both sides",
          },
          {
            name: "Esquiva Lateral",
            pt: "Lateral Dodge",
            description: "Dodge to the side by dropping low and leaning away from the kick. One hand on the ground for support.",
            cues: ["Drop low and lean to one side", "Supporting hand plants on the ground", "Other arm protects the head", "Weight stays centered — don't fall over"],
            milestone: "Fluid esquiva lateral to both sides from ginga",
          },
          {
            name: "Negativa",
            pt: "Negative / Low Escape",
            description: "Drop one leg extended, sit on the opposite heel, one hand on the floor, other hand protecting face. This is where you reload — many attacks and transitions start from here.",
            cues: ["Extended leg stays slightly bent — not locked", "Sit deep on the support heel", "Support hand same side as extended leg", "Guard hand up — always protecting"],
            milestone: "Comfortable negativa on both sides, flowing into rolê or attack",
          },
          {
            name: "Resistência",
            pt: "Resistance / Low Bridge",
            description: "A back-leaning escape where you bridge backward, often one hand on the ground. Used to dodge low attacks or set up counterattacks.",
            cues: ["Lean back from the waist, one hand reaches behind to the ground", "Legs stay bent, feet planted", "Hips stay forward if possible", "From here you can kick, sweep, or roll out"],
            milestone: "Quick resistência from standing, both sides, returning to ginga",
          }
        ]
      },
      {
        name: "Sweeps & Takedowns",
        subtitle: "Pulling the Rug Out",
        skills: [
          {
            name: "Rasteira",
            pt: "Sweep / Drag",
            description: "THE capoeira sweep. Hook your foot behind your opponent's supporting ankle and pull. Timing is everything — sweep when they're committed to a kick.",
            cues: ["Time it when their weight is on one foot", "Hook behind the ankle with your instep", "Pull toward you as you push their upper body the other way", "Follow through — half-rasteiras just annoy people"],
            milestone: "Successful rasteira on a training partner during a game",
          },
          {
            name: "Banda",
            pt: "Band / Trip",
            description: "Step behind your opponent's leg and trip them using your body momentum. Less of a sweep, more of a block-and-push.",
            cues: ["Step your leg behind their supporting leg", "Block their ankle or calf", "Simultaneously push with your hand or body", "Works best when they're stepping forward"],
            milestone: "Clean banda from ginga, setting up with a fake kick first",
          },
          {
            name: "Vingativa",
            pt: "Revenge",
            description: "A takedown where you enter close, hook behind their leg, and push with your shoulder or chest. Named 'revenge' for a reason.",
            cues: ["Close the distance fast — enter after dodging a kick", "Hook behind their knee with your leg", "Push their upper body with your shoulder/chest", "They go down, you stay up"],
            milestone: "Vingativa from esquiva, flowing from defense to takedown",
          },
          {
            name: "Tesoura",
            pt: "Scissors",
            description: "A scissor takedown using your legs to trap your opponent's leg or body. Can be done from the ground or while jumping. Spectacular and effective.",
            cues: ["Jump or drop, wrapping legs around opponent's leg", "One leg in front, one behind — scissor action", "Twist or squeeze to bring them down", "Advanced: flying tesoura from aú"],
            milestone: "Tesoura from the ground, successfully trapping a partner",
          }
        ]
      },
      {
        name: "Intermediate",
        subtitle: "Malícia & Game Sense",
        skills: [
          {
            name: "Chamadas",
            pt: "Calls / Ritual Invitations",
            description: "Ritualized movements in the roda — you 'call' your opponent close, creating a dialogue. Tests trust, awareness, and understanding of capoeira traditions.",
            cues: ["Open your arms and step forward", "Your opponent mirrors and approaches", "Walk together in close proximity", "Be ready — attacks can come during or after chamada"],
            milestone: "Execute and respond to chamadas in a roda with awareness",
          },
          {
            name: "Troca de Negativa",
            pt: "Negativa Exchange",
            description: "A hop that switches your negativa from one side to the other. Quick, low, and disorienting. Repositions you and creates attack opportunities.",
            cues: ["From negativa, hop and switch the extended leg", "Guard hand switches too", "Stay as low as possible during the switch", "Use it to dodge a sweep or reposition"],
            milestone: "Rapid troca switching 3-4 times while maintaining low position",
          },
          {
            name: "Rasteira de Mão",
            pt: "Hand Sweep",
            description: "A sweep using your hand instead of foot. While in negativa or low position, grab the opponent's ankle and pull during their kick.",
            cues: ["You must be low — negativa or similar position", "Time the grab when they commit to a kick", "Pull the supporting foot toward you, fast", "Can also push the kicking leg to amplify imbalance"],
            milestone: "Successful hand sweep during live roda play",
          },
          {
            name: "Aú de Cabeça com Rolê",
            pt: "Headstand Roll Transition",
            description: "From a headstand or aú, transition into a ground roll. Flow between vertical and horizontal planes seamlessly. This is what makes a ground game beautiful.",
            cues: ["From aú or bananeira, lower controlled into a roll", "Use momentum — don't crash", "Emerge into negativa, cocorinha, or standing", "Practice the transition slowly before adding speed"],
            milestone: "Seamless aú → headstand → rolê → negativa flow",
          }
        ]
      },
      {
        name: "Advanced",
        subtitle: "The Complete Capoeirista",
        skills: [
          {
            name: "Jogo de Dentro (Inside Game)",
            pt: "Playing Inside",
            description: "Playing extremely close to your opponent — inside striking range. This is where malícia, takedowns, and cabeçadas (headbutts) live. The truest test of a capoeirista.",
            cues: ["Stay close — resist the urge to create distance", "Every movement is both attack and defense", "Use shoulder bumps, headbutts, and close-range kicks", "Read your opponent's weight distribution constantly"],
            milestone: "Play a full game primarily inside, using takedowns and close range",
          },
          {
            name: "Chapéu de Couro",
            pt: "Leather Hat",
            description: "A dramatic ground-level movement where you swing over your opponent who is on the ground. Leapfrog meets cartwheel. Shows dominance and control.",
            cues: ["Opponent is low or on the ground", "Jump and arc over them using one or both hands", "Legs clear their body completely", "Land on the other side, ready to continue"],
            milestone: "Chapéu de couro over a partner cleanly during a game",
          },
          {
            name: "Cabeçada",
            pt: "Headbutt",
            description: "One of the oldest techniques in capoeira. A controlled headbutt to the chest, used close range. Not about force — about timing and surprise.",
            cues: ["Use the top of the forehead — never the face", "Enter from a low position — negativa, esquiva", "Drive upward through the legs, head contacts chest", "More of a push than a strike — control is key"],
            milestone: "Controlled cabeçada entry from esquiva in a game",
          },
          {
            name: "Fluxo Completo (Complete Flow)",
            pt: "Total Game Integration",
            description: "The ultimate goal: seamless flow between standing kicks, ground game, sweeps, floreios, and malícia. Not individual moves but an unbroken conversation with your body and your opponent.",
            cues: ["Stop thinking in individual moves — think in phrases", "Every dodge should contain a counter", "Every attack should set up the next movement", "Play with rhythm changes — fast/slow, high/low, in/out"],
            milestone: "Play a 3-minute roda game using all paths — kicks, ground, floreios, takedowns — seamlessly",
          }
        ]
      }
    ]
  },
  music: {
    name: "Música & Cultura",
    subtitle: "Music, Songs & History",
    icon: "🎵",
    hue: 280,
    accent: "#8B5FA8",
    accentAlt: "#B07ACC",
    glow: "rgba(139,95,168,0.3)",
    description: "Berimbau, pandeiro, atabaque, cantigas — the soul that drives the roda",
    levels: [
      {
        name: "Fundamentos",
        subtitle: "Finding the Rhythm",
        skills: [
          {
            name: "Rhythm & Clapping (Palmas)",
            pt: "Clapping",
            description: "Before you touch an instrument, feel the rhythm. Palmas (clapping) in the roda follows specific patterns. If you can clap on beat, you can play.",
            cues: ["Listen to the berimbau — it sets the rhythm", "Clap on the strong beats — not randomly", "Two main patterns: palm-to-palm (sharp) and cupped (deep)", "Practice with recorded rodas — clap along"],
            milestone: "Maintain steady palmas through an entire roda without losing the beat",
          },
          {
            name: "Basic Capoeira Songs (Corridos)",
            pt: "Corridos",
            description: "Corridos are the call-and-response songs during the game. The leader sings a line, the roda responds. Learn 5-10 basic corridos by heart.",
            cues: ["Start with: 'Paranauê,' 'Volta do Mundo,' 'Sai Sai Catarina'", "Learn the chorus first — that's what you sing in the roda", "Pronunciation matters — learn the Portuguese", "Sing with energy — this isn't background music"],
            milestone: "Sing the chorus of 10 corridos from memory during a roda",
          },
          {
            name: "Ladainhas (Opening Songs)",
            pt: "Litanies",
            description: "The slow, storytelling songs sung at the opening of a roda, usually by the most senior player. They tell of capoeira history, legends, and life lessons.",
            cues: ["Ladainha is sung solo — everyone listens", "The roda doesn't start until the ladainha ends", "Learn at least 3 ladainhas", "Understand the stories — they carry the history"],
            milestone: "Sing one complete ladainha from memory with correct melody and Portuguese",
          },
          {
            name: "Pandeiro (Tambourine)",
            pt: "Tambourine",
            description: "The pandeiro provides the rhythmic backbone of the bateria. Held in one hand, struck with the other. Multiple tones possible.",
            cues: ["Three basic sounds: open (thumb), closed (fingertips), slap (palm)", "The basic samba rhythm: thumb-tip-slap-tip", "Keep the pandeiro tilted slightly", "Wrist movement — don't slap with the whole arm"],
            milestone: "Play basic pandeiro rhythm for 5 minutes without losing the beat",
          }
        ]
      },
      {
        name: "Instruments",
        subtitle: "The Bateria",
        skills: [
          {
            name: "Atabaque",
            pt: "Conga-style Drum",
            description: "The tall drum that anchors the rhythm. Play with hands using three tones: open, closed, and slap. The heartbeat of the roda.",
            cues: ["Open tone: flat fingers near the edge", "Closed tone: press and hold in the center", "Slap: cupped hand strike near the edge", "Maintain steady rhythm — the roda depends on you"],
            milestone: "Play atabaque rhythm for a full roda (10+ minutes)",
          },
          {
            name: "Berimbau — Holding & Striking",
            pt: "Berimbau Basics",
            description: "The master instrument of capoeira. A single-string bow with a gourd resonator. Hold the stone (pedra), press the string, and strike with the stick (baqueta).",
            cues: ["Left hand holds berimbau, stone (dobrão), and gourd", "Right hand holds baqueta and caxixi", "Three tones: open (solto), closed (preso), buzz (chiado)", "The gourd opens and closes against your belly for resonance"],
            milestone: "Produce all three clean tones consistently",
          },
          {
            name: "Berimbau — Toque de Angola",
            pt: "Angola Rhythm",
            description: "The slow, methodical rhythm of Capoeira Angola. Deep, grounded, meditative. Dictates a slow, strategic game full of malícia.",
            cues: ["Slow tempo — don't rush", "The rhythm cycles: Tch-Tch-DONG-DING", "Alternating open and closed tones", "Feel the weight of each note — it controls the roda"],
            milestone: "Play toque de Angola for 5 minutes maintaining steady tempo",
          },
          {
            name: "Berimbau — Toque de São Bento Grande",
            pt: "São Bento Grande Rhythm",
            description: "The fast rhythm of Regional. This is the toque that drives the athletic, kick-heavy game most people associate with capoeira. Energetic and driving.",
            cues: ["Faster tempo — builds energy in the roda", "More complex pattern than Angola", "The buzz tone features heavily", "This toque drives the energy in most Regional rodas"],
            milestone: "Play São Bento Grande for 5 minutes with speed and consistency",
          }
        ]
      },
      {
        name: "Intermediate",
        subtitle: "Leading & Understanding",
        skills: [
          {
            name: "Singing Ladainha Solo",
            pt: "Solo Opening Song",
            description: "Stand up in the roda, pick up the gunga, and sing a ladainha from your heart. This is leadership. You set the tone for the entire roda.",
            cues: ["Choose a ladainha you feel deeply", "Project your voice — own the space", "The roda is silent during your ladainha", "After ladainha, transition smoothly into the chula and corrido"],
            milestone: "Open a roda with a full ladainha + chula + corrido transition, confidently",
          },
          {
            name: "Berimbau — Multiple Toques",
            pt: "Multiple Rhythms",
            description: "Learn the full range of toques: Angola, São Bento Pequeno, São Bento Grande, Amazonas, Iuna, Santa Maria, Cavalaria. Each dictates a different game.",
            cues: ["Each toque changes the energy of the roda", "Iuna: only graduated students play", "Cavalaria: warning rhythm (historically warning of police)", "Practice switching between toques without stopping"],
            milestone: "Play 5 different toques and explain when each is used",
          },
          {
            name: "Capoeira History",
            pt: "History & Origins",
            description: "Know the history: enslaved Africans in Brazil, engolo from Angola, the persecution era, legalization, Mestre Bimba and Regional, Mestre Pastinha and Angola, and the growth of the modern capoeira community worldwide.",
            cues: ["Study the African roots — particularly engolo from Angola", "Understand why capoeira was criminalized (and when)", "Mestre Bimba (Regional) vs Mestre Pastinha (Angola)", "Learn about your own group's lineage and mestres"],
            milestone: "Explain capoeira's history from African origins to the modern era to a newcomer",
          },
          {
            name: "Portuguese for Capoeira",
            pt: "Language",
            description: "Understand what you're singing. Learn the key Portuguese terms, phrases in songs, and basic conversation relevant to capoeira.",
            cues: ["Movement names: know what every name means", "Song vocabulary: axé, mandinga, malícia, dendê, berimbau", "Basic phrases: 'Joga bonito,' 'Iê, volta do mundo'", "Understanding lyrics transforms your connection to the music"],
            milestone: "Translate and explain 10 full capoeira songs",
          }
        ]
      },
      {
        name: "Advanced",
        subtitle: "Mestre's Path",
        skills: [
          {
            name: "Composing Songs",
            pt: "Song Creation",
            description: "Write your own ladainhas and corridos. Draw from your personal capoeira journey, your mestre's teachings, and the tradition. Original songs carry your story forward.",
            cues: ["Follow traditional structures — ladainha, chula, corrido", "Draw from real experiences and feelings", "Respect the tradition while adding your voice", "Test your songs in the roda — they need to work live"],
            milestone: "Compose and perform an original ladainha in a roda",
          },
          {
            name: "Commanding the Bateria",
            pt: "Musical Direction",
            description: "Lead the entire musical ensemble. Control the energy of the roda through your berimbau, change toques to shift the game, call songs that match the moment.",
            cues: ["The gunga player is the conductor of the roda", "Change toques to change the energy — faster, slower, different game", "Call songs that match or contrast with what's happening", "Start and end games with the berimbau"],
            milestone: "Command a full roda bateria for 30+ minutes, managing energy and transitions",
          },
          {
            name: "Understanding Fundamentos",
            pt: "Deep Principles",
            description: "Beyond technique: understand mandinga (magic/sorcery in movement), malícia (cunning/deception), axé (vital force), and dendê (the flavor of capoeira). These are what separate a technician from a capoeirista.",
            cues: ["Mandinga cannot be taught — it emerges from deep practice", "Malícia is reading intention before action", "Axé is the energy you bring and the energy the roda creates", "Dendê is style, flavor, your unique expression"],
            milestone: "Demonstrate mandinga and malícia in the roda — your mestre will tell you when you have it",
          },
          {
            name: "Your Group's Philosophy & Community",
            pt: "Group Values",
            description: "Understand and embody your group's philosophy: the relentless pursuit of technical mastery, the cycle of learning and teaching, community building, and using capoeira as a tool for personal and social growth.",
            cues: ["Study your mestre's teachings and lineage", "The cord system represents growth — each color has meaning", "Teaching is part of growth — give back to the group", "Capoeira is a vehicle for social transformation"],
            milestone: "Articulate your group's philosophy and how it shapes your practice and life",
          }
        ]
      }
    ]
  }
};

// ── ANGOLA TRAINING PATHS ──
const ANGOLA_PATHS = {
  ginga_angola: {
    name: "Ginga de Angola",
    subtitle: "Movement & Foundation",
    icon: "🌊",
    hue: 200,
    accent: "#2D8B7A",
    accentAlt: "#4DB8A4",
    glow: "rgba(45,139,122,0.3)",
    description: "The low, flowing ginga of Angola — deception, patience, and ancestral roots",
    levels: [
      {
        name: "Fundamentos",
        subtitle: "The Root Movements",
        skills: [
          {
            name: "Ginga de Angola",
            pt: "The Angola Swing",
            description: "Lower, wider, and more deceptive than Regional ginga. Your body stays close to the ground, weight shifts are subtle, and every movement is a question waiting for an answer. The Angola ginga is a conversation, not a monologue.",
            cues: ["Stay low — bend deep in the knees, center of gravity near the ground", "Wider base than Regional — feet spread, rooted stance", "Arms move deliberately — each hand position is protection AND deception", "The rhythm comes from within — listen to the berimbau, let it guide your movement"],
            milestone: "Fluid, low Angola ginga for 5 minutes with natural chamadas and variations",
          },
          {
            name: "Negativa",
            pt: "The Denial / Low Escape",
            description: "The foundation of Angola's ground game. One leg extended, one bent underneath you, hand on the ground, body low. It's a dodge, a rest, a trap — all at once. In Angola, the negativa is where you think.",
            cues: ["Sit deep — one leg extended, same-side arm on the ground", "Keep your eyes on your opponent — the negativa is not a retreat", "Chin protected by the raised arm", "Learn to enter and exit negativa fluidly from ginga"],
            milestone: "Enter negativa from ginga to both sides smoothly, hold for 10 seconds with control",
          },
          {
            name: "Rolê",
            pt: "The Roll / Ground Transition",
            description: "How you move on the ground. A circular ground movement where your body rolls around a central point. In Angola, the rolê is your primary transportation — you don't stand up and walk, you rolê.",
            cues: ["Hands planted, body rotates around them", "Legs sweep close to the ground — controlled, not wild", "Eyes always track your opponent through the rotation", "Chain rolês together to cover distance while staying low"],
            milestone: "Continuous rolê in both directions, transitioning smoothly in and out of negativa",
          },
          {
            name: "Chamada",
            pt: "The Call",
            description: "Unique to Angola. One player stops and 'calls' the other by opening their arms. The other must approach carefully — it's a test of trust, awareness, and malícia. The chamada is a ritual within the game.",
            cues: ["The caller opens arms wide, stands tall and still", "The responder approaches slowly, carefully — never rushing", "Eye contact is constant — this is a moment of deep connection", "The exit is the most dangerous part — stay alert for the unexpected"],
            milestone: "Initiate and respond to chamadas with awareness and proper ritualistic form",
          }
        ]
      },
      {
        name: "Ataques",
        subtitle: "Angola Attacks",
        skills: [
          {
            name: "Rabo de Arraia",
            pt: "Stingray Tail",
            description: "The signature kick of Angola. A spinning low kick delivered from the ground, sweeping like a stingray's tail. Beautiful, deceptive, and devastating when it connects.",
            cues: ["Start from negativa or a low squat position", "Hand plants as the body spins, leg sweeps in a wide arc", "Stay low — the kick should pass at shin to knee height", "The spin continues into your next movement — never stop"],
            milestone: "Clean rabo de arraia from negativa, both directions, with full rotation and recovery",
          },
          {
            name: "Cabeçada",
            pt: "Headbutt",
            description: "The headbutt. In Angola, the cabeçada is a legitimate and respected attack. Delivered from a low position, rising up into the opponent's body. It requires timing, proximity, and courage.",
            cues: ["Rise from a low position — the power comes from your legs driving upward", "Forehead or top of the skull makes contact — never the face", "Timing is everything — enter when your opponent is open and close", "Follow through with your whole body, not just your head"],
            milestone: "Execute controlled cabeçada from negativa, rising into standing position",
          },
          {
            name: "Rasteira",
            pt: "The Sweep",
            description: "Foot sweeps are the bread and butter of Angola. When your opponent's weight is on one foot, you take it away. Simple concept, lifetime of mastery. In Angola, the rasteira is an art form.",
            cues: ["Read the weight transfer — sweep the loaded foot", "Your sweeping foot hooks behind their ankle, pulling toward you", "Timing over power — a well-timed rasteira needs no force", "Stay balanced on your support leg — don't fall chasing the sweep"],
            milestone: "Successfully time rasteiras during jogo, reading weight shifts naturally",
          },
          {
            name: "Vingativa",
            pt: "The Vindictive One",
            description: "A body takedown unique to Angola. You trap your opponent's leg with yours while pushing their upper body in the opposite direction. It's a lesson in leverage and malícia.",
            cues: ["Enter when close — inside your opponent's space", "Your leg hooks behind theirs as your body presses forward", "The push is diagonal — chest into their shoulder", "Control the fall — this is a takedown, not an assault"],
            milestone: "Execute vingativa from close jogo with control and proper body mechanics",
          }
        ]
      },
      {
        name: "Jogo",
        subtitle: "The Angola Game",
        skills: [
          {
            name: "Jogo de Dentro",
            pt: "Inside Game",
            description: "Playing close. In Angola, the game happens inside — face to face, body to body. The jogo de dentro is where malícia lives. You must be comfortable being uncomfortable, close enough to smell your opponent's sweat.",
            cues: ["Stay in range — don't retreat to comfort", "Use small, precise movements — no wide wild swings", "Your head, hands, and knees are your tools at this range", "Read intention through proximity — feel what they're about to do"],
            milestone: "Maintain close-range jogo for a full toque without retreating to distance",
          },
          {
            name: "Malandragem",
            pt: "Street Smarts / Trickery",
            description: "The art of deception in the roda. False movements, traps, theatrical gestures that hide real intentions. In Angola, the cleverest player wins, not the strongest. Malandragem is intelligence made physical.",
            cues: ["Fake a movement and do the opposite — train your body to lie", "Use rhythm changes to disrupt your opponent's timing", "The best malandro makes their opponent feel safe right before the trap", "Study the old mestres — watch videos of Mestre Pastinha, João Grande, Moraes"],
            milestone: "Successfully set up and execute deceptive sequences in the roda",
          },
          {
            name: "Volta ao Mundo",
            pt: "Trip Around the World",
            description: "The reset. When a player initiates the volta ao mundo, both players walk the circle of the roda. It's a moment to breathe, to reset, to reflect. In Angola, it happens naturally and frequently — it's part of the ritual.",
            cues: ["Walk the circle calmly — this is not a race", "Stay aware — the game can restart at any moment", "Use this time to read your opponent, catch your breath, plan your next approach", "Respect the ritual — volta ao mundo is sacred space"],
            milestone: "Initiate and respond to volta ao mundo with proper ritual awareness",
          },
          {
            name: "Playing with the Berimbau",
            pt: "Jogo ao Pé do Berimbau",
            description: "The game at the foot of the berimbau. This is where the jogo begins and ends. In Angola, the ritual of entering and exiting the roda is as important as the game itself. You buy the game, you play, you return.",
            cues: ["Crouch at the foot of the berimbau — make the sign of the cross or your personal ritual", "Wait for the berimbau to 'release' you into the roda", "When exiting, return to the berimbau and acknowledge it", "The berimbau commands the roda — always listen, always respect"],
            milestone: "Enter and exit the roda with full ritual awareness and proper form",
          }
        ]
      },
      {
        name: "Ancestralidade",
        subtitle: "Roots & Mastery",
        skills: [
          {
            name: "Mandinga",
            pt: "Sorcery / Magic",
            description: "The invisible force in capoeira Angola. Mandinga is the magic that cannot be taught — it emerges from deep, devoted practice. It's in the eyes, the timing, the way you make your opponent see ghosts. Old mestres say mandinga comes from the ancestors.",
            cues: ["Mandinga is not a technique — it's a quality of movement and intention", "Study with a mestre who carries mandinga — it's transmitted, not learned from books", "Spend time in the roda watching, absorbing — mandinga enters through the eyes", "Be patient — mandinga comes when you stop trying to force it"],
            milestone: "Your mestre will tell you when they see mandinga in your game",
          },
          {
            name: "Ladainha Composition",
            pt: "Creating Your Song",
            description: "Write your own ladainha. In Angola, singing is not optional — it's essential. A ladainha tells a story, honors the ancestors, teaches a lesson. When you compose your own, you add your voice to centuries of tradition.",
            cues: ["Study the classic ladainhas — understand their structure and storytelling", "Write from your own experience — authenticity matters more than poetry", "Practice singing solo — your voice must carry the roda", "A good ladainha makes people feel something — aim for the heart"],
            milestone: "Compose and perform your own ladainha that moves the roda",
          },
          {
            name: "Fundamentos Filosóficos",
            pt: "Philosophical Foundations",
            description: "Understand the philosophy of Angola. Mestre Pastinha's teachings, the African roots in Candomblé and Bantu traditions, the meaning of the roda as a microcosm of life. Angola is not just a fighting style — it's a worldview.",
            cues: ["Read Mestre Pastinha's writings — 'Capoeira Angola' is essential", "Understand the connection to Candomblé and African spiritual traditions", "The roda is life: you face opponents, make allies, fall and rise, and the music never stops", "Study the lineage — know where your Angola comes from"],
            milestone: "Articulate the philosophical foundations of Angola to a newcomer with depth and feeling",
          },
          {
            name: "Roda Leadership",
            pt: "Commanding the Roda",
            description: "Lead an Angola roda. This means commanding the bateria, singing the opening ladainha, controlling the energy of the games, knowing when to call volta ao mundo, and maintaining the sacred space. In Angola, the roda leader is a spiritual guide.",
            cues: ["The gunga (big berimbau) leads — learn to command from the instrument", "Set the energy with your ladainha — the roda follows your intention", "Watch every game — intervene when necessary, let flow when the jogo is good", "Hold the space — an Angola roda is ceremony, and you are the conductor"],
            milestone: "Lead a complete Angola roda from opening ladainha through all games to closing",
          }
        ]
      }
    ]
  },
  angola_music: {
    name: "Música de Angola",
    subtitle: "The Angola Sound",
    icon: "🎶",
    hue: 300,
    accent: "#7B5EA7",
    accentAlt: "#A07BD4",
    glow: "rgba(123,94,167,0.3)",
    description: "The berimbau guides everything — master the toques, songs, and rhythms of Angola",
    levels: [
      {
        name: "Fundamentos",
        subtitle: "First Sounds",
        skills: [
          {
            name: "Toque de Angola",
            pt: "The Angola Rhythm",
            description: "The fundamental toque. Slow, deep, hypnotic. This is the rhythm that defines capoeira Angola — it sets the pace for the low, strategic game. Learn to feel it in your bones before you play it.",
            cues: ["Slow tempo — the berimbau breathes, it doesn't rush", "Deep resonant tone — let the cabaça amplify", "The pattern is simple but the feel is everything", "Close your eyes and let the toque pull you into the roda"],
            milestone: "Play toque de Angola for 10 minutes with consistent rhythm and tone",
          },
          {
            name: "Palmas de Angola",
            pt: "Angola Clapping",
            description: "The clapping patterns in Angola are different — slower, more deliberate, deeply connected to the berimbau rhythm. Your palmas are your voice when you're not singing. They carry the energy of the roda.",
            cues: ["Match the berimbau tempo — don't rush ahead", "Cupped hands for deep tones, flat for sharp", "Feel the communal rhythm — your palmas merge with everyone else's", "Palmas are participation — you're part of the roda even from the outside"],
            milestone: "Maintain proper Angola palmas rhythm for a full roda session",
          },
          {
            name: "Corridos de Angola",
            pt: "Angola Response Songs",
            description: "The call-and-response songs of Angola. The soloist sings a line, the roda responds. In Angola, the corridos are often slower and more melodic than in Regional. Learn the classic ones first.",
            cues: ["Listen first — learn the responses before trying to lead", "Sing from the diaphragm — Angola singing needs depth, not volume", "Learn the Portuguese — understand what you're singing", "The corrido sets the mood — choose songs that match the game's energy"],
            milestone: "Know 10 traditional Angola corridos and sing the responses confidently",
          }
        ]
      },
      {
        name: "Bateria",
        subtitle: "The Orchestra",
        skills: [
          {
            name: "Three Berimbaus",
            pt: "Gunga, Médio, Viola",
            description: "In Angola, the bateria has three berimbaus: the gunga (bass, leader), the médio (middle, complementary), and the viola (high, improvisational). Understanding their roles is understanding the hierarchy of the roda.",
            cues: ["Gunga: deepest tone, sets the tempo, commands the roda", "Médio: middle register, plays the complementary rhythm", "Viola: highest pitch, improvises and ornaments around the base rhythm", "The three berimbaus create a conversation — learn to listen to all three"],
            milestone: "Play each berimbau role (gunga, médio, viola) in the Angola bateria",
          },
          {
            name: "Pandeiro de Angola",
            pt: "Angola Tambourine",
            description: "The pandeiro in Angola follows a more traditional pattern. Less flashy than in Regional, but the groove must be solid and locked into the berimbau's tempo. The pandeiro is the heartbeat under the melody.",
            cues: ["Thumb, fingers, palm — master the three basic strokes", "Lock into the berimbau tempo — don't lead, support", "Subtle variations keep it alive without overpowering", "In Angola, the pandeiro whispers — it doesn't shout"],
            milestone: "Hold steady Angola pandeiro pattern for a full roda",
          },
          {
            name: "Atabaque",
            pt: "Sacred Drum",
            description: "The atabaque connects capoeira to its African and Candomblé roots. In Angola, the atabaque is essential — its deep pulse anchors everything. Playing atabaque is a privilege and a responsibility.",
            cues: ["Open tone (edge), slap (center), and bass (muffled) — three voices from one drum", "The atabaque follows the berimbau — never overpower it", "Feel the rhythm in your whole body, not just your hands", "This drum connects you to centuries of African tradition — play with reverence"],
            milestone: "Play atabaque in the Angola bateria with proper rhythm and dynamics",
          }
        ]
      },
      {
        name: "Canto",
        subtitle: "Song & Voice",
        skills: [
          {
            name: "Ladainha",
            pt: "The Solo Opening Prayer",
            description: "The ladainha opens the Angola roda. Sung solo by the most senior player or the roda leader, it tells a story — of capoeira, of life, of struggle and beauty. During the ladainha, no one plays. Everyone listens.",
            cues: ["Memorize at least 5 traditional ladainhas", "The melody is free — each singer brings their own interpretation", "Tell the story with feeling — a ladainha without emotion is empty", "Your voice doesn't need to be perfect — it needs to be honest"],
            milestone: "Sing 5 ladainhas from memory with proper melody and feeling",
          },
          {
            name: "Chula",
            pt: "The Bridge Song",
            description: "After the ladainha comes the chula — the transition into the game. 'Iê, volta do mundo, camará!' The chula calls the roda to attention and signals that the game is about to begin. It's the bridge between prayer and play.",
            cues: ["The chula follows specific traditional phrases", "The roda responds to each line — call and response", "Energy builds through the chula — from contemplative ladainha to active game", "Master the timing — the game begins at the right moment, not too early"],
            milestone: "Lead the transition from ladainha through chula into the game",
          },
          {
            name: "Singing While Playing",
            pt: "Cantar e Jogar",
            description: "In Angola, the game and the music are inseparable. The ultimate skill is to play berimbau, sing, and participate in the energy of the roda all at once. Your body, your voice, and the instrument become one.",
            cues: ["Start by humming the corrido while playing berimbau", "Build to singing full verses while maintaining the toque", "Your breathing must be controlled — sing from the diaphragm while your arms work", "This is meditation in action — total presence"],
            milestone: "Lead corridos while playing berimbau without losing rhythm or melody",
          }
        ]
      }
    ]
  }
};

// ── KIDS TRAINING PATHS ──
const KIDS_PATHS = {
  moves: {
    name: "Pequeno Guerreiro",
    subtitle: "Little Warrior Moves!",
    icon: "🦁",
    hue: 35,
    accent: "#FF8C42",
    accentAlt: "#FFB347",
    glow: "rgba(255,140,66,0.3)",
    description: "Learn awesome capoeira moves and become a little warrior! 💪🌟",
    levels: [
      {
        name: "Baby Steps",
        subtitle: "Your First Moves!",
        skills: [
          {
            name: "The Ginga Dance!",
            pt: "Ginga — The Swing",
            description: "This is how every capoeirista moves! It's like dancing from side to side — step back, swing your arms, and feel the rhythm. Think of it like being a tree swaying in the wind! 🌴💃",
            cues: ["Step back with one foot, then the other — like a dance!", "Swing your arms — one protects your face like a superhero shield! 🛡️", "Stay bouncy on your toes — never stand like a statue!"],
            milestone: "Dance the ginga for 1 whole minute without stopping! You're a capoeirista now!",
          },
          {
            name: "The Push Kick!",
            pt: "Bênção — The Blessing",
            description: "Push your foot forward like you're opening a really heavy door with your foot! It's the most basic kick and it's super satisfying when you get it right! 🚪💥",
            cues: ["Lift your knee up high like a flamingo! 🦩", "Push your foot out straight — like kicking a ball really far! ⚽", "Pull it back quick — don't leave your foot out there!"],
            milestone: "Do 10 push kicks without losing your balance — 5 on each side!",
          },
          {
            name: "The Crouch!",
            pt: "Cocorinha — The Squat Dodge",
            description: "Someone kicks over your head and you just... duck! Squat down like a little frog and cover your head with your hand. Simple, but it'll save you every time! 🐸",
            cues: ["Squat down low — pretend you're a tiny frog! 🐸", "One hand protects the top of your head", "Keep your eyes UP — watch what's happening!"],
            milestone: "Duck under 5 kicks from a friend without falling over!",
          },
          {
            name: "Animal Walks!",
            pt: "Walking Like Animals",
            description: "Capoeiristas move like animals! Walk like a bear 🐻, crawl like a spider 🕷️, hop like a monkey 🐒, and slither like a snake 🐍. These make you super strong and flexible!",
            cues: ["Bear walk: hands and feet on the ground, bum up high! 🐻", "Monkey hop: squat down and jump sideways like a cheeky monkey! 🐒", "Crab walk: sit down, hands behind you, walk backwards!"],
            milestone: "Do the animal walk circuit (bear, monkey, crab, spider) twice without stopping!",
          }
        ]
      },
      {
        name: "Getting Stronger",
        subtitle: "Level Up Your Skills!",
        skills: [
          {
            name: "Cartwheel!",
            pt: "Aú — The Cartwheel",
            description: "The capoeira cartwheel! It looks just like a regular cartwheel but cooler because you keep your eyes on your friend the whole time. You're upside down AND watching! 🤸‍♂️✨",
            cues: ["Hands down one at a time — like a slow-motion cartwheel", "Keep your legs apart and straight — make a big star shape! ⭐", "Look at your friend the whole time — even when you're upside down!"],
            milestone: "Do 5 cartwheels in a row on both sides!",
          },
          {
            name: "The Spinning Kick!",
            pt: "Meia Lua de Frente",
            description: "Swing your leg in a big half-circle like a rainbow! 🌈 It goes from one side allll the way to the other. It's like your leg is painting a rainbow in the air!",
            cues: ["Keep your leg straight like a stick! 🦿", "Swing it in a big arc — from outside to inside", "Don't fall over! Keep your balance on the other foot"],
            milestone: "Do the rainbow kick 5 times on each side without wobbling!",
          },
          {
            name: "The Dodge Roll!",
            pt: "Rolê — The Ground Roll",
            description: "Roll along the ground like a ninja! 🥷 Hands down, spin your body around in a circle close to the floor. It's how you escape AND get into position for your next move!",
            cues: ["Hands on the floor, body low like you're sneaking! 🥷", "Spin your legs around in a circle", "Stay smooth — no bumping or crashing!"],
            milestone: "Roll smoothly in both directions 3 times each!",
          },
          {
            name: "Playing the Game!",
            pt: "Jogo — The Game",
            description: "Now you put it all together! You and a friend take turns — one attacks, one dodges, and you keep going back and forth. It's like a conversation but with your bodies! 🗣️💬",
            cues: ["Take turns — when they kick, you dodge! When you kick, they dodge!", "Keep your ginga going the whole time — never stop moving!", "Smile and have fun — capoeira is a game, not a fight! 😄"],
            milestone: "Play a full game with a friend for 2 minutes — attack, dodge, and keep the flow!",
          }
        ]
      },
      {
        name: "Little Master",
        subtitle: "Show What You've Got!",
        skills: [
          {
            name: "The Headstand!",
            pt: "Bananeira — Banana Tree",
            description: "Go upside down like a banana tree! 🍌 It's a handstand where you balance on your hands. Start against a wall and work your way to doing it on your own. You'll feel like a superhero! 🦸",
            cues: ["Start with your hands on the floor, kick up gently against a wall", "Squeeze your tummy muscles tight — they keep you balanced! 💪", "Point your toes to the sky — make yourself as tall as possible!"],
            milestone: "Hold a headstand for 10 seconds without the wall!",
          },
          {
            name: "The Monkey Flip!",
            pt: "Macaco — The Monkey",
            description: "A backwards flip using your hands — you jump backwards over yourself like a monkey! 🐒🙃 It looks AMAZING and your friends will be SO impressed!",
            cues: ["One hand goes back to the ground behind you", "Push off your feet and flip backwards over your hand", "Land on your feet — superhero landing! 🦸‍♂️"],
            milestone: "Do a clean macaco from standing — both sides!",
          },
          {
            name: "The Hammer Kick!",
            pt: "Martelo — The Hammer",
            description: "The big powerful roundhouse kick! Swing your leg around like you're hitting a nail with a giant hammer! 🔨💥 Chamber your knee, twist your hips, and BOOM!",
            cues: ["Lift your knee up first — like loading a spring! 🔋", "Twist your whole body — power comes from the spin!", "Snap it back fast — don't leave your leg hanging out!"],
            milestone: "10 fast hammer kicks — 5 each side, head height!",
          },
          {
            name: "Your First Roda!",
            pt: "Roda — The Circle",
            description: "The roda is the big circle where everyone plays! You clap, you sing, and when it's your turn, you go in and show your moves! It's the most exciting thing ever! 🎪🎶",
            cues: ["Clap along with everyone — feel the rhythm! 👏", "When it's your turn, enter the circle with confidence!", "Play with a smile — have fun and show your personality! 🌟"],
            milestone: "Play in a real roda and have an awesome game!",
          }
        ]
      }
    ]
  },
  music_kids: {
    name: "Música Divertida",
    subtitle: "Fun Music & Songs!",
    icon: "🎪",
    hue: 320,
    accent: "#E84393",
    accentAlt: "#FD79A8",
    glow: "rgba(232,67,147,0.3)",
    description: "Clap, sing, and make music! The roda needs YOUR voice! 🎵🎤",
    levels: [
      {
        name: "Making Noise!",
        subtitle: "Your First Sounds",
        skills: [
          {
            name: "Clapping Games!",
            pt: "Palmas — Clapping",
            description: "Clap your hands to the rhythm! 👏👏 In capoeira, everyone around the circle claps together. It's like being in a giant band where clapping is your instrument!",
            cues: ["Clap on the beat — listen to the music and match it! 🎵", "Cup your hands a little for a deeper sound 🤲", "Keep going even when you're tired — the roda needs your claps!"],
            milestone: "Clap along to 3 different capoeira songs without losing the beat!",
          },
          {
            name: "Singing Together!",
            pt: "Corrido — The Songs",
            description: "When someone sings a line, everyone sings it back! It's like the most fun echo game ever! 🗣️📢 Don't worry about being perfect — just be LOUD and have fun!",
            cues: ["Listen to what the leader sings, then repeat it back! 📢", "Sing LOUD and proud — don't be shy! 🎤", "Learn the words in Portuguese — they sound SO cool!"],
            milestone: "Know 5 capoeira songs and sing the responses with the group!",
          },
          {
            name: "The Rhythm Game!",
            pt: "Ritmo — Feeling the Beat",
            description: "Can you feel the beat? Tap your knees, stomp your feet, nod your head — the music is everywhere and your whole body can dance to it! 🥁💃",
            cues: ["Close your eyes and feel the berimbau rhythm 🎶", "Tap the rhythm on your knees — can you keep it going?", "Try walking to the beat — slow when the music is slow, fast when it speeds up!"],
            milestone: "Move your whole body to the rhythm — clap, tap, and step all at once!",
          }
        ]
      },
      {
        name: "Little Musician",
        subtitle: "Play & Sing!",
        skills: [
          {
            name: "My First Berimbau!",
            pt: "Berimbau — The Magic Bow",
            description: "The berimbau is the coolest instrument ever — it's a bow with a gourd that makes magical sounds! 🏹✨ It's the boss of the roda. When the berimbau plays, everyone listens!",
            cues: ["Hold the berimbau with one hand, the baqueta (stick) in the other 🪵", "Hit the wire gently — tap tap tap to the rhythm!", "Press the dobrão (coin) against the wire to change the sound — it's like magic! ✨"],
            milestone: "Play a simple berimbau rhythm for 30 seconds without stopping!",
          },
          {
            name: "The Pandeiro!",
            pt: "Pandeiro — The Tambourine",
            description: "Shake it, tap it, slap it! 🪘 The pandeiro is like a supercharged tambourine. It jingles and booms and keeps everyone on rhythm. So satisfying to play!",
            cues: ["Hold it in one hand, tap with the other ✋", "Thumb for the bass sound, fingers for the jingle! 🎵", "Keep it steady — the pandeiro is the heartbeat of the music! ❤️"],
            milestone: "Play pandeiro for a whole song with your group!",
          },
          {
            name: "Animal Songs!",
            pt: "Cantigas de Bichos",
            description: "Capoeira has songs about everything — parrots 🦜, snakes 🐍, monkeys 🐒, and stingrays! Learn the animal songs and make the animal sounds while you sing! ROAR! 🦁",
            cues: ["Learn 'A Cobra Mordeu' (The Snake Bit!) — it's everyone's favorite! 🐍", "Make the animal noises during the song — be as silly as you want! 🐒", "Dance like the animal while you sing — be a parrot, be a monkey!"],
            milestone: "Sing 3 animal songs and teach one to a friend!",
          },
          {
            name: "Lead a Song!",
            pt: "Puxar a Cantiga",
            description: "YOU be the leader! Stand up, start singing, and everyone follows YOU! 🎤👑 It takes courage but when the whole roda sings YOUR song back to you... best feeling EVER!",
            cues: ["Pick your favorite song — one you know really well! ⭐", "Sing loud and clear so everyone can hear you! 📢", "Keep the energy up — if you're excited, everyone will be excited! 🎉"],
            milestone: "Lead a song in the roda and keep it going for at least 1 minute!",
          }
        ]
      }
    ]
  }
};

// Color palette for cord creation
const CORD_COLORS = [
  { name: "Crua", hex: "#E8DCC6" },
  { name: "Gold", hex: "#D4A843" },
  { name: "Orange", hex: "#E8652B" },
  { name: "Red", hex: "#DC2626" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Green", hex: "#16A34A" },
  { name: "Purple", hex: "#7C3AED" },
  { name: "Brown", hex: "#8B5E3C" },
  { name: "Black", hex: "#1C1C1C" },
  { name: "White", hex: "#F5F0E8" },
];


// ── Animated Background ──

const GLOBAL_TAGLINES = [
  "From Salvador to Seoul, London to Lagos",
  "From Bahia to Berlin, Nairobi to New York",
  "From Rio to Riga, Tokyo to Toronto",
  "From São Paulo to Sydney, Accra to Amsterdam",
  "From Recife to Rome, Mumbai to Melbourne",
  "From Brasília to Brooklyn, Dakar to Dublin",
];

function KineticBackground() {
  const circleColors = ["#D4A843", "#E8652B", "#2D8B7A", "#C77A29", "#A86D47", "#D4A843"];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {/* Flowing curves */}
      <svg viewBox="0 0 1200 800" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.14 }}>
        <path d="M-100 400 Q200 100 400 400 Q600 700 800 400 Q1000 100 1300 400" stroke="#D4A843" strokeWidth="4" fill="none" strokeLinecap="round">
          <animate attributeName="d" dur="20s" repeatCount="indefinite"
            values="M-100 400 Q200 100 400 400 Q600 700 800 400 Q1000 100 1300 400;
                    M-100 400 Q200 600 400 400 Q600 200 800 400 Q1000 600 1300 400;
                    M-100 400 Q200 100 400 400 Q600 700 800 400 Q1000 100 1300 400" />
        </path>
        <path d="M-100 300 Q300 500 500 300 Q700 100 900 300 Q1100 500 1300 300" stroke="#E8652B" strokeWidth="3" fill="none" strokeLinecap="round">
          <animate attributeName="d" dur="25s" repeatCount="indefinite"
            values="M-100 300 Q300 500 500 300 Q700 100 900 300 Q1100 500 1300 300;
                    M-100 300 Q300 100 500 300 Q700 500 900 300 Q1100 100 1300 300;
                    M-100 300 Q300 500 500 300 Q700 100 900 300 Q1100 500 1300 300" />
        </path>
        <path d="M-100 550 Q200 350 500 550 Q800 750 1100 550 Q1300 350 1500 550" stroke="#2D8B7A" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <animate attributeName="d" dur="30s" repeatCount="indefinite"
            values="M-100 550 Q200 350 500 550 Q800 750 1100 550 Q1300 350 1500 550;
                    M-100 550 Q200 750 500 550 Q800 350 1100 550 Q1300 750 1500 550;
                    M-100 550 Q200 350 500 550 Q800 750 1100 550 Q1300 350 1500 550" />
        </path>
      </svg>
      {/* Floating circles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 150 + i * 60,
          height: 150 + i * 60,
          borderRadius: "50%",
          border: `1.5px solid ${circleColors[i]}`,
          opacity: 0.06 + i * 0.008,
          left: `${15 + i * 14}%`,
          top: `${20 + (i % 3) * 25}%`,
          animation: `floatCircle ${18 + i * 4}s ease-in-out infinite ${i * 2}s`
        }} />
      ))}
    </div>
  );
}

function CordVisual({ color, stripe, pattern, active, small }) {
  const h = small ? 16 : 24;
  const w = small ? 60 : 90;
  let bg = color;
  if (stripe) {
    if (pattern === "gradient") bg = `linear-gradient(90deg, ${color}, ${stripe})`;
    else if (pattern === "half") bg = `linear-gradient(90deg, ${color} 50%, ${stripe} 50%)`;
    else if (pattern === "striped") bg = `repeating-linear-gradient(90deg, ${color} 0px, ${color} 6px, ${stripe} 6px, ${stripe} 12px)`;
  }
  return (
    <div style={{
      width: w, height: h, borderRadius: h / 2, position: "relative", overflow: "hidden",
      background: bg,
      boxShadow: active ? `0 0 12px ${color}88, 0 0 24px ${color}44` : "none",
      border: active ? "2px solid #fff" : "1px solid rgba(255,255,255,0.15)"
    }} />
  );
}

// ── App ──

export default function CapoeiraApp() {
  const { user, loading: authLoading, logout } = useAuth();
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Privacy policy can be shown before or after auth
  if (showPrivacy) return <PrivacyPolicy dark={!user} onBack={() => setShowPrivacy(false)} />;

  // Auth gate
  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "#FDF6EC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", color: "#8B7355" }}>
      Loading...
    </div>
  );
  if (!user) return <LoginScreen onShowPrivacy={() => setShowPrivacy(true)} />;

  return <CapoeiraAppInner user={user} logout={logout} onShowPrivacy={() => setShowPrivacy(true)} />;
}

function CapoeiraAppInner({ user, logout, onShowPrivacy }) {
  const { isPremium, requirePremium, showUpgrade, setShowUpgrade } = usePremium();
  const [view, setView] = useState("home");
  const [isKids, setIsKids] = useState(false);
  const [capoStyle, setCapoStyle] = useState("regional"); // regional | angola
  const [pathKey, setPathKey] = useState(null);
  const [levelIdx, setLevelIdx] = useState(0);
  const [skill, setSkill] = useState(null);
  const [completed, setCompleted] = useState({});
  const [fade, setFade] = useState(true);
  const [customSkills, setCustomSkills] = useState({});  // { pathKey: [skill, ...] }
  const [showAddModal, setShowAddModal] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [customDesc, setCustomDesc] = useState("");

  // Cord system state
  const [cords, setCords] = useState([]);
  const [activeCordIdx, setActiveCordIdx] = useState(null);
  const [showCordModal, setShowCordModal] = useState(false);
  const [cordName, setCordName] = useState("");
  const [cordColor, setCordColor] = useState("#D4A843");
  const [cordPattern, setCordPattern] = useState("solid"); // solid | half | striped | gradient
  const [cordStripe, setCordStripe] = useState("#E8652B");
  const [cordMeaning, setCordMeaning] = useState("");

  // Favorite songs state
  const [songs, setSongs] = useState([]);
  const [showSongModal, setShowSongModal] = useState(false);
  const [songTitle, setSongTitle] = useState("");
  const [songType, setSongType] = useState("corrido");
  const [songLyrics, setSongLyrics] = useState("");

  const addSong = () => {
    if (!songTitle.trim()) return;
    setSongs(prev => [...prev, {
      title: songTitle.trim(),
      type: songType,
      lyrics: songLyrics.trim()
    }]);
    setSongTitle(""); setSongType("corrido"); setSongLyrics(""); setShowSongModal(false);
  };

  const deleteSong = (idx) => setSongs(prev => prev.filter((_, i) => i !== idx));

  // ── Song catalog ──
  const SONG_CATALOG = [
    // Free songs
    { title: "Paranauê", type: "corrido", free: true,
      lyrics: "Paranauê, paranauê, paraná\nParanauê, paranauê, paraná" },
    { title: "Volta do Mundo", type: "corrido", free: true,
      lyrics: "Volta do mundo, camará\nQue o mundo deu, que o mundo dá\nVolta do mundo, camará" },
    { title: "Dona Maria Como Vai Você", type: "corrido", free: true,
      lyrics: "Dona Maria como vai você?\nEu vou bem, eu vou bem\nDona Maria como vai você?\nEu vou bem, graças a Deus" },
    { title: "Água de Beber", type: "ladainha", free: true,
      lyrics: "Água de beber, camará\nÁgua de beber\nÁgua de beber, camará" },
    { title: "Zum Zum Zum", type: "corrido", free: true,
      lyrics: "Zum zum zum, capoeira mata um\nZum zum zum, capoeira mata um" },
    // Premium songs
    { title: "Eu Já Vivo Enjoado", type: "corrido", free: false,
      lyrics: "Eu já vivo enjoado\nDe viver aqui na terra\nÔ mamãe eu vou pra lua\nEu já falei com a mulher" },
    { title: "A Manteiga Derramou", type: "corrido", free: false,
      lyrics: "A manteiga derramou\nQuem derramou, bota pra fora\nA manteiga derramou" },
    { title: "Toque de Angola (Ladainha)", type: "ladainha", free: false,
      lyrics: "Iê, maior é Deus\nMaior é Deus, pequeno sou eu\nO que eu tenho foi Deus quem me deu\nNa roda de capoeira, grande e pequeno sou eu" },
    { title: "Parana ê Parana", type: "corrido", free: false,
      lyrics: "Paraná ê, Paraná ê, Paraná\nCapoeira de Angola que Pastinha me ensinou" },
    { title: "Sou Eu Sou Eu", type: "corrido", free: false,
      lyrics: "Sou eu, sou eu\nSou eu, berimbau bateu\nSou eu, sou eu\nCapoeira sou eu" },
    { title: "O Navio Negreiro", type: "ladainha", free: false,
      lyrics: "O navio negreiro, trouxe pra cá\nOs escravos da África, ô meu Deus\nPra trabalhar, camará" },
    { title: "Santa Maria Mãe de Deus", type: "corrido", free: false,
      lyrics: "Santa Maria, mãe de Deus\nSanta Maria, mãe de Deus\nOlha, toma conta de mim" },
    { title: "Ai Ai Aidê", type: "corrido", free: false,
      lyrics: "Ai ai aidê\nJoga bonito que eu quero aprender\nAi ai aidê" },
    { title: "Valha Me Deus Senhor São Bento", type: "ladainha", free: false,
      lyrics: "Valha me Deus, Senhor São Bento\nA capoeira é um bom fundamento\nFoi Besouro Mangangá\nQue me ensinou a jogar" },
    { title: "Quem Vem Lá Sou Eu", type: "corrido", free: false,
      lyrics: "Quem vem lá sou eu\nQuem vem lá sou eu\nBerimbau tocou na capoeira sou eu" },
  ];

  // ── Events state ──
  const SEED_EVENTS = [
    { id: "e1", name: "Weekly Open Roda", type: "roda", date: "2026-03-01", time: "18:00", location: "Brixton Community Centre, London", scope: "local", description: "Open roda for all levels. Come play, sing, and connect. Berimbaus provided but bring your own if you have one.", organizer: "Mestre João", group: "Capoeira Mandinga", link: "", price: "Free", attendees: ["Ana", "Carlos", "Mia"] },
    { id: "e2", name: "Maculelê & Samba de Roda Workshop", type: "workshop", date: "2026-03-08", time: "14:00", location: "Dance Studio 5, Manchester", scope: "regional", description: "Deep dive into Maculelê stick dance and Samba de Roda. Learn the rhythms, songs, and movements. All levels welcome.", organizer: "Professora Leila", group: "Axé Capoeira UK", link: "", price: "£15", attendees: ["Tom", "Fatima"] },
    { id: "e3", name: "Spring Batizado & Troca de Cordas", type: "batizado", date: "2026-04-18", time: "10:00", location: "Olympic Sports Hall, Paris", scope: "national", description: "Annual batizado ceremony. Students receive their first cords, graded students advance. Special guest mestres from Brazil. 3-day event with workshops, rodas, and cultural presentations.", organizer: "Mestre Branco", group: "Capoeira Paris", link: "https://example.com/batizado", price: "€60", attendees: ["Pierre", "Camille", "Luis", "Aisha", "Yuki"] },
    { id: "e4", name: "International Capoeira Festival 2026", type: "festival", date: "2026-07-10", time: "09:00", location: "Salvador, Bahia, Brazil", scope: "global", description: "The biggest capoeira gathering of the year. 5 days of workshops with legendary mestres, massive rodas on the beach, cultural excursions, berimbau making, and the famous all-night roda. Capoeiristas from 40+ countries.", organizer: "Mestre Cobra", group: "Fundação Capoeira", link: "https://example.com/festival", price: "$200", attendees: ["Kenji", "Maria", "Jamal", "Sofia", "Chen", "Ade", "Luca", "Priya"] },
    { id: "e5", name: "Berimbau Building Workshop", type: "workshop", date: "2026-03-15", time: "11:00", location: "Hackney Arts Lab, London", scope: "local", description: "Learn to build your own berimbau from scratch. Materials provided. Take home your handmade instrument.", organizer: "Contra-Mestre Davi", group: "Capoeira Mandinga", link: "", price: "£30", attendees: ["Zara"] },
    { id: "e6", name: "European Capoeira Encounter", type: "festival", date: "2026-06-05", time: "10:00", location: "Amsterdam, Netherlands", scope: "global", description: "3-day encounter bringing together capoeira groups from across Europe. Workshops, rodas, music sessions, and cultural exchange.", organizer: "Mestre Aranha", group: "Capoeira Holanda", link: "https://example.com/encounter", price: "€80", attendees: ["Eva", "Lars", "Nina", "Marco"] },
  ];

  const [events, setEvents] = useState(SEED_EVENTS);
  const [attending, setAttending] = useState({});
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventSearch, setEventSearch] = useState("");
  const [eventScope, setEventScope] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calDay, setCalDay] = useState(null);
  const [newEvent, setNewEvent] = useState({ name: "", type: "roda", date: "", time: "", location: "", scope: "local", description: "", organizer: "", group: "", link: "", price: "Free" });

  const EVT_ACCENT = "#E06C4F";
  const SCOPE_COLORS = { local: "#16A34A", regional: "#2563EB", national: "#E8652B", global: "#8B5FA8" };
  const EVT_TYPES = ["roda", "workshop", "batizado", "festival", "other"];

  // ── Data persistence ──
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    api('/api/data').then(data => {
      if (data.completed && Object.keys(data.completed).length) setCompleted(data.completed);
      if (data.customSkills && Object.keys(data.customSkills).length) setCustomSkills(data.customSkills);
      if (data.cords && data.cords.length) setCords(data.cords);
      if (data.songs && data.songs.length) setSongs(data.songs);
      if (data.attending && Object.keys(data.attending).length) setAttending(data.attending);
      if (data.preferences) {
        if (data.preferences.capoStyle) setCapoStyle(data.preferences.capoStyle);
        if (data.preferences.isKids) setIsKids(data.preferences.isKids);
      }
      setDataLoaded(true);
    }).catch(() => setDataLoaded(true));
  }, []);

  const saveTimer = useRef(null);
  useEffect(() => {
    if (!dataLoaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api('/api/data', {
        method: 'PUT',
        body: JSON.stringify({
          completed, customSkills, cords, songs, attending,
          preferences: { capoStyle, isKids }
        })
      }).catch(() => {});
    }, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [completed, customSkills, cords, songs, attending, capoStyle, isKids, dataLoaded]);

  const toggleAttending = (id) => {
    if (!requirePremium()) return;
    setAttending(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const createEvent = () => {
    if (!newEvent.name.trim() || !newEvent.date) return;
    const evt = { ...newEvent, id: `e${Date.now()}`, name: newEvent.name.trim(), attendees: [] };
    setEvents(prev => [...prev, evt]);
    setNewEvent({ name: "", type: "roda", date: "", time: "", location: "", scope: "local", description: "", organizer: "", group: "", link: "", price: "Free" });
    setShowCreateEvent(false);
  };

  const filteredEvents = events
    .filter(e => eventScope === "all" || e.scope === eventScope)
    .filter(e => eventTypeFilter === "all" || e.type === eventTypeFilter)
    .filter(e => {
      if (!eventSearch.trim()) return true;
      const q = eventSearch.toLowerCase();
      return e.name.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.group.toLowerCase().includes(q) || e.type.includes(q);
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const upcomingCount = events.filter(e => e.date >= new Date().toISOString().split("T")[0]).length;

  const go = useCallback((v, pk = null, li = 0, sk = null) => {
    setFade(false);
    setTimeout(() => {
      setView(v); if (pk !== null) setPathKey(pk); setLevelIdx(li); setSkill(sk);
      setFade(true); window.scrollTo?.({ top: 0 });
    }, 120);
  }, []);

  const toggle = (pk, li, si) => {
    const k = `${pk}-${li}-${si}`;
    setCompleted(p => ({ ...p, [k]: !p[k] }));
  };

  const prog = (pk) => {
    const paths = getPaths();
    let t = 0, d = 0;
    (paths[pk] || PATHS[pk]).levels.forEach((l, li) => l.skills.forEach((_, si) => { t++; if (completed[`${pk}-${li}-${si}`]) d++; }));
    return { t, d, pct: t ? Math.round(d / t * 100) : 0 };
  };

  const lvlProg = (pk, li) => {
    const paths = getPaths();
    let t = 0, d = 0;
    (paths[pk] || PATHS[pk]).levels[li].skills.forEach((_, si) => { t++; if (completed[`${pk}-${li}-${si}`]) d++; });
    return { t, d, pct: t ? Math.round(d / t * 100) : 0 };
  };

  // Merge custom skills into PATHS for rendering
  const getPaths = useCallback(() => {
    const basePaths = isKids ? KIDS_PATHS : (capoStyle === "angola" ? ANGOLA_PATHS : PATHS);
    const merged = {};
    for (const [key, path] of Object.entries(basePaths)) {
      const customs = customSkills[key] || [];
      if (customs.length === 0) { merged[key] = path; continue; }
      merged[key] = {
        ...path,
        levels: [
          ...path.levels,
          {
            name: isKids ? "My Stuff!" : "My Training",
            subtitle: isKids ? "Things I Want to Learn!" : "Custom Goals",
            skills: customs
          }
        ]
      };
    }
    return merged;
  }, [customSkills, capoStyle, isKids]);

  const totalCustomSkills = Object.values(customSkills).reduce((sum, arr) => sum + arr.length, 0);
  const FREE_CUSTOM_LIMIT = 2;

  const addCustomTraining = () => {
    if (!isPremium && totalCustomSkills >= FREE_CUSTOM_LIMIT) {
      requirePremium();
      return;
    }
    if (!customInput.trim()) return;
    const category = classifyCustomTraining(customInput + " " + customDesc);
    const newSkill = {
      name: customInput.trim(),
      pt: "Custom Training",
      description: customDesc.trim() || `Personal training goal: ${customInput.trim()}`,
      cues: ["Focus on form and consistency", "Track your progress session by session", "Set small milestones along the way", "Celebrate your growth"],
      milestone: `Complete your personal goal: ${customInput.trim()}`,
    };
    setCustomSkills(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), newSkill]
    }));
    setCustomInput("");
    setCustomDesc("");
    setShowAddModal(false);
  };

  const addCord = () => {
    if (!cordName.trim()) return;
    const newCord = {
      name: cordName.trim(),
      color: cordColor,
      pattern: cordPattern,
      stripe: cordPattern !== "solid" ? cordStripe : null,
      meaning: cordMeaning.trim() || ""
    };
    setCords(prev => [...prev, newCord]);
    if (cords.length === 0) setActiveCordIdx(0); // auto-select first cord
    setCordName(""); setCordColor("#D4A843"); setCordPattern("solid");
    setCordStripe("#E8652B"); setCordMeaning(""); setShowCordModal(false);
  };

  const deleteCord = (idx) => {
    setCords(prev => prev.filter((_, i) => i !== idx));
    if (activeCordIdx === idx) setActiveCordIdx(null);
    else if (activeCordIdx > idx) setActiveCordIdx(prev => prev - 1);
  };

  const moveCord = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= cords.length) return;
    setCords(prev => {
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
    if (activeCordIdx === idx) setActiveCordIdx(newIdx);
    else if (activeCordIdx === newIdx) setActiveCordIdx(idx);
  };

  const c = isKids ? {
    bg: "#FFF8F0",
    bgCard: "#FFFFFF",
    bgCardLight: "#FFF3E8",
    text: "#2D1B4E",
    textMuted: "#7B6B8A",
    gold: "#FF9F43",
    goldDim: "rgba(255,159,67,0.15)",
    border: "#F0E0D0",
  } : {
    bg: "#FDF6EC",
    bgCard: "#FFFFFF",
    bgCardLight: "#FFF8F0",
    text: "#2C1810",
    textMuted: "#8B7355",
    gold: "#D4A843",
    goldDim: "rgba(212,168,67,0.12)",
    border: "#E8DCC8",
  };

  const container = {
    maxWidth: 850, margin: "0 auto", padding: "0 24px",
    position: "relative", zIndex: 1,
    opacity: fade ? 1 : 0, transition: "opacity 0.12s ease"
  };

  // ── 2-week gentle prompt ──
  const daysSinceSignup = user?.firstLogin
    ? Math.floor((Date.now() - new Date(user.firstLogin).getTime()) / 86400000)
    : 0;
  const [dismissedPromo, setDismissedPromo] = useState(
    () => localStorage.getItem('ginga_promo_dismissed') === 'true'
  );
  const showGentlePrompt = !isPremium && daysSinceSignup >= 14 && !dismissedPromo;

  // ── HOME ──
  const renderHome = () => (
    <div style={container}>
      {/* Settings gear */}
      <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
        <button onClick={() => go("settings")} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: c.textMuted, fontSize: '1.3rem', padding: 8, opacity: 0.6,
        }} title="Settings">&#9881;</button>
      </div>

      {/* Gentle premium prompt */}
      {showGentlePrompt && (
        <div style={{
          background: `${c.gold}11`, border: `1px solid ${c.gold}33`,
          borderRadius: 12, padding: '12px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem',
          color: c.text, animation: 'fadeUp 0.4s ease both',
        }}>
          <span>Enjoying AXÉ? <span onClick={() => setShowUpgrade(true)} style={{ color: c.gold, cursor: 'pointer', fontWeight: 600 }}>Premium unlocks deeper tracking.</span></span>
          <button onClick={() => { setDismissedPromo(true); localStorage.setItem('ginga_promo_dismissed', 'true'); }} style={{
            background: 'none', border: 'none', color: c.textMuted, cursor: 'pointer', fontSize: '1rem', padding: '0 4px',
          }}>&times;</button>
        </div>
      )}

      {/* Header — title with breathing room */}
      <header style={{ textAlign: "center", padding: "64px 0 0" }}>
        <div style={{
          fontSize: "clamp(3.5rem, 10vw, 6rem)",
          fontWeight: 800,
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: "0.08em",
          lineHeight: 1.1,
          paddingTop: 6,
          color: c.text,
          animation: "slideDown 0.6s ease both"
        }}>
          {isKids ? (
            <span style={{ background: "linear-gradient(135deg, #FF9F43, #E84393, #6C5CE7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AXÉ</span>
          ) : (
            <span style={{ background: "linear-gradient(135deg, #D4A843, #E8652B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AXÉ</span>
          )}
        </div>
        <div style={{
          fontSize: "clamp(0.85rem, 2vw, 1.05rem)",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 300,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: c.textMuted,
          marginTop: 8,
          animation: "slideDown 0.6s ease both 0.1s"
        }}>
          {isKids ? "Capoeira for Kids! 🌟" : "Capoeira Progression Guide"}
        </div>

        {/* Global tagline */}
        {!isKids && (
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.78rem",
            fontWeight: 400,
            fontStyle: "italic",
            color: c.gold,
            marginTop: 12,
            opacity: 0.7,
            animation: "slideDown 0.6s ease both 0.12s"
          }}>
            {GLOBAL_TAGLINES[Math.floor(Date.now() / 86400000) % GLOBAL_TAGLINES.length]}
          </div>
        )}

        {/* Greet capoeirista by apelido */}
        {user?.name && (
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "1.1rem",
            fontWeight: 500,
            color: c.gold,
            marginTop: 20,
            opacity: 0.85,
            animation: "slideDown 0.6s ease both 0.2s",
          }}>
            Salve, {user.name}! 🤙
          </div>
        )}

        {/* Style Toggle — hidden in kids mode */}
        {!isKids && (
          <div style={{
            display: "flex", justifyContent: "center", gap: 0, marginTop: 24,
            animation: "slideDown 0.6s ease both 0.15s"
          }}>
            <button onClick={() => { setCapoStyle("regional"); setPathKey(null); setLevelIdx(0); }} style={{
              padding: "8px 20px", cursor: "pointer",
              background: capoStyle === "regional" ? `${c.gold}18` : "transparent",
              border: `1px solid ${capoStyle === "regional" ? c.gold : c.border}`,
              borderRadius: "8px 0 0 8px", borderRight: "none",
              color: capoStyle === "regional" ? c.gold : c.textMuted,
              fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem",
              letterSpacing: "0.06em", transition: "all 0.2s"
            }}>Regional</button>
            <button onClick={() => { setCapoStyle("angola"); setPathKey(null); setLevelIdx(0); }} style={{
              padding: "8px 20px", cursor: "pointer",
              background: capoStyle === "angola" ? "#2D8B7A18" : "transparent",
              border: `1px solid ${capoStyle === "angola" ? "#2D8B7A" : c.border}`,
              borderRadius: "0 8px 8px 0",
              color: capoStyle === "angola" ? "#2D8B7A" : c.textMuted,
              fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem",
              letterSpacing: "0.06em", transition: "all 0.2s"
            }}>Angola</button>
          </div>
        )}
      </header>

      {/* Path Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, marginTop: 24 }}>
        {Object.entries(getPaths()).map(([key, path], i) => {
          const p = prog(key);
          return (
            <div
              key={key}
              onClick={() => go("path", key)}
              style={{
                background: c.bgCard,
                border: `1px solid ${c.border}`,
                borderRadius: 12,
                padding: 0,
                cursor: "pointer",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                animation: `fadeUp 0.5s ease both ${0.15 + i * 0.08}s`,
                position: "relative",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = path.accent;
                e.currentTarget.style.transform = "translateY(-4px) scale(1.01)";
                e.currentTarget.style.boxShadow = `0 12px 40px ${path.glow}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = c.border;
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
              }}
            >
              {/* Accent line */}
              <div style={{
                height: 3,
                background: `linear-gradient(90deg, transparent, ${path.accent}, ${path.accentAlt}, transparent)`
              }} />

              <div style={{ padding: "22px 24px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{ fontSize: 32 }}>{path.icon}</span>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase",
                    color: path.accent, fontWeight: 600,
                    padding: "3px 10px",
                    border: `1px solid ${path.accent}44`,
                    borderRadius: 4
                  }}>{p.pct}%</span>
                </div>

                <h2 style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "1.6rem", letterSpacing: "0.04em",
                  color: c.text, margin: "0 0 2px"
                }}>{path.name}</h2>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.8rem", color: path.accent, fontWeight: 500,
                  marginBottom: 10
                }}>{path.subtitle}</div>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.88rem", color: c.textMuted, lineHeight: 1.6, margin: "0 0 16px"
                }}>{path.description}</p>

                {/* Progress */}
                <div style={{
                  height: isKids ? 8 : 4, background: c.border, borderRadius: isKids ? 4 : 2, overflow: "hidden"
                }}>
                  <div style={{
                    width: `${p.pct}%`, height: "100%",
                    background: isKids
                      ? `linear-gradient(90deg, #FF9F43, #E84393, #6C5CE7)`
                      : `linear-gradient(90deg, ${path.accent}, ${path.accentAlt})`,
                    borderRadius: isKids ? 4 : 2, transition: "width 0.5s"
                  }} />
                </div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: isKids ? "0.82rem" : "0.75rem", color: c.textMuted, marginTop: 6
                }}>{isKids ? `${p.d}/${p.t} skills unlocked! ${p.pct === 100 ? "🏆" : "⭐"}` : `${p.d}/${p.t} movements mastered`}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Training */}
      <div style={{
        display: "flex", justifyContent: "center", marginTop: 24,
        animation: "fadeUp 0.5s ease both 0.5s"
      }}>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: c.bgCard,
            border: `1px dashed ${c.gold}55`,
            borderRadius: 10, padding: "12px 28px",
            color: c.gold, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem",
            fontWeight: 600, letterSpacing: "0.05em",
            display: "flex", alignItems: "center", gap: 10,
            transition: "all 0.3s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = c.gold; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(212,168,67,0.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = `${c.gold}55`; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
        >
          <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span> Add Custom Training {!isPremium && <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>({totalCustomSkills}/{FREE_CUSTOM_LIMIT})</span>}
        </button>
      </div>

      {/* Install as app prompt */}
      <div style={{ marginTop: 24 }}>
        <InstallPrompt colors={c} />
      </div>

      {/* Cord System Card */}
      <div
        onClick={() => go("cords")}
        style={{
          background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 12,
          padding: "20px 24px", marginTop: 24, cursor: "pointer",
          transition: "all 0.3s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          animation: "fadeUp 0.5s ease both 0.55s"
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = c.gold; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(212,168,67,0.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 28 }}>🪢</span>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.2rem", letterSpacing: "0.04em", color: c.gold, margin: 0
            }}>Cord System</h3>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.82rem", color: c.textMuted, margin: "2px 0 0"
            }}>{cords.length > 0 && activeCordIdx !== null && cords[activeCordIdx]
              ? `Current: ${cords[activeCordIdx].name}${cords[activeCordIdx].meaning ? ` — ${cords[activeCordIdx].meaning}` : ""}`
              : "Your progression through the cordas — build your own system"
            }</p>
          </div>
          {cords.length > 0 && activeCordIdx !== null && cords[activeCordIdx] && (
            <CordVisual color={cords[activeCordIdx].color} stripe={cords[activeCordIdx].stripe} pattern={cords[activeCordIdx].pattern} active small />
          )}
          <span style={{ color: c.textMuted, fontSize: "1.4rem" }}>→</span>
        </div>
      </div>

      {/* Events Card */}
      <div
        onClick={() => go("events")}
        style={{
          background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 12,
          padding: "20px 24px", marginTop: 10, cursor: "pointer",
          transition: "all 0.3s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          animation: "fadeUp 0.5s ease both 0.6s"
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = EVT_ACCENT; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 4px 12px ${EVT_ACCENT}18`; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 28 }}>📅</span>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.2rem", letterSpacing: "0.04em", color: EVT_ACCENT, margin: 0
            }}>Events & Community</h3>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.82rem", color: c.textMuted, margin: "2px 0 0"
            }}>{upcomingCount} upcoming event{upcomingCount !== 1 ? "s" : ""} — rodas, workshops, batizados & more</p>
          </div>
          <span style={{ color: c.textMuted, fontSize: "1.4rem" }}>→</span>
        </div>
      </div>

      {/* Global Community */}
      {!isKids && (
        <div style={{
          textAlign: "center", padding: "36px 20px 0", marginTop: 16,
          position: "relative", overflow: "hidden",
          animation: "fadeUp 0.5s ease both 0.65s"
        }}>
          {/* Simplified world map silhouette */}
          <svg viewBox="0 0 800 400" style={{
            width: "100%", maxWidth: 500, height: "auto", margin: "0 auto",
            opacity: 0.06, display: "block"
          }}>
            {/* Americas */}
            <path d="M120 80 C125 75 135 70 140 78 C145 85 148 95 142 105 C138 112 130 120 125 130 C120 140 118 155 122 165 C126 175 130 185 128 200 C126 210 120 225 115 235 C112 242 108 250 112 260 C118 275 125 285 130 300 C132 310 128 320 122 325 L115 330 C110 320 108 310 112 295 C108 280 100 270 95 255 C90 240 92 225 95 210 C98 195 102 180 100 165 C98 150 95 135 100 120 C105 105 112 90 120 80 Z" fill="#D4A843" />
            {/* North America */}
            <path d="M140 60 C150 55 165 50 175 55 C185 60 190 70 185 80 C180 88 172 92 165 88 C158 85 150 78 145 72 C142 68 140 64 140 60 Z" fill="#D4A843" />
            {/* Europe */}
            <path d="M350 70 C360 65 375 60 390 65 C400 68 408 75 405 85 C402 92 395 98 385 100 C375 102 365 98 358 92 C352 86 348 78 350 70 Z" fill="#E8652B" />
            {/* Africa */}
            <path d="M360 120 C370 115 385 112 395 118 C405 125 412 138 415 155 C418 172 415 192 408 210 C402 225 392 240 380 252 C372 260 362 265 355 258 C348 250 345 238 348 222 C350 208 355 192 352 175 C350 160 348 142 352 130 C354 124 357 120 360 120 Z" fill="#E8652B" />
            {/* Asia */}
            <path d="M450 60 C470 52 500 48 530 55 C555 60 575 72 590 88 C600 98 608 112 605 128 C602 142 592 152 578 158 C565 162 548 160 535 152 C520 145 508 132 498 120 C488 108 478 95 468 85 C458 75 450 68 450 60 Z" fill="#2D8B7A" />
            {/* Oceania */}
            <path d="M600 220 C615 215 635 218 645 228 C652 236 650 248 640 255 C630 260 618 258 610 250 C604 242 600 230 600 220 Z" fill="#2D8B7A" />
            {/* Brazil highlight */}
            <circle cx="165" cy="210" r="8" fill="#D4A843" opacity="0.4" />
            <circle cx="165" cy="210" r="4" fill="#D4A843" opacity="0.7" />
          </svg>

          <h3 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.4rem", letterSpacing: "0.08em",
            color: c.gold, margin: "8px 0 8px",
            fontWeight: 400
          }}>One Roda, Every Nation</h3>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.85rem", color: c.textMuted, lineHeight: 1.7,
            maxWidth: 480, margin: "0 auto",
            fontWeight: 300
          }}>
            Capoeira unites practitioners across 160+ countries — from street rodas in Bahia to academies in Berlin, Seoul, and Nairobi. Wherever you train, you are part of the roda.
          </p>
        </div>
      )}

      {/* Quote */}
      <div style={{
        textAlign: "center", padding: "32px 20px 24px",
        animation: "fadeUp 0.5s ease both 0.7s"
      }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.95rem", fontStyle: "italic", fontWeight: 300,
          color: c.textMuted, lineHeight: 1.8,
          maxWidth: 400, margin: "0 auto"
        }}>
          "Capoeira é pra homem, menino e mulher —<br />só não aprende quem não quer."
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.78rem", color: c.gold, marginTop: 8, fontWeight: 500
        }}>— Traditional corrido</p>
      </div>

      {/* Kids Toggle — subtle, at bottom */}
      <div style={{
        display: "flex", justifyContent: "center", paddingBottom: 48,
        animation: "fadeUp 0.5s ease both 0.7s"
      }}>
        <button onClick={() => { setIsKids(!isKids); setPathKey(null); setLevelIdx(0); }} style={{
          padding: "6px 16px", cursor: "pointer",
          background: isKids ? "linear-gradient(135deg, #FF9F43, #E84393, #6C5CE7)" : "transparent",
          border: isKids ? "1.5px solid #FF9F43" : `1px solid ${c.border}`,
          borderRadius: 20,
          color: isKids ? "#fff" : c.textMuted,
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem",
          fontWeight: 500, letterSpacing: "0.04em",
          transition: "all 0.3s",
          opacity: isKids ? 1 : 0.6,
          boxShadow: isKids ? "0 4px 15px rgba(255,159,67,0.3)" : "none"
        }}>
          {isKids ? "🧒 Crianças Mode ON" : "🧒 Crianças Mode"}
        </button>
      </div>
    </div>
  );

  // ── PATH ──
  const renderPath = () => {
    const p = getPaths()[pathKey]; if (!p) return null;
    const lv = p.levels[levelIdx]; const lp = lvlProg(pathKey, levelIdx);
    return (
      <div style={container}>
        <button onClick={() => go("home")} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem",
          color: c.textMuted, padding: "20px 0 8px",
          display: "flex", alignItems: "center", gap: 8, transition: "color 0.2s"
        }}
          onMouseEnter={e => e.target.style.color = c.text}
          onMouseLeave={e => e.target.style.color = c.textMuted}
        >← All Paths</button>

        <div style={{ textAlign: "center", padding: "8px 0 0" }}>
          <span style={{ fontSize: 48 }}>{p.icon}</span>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            letterSpacing: "0.06em", color: c.text, margin: "4px 0 0"
          }}>{p.name}</h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.92rem", color: c.textMuted, fontStyle: "italic"
          }}>{p.description}</p>
        </div>

        {/* Level tabs */}
        <div style={{ display: "flex", gap: 6, margin: "28px 0 24px", overflowX: "auto", padding: "4px 0" }}>
          {p.levels.map((lev, idx) => {
            const active = levelIdx === idx;
            const lpr = lvlProg(pathKey, idx);
            const isAdvanced = idx >= 3;
            const locked = isAdvanced && !isPremium;
            return (
              <button key={idx} onClick={() => { if (locked) { requirePremium(); return; } setLevelIdx(idx); }} style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem",
                fontWeight: active ? 600 : 400,
                background: active ? `${p.accent}22` : "transparent",
                border: `1px solid ${active ? p.accent : c.border}`,
                borderRadius: 8, padding: "10px 18px", cursor: "pointer",
                color: active ? p.accent : c.textMuted,
                whiteSpace: "nowrap", transition: "all 0.2s"
              }}>
                <div>{lev.name} {locked && <span style={{ fontSize: "0.7rem" }}>&#x1F512;</span>}</div>
                <div style={{ fontSize: "0.7rem", opacity: locked ? 0.5 : 0.8, marginTop: 2 }}>
                  {locked ? "Premium" : `${lpr.d}/${lpr.t} ${lpr.pct === 100 ? "✦" : ""}`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Level header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.3rem", letterSpacing: "0.04em", color: c.text, margin: 0
          }}>
            <span style={{ color: p.accent }}>Level {levelIdx + 1}:</span> {lv.subtitle}
          </h2>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: c.textMuted }}>{lp.pct}%</span>
        </div>
        <div style={{ height: 3, background: c.border, borderRadius: 2, overflow: "hidden", marginBottom: 24 }}>
          <div style={{
            width: `${lp.pct}%`, height: "100%",
            background: `linear-gradient(90deg, ${p.accent}, ${p.accentAlt})`,
            transition: "width 0.5s"
          }} />
        </div>

        {/* Skills */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 48 }}>
          {lv.skills.map((sk, si) => {
            const done = completed[`${pathKey}-${levelIdx}-${si}`];
            return (
              <div key={si}
                onClick={() => go("skill", pathKey, levelIdx, { ...sk, si })}
                style={{
                  background: done ? `${p.accent}10` : c.bgCard,
                  border: `1px solid ${done ? `${p.accent}55` : c.border}`,
                  borderRadius: 10, padding: "18px 22px",
                  cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 16,
                  transition: "all 0.25s",
                  animation: `fadeUp 0.4s ease both ${si * 0.07}s`
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = p.accent; e.currentTarget.style.background = `${p.accent}0C`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = done ? `${p.accent}55` : c.border; e.currentTarget.style.background = done ? `${p.accent}10` : c.bgCard; }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                  border: `2px solid ${done ? p.accent : c.border}`,
                  background: done ? p.accent : "transparent",
                  color: done ? c.bg : c.textMuted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem",
                  marginTop: 2, transition: "all 0.3s"
                }}>{done ? "✦" : si + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "1.1rem", letterSpacing: "0.03em", color: c.text, margin: "0 0 2px"
                  }}>{sk.name}</h3>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.75rem", color: p.accent, fontStyle: "italic", marginBottom: 6
                  }}>{sk.pt}</div>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.85rem", color: c.textMuted, lineHeight: 1.55, margin: 0,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                  }}>{sk.description}</p>
                </div>
                <span style={{ color: c.textMuted, fontSize: "1.2rem", marginTop: 4 }}>›</span>
              </div>
            );
          })}
        </div>

        {/* Favorite Songs — only on music path */}
        {pathKey === "music" && (
          <div style={{ marginBottom: 48, animation: "fadeUp 0.5s ease both 0.3s" }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 14
            }}>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.3rem", letterSpacing: "0.04em", color: c.text, margin: 0
              }}>
                <span style={{ color: "#8B5FA8" }}>🎶</span> Favorite Songs
              </h2>
              <button
                onClick={() => isPremium ? setShowSongModal(true) : setShowUpgrade(true)}
                style={{
                  background: `#8B5FA822`, border: `1px solid #8B5FA855`,
                  borderRadius: 6, padding: "6px 14px", cursor: "pointer",
                  color: "#8B5FA8", fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.8rem", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#8B5FA833"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#8B5FA822"; }}
              >
                {isPremium ? <><span>+</span> Add Song</> : <><span>🔒</span> Add Song</>}
              </button>
            </div>

            {songs.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "32px 20px",
                background: c.bgCard, border: `1px dashed ${c.border}`,
                borderRadius: 10
              }}>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.88rem", color: c.textMuted
                }}>No songs yet — save your favorite corridos, ladainhas, and chulas here</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {songs.map((song, i) => (
                  <div key={i} style={{
                    background: c.bgCard, border: `1px solid ${c.border}`,
                    borderRadius: 10, padding: "14px 18px",
                    animation: `fadeUp 0.3s ease both ${i * 0.05}s`,
                    transition: "border-color 0.2s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#8B5FA855"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = c.border}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <h3 style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: "1.05rem", letterSpacing: "0.03em",
                            color: c.text, margin: 0
                          }}>{song.title}</h3>
                          <span style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase",
                            color: "#8B5FA8", fontWeight: 600,
                            padding: "2px 8px",
                            border: "1px solid #8B5FA844",
                            borderRadius: 4
                          }}>{song.type}</span>
                        </div>
                        {song.lyrics && (
                          <p style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "0.85rem", color: c.textMuted, lineHeight: 1.6,
                            margin: 0, whiteSpace: "pre-wrap",
                            display: "-webkit-box", WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical", overflow: "hidden"
                          }}>{song.lyrics}</p>
                        )}
                      </div>
                      <button onClick={() => deleteSong(i)}
                        style={{
                          background: "none", border: `1px solid ${c.border}`, borderRadius: 4,
                          color: "#DC2626", cursor: "pointer", padding: "2px 6px",
                          fontSize: "0.75rem", marginLeft: 10, flexShrink: 0
                        }}
                      >×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Song Catalog — on music path */}
        {pathKey === "music" && (
          <div style={{ marginBottom: 48, animation: "fadeUp 0.5s ease both 0.4s" }}>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.3rem", letterSpacing: "0.04em", color: c.text, margin: "0 0 14px"
            }}>
              <span style={{ color: "#D4A843" }}>📜</span> Song Catalog
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SONG_CATALOG.map((song, i) => {
                const locked = !song.free && !isPremium;
                return (
                  <div key={i} style={{
                    background: c.bgCard, border: `1px solid ${c.border}`,
                    borderRadius: 10, padding: "14px 18px",
                    opacity: locked ? 0.55 : 1,
                    position: "relative",
                    animation: `fadeUp 0.3s ease both ${i * 0.04}s`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <h3 style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: "1.05rem", letterSpacing: "0.03em",
                        color: c.text, margin: 0
                      }}>{locked ? "🔒 " : ""}{song.title}</h3>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase",
                        color: "#D4A843", fontWeight: 600,
                        padding: "2px 8px",
                        border: "1px solid #D4A84344",
                        borderRadius: 4
                      }}>{song.type}</span>
                    </div>
                    {locked ? (
                      <p style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.82rem", color: c.textMuted, margin: 0, fontStyle: "italic"
                      }}>Upgrade to premium to see lyrics</p>
                    ) : (
                      <p style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.85rem", color: c.textMuted, lineHeight: 1.6,
                        margin: 0, whiteSpace: "pre-wrap",
                      }}>{song.lyrics}</p>
                    )}
                  </div>
                );
              })}
              {!isPremium && (
                <button
                  onClick={() => setShowUpgrade(true)}
                  style={{
                    marginTop: 8,
                    padding: "14px 20px",
                    background: `linear-gradient(135deg, #D4A843, #E8652B)`,
                    border: "none", borderRadius: 10,
                    color: "#fff", fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600, fontSize: "0.88rem",
                    cursor: "pointer", textAlign: "center",
                  }}
                >
                  Unlock full catalog with Premium
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── SKILL ──
  const renderSkill = () => {
    if (!skill || !pathKey) return null;
    const p = getPaths()[pathKey];
    const done = completed[`${pathKey}-${levelIdx}-${skill.si}`];

    return (
      <div style={container}>
        <button onClick={() => go("path", pathKey, levelIdx)} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem",
          color: c.textMuted, padding: "20px 0 8px",
          display: "flex", alignItems: "center", gap: 8, transition: "color 0.2s"
        }}
          onMouseEnter={e => e.target.style.color = c.text}
          onMouseLeave={e => e.target.style.color = c.textMuted}
        >← {p.levels[levelIdx].name}</button>

        <div style={{ animation: "fadeUp 0.4s ease both" }}>
          <div style={{
            display: "inline-block",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase",
            color: p.accent, fontWeight: 600,
            padding: "4px 12px",
            border: `1px solid ${p.accent}44`,
            borderRadius: 4, marginBottom: 16
          }}>{p.icon} {p.name} · Level {levelIdx + 1}</div>

          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
            letterSpacing: "0.04em", color: c.text, margin: "0 0 4px"
          }}>{skill.name}</h1>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.9rem", color: p.accent, fontStyle: "italic", marginBottom: 16
          }}>{skill.pt}</div>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "1rem", color: c.textMuted, lineHeight: 1.75, margin: "0 0 28px"
          }}>{skill.description}</p>

          {/* Cues */}
          <div style={{
            background: `${p.accent}0A`,
            border: `1px solid ${p.accent}33`,
            borderRadius: 10, padding: "24px 24px 20px", marginBottom: 14
          }}>
            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.1rem", letterSpacing: "0.06em", color: p.accent, margin: "0 0 16px"
            }}>⚡ Key Points</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {skill.cues.map((cue, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    border: `1px solid ${p.accent}66`, color: p.accent,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", fontWeight: 700
                  }}>{i + 1}</div>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    margin: 0, color: c.textMuted, fontSize: "0.92rem", lineHeight: 1.6
                  }}>{cue}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone */}
          <div style={{
            background: c.goldDim,
            border: `1px solid ${c.gold}44`,
            borderRadius: 10, padding: "20px 24px", marginBottom: 24
          }}>
            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1rem", letterSpacing: "0.06em", color: c.gold, margin: "0 0 8px"
            }}>🎯 Milestone</h3>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              margin: 0, color: c.textMuted, fontSize: "0.92rem", lineHeight: 1.6
            }}>{skill.milestone}</p>
          </div>

          <button onClick={() => toggle(pathKey, levelIdx, skill.si)} style={{
            width: "100%", padding: "16px 24px",
            background: done ? "transparent" : `linear-gradient(135deg, ${p.accent}, ${p.accentAlt})`,
            border: done ? `2px solid ${p.accent}` : "none",
            borderRadius: 10,
            color: done ? p.accent : c.bg,
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.15rem", letterSpacing: "0.08em",
            cursor: "pointer", transition: "all 0.3s"
          }}
            onMouseEnter={e => e.target.style.transform = "scale(1.02)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
          >
            {isKids
              ? (done ? "⭐ I DID IT! — TAP TO UNDO" : "I DID IT! ⭐")
              : (done ? "✦ MASTERED — TAP TO UNDO" : "MARK AS MASTERED ✦")}
          </button>
          <div style={{ height: 48 }} />
        </div>
      </div>
    );
  };

  // ── EVENTS HUB ──
  const renderEvents = () => (
    <div style={container}>
      <button onClick={() => go("home")} style={{
        background: "none", border: "none", cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem",
        color: c.textMuted, padding: "20px 0 8px",
        display: "flex", alignItems: "center", gap: 8, transition: "color 0.2s"
      }}
        onMouseEnter={e => e.target.style.color = c.text}
        onMouseLeave={e => e.target.style.color = c.textMuted}
      >← Home</button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
          letterSpacing: "0.06em", color: c.text, margin: 0
        }}>Events</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => go("calendar")} style={{
            background: `${EVT_ACCENT}15`, border: `1px solid ${EVT_ACCENT}44`,
            borderRadius: 8, padding: "8px 14px", cursor: "pointer",
            color: EVT_ACCENT, fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", fontWeight: 600
          }}>📅 Calendar</button>
          <button onClick={() => { if (!requirePremium()) return; setShowCreateEvent(true); }} style={{
            background: isPremium ? `linear-gradient(135deg, ${EVT_ACCENT}, #FF8A6A)` : `${EVT_ACCENT}44`,
            border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer",
            color: isPremium ? c.bg : EVT_ACCENT, fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.95rem",
            letterSpacing: "0.04em"
          }}>+ Create {!isPremium && "🔒"}</button>
        </div>
      </div>

      {/* Search */}
      <input
        value={eventSearch}
        onChange={e => setEventSearch(e.target.value)}
        placeholder="Search events, locations, groups..."
        style={{
          width: "100%", padding: "12px 16px", marginBottom: 14,
          background: c.bgCard, border: `1px solid ${c.border}`,
          borderRadius: 8, color: c.text, fontSize: "0.92rem",
          fontFamily: "'DM Sans', sans-serif", outline: "none"
        }}
        onFocus={e => e.target.style.borderColor = EVT_ACCENT}
        onBlur={e => e.target.style.borderColor = c.border}
      />

      {/* Scope tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", padding: "2px 0" }}>
        {["all", "local", "regional", "national", "global"].map(s => (
          <button key={s} onClick={() => setEventScope(s)} style={{
            padding: "7px 14px", borderRadius: 6, cursor: "pointer",
            background: eventScope === s ? (s === "all" ? `${EVT_ACCENT}22` : `${SCOPE_COLORS[s]}22`) : "transparent",
            border: `1px solid ${eventScope === s ? (s === "all" ? EVT_ACCENT : SCOPE_COLORS[s]) : c.border}`,
            color: eventScope === s ? (s === "all" ? EVT_ACCENT : SCOPE_COLORS[s]) : c.textMuted,
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem",
            fontWeight: eventScope === s ? 600 : 400, textTransform: "capitalize",
            whiteSpace: "nowrap", transition: "all 0.2s"
          }}>{s === "all" ? "All Scopes" : s}</button>
        ))}
      </div>

      {/* Type filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", padding: "2px 0" }}>
        {["all", ...EVT_TYPES].map(t => (
          <button key={t} onClick={() => setEventTypeFilter(t)} style={{
            padding: "6px 12px", borderRadius: 6, cursor: "pointer",
            background: eventTypeFilter === t ? `${EVT_ACCENT}15` : "transparent",
            border: `1px solid ${eventTypeFilter === t ? `${EVT_ACCENT}66` : c.border}`,
            color: eventTypeFilter === t ? EVT_ACCENT : c.textMuted,
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem",
            fontWeight: eventTypeFilter === t ? 600 : 400, textTransform: "capitalize",
            whiteSpace: "nowrap", transition: "all 0.2s"
          }}>{t === "all" ? "All Types" : t}</button>
        ))}
      </div>

      {/* Event cards */}
      {filteredEvents.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "40px 20px",
          background: c.bgCard, border: `1px dashed ${c.border}`, borderRadius: 10
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem", color: c.textMuted }}>
            No events found{eventSearch ? ` for "${eventSearch}"` : ""}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 48 }}>
          {filteredEvents.map((evt, i) => {
            const sc = SCOPE_COLORS[evt.scope] || EVT_ACCENT;
            const isGoing = attending[evt.id];
            const totalAttendees = (evt.attendees?.length || 0) + (isGoing ? 1 : 0);
            return (
              <div key={evt.id}
                onClick={() => { setSelectedEvent(evt); go("event-detail"); }}
                style={{
                  background: c.bgCard, border: `1px solid ${c.border}`,
                  borderRadius: 10, padding: 0, cursor: "pointer",
                  overflow: "hidden", transition: "all 0.25s",
                  animation: `fadeUp 0.4s ease both ${i * 0.06}s`
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = EVT_ACCENT; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${sc}, transparent)` }} />
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                        <h3 style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          fontSize: "1.15rem", letterSpacing: "0.03em", color: c.text, margin: 0
                        }}>{evt.name}</h3>
                        <span style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase",
                          color: EVT_ACCENT, fontWeight: 600, padding: "2px 8px",
                          border: `1px solid ${EVT_ACCENT}44`, borderRadius: 4
                        }}>{evt.type}</span>
                        <span style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase",
                          color: sc, fontWeight: 600, padding: "2px 8px",
                          border: `1px solid ${sc}44`, borderRadius: 4
                        }}>{evt.scope}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: "flex", flexWrap: "wrap", gap: 14,
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: c.textMuted, marginBottom: 8
                  }}>
                    <span>📅 {new Date(evt.date + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {evt.time && <span>🕐 {evt.time}</span>}
                    <span>📍 {evt.location}</span>
                  </div>

                  {evt.organizer && (
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: c.textMuted, marginBottom: 10
                    }}>
                      By <span style={{ color: c.text, fontWeight: 500 }}>{evt.organizer}</span>
                      {evt.group && <span> · {evt.group}</span>}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: c.textMuted
                    }}>👥 {totalAttendees} going{evt.price && evt.price !== "Free" ? ` · ${evt.price}` : " · Free"}</span>
                    <button
                      onClick={e => { e.stopPropagation(); toggleAttending(evt.id); }}
                      style={{
                        padding: "6px 14px", borderRadius: 6, cursor: "pointer",
                        background: isGoing ? `${EVT_ACCENT}22` : "transparent",
                        border: `1px solid ${isGoing ? EVT_ACCENT : c.border}`,
                        color: isGoing ? EVT_ACCENT : c.textMuted,
                        fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem",
                        fontWeight: isGoing ? 600 : 400, transition: "all 0.2s"
                      }}
                    >{isGoing ? "✓ Going" : isPremium ? "I'm Going" : "RSVP 🔒"}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── EVENT DETAIL ──
  const renderEventDetail = () => {
    if (!selectedEvent) return null;
    const evt = selectedEvent;
    const sc = SCOPE_COLORS[evt.scope] || EVT_ACCENT;
    const isGoing = attending[evt.id];
    const totalAttendees = (evt.attendees?.length || 0) + (isGoing ? 1 : 0);
    const allNames = [...(evt.attendees || []), ...(isGoing ? ["You"] : [])];

    return (
      <div style={container}>
        <button onClick={() => go("events")} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem",
          color: c.textMuted, padding: "20px 0 8px",
          display: "flex", alignItems: "center", gap: 8, transition: "color 0.2s"
        }}
          onMouseEnter={e => e.target.style.color = c.text}
          onMouseLeave={e => e.target.style.color = c.textMuted}
        >← Events</button>

        <div style={{ animation: "fadeUp 0.4s ease both" }}>
          {/* Badges */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: EVT_ACCENT, fontWeight: 600, padding: "4px 12px",
              border: `1px solid ${EVT_ACCENT}44`, borderRadius: 4
            }}>{evt.type}</span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: sc, fontWeight: 600, padding: "4px 12px",
              border: `1px solid ${sc}44`, borderRadius: 4
            }}>{evt.scope}</span>
          </div>

          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
            letterSpacing: "0.04em", color: c.text, margin: "0 0 16px"
          }}>{evt.name}</h1>

          {/* Info cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            <div style={{
              background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 8,
              padding: "14px 18px", display: "flex", flexWrap: "wrap", gap: 20,
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", color: c.textMuted
            }}>
              <div><span style={{ color: c.text, fontWeight: 500 }}>📅 Date</span><br />{new Date(evt.date + "T00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
              {evt.time && <div><span style={{ color: c.text, fontWeight: 500 }}>🕐 Time</span><br />{evt.time}</div>}
              <div><span style={{ color: c.text, fontWeight: 500 }}>📍 Location</span><br />{evt.location}</div>
              {evt.price && <div><span style={{ color: c.text, fontWeight: 500 }}>💰 Price</span><br />{evt.price}</div>}
            </div>

            {evt.organizer && (
              <div style={{
                background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 8,
                padding: "14px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", color: c.textMuted
              }}>
                <span style={{ color: c.text, fontWeight: 500 }}>Organized by</span><br />
                {evt.organizer}{evt.group && ` · ${evt.group}`}
              </div>
            )}
          </div>

          {/* Description */}
          {evt.description && (
            <div style={{
              background: `${EVT_ACCENT}08`, border: `1px solid ${EVT_ACCENT}22`,
              borderRadius: 10, padding: "20px 22px", marginBottom: 16
            }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.95rem", color: c.textMuted, lineHeight: 1.7, margin: 0
              }}>{evt.description}</p>
            </div>
          )}

          {/* Registration link */}
          {evt.link && (
            <a href={evt.link} target="_blank" rel="noopener noreferrer" style={{
              display: "block", textAlign: "center", padding: "12px 20px",
              background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 8,
              color: EVT_ACCENT, fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem",
              fontWeight: 600, textDecoration: "none", marginBottom: 16, transition: "border-color 0.2s"
            }}
              onMouseEnter={e => e.target.style.borderColor = EVT_ACCENT}
              onMouseLeave={e => e.target.style.borderColor = c.border}
            >🔗 Registration Link →</a>
          )}

          {/* Attendees */}
          <div style={{
            background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10,
            padding: "18px 22px", marginBottom: 20
          }}>
            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.1rem", letterSpacing: "0.04em", color: c.text, margin: "0 0 12px"
            }}>👥 Attending ({totalAttendees})</h3>
            {allNames.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {allNames.map((name, i) => (
                  <span key={i} style={{
                    padding: "5px 12px", borderRadius: 20,
                    background: name === "You" ? `${EVT_ACCENT}22` : c.bgCardLight,
                    border: `1px solid ${name === "You" ? EVT_ACCENT : c.border}`,
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem",
                    color: name === "You" ? EVT_ACCENT : c.textMuted, fontWeight: name === "You" ? 600 : 400
                  }}>{name}</span>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: c.textMuted, margin: 0 }}>No one yet — be the first!</p>
            )}
          </div>

          {/* Attend button */}
          <button onClick={() => toggleAttending(evt.id)} style={{
            width: "100%", padding: "16px 24px",
            background: isGoing ? "transparent" : `linear-gradient(135deg, ${EVT_ACCENT}, #FF8A6A)`,
            border: isGoing ? `2px solid ${EVT_ACCENT}` : "none",
            borderRadius: 10,
            color: isGoing ? EVT_ACCENT : c.bg,
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.15rem", letterSpacing: "0.08em",
            cursor: "pointer", transition: "all 0.3s"
          }}
            onMouseEnter={e => e.target.style.transform = "scale(1.02)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
          >
            {isGoing ? "✓ GOING — TAP TO CANCEL" : isPremium ? "I'M GOING ✦" : "RSVP — PREMIUM ONLY 🔒"}
          </button>
          <div style={{ height: 48 }} />
        </div>
      </div>
    );
  };

  // ── CALENDAR ──
  const renderCalendar = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const firstDay = new Date(calYear, calMonth, 1);
    const startDay = (firstDay.getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const eventsOnDay = (d) => {
      if (!d) return [];
      const ds = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      return events.filter(e => e.date === ds);
    };

    const prevMonth = () => {
      if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
      else setCalMonth(m => m - 1);
      setCalDay(null);
    };
    const nextMonth = () => {
      if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
      else setCalMonth(m => m + 1);
      setCalDay(null);
    };

    const today = new Date();
    const isToday = (d) => d && calYear === today.getFullYear() && calMonth === today.getMonth() && d === today.getDate();
    const dayEvents = calDay ? eventsOnDay(calDay) : [];

    return (
      <div style={container}>
        <button onClick={() => go("events")} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem",
          color: c.textMuted, padding: "20px 0 8px",
          display: "flex", alignItems: "center", gap: 8, transition: "color 0.2s"
        }}
          onMouseEnter={e => e.target.style.color = c.text}
          onMouseLeave={e => e.target.style.color = c.textMuted}
        >← Events</button>

        {/* Month header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 24
        }}>
          <button onClick={prevMonth} style={{
            background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 8,
            padding: "10px 16px", cursor: "pointer", color: c.text,
            fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem"
          }}>←</button>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(1.4rem, 4vw, 2rem)",
            letterSpacing: "0.06em", color: c.text, margin: 0
          }}>{monthNames[calMonth]} {calYear}</h1>
          <button onClick={nextMonth} style={{
            background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 8,
            padding: "10px 16px", cursor: "pointer", color: c.text,
            fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem"
          }}>→</button>
        </div>

        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
          {dayNames.map(d => (
            <div key={d} style={{
              textAlign: "center", fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: c.textMuted, fontWeight: 600, padding: "6px 0"
            }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 24 }}>
          {cells.map((d, i) => {
            const dayEvts = eventsOnDay(d);
            const selected = d && d === calDay;
            return (
              <div key={i}
                onClick={() => d && setCalDay(d === calDay ? null : d)}
                style={{
                  aspectRatio: "1", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 3,
                  borderRadius: 8, cursor: d ? "pointer" : "default",
                  background: selected ? `${EVT_ACCENT}22` : (d ? c.bgCard : "transparent"),
                  border: `1px solid ${selected ? EVT_ACCENT : isToday(d) ? c.gold : (d ? c.border : "transparent")}`,
                  transition: "all 0.15s"
                }}
              >
                {d && (
                  <>
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem",
                      fontWeight: isToday(d) ? 700 : 400,
                      color: selected ? EVT_ACCENT : isToday(d) ? c.gold : c.text
                    }}>{d}</span>
                    {dayEvts.length > 0 && (
                      <div style={{ display: "flex", gap: 3 }}>
                        {dayEvts.slice(0, 3).map((e, j) => (
                          <div key={j} style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: SCOPE_COLORS[e.scope] || EVT_ACCENT
                          }} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected day events */}
        {calDay && (
          <div style={{ marginBottom: 48 }}>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.2rem", letterSpacing: "0.04em", color: c.text, margin: "0 0 12px"
            }}>
              {new Date(calYear, calMonth, calDay).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </h2>
            {dayEvents.length === 0 ? (
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem",
                color: c.textMuted, padding: "16px 0"
              }}>No events on this day</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dayEvents.map(evt => (
                  <div key={evt.id}
                    onClick={() => { setSelectedEvent(evt); go("event-detail"); }}
                    style={{
                      background: c.bgCard, border: `1px solid ${c.border}`,
                      borderRadius: 8, padding: "14px 18px", cursor: "pointer",
                      transition: "border-color 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = EVT_ACCENT}
                    onMouseLeave={e => e.currentTarget.style.borderColor = c.border}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <h3 style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: "1rem", color: c.text, margin: 0
                      }}>{evt.name}</h3>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem",
                        color: SCOPE_COLORS[evt.scope], fontWeight: 600,
                        padding: "1px 6px", border: `1px solid ${SCOPE_COLORS[evt.scope]}44`,
                        borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.06em"
                      }}>{evt.type}</span>
                    </div>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: c.textMuted
                    }}>
                      {evt.time && `${evt.time} · `}{evt.location}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── CORDS ──
  const renderCords = () => (
    <div style={container}>
      <button onClick={() => go("home")} style={{
        background: "none", border: "none", cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem",
        color: c.textMuted, padding: "20px 0 8px",
        display: "flex", alignItems: "center", gap: 8, transition: "color 0.2s"
      }}
        onMouseEnter={e => e.target.style.color = c.text}
        onMouseLeave={e => e.target.style.color = c.textMuted}
      >← Home</button>

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
          letterSpacing: "0.06em", color: c.text, margin: "0 0 4px"
        }}>Cord System</h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.92rem", color: c.textMuted, fontStyle: "italic"
        }}>Build your group's cord progression — tap a cord to set it as your current level</p>
      </div>

      {cords.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px 24px",
          background: c.bgCard, border: `1px dashed ${c.border}`,
          borderRadius: 12, marginBottom: 24
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🪢</div>
          <h3 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.3rem", color: c.text, margin: "0 0 8px"
          }}>No cords yet</h3>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.88rem", color: c.textMuted, marginBottom: 24
          }}>Add your first cord to start building your group's progression system</p>
          <button
            onClick={() => setShowCordModal(true)}
            style={{
              padding: "12px 28px",
              background: `linear-gradient(135deg, ${c.gold}, #E8A020)`,
              border: "none", borderRadius: 8, cursor: "pointer",
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1rem", letterSpacing: "0.06em", color: c.bg
            }}
          >+ Add First Cord</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {cords.map((cord, i) => {
            const isActive = activeCordIdx === i;
            return (
              <div key={i} style={{
                background: isActive ? c.goldDim : c.bgCard,
                border: `1px solid ${isActive ? c.gold : c.border}`,
                borderRadius: 10, padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 14,
                animation: `fadeUp 0.35s ease both ${i * 0.04}s`,
                position: "relative", overflow: "hidden", cursor: "pointer",
                transition: "all 0.2s"
              }}
                onClick={() => setActiveCordIdx(i)}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = c.gold + "88"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = c.border; }}
              >
                {isActive && <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                  background: c.gold
                }} />}
                <CordVisual color={cord.color} stripe={cord.stripe} pattern={cord.pattern} active={isActive} small />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "1.05rem", letterSpacing: "0.04em",
                    color: isActive ? c.gold : c.text, margin: 0
                  }}>{cord.name}</h3>
                  {cord.meaning && <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.82rem", color: c.textMuted, margin: "2px 0 0"
                  }}>{cord.meaning}</p>}
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <button onClick={e => { e.stopPropagation(); moveCord(i, -1); }}
                    style={{
                      background: "none", border: `1px solid ${c.border}`, borderRadius: 4,
                      color: c.textMuted, cursor: "pointer", padding: "2px 6px", fontSize: "0.75rem",
                      opacity: i === 0 ? 0.3 : 1
                    }}
                    disabled={i === 0}
                  >↑</button>
                  <button onClick={e => { e.stopPropagation(); moveCord(i, 1); }}
                    style={{
                      background: "none", border: `1px solid ${c.border}`, borderRadius: 4,
                      color: c.textMuted, cursor: "pointer", padding: "2px 6px", fontSize: "0.75rem",
                      opacity: i === cords.length - 1 ? 0.3 : 1
                    }}
                    disabled={i === cords.length - 1}
                  >↓</button>
                  <button onClick={e => { e.stopPropagation(); deleteCord(i); }}
                    style={{
                      background: "none", border: `1px solid ${c.border}`, borderRadius: 4,
                      color: "#DC2626", cursor: "pointer", padding: "2px 6px", fontSize: "0.75rem",
                      transition: "opacity 0.2s"
                    }}
                  >×</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add cord button */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
        <button
          onClick={() => setShowCordModal(true)}
          style={{
            background: `${c.gold}11`, border: `1px dashed ${c.gold}55`,
            borderRadius: 10, padding: "12px 28px", cursor: "pointer",
            color: c.gold, fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.88rem", fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8,
            transition: "all 0.3s"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = c.gold; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = `${c.gold}55`; e.currentTarget.style.transform = "none"; }}
        >
          <span style={{ fontSize: "1.2rem" }}>+</span> Add Cord
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: `
        radial-gradient(ellipse at 20% 0%, rgba(212,168,67,0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, rgba(232,101,43,0.05) 0%, transparent 50%),
        ${c.bg}
      `,
      color: c.text, position: "relative"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; background: #FDF6EC; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #FDF6EC; }
        ::-webkit-scrollbar-thumb { background: #D4C4A8; border-radius: 3px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatCircle {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.03); }
        }
      `}</style>

      <div>
      <KineticBackground />
      {view === "home" && renderHome()}
      {view === "path" && renderPath()}
      {view === "skill" && renderSkill()}
      {view === "cords" && renderCords()}
      {view === "events" && renderEvents()}
      {view === "event-detail" && renderEventDetail()}
      {view === "calendar" && renderCalendar()}
      {view === "settings" && <SettingsPanel user={user} onBack={() => go("home")} onLogout={logout} onUpgrade={() => setShowUpgrade(true)} onShowPrivacy={onShowPrivacy} />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </div>

      {/* Add Custom Training Modal */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24, animation: "fadeUp 0.2s ease both"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: c.bgCard, border: `1px solid ${c.border}`,
              borderRadius: 14, padding: "32px 28px", width: "100%", maxWidth: 440,
              animation: "fadeUp 0.3s ease both"
            }}
          >
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.6rem", letterSpacing: "0.04em", color: c.text, margin: "0 0 4px"
            }}>Add Your Training</h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.85rem", color: c.textMuted, margin: "0 0 24px", lineHeight: 1.5
            }}>
              Describe what you want to work on — we'll place it in the right category automatically.
            </p>

            <label style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: c.gold, fontWeight: 600, display: "block", marginBottom: 8
            }}>What do you want to train?</label>
            <input
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder="e.g. Armada spin kick, Berimbau rhythms, Queda de rins..."
              style={{
                width: "100%", padding: "12px 16px",
                background: c.bg, border: `1px solid ${c.border}`,
                borderRadius: 8, color: c.text, fontSize: "0.95rem",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none", transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = c.gold}
              onBlur={e => e.target.style.borderColor = c.border}
              onKeyDown={e => { if (e.key === "Enter" && customInput.trim()) addCustomTraining(); }}
            />

            <label style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: c.gold, fontWeight: 600, display: "block", marginTop: 18, marginBottom: 8
            }}>Description (optional)</label>
            <textarea
              value={customDesc}
              onChange={e => setCustomDesc(e.target.value)}
              placeholder="Add details about your goal, what you want to improve..."
              rows={3}
              style={{
                width: "100%", padding: "12px 16px",
                background: c.bg, border: `1px solid ${c.border}`,
                borderRadius: 8, color: c.text, fontSize: "0.9rem",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none", resize: "vertical", transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = c.gold}
              onBlur={e => e.target.style.borderColor = c.border}
            />

            {customInput.trim() && (
              <div style={{
                marginTop: 14, padding: "8px 14px",
                background: `${(PATHS[classifyCustomTraining(customInput + " " + customDesc)]?.accent || c.gold)}11`,
                border: `1px solid ${(PATHS[classifyCustomTraining(customInput + " " + customDesc)]?.accent || c.gold)}33`,
                borderRadius: 6, display: "flex", alignItems: "center", gap: 8
              }}>
                <span style={{ fontSize: 16 }}>{PATHS[classifyCustomTraining(customInput + " " + customDesc)]?.icon}</span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem",
                  color: PATHS[classifyCustomTraining(customInput + " " + customDesc)]?.accent || c.gold
                }}>
                  Will be added to <strong>{PATHS[classifyCustomTraining(customInput + " " + customDesc)]?.name}</strong> → My Training
                </span>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1, padding: "13px 20px",
                  background: "transparent", border: `1px solid ${c.border}`,
                  borderRadius: 8, color: c.textMuted, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.target.style.borderColor = c.textMuted}
                onMouseLeave={e => e.target.style.borderColor = c.border}
              >Cancel</button>
              <button
                onClick={addCustomTraining}
                disabled={!customInput.trim()}
                style={{
                  flex: 1, padding: "13px 20px",
                  background: customInput.trim() ? `linear-gradient(135deg, ${c.gold}, #E8A020)` : c.border,
                  border: "none", borderRadius: 8,
                  color: customInput.trim() ? c.bg : c.textMuted,
                  cursor: customInput.trim() ? "pointer" : "not-allowed",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "1.05rem", letterSpacing: "0.06em",
                  transition: "all 0.3s"
                }}
                onMouseEnter={e => { if (customInput.trim()) e.target.style.transform = "scale(1.03)"; }}
                onMouseLeave={e => e.target.style.transform = "scale(1)"}
              >Add Training</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Cord Modal */}
      {showCordModal && (
        <div
          onClick={() => setShowCordModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24, animation: "fadeUp 0.2s ease both"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: c.bgCard, border: `1px solid ${c.border}`,
              borderRadius: 14, padding: "32px 28px", width: "100%", maxWidth: 440,
              animation: "fadeUp 0.3s ease both", maxHeight: "90vh", overflowY: "auto"
            }}
          >
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.6rem", letterSpacing: "0.04em", color: c.text, margin: "0 0 4px"
            }}>Add a Cord</h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.85rem", color: c.textMuted, margin: "0 0 24px", lineHeight: 1.5
            }}>
              Create a cord from your group's system — choose the color, pattern, and meaning.
            </p>

            {/* Name */}
            <label style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: c.gold, fontWeight: 600, display: "block", marginBottom: 8
            }}>Cord Name</label>
            <input
              value={cordName}
              onChange={e => setCordName(e.target.value)}
              placeholder="e.g. Amarela, Green Belt, Crua-Laranja..."
              style={{
                width: "100%", padding: "12px 16px",
                background: c.bg, border: `1px solid ${c.border}`,
                borderRadius: 8, color: c.text, fontSize: "0.95rem",
                fontFamily: "'DM Sans', sans-serif", outline: "none"
              }}
              onFocus={e => e.target.style.borderColor = c.gold}
              onBlur={e => e.target.style.borderColor = c.border}
            />

            {/* Pattern */}
            <label style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: c.gold, fontWeight: 600, display: "block", marginTop: 18, marginBottom: 8
            }}>Pattern</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["solid", "half", "striped", "gradient"].map(pat => (
                <button key={pat} onClick={() => setCordPattern(pat)}
                  style={{
                    flex: 1, padding: "10px 12px",
                    background: cordPattern === pat ? `${c.gold}22` : "transparent",
                    border: `1px solid ${cordPattern === pat ? c.gold : c.border}`,
                    borderRadius: 8, cursor: "pointer",
                    color: cordPattern === pat ? c.gold : c.textMuted,
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem",
                    fontWeight: cordPattern === pat ? 600 : 400,
                    transition: "all 0.2s"
                  }}
                >{{ solid: "Solid", half: "Half & Half", striped: "Striped", gradient: "Gradient" }[pat]}</button>
              ))}
            </div>

            {/* Primary Color */}
            <label style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: c.gold, fontWeight: 600, display: "block", marginTop: 18, marginBottom: 8
            }}>{cordPattern === "solid" ? "Color" : "Primary Color"}</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CORD_COLORS.map(cc => (
                <button key={cc.hex} onClick={() => setCordColor(cc.hex)}
                  title={cc.name}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: cc.hex, cursor: "pointer",
                    border: cordColor === cc.hex ? "3px solid #fff" : "2px solid rgba(255,255,255,0.15)",
                    boxShadow: cordColor === cc.hex ? `0 0 12px ${cc.hex}88` : "none",
                    transition: "all 0.2s"
                  }}
                />
              ))}
            </div>

            {/* Secondary Color (for striped/gradient) */}
            {cordPattern !== "solid" && (
              <>
                <label style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase",
                  color: c.gold, fontWeight: 600, display: "block", marginTop: 18, marginBottom: 8
                }}>Secondary Color</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {CORD_COLORS.map(cc => (
                    <button key={cc.hex} onClick={() => setCordStripe(cc.hex)}
                      title={cc.name}
                      style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: cc.hex, cursor: "pointer",
                        border: cordStripe === cc.hex ? "3px solid #fff" : "2px solid rgba(255,255,255,0.15)",
                        boxShadow: cordStripe === cc.hex ? `0 0 12px ${cc.hex}88` : "none",
                        transition: "all 0.2s"
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Meaning */}
            <label style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: c.gold, fontWeight: 600, display: "block", marginTop: 18, marginBottom: 8
            }}>Meaning (optional)</label>
            <input
              value={cordMeaning}
              onChange={e => setCordMeaning(e.target.value)}
              placeholder="e.g. The beginning, Awakening consciousness..."
              style={{
                width: "100%", padding: "12px 16px",
                background: c.bg, border: `1px solid ${c.border}`,
                borderRadius: 8, color: c.text, fontSize: "0.9rem",
                fontFamily: "'DM Sans', sans-serif", outline: "none"
              }}
              onFocus={e => e.target.style.borderColor = c.gold}
              onBlur={e => e.target.style.borderColor = c.border}
            />

            {/* Live Preview */}
            <div style={{
              marginTop: 20, padding: "16px 20px",
              background: c.bg, border: `1px solid ${c.border}`,
              borderRadius: 8, display: "flex", alignItems: "center", gap: 14
            }}>
              <CordVisual
                color={cordColor}
                stripe={cordPattern !== "solid" ? cordStripe : null}
                pattern={cordPattern}
                active
                small={false}
              />
              <div>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "1rem", color: c.text
                }}>{cordName || "Preview"}</div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.75rem", color: c.textMuted
                }}>{cordPattern} pattern</div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowCordModal(false)}
                style={{
                  flex: 1, padding: "13px 20px",
                  background: "transparent", border: `1px solid ${c.border}`,
                  borderRadius: 8, color: c.textMuted, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.target.style.borderColor = c.textMuted}
                onMouseLeave={e => e.target.style.borderColor = c.border}
              >Cancel</button>
              <button
                onClick={addCord}
                disabled={!cordName.trim()}
                style={{
                  flex: 1, padding: "13px 20px",
                  background: cordName.trim() ? `linear-gradient(135deg, ${c.gold}, #E8A020)` : c.border,
                  border: "none", borderRadius: 8,
                  color: cordName.trim() ? c.bg : c.textMuted,
                  cursor: cordName.trim() ? "pointer" : "not-allowed",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "1.05rem", letterSpacing: "0.06em",
                  transition: "all 0.3s"
                }}
                onMouseEnter={e => { if (cordName.trim()) e.target.style.transform = "scale(1.03)"; }}
                onMouseLeave={e => e.target.style.transform = "scale(1)"}
              >Add Cord</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Song Modal */}
      {showSongModal && (
        <div
          onClick={() => setShowSongModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24, animation: "fadeUp 0.2s ease both"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: c.bgCard, border: `1px solid ${c.border}`,
              borderRadius: 14, padding: "32px 28px", width: "100%", maxWidth: 440,
              animation: "fadeUp 0.3s ease both", maxHeight: "90vh", overflowY: "auto"
            }}
          >
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.6rem", letterSpacing: "0.04em", color: c.text, margin: "0 0 4px"
            }}>Add a Song</h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.85rem", color: c.textMuted, margin: "0 0 24px", lineHeight: 1.5
            }}>
              Save your favorite capoeira songs — corridos, ladainhas, chulas, and more.
            </p>

            {/* Title */}
            <label style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#8B5FA8", fontWeight: 600, display: "block", marginBottom: 8
            }}>Song Title</label>
            <input
              value={songTitle}
              onChange={e => setSongTitle(e.target.value)}
              placeholder='e.g. "Paranauê", "Volta do Mundo"...'
              style={{
                width: "100%", padding: "12px 16px",
                background: c.bg, border: `1px solid ${c.border}`,
                borderRadius: 8, color: c.text, fontSize: "0.95rem",
                fontFamily: "'DM Sans', sans-serif", outline: "none"
              }}
              onFocus={e => e.target.style.borderColor = "#8B5FA8"}
              onBlur={e => e.target.style.borderColor = c.border}
            />

            {/* Type */}
            <label style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#8B5FA8", fontWeight: 600, display: "block", marginTop: 18, marginBottom: 8
            }}>Type</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["corrido", "ladainha", "chula", "quadra", "other"].map(t => (
                <button key={t} onClick={() => setSongType(t)}
                  style={{
                    padding: "8px 14px",
                    background: songType === t ? "#8B5FA822" : "transparent",
                    border: `1px solid ${songType === t ? "#8B5FA8" : c.border}`,
                    borderRadius: 8, cursor: "pointer",
                    color: songType === t ? "#8B5FA8" : c.textMuted,
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem",
                    fontWeight: songType === t ? 600 : 400,
                    textTransform: "capitalize", transition: "all 0.2s"
                  }}
                >{t}</button>
              ))}
            </div>

            {/* Lyrics */}
            <label style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#8B5FA8", fontWeight: 600, display: "block", marginTop: 18, marginBottom: 8
            }}>Lyrics (optional)</label>
            <textarea
              value={songLyrics}
              onChange={e => setSongLyrics(e.target.value)}
              placeholder={"Paranauê, paranauê, paraná\nParanauê, paranauê, paraná..."}
              rows={5}
              style={{
                width: "100%", padding: "12px 16px",
                background: c.bg, border: `1px solid ${c.border}`,
                borderRadius: 8, color: c.text, fontSize: "0.9rem",
                fontFamily: "'DM Sans', sans-serif", outline: "none",
                resize: "vertical", lineHeight: 1.6
              }}
              onFocus={e => e.target.style.borderColor = "#8B5FA8"}
              onBlur={e => e.target.style.borderColor = c.border}
            />

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowSongModal(false)}
                style={{
                  flex: 1, padding: "13px 20px",
                  background: "transparent", border: `1px solid ${c.border}`,
                  borderRadius: 8, color: c.textMuted, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem"
                }}
              >Cancel</button>
              <button
                onClick={addSong}
                disabled={!songTitle.trim()}
                style={{
                  flex: 1, padding: "13px 20px",
                  background: songTitle.trim() ? "linear-gradient(135deg, #8B5FA8, #B07ACC)" : c.border,
                  border: "none", borderRadius: 8,
                  color: songTitle.trim() ? "#fff" : c.textMuted,
                  cursor: songTitle.trim() ? "pointer" : "not-allowed",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "1.05rem", letterSpacing: "0.06em",
                  transition: "all 0.3s"
                }}
                onMouseEnter={e => { if (songTitle.trim()) e.target.style.transform = "scale(1.03)"; }}
                onMouseLeave={e => e.target.style.transform = "scale(1)"}
              >Add Song</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div
          onClick={() => setShowCreateEvent(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24, animation: "fadeUp 0.2s ease both"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: c.bgCard, border: `1px solid ${c.border}`,
              borderRadius: 14, padding: "32px 28px", width: "100%", maxWidth: 480,
              animation: "fadeUp 0.3s ease both", maxHeight: "90vh", overflowY: "auto"
            }}
          >
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.6rem", letterSpacing: "0.04em", color: c.text, margin: "0 0 4px"
            }}>Create Event</h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.85rem", color: c.textMuted, margin: "0 0 24px", lineHeight: 1.5
            }}>Share your roda, workshop, batizado, or festival with the community.</p>

            {/* Event Name */}
            <label style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em",
              textTransform: "uppercase", color: EVT_ACCENT, fontWeight: 600, display: "block", marginBottom: 8
            }}>Event Name</label>
            <input value={newEvent.name} onChange={e => setNewEvent(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Sunday Open Roda"
              style={{
                width: "100%", padding: "12px 16px", background: c.bg,
                border: `1px solid ${c.border}`, borderRadius: 8, color: c.text,
                fontSize: "0.95rem", fontFamily: "'DM Sans', sans-serif", outline: "none"
              }}
              onFocus={e => e.target.style.borderColor = EVT_ACCENT}
              onBlur={e => e.target.style.borderColor = c.border}
            />

            {/* Type */}
            <label style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em",
              textTransform: "uppercase", color: EVT_ACCENT, fontWeight: 600,
              display: "block", marginTop: 16, marginBottom: 8
            }}>Type</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {EVT_TYPES.map(t => (
                <button key={t} onClick={() => setNewEvent(p => ({ ...p, type: t }))} style={{
                  padding: "7px 14px", borderRadius: 6, cursor: "pointer",
                  background: newEvent.type === t ? `${EVT_ACCENT}22` : "transparent",
                  border: `1px solid ${newEvent.type === t ? EVT_ACCENT : c.border}`,
                  color: newEvent.type === t ? EVT_ACCENT : c.textMuted,
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem",
                  fontWeight: newEvent.type === t ? 600 : 400, textTransform: "capitalize"
                }}>{t}</button>
              ))}
            </div>

            {/* Date & Time */}
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", color: EVT_ACCENT, fontWeight: 600, display: "block", marginBottom: 8
                }}>Date</label>
                <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))}
                  style={{
                    width: "100%", padding: "12px 16px", background: c.bg,
                    border: `1px solid ${c.border}`, borderRadius: 8, color: c.text,
                    fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif", outline: "none",
                    colorScheme: "dark"
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", color: EVT_ACCENT, fontWeight: 600, display: "block", marginBottom: 8
                }}>Time</label>
                <input type="time" value={newEvent.time} onChange={e => setNewEvent(p => ({ ...p, time: e.target.value }))}
                  style={{
                    width: "100%", padding: "12px 16px", background: c.bg,
                    border: `1px solid ${c.border}`, borderRadius: 8, color: c.text,
                    fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif", outline: "none",
                    colorScheme: "dark"
                  }}
                />
              </div>
            </div>

            {/* Location */}
            <label style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em",
              textTransform: "uppercase", color: EVT_ACCENT, fontWeight: 600,
              display: "block", marginTop: 16, marginBottom: 8
            }}>Location</label>
            <input value={newEvent.location} onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))}
              placeholder="City, venue, or address"
              style={{
                width: "100%", padding: "12px 16px", background: c.bg,
                border: `1px solid ${c.border}`, borderRadius: 8, color: c.text,
                fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif", outline: "none"
              }}
              onFocus={e => e.target.style.borderColor = EVT_ACCENT}
              onBlur={e => e.target.style.borderColor = c.border}
            />

            {/* Scope */}
            <label style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em",
              textTransform: "uppercase", color: EVT_ACCENT, fontWeight: 600,
              display: "block", marginTop: 16, marginBottom: 8
            }}>Scope</label>
            <div style={{ display: "flex", gap: 6 }}>
              {["local", "regional", "national", "global"].map(s => (
                <button key={s} onClick={() => setNewEvent(p => ({ ...p, scope: s }))} style={{
                  flex: 1, padding: "8px 10px", borderRadius: 6, cursor: "pointer",
                  background: newEvent.scope === s ? `${SCOPE_COLORS[s]}22` : "transparent",
                  border: `1px solid ${newEvent.scope === s ? SCOPE_COLORS[s] : c.border}`,
                  color: newEvent.scope === s ? SCOPE_COLORS[s] : c.textMuted,
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem",
                  fontWeight: newEvent.scope === s ? 600 : 400, textTransform: "capitalize"
                }}>{s}</button>
              ))}
            </div>

            {/* Description */}
            <label style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em",
              textTransform: "uppercase", color: EVT_ACCENT, fontWeight: 600,
              display: "block", marginTop: 16, marginBottom: 8
            }}>Description</label>
            <textarea value={newEvent.description} onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))}
              placeholder="Tell people what to expect..."
              rows={3}
              style={{
                width: "100%", padding: "12px 16px", background: c.bg,
                border: `1px solid ${c.border}`, borderRadius: 8, color: c.text,
                fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif", outline: "none",
                resize: "vertical"
              }}
              onFocus={e => e.target.style.borderColor = EVT_ACCENT}
              onBlur={e => e.target.style.borderColor = c.border}
            />

            {/* Organizer & Group */}
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", color: EVT_ACCENT, fontWeight: 600, display: "block", marginBottom: 8
                }}>Organizer</label>
                <input value={newEvent.organizer} onChange={e => setNewEvent(p => ({ ...p, organizer: e.target.value }))}
                  placeholder="Your name / title"
                  style={{
                    width: "100%", padding: "12px 16px", background: c.bg,
                    border: `1px solid ${c.border}`, borderRadius: 8, color: c.text,
                    fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif", outline: "none"
                  }}
                  onFocus={e => e.target.style.borderColor = EVT_ACCENT}
                  onBlur={e => e.target.style.borderColor = c.border}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", color: EVT_ACCENT, fontWeight: 600, display: "block", marginBottom: 8
                }}>Group</label>
                <input value={newEvent.group} onChange={e => setNewEvent(p => ({ ...p, group: e.target.value }))}
                  placeholder="Your capoeira group"
                  style={{
                    width: "100%", padding: "12px 16px", background: c.bg,
                    border: `1px solid ${c.border}`, borderRadius: 8, color: c.text,
                    fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif", outline: "none"
                  }}
                  onFocus={e => e.target.style.borderColor = EVT_ACCENT}
                  onBlur={e => e.target.style.borderColor = c.border}
                />
              </div>
            </div>

            {/* Price & Registration Link */}
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", color: EVT_ACCENT, fontWeight: 600, display: "block", marginBottom: 8
                }}>Price</label>
                <input value={newEvent.price} onChange={e => setNewEvent(p => ({ ...p, price: e.target.value }))}
                  placeholder="Free, £10, etc."
                  style={{
                    width: "100%", padding: "12px 16px", background: c.bg,
                    border: `1px solid ${c.border}`, borderRadius: 8, color: c.text,
                    fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif", outline: "none"
                  }}
                  onFocus={e => e.target.style.borderColor = EVT_ACCENT}
                  onBlur={e => e.target.style.borderColor = c.border}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", color: EVT_ACCENT, fontWeight: 600, display: "block", marginBottom: 8
                }}>Registration Link</label>
                <input value={newEvent.link} onChange={e => setNewEvent(p => ({ ...p, link: e.target.value }))}
                  placeholder="https://..."
                  style={{
                    width: "100%", padding: "12px 16px", background: c.bg,
                    border: `1px solid ${c.border}`, borderRadius: 8, color: c.text,
                    fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif", outline: "none"
                  }}
                  onFocus={e => e.target.style.borderColor = EVT_ACCENT}
                  onBlur={e => e.target.style.borderColor = c.border}
                />
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowCreateEvent(false)} style={{
                flex: 1, padding: "13px 20px",
                background: "transparent", border: `1px solid ${c.border}`,
                borderRadius: 8, color: c.textMuted, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem"
              }}>Cancel</button>
              <button onClick={createEvent}
                disabled={!newEvent.name.trim() || !newEvent.date}
                style={{
                  flex: 1, padding: "13px 20px",
                  background: (newEvent.name.trim() && newEvent.date) ? `linear-gradient(135deg, ${EVT_ACCENT}, #FF8A6A)` : c.border,
                  border: "none", borderRadius: 8,
                  color: (newEvent.name.trim() && newEvent.date) ? c.bg : c.textMuted,
                  cursor: (newEvent.name.trim() && newEvent.date) ? "pointer" : "not-allowed",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "1.05rem", letterSpacing: "0.06em",
                  transition: "all 0.3s"
                }}
                onMouseEnter={e => { if (newEvent.name.trim() && newEvent.date) e.target.style.transform = "scale(1.03)"; }}
                onMouseLeave={e => e.target.style.transform = "scale(1)"}
              >Create Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
