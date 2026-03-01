import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   GINGA — Capoeira Progression Guide
   Aesthetic: Kinetic Brazilian street energy, warm & alive
   For ABADÁ-Capoeira practitioners
   ═══════════════════════════════════════════════════════════════ */

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
            duration: "Ongoing — never stop refining"
          },
          {
            name: "Bênção",
            pt: "Blessing / Front Push Kick",
            description: "The most fundamental kick. A straight push kick aimed at the chest or stomach. It's the 'jab' of capoeira — fast, direct, and always a threat.",
            cues: ["Chamber the knee high before extending", "Push through with the ball of the foot or whole sole", "Hips face forward — power comes from hip extension", "Retract fast — a slow bênção gets you swept"],
            milestone: "Clean bênção from ginga to both sides, chest height, with control",
            duration: "2-3 weeks"
          },
          {
            name: "Meia Lua de Frente",
            pt: "Half Moon to the Front",
            description: "A crescent kick sweeping inward. Your first circular kick. The leg draws a half-moon arc from outside to inside, striking with the instep or shin.",
            cues: ["Keep the kicking leg mostly straight", "Arc comes from the hip — let it swing like a pendulum", "Supporting foot pivots slightly", "Return to ginga position — don't let the kick carry you off balance"],
            milestone: "Fluid meia lua de frente from ginga, both sides, head height",
            duration: "2-3 weeks"
          },
          {
            name: "Martelo",
            pt: "Hammer / Roundhouse",
            description: "The power kick. A roundhouse delivered with the instep or shin. Chamber, pivot, and unleash. This is the kick that ends games.",
            cues: ["Chamber the knee high, pointing at your target", "Pivot hard on the support foot — hips must turn over", "Strike with instep (for range) or shin (for power)", "Snap it back — don't leave your leg hanging out there"],
            milestone: "Fast, snapping martelo to head height from both sides",
            duration: "3-4 weeks"
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
            duration: "3-4 weeks"
          },
          {
            name: "Armada",
            pt: "Fleet / Spinning Back Kick",
            description: "The classic capoeira spinning kick. Full 360° rotation with the leg sweeping at head height. Beautiful, powerful, and iconic.",
            cues: ["Spot your target — look over your shoulder as you spin", "The power comes from hip rotation, not the leg", "Keep the kicking leg mostly straight for range", "Land back in ginga — control the momentum"],
            milestone: "Clean armada with full rotation and control, landing balanced",
            duration: "4-6 weeks"
          },
          {
            name: "Meia Lua de Compasso",
            pt: "Compass Half Moon",
            description: "THE signature capoeira kick. Step across, plant both hands, and sweep the leg in a massive arc. One hand on the ground, your body forms a compass. Devastating reach and power.",
            cues: ["Step across at 45°, plant one or both hands firmly", "Look through your legs at your target", "The kick sweeps at head height — hip drives the arc", "Keep the supporting hand active — you may need to adjust"],
            milestone: "Controlled compasso from ginga, both sides, touching the ground with one hand only",
            duration: "4-8 weeks"
          },
          {
            name: "Gancho",
            pt: "Hook Kick",
            description: "A hook kick, often following armada or compasso. The leg extends then snaps back with the heel as the striking surface. Catches people who duck under spinning kicks.",
            cues: ["Usually follows a spinning kick that misses", "Extend the leg straight, then snap-hook the heel back", "The target is usually the face or back of the head", "Don't telegraph — let it flow from the previous movement"],
            milestone: "Gancho as a follow-up to armada, landing clean",
            duration: "4-6 weeks"
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
            duration: "4-6 weeks"
          },
          {
            name: "Chapa",
            pt: "Sole Kick / Side Kick",
            description: "A powerful side kick or back kick using the sole of the foot. Can be thrown standing, from the ground, or from handstand. The stopping power is immense.",
            cues: ["Chamber, rotate hips sideways, extend through the heel/sole", "Can be thrown forward, sideways, or backward", "From the ground: cocorinha → explode into side kick", "Keep core tight — the power comes from the hip, not the knee"],
            milestone: "Chapa from standing AND from ground position, strong and controlled",
            duration: "3-5 weeks"
          },
          {
            name: "Martelo Cruzado",
            pt: "Crossed Hammer",
            description: "A martelo thrown with the rear leg, crossing over. Generates huge power because of the extra rotation. Unexpected angle.",
            cues: ["Step across like queixada, but chamber for roundhouse", "Extra hip rotation creates devastating power", "Don't over-rotate — control your landing", "Great follow-up after a feinted queixada"],
            milestone: "Martelo cruzado with power and landing in ginga",
            duration: "4-6 weeks"
          },
          {
            name: "Ponteira",
            pt: "Snap Kick / Tip",
            description: "A fast front snap kick using the ball of the foot or toes. Quick jab to the face or body. Less power than bênção, but much faster.",
            cues: ["Snap from the knee — minimal wind-up", "Ball of the foot or toes as striking surface", "Think 'flick' not 'push'", "Retract immediately — in and out"],
            milestone: "Lightning-fast ponteira from ginga, catching the rhythm break",
            duration: "3-4 weeks"
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
            duration: "2-4 months"
          },
          {
            name: "Armada Dupla",
            pt: "Double Fleet",
            description: "A jumping double kick — two armadas in the air. Both legs fire in succession while airborne. Incredibly athletic and crowd-pleasing.",
            cues: ["Jump high — you need airtime for both kicks", "First kick with lead leg, second with rear", "Scissor the legs — one fires as the other retracts", "Land controlled — don't sacrifice balance for height"],
            milestone: "Both kicks connecting at target height, clean landing",
            duration: "3-6 months"
          },
          {
            name: "Meia Lua Solta / Parafuso de Lado",
            pt: "Released Half Moon",
            description: "An aerial kick from compasso position — both hands release from the ground. You're airborne in a horizontal spin. Pure malícia and athleticism.",
            cues: ["Enter like compasso, but push off with hands", "Body goes horizontal as you spin", "Kick connects at peak of the rotation", "Land on both feet or transition to the ground"],
            milestone: "Airborne horizontal spin kick with controlled landing",
            duration: "3-6 months"
          },
          {
            name: "S-Dobrado",
            pt: "S-Fold / Butterfly Kick",
            description: "A no-hand aerial that traces an S-shape. Both legs sweep through the air in a butterfly motion. One of the most beautiful movements in capoeira.",
            cues: ["Swing arms for momentum as you jump", "First leg kicks up, body follows, second leg sweeps over", "Keep looking forward — don't tuck the chin", "Think 'sweeping' not 'flipping' — it's horizontal rotation"],
            milestone: "Clean s-dobrado with both legs sweeping at head height",
            duration: "4-8 months"
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
            duration: "2-3 weeks"
          },
          {
            name: "Rolê",
            pt: "Ground Spin",
            description: "A low spin on the ground used to reposition, escape, or transition. You stay close to the floor, weight on hands and one foot, spinning to a new position.",
            cues: ["Start from negativa or cocorinha", "Weight on both hands, one foot — other leg sweeps", "Stay LOW — your head should barely rise", "Always watch your opponent through the movement"],
            milestone: "Smooth rolê in both directions, transitioning into ginga or negativa",
            duration: "2-3 weeks"
          },
          {
            name: "Queda de Rins",
            pt: "Kidney Drop / Elbow Balance",
            description: "Balance on your hands with your hip resting on one elbow. Legs can be tucked, split, or extended. The foundation of many ground floreios.",
            cues: ["Hands and head form a tripod on the floor", "Twist hips and rest one hip on the same-side elbow", "Slowly lift legs off the ground", "Build hold time — strength and balance develop together"],
            milestone: "Hold 15 seconds with legs extended, both sides",
            duration: "3-4 weeks"
          },
          {
            name: "Bananeira (Handstand)",
            pt: "Banana Tree",
            description: "The capoeira handstand. Unlike gymnastic handstands, you may have a slight arch — it looks different and that's okay. Used for mobility, pauses, and kicks.",
            cues: ["Kick up and hold — don't worry about perfect straight line", "Hands shoulder-width, fingers spread", "Slight arch is natural in capoeira — embrace it", "Practice against a wall first, then freestanding"],
            milestone: "Freestanding bananeira hold, 10 seconds",
            duration: "4-8 weeks"
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
            duration: "4-8 weeks"
          },
          {
            name: "Aú Batido",
            pt: "Struck Cartwheel",
            description: "A cartwheel interrupted by a kick in the air. Mid-aú, one leg fires a chapa while you're inverted. Attack from an unexpected angle.",
            cues: ["Start a normal aú", "At the top, fire one leg outward as a chapa/kick", "The other leg continues over", "Land facing your opponent with momentum absorbed"],
            milestone: "Aú batido with a convincing kick, both directions",
            duration: "4-6 weeks"
          },
          {
            name: "Aú Sem Mão",
            pt: "No-Hands Cartwheel / Aerial",
            description: "A cartwheel without hands touching the ground. The classic aerial. Requires explosive leg drive and commitment.",
            cues: ["Swing arms hard for momentum", "Drive the lead leg UP aggressively", "Commit — half-attempts are more dangerous than full ones", "Land on one foot, then the other"],
            milestone: "Consistent aú sem mão landing on both feet",
            duration: "2-4 months"
          },
          {
            name: "Pião de Mão",
            pt: "Hand Spin",
            description: "A one-handed spin while in a handstand or queda de rins-like position. The legs spin around while one or both hands are on the ground.",
            cues: ["Start from queda de rins or bananeira", "Whip the legs to initiate the spin", "Shift weight to one hand", "Use momentum — don't muscle it"],
            milestone: "Full 360° spin on one hand, landing controlled",
            duration: "2-3 months"
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
            duration: "2-4 months"
          },
          {
            name: "Mortal de Frente (Front Flip)",
            pt: "Front Flip",
            description: "Standing front flip. Less common than back flip in the roda but impressive and useful for entering or dramatic emphasis.",
            cues: ["Swing arms up for height", "Tuck chin, drive knees to chest", "Rotate around your center — don't dive forward", "Spot the landing — open up from the tuck before contact"],
            milestone: "Clean standing front tuck from flat ground",
            duration: "2-4 months"
          },
          {
            name: "Aú de Coluna (Back Walkover)",
            pt: "Spine Cartwheel",
            description: "A slow, arching back walkover through handstand. Requires good backbend flexibility. Elegant and controlled.",
            cues: ["Reach back, bridge through handstand", "Pass through bananeira position with an arched back", "Legs go one at a time — slow and controlled", "Requires solid back and shoulder flexibility"],
            milestone: "Smooth back walkover from standing",
            duration: "2-4 months"
          },
          {
            name: "Reversão",
            pt: "Reversal / Kip-Up",
            description: "From your back, explode up to standing in one motion. Getting up off the ground with style and speed.",
            cues: ["Roll back slightly to load the spring", "Throw arms and legs simultaneously", "Hip thrust provides the lift", "Land with feet under you, ready to ginga"],
            milestone: "Kip-up from flat on back to standing, no hesitation",
            duration: "3-6 weeks"
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
            duration: "3-6 months"
          },
          {
            name: "Mortal de Costas com Pirueta",
            pt: "Back Flip with Twist",
            description: "A back flip with a full 360° twist added. Combines height, rotation, and spatial awareness.",
            cues: ["Get maximum height first — twist comes second", "Initiate twist with shoulders and head turn", "Spot your landing through the twist", "Master the backflip completely before adding twist"],
            milestone: "Back full with consistent landing",
            duration: "4-8 months"
          },
          {
            name: "Folha Seca",
            pt: "Dry Leaf",
            description: "A falling leaf — a no-hand trick where the body arcs backward and the legs sweep overhead like a leaf falling from a tree. Hypnotic and beautiful.",
            cues: ["Similar to a gainer from standing", "Arch back and let the legs sweep over", "Arms stay wide like a falling leaf", "Landing requires spotting the ground through the arch"],
            milestone: "Controlled folha seca with soft landing",
            duration: "4-8 months"
          },
          {
            name: "Aú Chibata",
            pt: "Whip Cartwheel",
            description: "A fast, low cartwheel that whips through with incredible speed, often incorporating a kick. The body barely goes vertical — it's a horizontal whip.",
            cues: ["Stay low — don't go fully vertical", "Speed is everything — drive through fast", "Can include a kick mid-rotation", "Land ready to continue the flow"],
            milestone: "Fast aú chibata transitioning immediately into a kick or ginga",
            duration: "2-4 months"
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
            duration: "1-2 weeks"
          },
          {
            name: "Esquiva Lateral",
            pt: "Lateral Dodge",
            description: "Dodge to the side by dropping low and leaning away from the kick. One hand on the ground for support.",
            cues: ["Drop low and lean to one side", "Supporting hand plants on the ground", "Other arm protects the head", "Weight stays centered — don't fall over"],
            milestone: "Fluid esquiva lateral to both sides from ginga",
            duration: "2-3 weeks"
          },
          {
            name: "Negativa",
            pt: "Negative / Low Escape",
            description: "Drop one leg extended, sit on the opposite heel, one hand on the floor, other hand protecting face. This is where you reload — many attacks and transitions start from here.",
            cues: ["Extended leg stays slightly bent — not locked", "Sit deep on the support heel", "Support hand same side as extended leg", "Guard hand up — always protecting"],
            milestone: "Comfortable negativa on both sides, flowing into rolê or attack",
            duration: "2-3 weeks"
          },
          {
            name: "Resistência",
            pt: "Resistance / Low Bridge",
            description: "A back-leaning escape where you bridge backward, often one hand on the ground. Used to dodge low attacks or set up counterattacks.",
            cues: ["Lean back from the waist, one hand reaches behind to the ground", "Legs stay bent, feet planted", "Hips stay forward if possible", "From here you can kick, sweep, or roll out"],
            milestone: "Quick resistência from standing, both sides, returning to ginga",
            duration: "2-3 weeks"
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
            duration: "4-8 weeks"
          },
          {
            name: "Banda",
            pt: "Band / Trip",
            description: "Step behind your opponent's leg and trip them using your body momentum. Less of a sweep, more of a block-and-push.",
            cues: ["Step your leg behind their supporting leg", "Block their ankle or calf", "Simultaneously push with your hand or body", "Works best when they're stepping forward"],
            milestone: "Clean banda from ginga, setting up with a fake kick first",
            duration: "3-6 weeks"
          },
          {
            name: "Vingativa",
            pt: "Revenge",
            description: "A takedown where you enter close, hook behind their leg, and push with your shoulder or chest. Named 'revenge' for a reason.",
            cues: ["Close the distance fast — enter after dodging a kick", "Hook behind their knee with your leg", "Push their upper body with your shoulder/chest", "They go down, you stay up"],
            milestone: "Vingativa from esquiva, flowing from defense to takedown",
            duration: "4-6 weeks"
          },
          {
            name: "Tesoura",
            pt: "Scissors",
            description: "A scissor takedown using your legs to trap your opponent's leg or body. Can be done from the ground or while jumping. Spectacular and effective.",
            cues: ["Jump or drop, wrapping legs around opponent's leg", "One leg in front, one behind — scissor action", "Twist or squeeze to bring them down", "Advanced: flying tesoura from aú"],
            milestone: "Tesoura from the ground, successfully trapping a partner",
            duration: "2-3 months"
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
            duration: "4-8 weeks"
          },
          {
            name: "Troca de Negativa",
            pt: "Negativa Exchange",
            description: "A hop that switches your negativa from one side to the other. Quick, low, and disorienting. Repositions you and creates attack opportunities.",
            cues: ["From negativa, hop and switch the extended leg", "Guard hand switches too", "Stay as low as possible during the switch", "Use it to dodge a sweep or reposition"],
            milestone: "Rapid troca switching 3-4 times while maintaining low position",
            duration: "3-4 weeks"
          },
          {
            name: "Rasteira de Mão",
            pt: "Hand Sweep",
            description: "A sweep using your hand instead of foot. While in negativa or low position, grab the opponent's ankle and pull during their kick.",
            cues: ["You must be low — negativa or similar position", "Time the grab when they commit to a kick", "Pull the supporting foot toward you, fast", "Can also push the kicking leg to amplify imbalance"],
            milestone: "Successful hand sweep during live roda play",
            duration: "4-8 weeks"
          },
          {
            name: "Aú de Cabeça com Rolê",
            pt: "Headstand Roll Transition",
            description: "From a headstand or aú, transition into a ground roll. Flow between vertical and horizontal planes seamlessly. This is what makes a ground game beautiful.",
            cues: ["From aú or bananeira, lower controlled into a roll", "Use momentum — don't crash", "Emerge into negativa, cocorinha, or standing", "Practice the transition slowly before adding speed"],
            milestone: "Seamless aú → headstand → rolê → negativa flow",
            duration: "4-6 weeks"
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
            duration: "3-6 months"
          },
          {
            name: "Chapéu de Couro",
            pt: "Leather Hat",
            description: "A dramatic ground-level movement where you swing over your opponent who is on the ground. Leapfrog meets cartwheel. Shows dominance and control.",
            cues: ["Opponent is low or on the ground", "Jump and arc over them using one or both hands", "Legs clear their body completely", "Land on the other side, ready to continue"],
            milestone: "Chapéu de couro over a partner cleanly during a game",
            duration: "2-4 months"
          },
          {
            name: "Cabeçada",
            pt: "Headbutt",
            description: "One of the oldest techniques in capoeira. A controlled headbutt to the chest, used close range. Not about force — about timing and surprise.",
            cues: ["Use the top of the forehead — never the face", "Enter from a low position — negativa, esquiva", "Drive upward through the legs, head contacts chest", "More of a push than a strike — control is key"],
            milestone: "Controlled cabeçada entry from esquiva in a game",
            duration: "4-8 weeks"
          },
          {
            name: "Fluxo Completo (Complete Flow)",
            pt: "Total Game Integration",
            description: "The ultimate goal: seamless flow between standing kicks, ground game, sweeps, floreios, and malícia. Not individual moves but an unbroken conversation with your body and your opponent.",
            cues: ["Stop thinking in individual moves — think in phrases", "Every dodge should contain a counter", "Every attack should set up the next movement", "Play with rhythm changes — fast/slow, high/low, in/out"],
            milestone: "Play a 3-minute roda game using all paths — kicks, ground, floreios, takedowns — seamlessly",
            duration: "Ongoing — the lifelong pursuit"
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
            duration: "1-2 weeks"
          },
          {
            name: "Basic Capoeira Songs (Corridos)",
            pt: "Corridos",
            description: "Corridos are the call-and-response songs during the game. The leader sings a line, the roda responds. Learn 5-10 basic corridos by heart.",
            cues: ["Start with: 'Paranauê,' 'Volta do Mundo,' 'Sai Sai Catarina'", "Learn the chorus first — that's what you sing in the roda", "Pronunciation matters — learn the Portuguese", "Sing with energy — this isn't background music"],
            milestone: "Sing the chorus of 10 corridos from memory during a roda",
            duration: "3-4 weeks"
          },
          {
            name: "Ladainhas (Opening Songs)",
            pt: "Litanies",
            description: "The slow, storytelling songs sung at the opening of a roda, usually by the most senior player. They tell of capoeira history, legends, and life lessons.",
            cues: ["Ladainha is sung solo — everyone listens", "The roda doesn't start until the ladainha ends", "Learn at least 3 ladainhas", "Understand the stories — they carry the history"],
            milestone: "Sing one complete ladainha from memory with correct melody and Portuguese",
            duration: "4-8 weeks"
          },
          {
            name: "Pandeiro (Tambourine)",
            pt: "Tambourine",
            description: "The pandeiro provides the rhythmic backbone of the bateria. Held in one hand, struck with the other. Multiple tones possible.",
            cues: ["Three basic sounds: open (thumb), closed (fingertips), slap (palm)", "The basic samba rhythm: thumb-tip-slap-tip", "Keep the pandeiro tilted slightly", "Wrist movement — don't slap with the whole arm"],
            milestone: "Play basic pandeiro rhythm for 5 minutes without losing the beat",
            duration: "4-6 weeks"
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
            duration: "4-6 weeks"
          },
          {
            name: "Berimbau — Holding & Striking",
            pt: "Berimbau Basics",
            description: "The master instrument of capoeira. A single-string bow with a gourd resonator. Hold the stone (pedra), press the string, and strike with the stick (baqueta).",
            cues: ["Left hand holds berimbau, stone (dobrão), and gourd", "Right hand holds baqueta and caxixi", "Three tones: open (solto), closed (preso), buzz (chiado)", "The gourd opens and closes against your belly for resonance"],
            milestone: "Produce all three clean tones consistently",
            duration: "4-8 weeks"
          },
          {
            name: "Berimbau — Toque de Angola",
            pt: "Angola Rhythm",
            description: "The slow, methodical rhythm of Capoeira Angola. Deep, grounded, meditative. Dictates a slow, strategic game full of malícia.",
            cues: ["Slow tempo — don't rush", "The rhythm cycles: ding-dong-ding-dong-ding...", "Alternating open and closed tones", "Feel the weight of each note — it controls the roda"],
            milestone: "Play toque de Angola for 5 minutes maintaining steady tempo",
            duration: "4-6 weeks"
          },
          {
            name: "Berimbau — Toque de São Bento Grande",
            pt: "São Bento Grande Rhythm",
            description: "The fast rhythm of Regional. This is the toque that drives the athletic, kick-heavy game most people associate with capoeira. Energetic and driving.",
            cues: ["Faster tempo — builds energy in the roda", "More complex pattern than Angola", "The buzz tone features heavily", "This toque is what you hear most in ABADÁ rodas"],
            milestone: "Play São Bento Grande de ABADÁ for 5 minutes with speed and consistency",
            duration: "2-3 months"
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
            duration: "2-4 months"
          },
          {
            name: "Berimbau — Multiple Toques",
            pt: "Multiple Rhythms",
            description: "Learn the full range of toques: Angola, São Bento Pequeno, São Bento Grande, Amazonas, Iuna, Santa Maria, Cavalaria. Each dictates a different game.",
            cues: ["Each toque changes the energy of the roda", "Iuna: only graduated students play", "Cavalaria: warning rhythm (historically warning of police)", "Practice switching between toques without stopping"],
            milestone: "Play 5 different toques and explain when each is used",
            duration: "3-6 months"
          },
          {
            name: "Capoeira History",
            pt: "History & Origins",
            description: "Know the history: enslaved Africans in Brazil, engolo from Angola, the persecution era, legalization, Mestre Bimba and Regional, Mestre Pastinha and Angola, and the founding of ABADÁ by Mestre Camisa.",
            cues: ["Study the African roots — particularly engolo from Angola", "Understand why capoeira was criminalized (and when)", "Mestre Bimba (Regional) vs Mestre Pastinha (Angola)", "Mestre Camisa and the ABADÁ philosophy"],
            milestone: "Explain capoeira's history from African origins to ABADÁ's founding to a newcomer",
            duration: "2-3 months"
          },
          {
            name: "Portuguese for Capoeira",
            pt: "Language",
            description: "Understand what you're singing. Learn the key Portuguese terms, phrases in songs, and basic conversation relevant to capoeira.",
            cues: ["Movement names: know what every name means", "Song vocabulary: axé, mandinga, malícia, dendê, berimbau", "Basic phrases: 'Joga bonito,' 'Iê, volta do mundo'", "Understanding lyrics transforms your connection to the music"],
            milestone: "Translate and explain 10 full capoeira songs",
            duration: "3-6 months"
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
            duration: "3-6 months"
          },
          {
            name: "Commanding the Bateria",
            pt: "Musical Direction",
            description: "Lead the entire musical ensemble. Control the energy of the roda through your berimbau, change toques to shift the game, call songs that match the moment.",
            cues: ["The gunga player is the conductor of the roda", "Change toques to change the energy — faster, slower, different game", "Call songs that match or contrast with what's happening", "Start and end games with the berimbau"],
            milestone: "Command a full roda bateria for 30+ minutes, managing energy and transitions",
            duration: "6-12 months"
          },
          {
            name: "Understanding Fundamentos",
            pt: "Deep Principles",
            description: "Beyond technique: understand mandinga (magic/sorcery in movement), malícia (cunning/deception), axé (vital force), and dendê (the flavor of capoeira). These are what separate a technician from a capoeirista.",
            cues: ["Mandinga cannot be taught — it emerges from deep practice", "Malícia is reading intention before action", "Axé is the energy you bring and the energy the roda creates", "Dendê is style, flavor, your unique expression"],
            milestone: "Demonstrate mandinga and malícia in the roda — your mestre will tell you when you have it",
            duration: "Ongoing — lifelong"
          },
          {
            name: "ABADÁ Philosophy & Community",
            pt: "Group Values",
            description: "Understand and embody ABADÁ's philosophy: the relentless pursuit of technical mastery, the cycle of learning and teaching, community building, and using capoeira as a tool for personal and social growth.",
            cues: ["Study Mestre Camisa's writings and teachings", "The cord system represents nature — each color has meaning", "Teaching is part of growth — give back to the group", "Capoeira is a vehicle for social transformation"],
            milestone: "Articulate ABADÁ's philosophy and how it shapes your practice and life",
            duration: "Ongoing"
          }
        ]
      }
    ]
  }
};

const ABADA_CORDS = [
  { name: "Crua", color: "#E8DCC6", border: "#C4B896", meaning: "Raw / Natural — the beginning" },
  { name: "Crua-Amarela", color: "#E8DCC6", stripe: "#D4A843", meaning: "Transformation begins" },
  { name: "Amarela", color: "#D4A843", border: "#B8860B", meaning: "Gold — value of apprenticeship" },
  { name: "Amarela-Laranja", color: "#D4A843", stripe: "#E8652B", meaning: "Transformation — YOU ARE HERE", active: true },
  { name: "Laranja", color: "#E8652B", border: "#C2410C", meaning: "The Sun — awakening consciousness" },
  { name: "Laranja-Azul", color: "#E8652B", stripe: "#2563EB", meaning: "Transformation to graduate" },
  { name: "Azul", color: "#2563EB", border: "#1D4ED8", meaning: "The Sea — awareness of the path ahead" },
  { name: "Azul-Verde", color: "#2563EB", stripe: "#16A34A", meaning: "Transformation" },
  { name: "Verde", color: "#16A34A", border: "#15803D", meaning: "The Forest — foundation solidified" },
  { name: "Verde-Roxo", color: "#16A34A", stripe: "#7C3AED", meaning: "Transition to instructor" },
  { name: "Roxo", color: "#7C3AED", border: "#6D28D9", meaning: "Amethyst — overcoming pain" },
];

// ── Animated Background ──

function KineticBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {/* Flowing curves */}
      <svg viewBox="0 0 1200 800" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}>
        <path d="M-100 400 Q200 100 400 400 Q600 700 800 400 Q1000 100 1300 400" stroke="currentColor" strokeWidth="2" fill="none">
          <animate attributeName="d" dur="20s" repeatCount="indefinite"
            values="M-100 400 Q200 100 400 400 Q600 700 800 400 Q1000 100 1300 400;
                    M-100 400 Q200 600 400 400 Q600 200 800 400 Q1000 600 1300 400;
                    M-100 400 Q200 100 400 400 Q600 700 800 400 Q1000 100 1300 400" />
        </path>
        <path d="M-100 300 Q300 500 500 300 Q700 100 900 300 Q1100 500 1300 300" stroke="currentColor" strokeWidth="1.5" fill="none">
          <animate attributeName="d" dur="25s" repeatCount="indefinite"
            values="M-100 300 Q300 500 500 300 Q700 100 900 300 Q1100 500 1300 300;
                    M-100 300 Q300 100 500 300 Q700 500 900 300 Q1100 100 1300 300;
                    M-100 300 Q300 500 500 300 Q700 100 900 300 Q1100 500 1300 300" />
        </path>
        <path d="M-100 550 Q200 350 500 550 Q800 750 1100 550 Q1300 350 1500 550" stroke="currentColor" strokeWidth="1" fill="none">
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
          border: "1px solid currentColor",
          opacity: 0.02 + i * 0.005,
          left: `${15 + i * 14}%`,
          top: `${20 + (i % 3) * 25}%`,
          animation: `floatCircle ${18 + i * 4}s ease-in-out infinite ${i * 2}s`
        }} />
      ))}
    </div>
  );
}

function CordVisual({ color, stripe, active, small }) {
  const h = small ? 16 : 24;
  const w = small ? 60 : 90;
  return (
    <div style={{
      width: w, height: h, borderRadius: h / 2, position: "relative", overflow: "hidden",
      background: color,
      boxShadow: active ? `0 0 12px ${color}88, 0 0 24px ${color}44` : "none",
      border: active ? "2px solid #fff" : "1px solid rgba(255,255,255,0.15)"
    }}>
      {stripe && (
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "35%", height: "100%", background: stripe
        }} />
      )}
    </div>
  );
}

// ── App ──

export default function CapoeiraApp() {
  const [view, setView] = useState("home");
  const [pathKey, setPathKey] = useState(null);
  const [levelIdx, setLevelIdx] = useState(0);
  const [skill, setSkill] = useState(null);
  const [completed, setCompleted] = useState({});
  const [fade, setFade] = useState(true);

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
    let t = 0, d = 0;
    PATHS[pk].levels.forEach((l, li) => l.skills.forEach((_, si) => { t++; if (completed[`${pk}-${li}-${si}`]) d++; }));
    return { t, d, pct: t ? Math.round(d / t * 100) : 0 };
  };

  const lvlProg = (pk, li) => {
    let t = 0, d = 0;
    PATHS[pk].levels[li].skills.forEach((_, si) => { t++; if (completed[`${pk}-${li}-${si}`]) d++; });
    return { t, d, pct: t ? Math.round(d / t * 100) : 0 };
  };

  const c = {
    bg: "#1A1108",
    bgCard: "#241A0F",
    bgCardLight: "#2C2014",
    text: "#F5ECD7",
    textMuted: "#A89272",
    gold: "#D4A843",
    goldDim: "rgba(212,168,67,0.15)",
    border: "#3D2E1C",
  };

  const container = {
    maxWidth: 850, margin: "0 auto", padding: "0 24px",
    position: "relative", zIndex: 1,
    opacity: fade ? 1 : 0, transition: "opacity 0.12s ease"
  };

  // ── HOME ──
  const renderHome = () => (
    <div style={container}>
      <header style={{ textAlign: "center", padding: "48px 0 0" }}>
        <div style={{
          fontSize: "clamp(3rem, 8vw, 5rem)",
          fontWeight: 800,
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: "0.06em",
          lineHeight: 0.9,
          color: c.text,
          animation: "slideDown 0.6s ease both"
        }}>
          <span style={{ WebkitTextStroke: "1px rgba(212,168,67,0.4)", color: "transparent" }}>GINGA</span>
        </div>
        <div style={{
          fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 300,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: c.textMuted,
          marginTop: 4,
          animation: "slideDown 0.6s ease both 0.1s"
        }}>
          Capoeira Progression Guide
        </div>
        
        <div style={{
          margin: "28px auto 0", maxWidth: 360,
          animation: "slideDown 0.6s ease both 0.2s"
        }}>
          <div style={{
            fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase",
            color: c.gold, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            marginBottom: 10
          }}>Your Cord · ABADÁ-Capoeira</div>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "14px 20px",
            background: c.bgCard,
            border: `1px solid ${c.border}`,
            borderRadius: 8
          }}>
            <CordVisual color="#D4A843" stripe="#E8652B" active small={false} />
            <div style={{ textAlign: "left" }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.1rem", letterSpacing: "0.05em", color: c.text
              }}>Amarela-Laranja</div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.78rem", color: c.textMuted
              }}>The Awakening · Aluno(a)</div>
            </div>
          </div>
        </div>
      </header>

      {/* Path Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, marginTop: 40 }}>
        {Object.entries(PATHS).map(([key, path], i) => {
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
                position: "relative"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = path.accent;
                e.currentTarget.style.transform = "translateY(-4px) scale(1.01)";
                e.currentTarget.style.boxShadow = `0 12px 40px ${path.glow}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = c.border;
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
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
                  height: 4, background: c.border, borderRadius: 2, overflow: "hidden"
                }}>
                  <div style={{
                    width: `${p.pct}%`, height: "100%",
                    background: `linear-gradient(90deg, ${path.accent}, ${path.accentAlt})`,
                    borderRadius: 2, transition: "width 0.5s"
                  }} />
                </div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.75rem", color: c.textMuted, marginTop: 6
                }}>{p.d}/{p.t} movements mastered</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cord System Card */}
      <div
        onClick={() => go("cords")}
        style={{
          background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 12,
          padding: "20px 24px", marginTop: 16, cursor: "pointer",
          transition: "all 0.3s",
          animation: "fadeUp 0.5s ease both 0.55s"
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = c.gold; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = "none"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 28 }}>🪢</span>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.2rem", letterSpacing: "0.04em", color: c.gold, margin: 0
            }}>ABADÁ Cord System</h3>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.82rem", color: c.textMuted, margin: "2px 0 0"
            }}>The path from crua to mestre — and where you stand</p>
          </div>
          <span style={{ color: c.textMuted, fontSize: "1.4rem" }}>→</span>
        </div>
      </div>

      {/* Quote */}
      <div style={{
        textAlign: "center", padding: "40px 20px 48px",
        animation: "fadeUp 0.5s ease both 0.65s"
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
    </div>
  );

  // ── PATH ──
  const renderPath = () => {
    const p = PATHS[pathKey]; if (!p) return null;
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
            return (
              <button key={idx} onClick={() => setLevelIdx(idx)} style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem",
                fontWeight: active ? 600 : 400,
                background: active ? `${p.accent}22` : "transparent",
                border: `1px solid ${active ? p.accent : c.border}`,
                borderRadius: 8, padding: "10px 18px", cursor: "pointer",
                color: active ? p.accent : c.textMuted,
                whiteSpace: "nowrap", transition: "all 0.2s"
              }}>
                <div>{lev.name}</div>
                <div style={{ fontSize: "0.7rem", opacity: 0.8, marginTop: 2 }}>
                  {lpr.d}/{lpr.t} {lpr.pct === 100 ? "✦" : ""}
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
                  <div style={{
                    display: "flex", gap: 16, marginTop: 8,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.73rem", color: c.textMuted
                  }}>
                    <span>⏱ {sk.duration}</span>
                  </div>
                </div>
                <span style={{ color: c.textMuted, fontSize: "1.2rem", marginTop: 4 }}>›</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── SKILL ──
  const renderSkill = () => {
    if (!skill || !pathKey) return null;
    const p = PATHS[pathKey];
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
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              margin: "8px 0 0", color: c.textMuted, fontSize: "0.8rem", fontStyle: "italic"
            }}>Estimated: {skill.duration}</p>
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
            {done ? "✦ MASTERED — TAP TO UNDO" : "MARK AS MASTERED ✦"}
          </button>
          <div style={{ height: 48 }} />
        </div>
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
        }}>ABADÁ Cord System</h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.92rem", color: c.textMuted, fontStyle: "italic"
        }}>Each cord represents a stage of growth — colors drawn from nature</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 48 }}>
        {ABADA_CORDS.map((cord, i) => (
          <div key={i} style={{
            background: cord.active ? c.goldDim : c.bgCard,
            border: `1px solid ${cord.active ? c.gold : c.border}`,
            borderRadius: 10, padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 16,
            animation: `fadeUp 0.35s ease both ${i * 0.04}s`,
            position: "relative",
            overflow: "hidden"
          }}>
            {cord.active && <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
              background: c.gold
            }} />}
            <CordVisual color={cord.color} stripe={cord.stripe} active={cord.active} small />
            <div>
              <h3 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.05rem", letterSpacing: "0.04em",
                color: cord.active ? c.gold : c.text, margin: 0
              }}>{cord.name}</h3>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.82rem", color: c.textMuted, margin: "2px 0 0"
              }}>{cord.meaning}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: `
        radial-gradient(ellipse at 20% 0%, rgba(212,168,67,0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, rgba(232,101,43,0.04) 0%, transparent 50%),
        ${c.bg}
      `,
      color: c.text, position: "relative"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; background: #1A1108; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1A1108; }
        ::-webkit-scrollbar-thumb { background: #3D2E1C; border-radius: 3px; }
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
      <KineticBackground />
      {view === "home" && renderHome()}
      {view === "path" && renderPath()}
      {view === "skill" && renderSkill()}
      {view === "cords" && renderCords()}
    </div>
  );
}
