const { useState, useEffect, useCallback, useRef } = React;

// ========== DATABASE LAYER ==========
const DB = {
  async load(key) {
    try {
      const r = await window.storage.get(key);
      return r ? JSON.parse(r.value) : null;
    } catch { return null; }
  },
  async save(key, data) {
    try {
      await window.storage.set(key, JSON.stringify(data));
    } catch (e) { console.error("Save failed:", e); }
  },
  async remove(key) {
    try { await window.storage.delete(key); } catch {}
  },
  async listKeys(prefix) {
    try {
      const r = await window.storage.list(prefix);
      return r?.keys || [];
    } catch { return []; }
  }
};

// ========== GAME DATA ==========
const THREAT_BANDS = {
  A: [
    { name: "Disquiet", color: "#22c55e", slots: 4 },
    { name: "Unease", color: "#84cc16", slots: 4 },
    { name: "Distress", color: "#eab308", slots: 4 },
    { name: "Dismay", color: "#f97316", slots: 4 },
    { name: "Desperation", color: "#ef4444", slots: 4 },
    { name: "Doom", color: "#991b1b", slots: 4 },
  ],
  B: [
    { name: "Disquiet", color: "#22c55e", slots: 3 },
    { name: "Unease", color: "#84cc16", slots: 3 },
    { name: "Distress", color: "#eab308", slots: 4 },
    { name: "Dismay", color: "#f97316", slots: 4 },
    { name: "Desperation", color: "#ef4444", slots: 5 },
    { name: "Doom", color: "#991b1b", slots: 5 },
  ],
};

const STATUS_EFFECTS = [
  { id: "fatigued", name: "Fatigado", icon: "😰", color: "#eab308" },
  { id: "poisoned", name: "Envenenado", icon: "☠️", color: "#22c55e" },
  { id: "cursed", name: "Maldito", icon: "💀", color: "#7c3aed" },
  { id: "burning", name: "Quemando", icon: "🔥", color: "#ef4444" },
  { id: "terrified", name: "Aterrorizado", icon: "😱", color: "#a855f7" },
  { id: "stunned", name: "Aturdido", icon: "💫", color: "#3b82f6" },
  { id: "wounded", name: "Herido", icon: "🩸", color: "#dc2626" },
  { id: "blessed", name: "Bendito", icon: "✨", color: "#fbbf24" },
  { id: "corrupted", name: "Corrompido", icon: "🌑", color: "#1e1b4b" },
  { id: "prone", name: "Derribado", icon: "⬇️", color: "#6b7280" },
];

const BASE_CHARACTERS = [
  { nombre: "Grogmar", especie: "Ormen", salud_max: 7, habilidad_max: 3, magia_max: 2, acciones: 2, coste: 73, innatas: ["Quick Recovery"] },
  { nombre: "Moranna", especie: "Human", salud_max: 5, habilidad_max: 5, magia_max: 4, acciones: 2, coste: 80, innatas: ["Impervious", "Malacyte Mastery"] },
  { nombre: "Greet", especie: "Grobbler", salud_max: 5, habilidad_max: 5, magia_max: 3, acciones: 3, coste: 75, innatas: ["Barter", "Tricks of the Trade"] },
  { nombre: "Syrio", especie: "Eld", salud_max: 6, habilidad_max: 4, magia_max: 3, acciones: 2, coste: 64, innatas: ["Reflexes"] },
  { nombre: "Callan", especie: "Human", salud_max: 5, habilidad_max: 4, magia_max: 3, acciones: 2, coste: 54, innatas: ["Frenzy"] },
  { nombre: "Nerinda", especie: "Human", salud_max: 5, habilidad_max: 4, magia_max: 2, acciones: 2, coste: 80, innatas: ["Weapons Master 1"] },
  { nombre: "Unger", especie: "Tregar", salud_max: 4, habilidad_max: 3, magia_max: 1, acciones: 2, coste: 73, innatas: ["Persuasión", "Detect"] },
  { nombre: "Kriga", especie: "Human", salud_max: 4, habilidad_max: 3, magia_max: 1, acciones: 2, coste: 73, innatas: [] },
  { nombre: "Beren", especie: "Human", salud_max: 4, habilidad_max: 4, magia_max: 2, acciones: 2, coste: 71, innatas: ["Natural Remedies", "Ready for Anything"] },
  { nombre: "Hendley", especie: "Dwella", salud_max: 4, habilidad_max: 3, magia_max: 1, acciones: 2, coste: 75, innatas: ["Night Vision", "Smithing"] },
  { nombre: "Galen", especie: "Eld", salud_max: 3, habilidad_max: 3, magia_max: 1, acciones: 2, coste: 75, innatas: ["Ambush"] },
  { nombre: "Artain", especie: "Human", salud_max: 3, habilidad_max: 3, magia_max: 3, acciones: 2, coste: 61, innatas: ["Entertainer"] },
  { nombre: "Ariah", especie: "Human", salud_max: 3, habilidad_max: 4, magia_max: 1, acciones: 2, coste: 73, innatas: ["Tactical Gift", "Ranged Expert"] },
  { nombre: "Brahm", especie: "Human", salud_max: 4, habilidad_max: 4, magia_max: 3, acciones: 2, coste: 90, innatas: ["Weapons Master", "Ranged Expert"] },
  { nombre: "Emmerik", especie: "Human", salud_max: 3, habilidad_max: 3, magia_max: 4, acciones: 2, coste: 60, innatas: ["Loremaster"] },
];

const CLASSES = [
  "Barbarian","Rogue","Sellsword","Assassin","Scavenger","Swindler",
  "Marksman","Guardian","Blacksmith","Curator","Contender","Strategist",
  "Maestro","Rook","Paladin","Prymorist","Eudaemon","Ranger","Druid","Magus","Rambler"
];

const MISSIONS = {
  Intro: {
    id: "Intro", nombre: "De Moneda y Gloria", pagina: 4,
    condicion: "Misión independiente rejugable. Puede jugarse antes de la campaña o entre misiones (cuesta 1 espacio de Demora si se juega dentro de la campaña).",
    objetivo_primario: "Recolectar armas, armaduras y recursos. Ganar experiencia de combate.",
    objetivo_secundario: "Recuperar Objetivos 7 y 8 de la bolsa de fichas. Cada uno vale 1 Renombre en Mercado.",
    reglas_especiales: [
      { nombre: "Mecanismos Antiguos", desc: "4 palancas activas. Al interactuar con cada una, girar la ficha y resolver: 1=roto sin efecto, 2=abre tragaluz/retira Oscuridad, 3=cierra tragaluz/añade Oscuridad, 4=cierra puerta al azar, 5=desbloquea puerta al azar, 6=retira pared amarilla → acceso a Cámara del Arcanista." }
    ],
    amenaza: { cara: "A", clavijas: 0 },
    mazo_eventos: "8× Lamentor, 2× Hellfront, 8× Mapa, 2× Malagaunt + dificultad",
    consecuencias: "Ninguna (misión independiente). Si se juega en campaña: +1 Demora.",
  },
  A: {
    id: "A", nombre: "Secretos en la Oscuridad", pagina: 6,
    condicion: "Primera misión de la campaña.",
    objetivo_primario: "Recuperar Reliquias de Objetivos 1-8 (una por cada caja, cofre y tumba). Cada reliquia vale 6₲ en Mercado. Anotar número de reliquias recuperadas en Registro.",
    objetivo_secundario: "Recuperar Objetivo 9 del Escritorio del Arcanista. Representa mapas y diarios. Si se recupera: descartarlo en Descanso y marcar Logro Parafernalia Oculta.",
    reglas_especiales: [],
    amenaza: { cara: "A", clavijas: 0 },
    mazo_eventos: "8× Lamentor, 8× Mapa, 2× Hellfront, 2× Malagaunt + dificultad",
    asignacion_busqueda: "Dejar 2 negras aparte. 6× fichas + 1× mapa en terreno buscable.",
    consecuencias: "Si recuperaste Objetivo 1 → puedes jugar Misión B. Si 5+ reliquias → Misión C. Si 4 o menos → Misión D.",
  },
  B: {
    id: "B", nombre: "La Reliquia", pagina: 8,
    condicion: "Opcional. Se juega después de A si recuperaste Objetivo 1.",
    objetivo_primario: "Encontrar al familiar del aldeano atrinchado. Si se rescata por Punto de Reagrupamiento: familia paga 10₲ + 2 Renombre + marcar Logro Deuda de Favor.",
    objetivo_secundario: "Saquear todo lo posible.",
    reglas_especiales: [
      { nombre: "Oscuridad", desc: "Toda el área sigue reglas de Oscuridad. El Habitante no se activa hasta que un Aventurero entre en contacto corto o sea atacado → aumenta Amenaza en 3." }
    ],
    amenaza: { cara: "A", clavijas: 2 },
    mazo_eventos: "8× Lamentor, 8× Mapa, 3× Hellfront, 1× Malagaunt + dificultad",
    consecuencias: "+1 Demora. Luego: 5+ reliquias → C, 4 o menos → D.",
  },
  C: {
    id: "C", nombre: "Un Nuevo Poder en Ascenso", pagina: 10,
    condicion: "Recuperaste 5+ reliquias en Misión A.",
    objetivo_primario: "Recuperar partes de criaturas derrotadas como Objetivos: Primer Lamentor tras Amenaza ≥ Distress → Obj 1-3. Primera Myria tras ≥ Distress → Obj 4-5. Primer Hellfront → Obj 6. Rot Troll → Obj 9.",
    objetivo_secundario: "Recuperar Objetivos 7 y 8. Si ambos: marcar Logro Rastro Esquelético.",
    reglas_especiales: [
      { nombre: "Sombras Cambiantes", desc: "Oscuridad activa. Al inicio lanzar Dado Mágico 3 veces → colocar Luz. Desde Distress: mover luz al siguiente nro. más alto. Palancas para mover luz." }
    ],
    amenaza: { cara: "A", clavijas: 2 },
    mazo_eventos: "8× Lamentor, 8× Mapa, 2× Hellfront, 2× Malagaunt + dificultad",
    consecuencias: "Si Obj 7 u 8 → elegir ruta. Carretera → Misión E. Túneles → Misión F. Sin Obj 7/8 → Misión E.",
  },
  D: {
    id: "D", nombre: "Resurrectionistas", pagina: 12,
    condicion: "Recuperaste 4 o menos reliquias en Misión A.",
    objetivo_primario: "Acumular botín. 1 Renombre por cada 20₲ de aumento en Mercado.",
    objetivo_secundario: "Mapeo de Túneles: Interactuar con puntos de entrada para mapearlos. Robo de Tumbas: Buscar en Espacios de Sepultura. Anotar en Registro.",
    reglas_especiales: [
      { nombre: "Spawn", desc: "Si Revenants llegan y no hay ninguno activo → colocarlos en punto de entrada más cercano." }
    ],
    amenaza: { cara: "A", clavijas: 1 },
    mazo_eventos: "7× Lamentor, 2× Malagaunt, 6× Mapa, 2× Hellfront, 3× Malagaunt, 1× Omega + dificultad",
    consecuencias: "Siguiente misión: Misión F.",
  },
};

const DEMORA_EFFECTS = [
  { min: 0, max: 2, desc: "Sin efectos negativos." },
  { min: 3, max: 4, desc: "Aumenta la dificultad base de las misiones." },
  { min: 5, max: 6, desc: "Efectos moderados en las misiones." },
  { min: 7, max: 8, desc: "Efectos severos. La situación empeora." },
  { min: 9, max: 10, desc: "Casi al límite. Consecuencias graves." },
  { min: 11, max: 12, desc: "Máxima presión. El tiempo se acaba." },
];

const TURN_PHASES = [
  {
    id: "dread", name: "Fase de Amenaza", icon: "⚡",
    steps: [
      "Avanzar Amenaza +1",
      "Si magia fue usada esta ronda → +1 adicional",
      "Si clavija entra en espacio rojo → lanzar Dado Mágico",
      "Robar Carta de Evento (desde ronda 2)",
      "Resolver efecto según nivel de Amenaza actual",
    ]
  },
  {
    id: "adventurers", name: "Fase de Aventureros", icon: "⚔️",
    steps: [
      "Activar Aventureros alternando entre jugadores",
      "Cada Aventurero: hasta 2 acciones + 1 sin esfuerzo",
      "Todos los Aventureros activados",
    ]
  },
  {
    id: "adversary", name: "Fase de Adversarios", icon: "👹",
    steps: [
      "Nuevas llegadas según banda de Amenaza",
      "Activar Adversarios por Rango (mayor primero)",
      "Resolver IA de cada uno",
    ]
  },
  {
    id: "npc", name: "Fase de PNJs", icon: "🧙",
    steps: [
      "Activar Wandering Beasts",
      "Activar Denizens / Habitantes",
    ]
  },
  {
    id: "assessment", name: "Fase de Evaluación", icon: "📋",
    steps: [
      "Resolver efectos de estado (Burning, Poisoned, etc.)",
      "Retirar contadores según reglas",
      "Retirar contadores de Activación",
      "Siguiente primer jugador en sentido horario",
    ]
  },
];

function defaultCampaign(name) {
  return {
    id: "camp_" + Date.now(),
    name,
    createdAt: new Date().toISOString(),
    currentMission: "A",
    demora: 0,
    registro: {
      malagauntDerrotado: 0, troll_derrotado: false,
      aprendiz_estado: null, aprendiz_nombre: null,
      cadaveres_examinados: 0, sepulturas_registradas: 0,
      invasores_escapados: 0, disminuir_horda: 0, salas_santificadas: 0,
      puntos_entrada_mapeados: [],
      logros: {
        deuda_de_favor: false, rastro_esqueletico: false,
        parafernalia_oculta: false, aprendiz_derrotado: false,
        aprendiz_liberado: false, troll_derrotado_logro: false,
        investigacion_en_curso: false, escudo_de_almas: false,
      },
      recompensas: {
        perspectiva_tactica: 0, resistencia_al_veneno: false,
        debilidad_del_objetivo: false, experiencia_de_combate: false,
        saqueo_de_sepulturas: false, signos_reveladores: false,
        ritual_de_consagracion: false, oferta_de_ayuda: false,
        contactos_en_gremio: false, sabiduria_de_mazmorra: 0,
      },
    },
  };
}

function defaultAdventurer(campId, charData) {
  return {
    id: "adv_" + Date.now() + "_" + Math.random().toString(36).slice(2,6),
    campaign_id: campId,
    nombre: charData.nombre,
    clase: "",
    especie: charData.especie,
    rango: 1,
    experiencia: 0,
    salud_max: charData.salud_max,
    salud_actual: charData.salud_max,
    magia_max: charData.magia_max,
    magia_actual: charData.magia_max,
    habilidad_max: charData.habilidad_max,
    habilidad_actual: charData.habilidad_max,
    acciones: charData.acciones,
    coste: charData.coste,
    innatas: charData.innatas || [],
    status_effects: [],
    inventario: [],
    habilidades: [],
    renombre: 0,
    vivo: true,
  };
}

function defaultMissionState(campId, missionId) {
  const m = MISSIONS[missionId];
  return {
    id: "ms_" + Date.now(),
    campaign_id: campId,
    mision_id: missionId,
    ronda: 1,
    amenaza_nivel: m?.amenaza?.clavijas || 0,
    amenaza_cara: m?.amenaza?.cara || "A",
    fase_actual: "dread",
    magia_usada_esta_ronda: false,
    fases_completadas: {},
    steps_completados: {},
    notas: "",
  };
}

// ========== COMPONENTS ==========

// --- PEG BAR ---
function PegBar({ label, icon, current, max, color, onChange }) {
  const pegs = [];
  for (let i = 0; i < max; i++) {
    pegs.push(
      <button key={i} onClick={() => onChange(i < current ? i : i + 1)}
        style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid " + (i < current ? color : "#374151"),
          background: i < current ? color : "transparent", transition: "all 0.2s", cursor: "pointer", margin: 2 }}
      />
    );
  }
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ color: "#d4b896", fontSize: 13, fontWeight: 600 }}>{label}</span>
        <span style={{ color: "#9ca3af", fontSize: 12, marginLeft: "auto" }}>{current}/{max}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>{pegs}</div>
    </div>
  );
}

// --- STATUS EFFECT TOGGLE ---
function StatusEffects({ effects, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
      {STATUS_EFFECTS.map(se => {
        const count = effects.filter(e => e === se.id).length;
        const active = count > 0;
        return (
          <div key={se.id} style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <button onClick={() => onChange([...effects, se.id])}
              style={{ minWidth: 44, minHeight: 36, padding: "4px 8px", borderRadius: 6,
                border: active ? `2px solid ${se.color}` : "1px solid #374151",
                background: active ? se.color + "33" : "transparent",
                color: active ? se.color : "#6b7280", fontSize: 12, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 3 }}>
              <span>{se.icon}</span>
              {count > 1 && <span style={{fontWeight:700}}>×{count}</span>}
            </button>
            {active && (
              <button onClick={() => { const i = effects.indexOf(se.id); if(i>-1){const n=[...effects];n.splice(i,1);onChange(n);} }}
                style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #ef4444",
                  background: "transparent", color: "#ef4444", fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- THREAT TRACKER ---
function ThreatTracker({ level, cara, onLevelChange }) {
  const bands = THREAT_BANDS[cara] || THREAT_BANDS.A;
  let cumulative = 0;
  let currentBandIdx = 0;
  for (let i = 0; i < bands.length; i++) {
    if (level >= cumulative + bands[i].slots) {
      cumulative += bands[i].slots;
      currentBandIdx = i + 1;
    } else break;
  }
  const totalSlots = bands.reduce((s, b) => s + b.slots, 0);
  const bandName = bands[Math.min(currentBandIdx, bands.length - 1)]?.name || "Disquiet";
  const bandColor = bands[Math.min(currentBandIdx, bands.length - 1)]?.color || "#22c55e";

  return (
    <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 14, border: "1px solid #2d2d44" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div>
          <div style={{ color: "#d4b896", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Amenaza</div>
          <div style={{ color: bandColor, fontSize: 20, fontWeight: 800 }}>{bandName}</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onLevelChange(Math.max(0, level - 1))}
            style={{ width: 44, height: 44, borderRadius: 8, border: "1px solid #374151",
              background: "#1e293b", color: "#d4b896", fontSize: 20, cursor: "pointer" }}>−</button>
          <div style={{ width: 52, height: 44, borderRadius: 8, background: bandColor + "33",
            border: `2px solid ${bandColor}`, display: "flex", alignItems: "center",
            justifyContent: "center", color: bandColor, fontSize: 22, fontWeight: 800 }}>{level}</div>
          <button onClick={() => onLevelChange(Math.min(totalSlots, level + 1))}
            style={{ width: 44, height: 44, borderRadius: 8, border: "1px solid #374151",
              background: "#1e293b", color: "#d4b896", fontSize: 20, cursor: "pointer" }}>+</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 2, height: 18 }}>
        {bands.map((band, bi) => {
          const slots = [];
          for (let s = 0; s < band.slots; s++) {
            const slotIdx = bands.slice(0, bi).reduce((a, b2) => a + b2.slots, 0) + s;
            slots.push(
              <div key={s} style={{ flex: 1, height: "100%", borderRadius: 3,
                background: slotIdx < level ? band.color : band.color + "22",
                border: `1px solid ${band.color}44`, transition: "background 0.3s" }}/>
            );
          }
          return <div key={bi} style={{ display: "flex", gap: 1, flex: band.slots }}>{slots}</div>;
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {bands.map((b, i) => (
          <span key={i} style={{ fontSize: 8, color: b.color + "aa", textAlign: "center", flex: b.slots }}>{b.name}</span>
        ))}
      </div>
      <div style={{ fontSize: 10, color: "#6b7280", marginTop: 6, textAlign: "center" }}>
        Cara {cara} · {level}/{totalSlots} clavijas
      </div>
    </div>
  );
}

// --- PHASE CHECKLIST ---
function PhaseChecklist({ phases, completedPhases, completedSteps, onTogglePhase, onToggleStep }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {phases.map(phase => {
        const isOpen = expanded === phase.id;
        const allDone = phase.steps.every((_, i) => completedSteps[`${phase.id}_${i}`]);
        return (
          <div key={phase.id} style={{ background: "#1a1a2e", borderRadius: 10, border: "1px solid #2d2d44", overflow: "hidden" }}>
            <button onClick={() => setExpanded(isOpen ? null : phase.id)}
              style={{ width: "100%", padding: "12px 14px", background: "transparent", border: "none",
                display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "#d4b896" }}>
              <span style={{ fontSize: 20 }}>{phase.icon}</span>
              <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 700 }}>{phase.name}</span>
              {allDone && <span style={{ color: "#22c55e", fontSize: 18 }}>✓</span>}
              <span style={{ fontSize: 12, transform: isOpen ? "rotate(180deg)" : "", transition: "0.2s" }}>▼</span>
            </button>
            {isOpen && (
              <div style={{ padding: "0 14px 12px" }}>
                {phase.steps.map((step, i) => {
                  const done = completedSteps[`${phase.id}_${i}`];
                  return (
                    <button key={i} onClick={() => onToggleStep(phase.id, i)}
                      style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0",
                        background: "none", border: "none", borderTop: i > 0 ? "1px solid #2d2d44" : "none",
                        width: "100%", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ width: 22, height: 22, borderRadius: 4, flexShrink: 0, marginTop: 1,
                        border: done ? "2px solid #22c55e" : "2px solid #4b5563",
                        background: done ? "#22c55e22" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#22c55e", fontSize: 14 }}>{done ? "✓" : ""}</div>
                      <span style={{ color: done ? "#6b7280" : "#d4b896", fontSize: 13,
                        textDecoration: done ? "line-through" : "none" }}>{step}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- COLLAPSIBLE ---
function Collapsible({ title, icon, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div style={{ background: "#1a1a2e", borderRadius: 10, border: "1px solid #2d2d44", marginBottom: 8 }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", padding: "12px 14px", background: "transparent", border: "none",
          display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#d4b896" }}>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
        <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 700 }}>{title}</span>
        <span style={{ fontSize: 12, transform: open ? "rotate(180deg)" : "", transition: "0.2s" }}>▼</span>
      </button>
      {open && <div style={{ padding: "0 14px 14px" }}>{children}</div>}
    </div>
  );
}

// ========== SCREENS ==========

// --- HOME SCREEN ---
function HomeScreen({ onCreateCampaign, onLoadCampaign, campaigns }) {
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div style={{ padding: 16, maxWidth: 500, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32, paddingTop: 24 }}>
        <div style={{ fontSize: 42, marginBottom: 8 }}>⚔️</div>
        <h1 style={{ color: "#d4b896", fontSize: 26, fontWeight: 800, margin: 0,
          fontFamily: "'Cinzel', serif", letterSpacing: 2 }}>MALADUM</h1>
        <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 4, letterSpacing: 3, textTransform: "uppercase" }}>Companion App</div>
        <div style={{ width: 60, height: 2, background: "linear-gradient(90deg, transparent, #b91c1c, transparent)",
          margin: "12px auto" }}/>
      </div>

      {campaigns.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase",
            letterSpacing: 2, marginBottom: 8 }}>Campañas guardadas</div>
          {campaigns.map(c => (
            <button key={c.id} onClick={() => onLoadCampaign(c)}
              style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid #2d2d44",
                background: "#1a1a2e", marginBottom: 8, cursor: "pointer", textAlign: "left" }}>
              <div style={{ color: "#d4b896", fontSize: 15, fontWeight: 700 }}>{c.name}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 12, color: "#9ca3af" }}>
                <span>Misión: {c.currentMission}</span>
                <span>Demora: {c.demora}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {!showCreate ? (
        <button onClick={() => setShowCreate(true)}
          style={{ width: "100%", padding: 16, borderRadius: 10, border: "2px solid #b91c1c",
            background: "#b91c1c22", color: "#fca5a5", fontSize: 16, fontWeight: 700,
            cursor: "pointer", letterSpacing: 1 }}>
          + Nueva Campaña
        </button>
      ) : (
        <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 16, border: "1px solid #2d2d44" }}>
          <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Nombre de la campaña</div>
          <input value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Ej: Campaña de los Aventureros"
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #374151",
              background: "#0f172a", color: "#d4b896", fontSize: 15, boxSizing: "border-box" }}/>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={() => setShowCreate(false)}
              style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #374151",
                background: "transparent", color: "#9ca3af", fontSize: 14, cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => { if(newName.trim()){onCreateCampaign(newName.trim());setNewName("");setShowCreate(false);} }}
              style={{ flex: 1, padding: 12, borderRadius: 8, border: "none",
                background: "#b91c1c", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Crear</button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- CAMPAIGN HUB ---
function CampaignHub({ campaign, adventurers, onNavigate }) {
  const demoraEffect = DEMORA_EFFECTS.find(d => campaign.demora >= d.min && campaign.demora <= d.max);
  return (
    <div style={{ padding: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>Campaña</div>
        <h2 style={{ color: "#d4b896", fontSize: 20, fontWeight: 800, margin: "4px 0" }}>{campaign.name}</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", textAlign: "center" }}>
          <div style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase" }}>Misión Actual</div>
          <div style={{ color: "#d4b896", fontSize: 24, fontWeight: 800 }}>{campaign.currentMission}</div>
          <div style={{ color: "#6b7280", fontSize: 11 }}>{MISSIONS[campaign.currentMission]?.nombre || ""}</div>
        </div>
        <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", textAlign: "center" }}>
          <div style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase" }}>Demora</div>
          <div style={{ color: campaign.demora >= 7 ? "#ef4444" : campaign.demora >= 4 ? "#eab308" : "#22c55e",
            fontSize: 24, fontWeight: 800 }}>{campaign.demora}/12</div>
          <div style={{ color: "#6b7280", fontSize: 10 }}>{demoraEffect?.desc}</div>
        </div>
      </div>

      {adventurers.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase",
            letterSpacing: 2, marginBottom: 8 }}>Grupo ({adventurers.length})</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {adventurers.map(a => (
              <div key={a.id} style={{ background: "#1a1a2e", borderRadius: 8, padding: "6px 12px",
                border: "1px solid #2d2d44", fontSize: 13, color: "#d4b896" }}>
                {a.nombre} {a.clase && `(${a.clase})`}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <NavButton icon="⚔️" label="Comenzar Misión" sub="Setup y partida" onClick={() => onNavigate("mission-setup")} accent/>
        <NavButton icon="🛡️" label="Gestionar Grupo" sub="Fichas de aventureros" onClick={() => onNavigate("adventurers")}/>
        <NavButton icon="📜" label="Registro de Campaña" sub="Logros y recompensas" onClick={() => onNavigate("registry")}/>
      </div>
    </div>
  );
}

function NavButton({ icon, label, sub, onClick, accent }) {
  return (
    <button onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 10,
        border: accent ? "2px solid #b91c1c" : "1px solid #2d2d44",
        background: accent ? "#b91c1c18" : "#1a1a2e", cursor: "pointer", textAlign: "left", width: "100%" }}>
      <span style={{ fontSize: 24, width: 40, textAlign: "center" }}>{icon}</span>
      <div>
        <div style={{ color: accent ? "#fca5a5" : "#d4b896", fontSize: 15, fontWeight: 700 }}>{label}</div>
        {sub && <div style={{ color: "#6b7280", fontSize: 12 }}>{sub}</div>}
      </div>
    </button>
  );
}

// --- ADVENTURER MANAGEMENT ---
function AdventurersScreen({ adventurers, campaign, onUpdate, onAdd, onRemove }) {
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  if (selected) {
    const adv = adventurers.find(a => a.id === selected);
    if (!adv) { setSelected(null); return null; }
    return (
      <AdventurerSheet adv={adv}
        onUpdate={updated => onUpdate(updated)}
        onBack={() => setSelected(null)}
        onRemove={() => { onRemove(adv.id); setSelected(null); }}/>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ color: "#9ca3af", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
        Aventureros del Grupo
      </div>
      {adventurers.map(a => (
        <button key={a.id} onClick={() => setSelected(a.id)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 12,
            borderRadius: 10, border: "1px solid #2d2d44", background: "#1a1a2e",
            marginBottom: 8, cursor: "pointer", textAlign: "left" }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#d4b896", fontSize: 15, fontWeight: 700 }}>{a.nombre}</div>
            <div style={{ color: "#6b7280", fontSize: 12 }}>{a.especie} · {a.clase || "Sin clase"} · Rango {a.rango}</div>
          </div>
          <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
            <span style={{ color: "#22c55e" }}>♥{a.salud_actual}</span>
            <span style={{ color: "#3b82f6" }}>✦{a.magia_actual}</span>
            <span style={{ color: "#eab308" }}>◆{a.habilidad_actual}</span>
          </div>
        </button>
      ))}

      {!showAdd ? (
        <button onClick={() => setShowAdd(true)}
          style={{ width: "100%", padding: 14, borderRadius: 10, border: "2px dashed #374151",
            background: "transparent", color: "#9ca3af", fontSize: 14, cursor: "pointer", marginTop: 8 }}>
          + Añadir Aventurero
        </button>
      ) : (
        <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 12, border: "1px solid #2d2d44", marginTop: 8 }}>
          <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Selecciona personaje</div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {BASE_CHARACTERS.map(ch => (
              <button key={ch.nombre} onClick={() => { onAdd(ch); setShowAdd(false); }}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #2d2d44",
                  background: "#0f172a", marginBottom: 4, cursor: "pointer", textAlign: "left",
                  display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#d4b896", fontSize: 14, fontWeight: 600 }}>{ch.nombre}</div>
                  <div style={{ color: "#6b7280", fontSize: 11 }}>{ch.especie} · ♥{ch.salud_max} ✦{ch.magia_max} ◆{ch.habilidad_max}</div>
                </div>
                <div style={{ color: "#9ca3af", fontSize: 11 }}>{ch.coste}₲</div>
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdd(false)}
            style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 8, border: "1px solid #374151",
              background: "transparent", color: "#9ca3af", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
        </div>
      )}
    </div>
  );
}

// --- ADVENTURER SHEET ---
function AdventurerSheet({ adv, onUpdate, onBack, onRemove }) {
  const update = (field, val) => onUpdate({ ...adv, [field]: val });

  return (
    <div style={{ padding: 16 }}>
      <button onClick={onBack}
        style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 13,
          cursor: "pointer", marginBottom: 12, padding: 0 }}>← Volver al grupo</button>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#d4b896", fontSize: 22, fontWeight: 800, margin: 0 }}>{adv.nombre}</h2>
        <div style={{ color: "#6b7280", fontSize: 13 }}>{adv.especie} · Rango {adv.rango} · {adv.coste}₲</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Clase</div>
        <select value={adv.clase} onChange={e => update("clase", e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151",
            background: "#0f172a", color: "#d4b896", fontSize: 14 }}>
          <option value="">— Sin clase —</option>
          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 14, border: "1px solid #2d2d44", marginBottom: 12 }}>
        <PegBar label="Salud" icon="♥" current={adv.salud_actual} max={adv.salud_max}
          color="#22c55e" onChange={v => update("salud_actual", v)}/>
        <PegBar label="Magia" icon="✦" current={adv.magia_actual} max={adv.magia_max}
          color="#3b82f6" onChange={v => update("magia_actual", v)}/>
        <PegBar label="Habilidad" icon="◆" current={adv.habilidad_actual} max={adv.habilidad_max}
          color="#eab308" onChange={v => update("habilidad_actual", v)}/>
      </div>

      <Collapsible title="Estados" icon="💀" defaultOpen={adv.status_effects.length > 0}>
        <StatusEffects effects={adv.status_effects} onChange={v => update("status_effects", v)}/>
      </Collapsible>

      {adv.innatas.length > 0 && (
        <Collapsible title="Habilidades Innatas" icon="⭐">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {adv.innatas.map(h => (
              <span key={h} style={{ padding: "4px 10px", borderRadius: 6, background: "#eab30822",
                border: "1px solid #eab30844", color: "#eab308", fontSize: 12 }}>{h}</span>
            ))}
          </div>
        </Collapsible>
      )}

      <Collapsible title="Estadísticas" icon="📊">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "Experiencia", field: "experiencia" },
            { label: "Renombre", field: "renombre" },
          ].map(({ label, field }) => (
            <div key={field} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#0f172a", borderRadius: 8, padding: "8px 10px" }}>
              <span style={{ color: "#9ca3af", fontSize: 12 }}>{label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => update(field, Math.max(0, adv[field] - 1))}
                  style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #374151",
                    background: "transparent", color: "#d4b896", fontSize: 16, cursor: "pointer" }}>−</button>
                <span style={{ color: "#d4b896", fontSize: 16, fontWeight: 700, width: 24, textAlign: "center" }}>{adv[field]}</span>
                <button onClick={() => update(field, adv[field] + 1)}
                  style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #374151",
                    background: "transparent", color: "#d4b896", fontSize: 16, cursor: "pointer" }}>+</button>
              </div>
            </div>
          ))}
        </div>
      </Collapsible>

      <button onClick={onRemove}
        style={{ width: "100%", padding: 12, marginTop: 12, borderRadius: 8, border: "1px solid #7f1d1d",
          background: "#7f1d1d22", color: "#fca5a5", fontSize: 13, cursor: "pointer" }}>
        Retirar del grupo
      </button>
    </div>
  );
}

// --- MISSION SETUP ---
function MissionSetupScreen({ campaign, onStartMission, onBack }) {
  const mId = campaign.currentMission;
  const mission = MISSIONS[mId];
  if (!mission) return (
    <div style={{ padding: 16 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 0, marginBottom: 12 }}>← Volver</button>
      <div style={{ color: "#d4b896", textAlign: "center", padding: 40 }}>Misión {mId} aún no implementada en esta fase.</div>
    </div>
  );

  return (
    <div style={{ padding: 16 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 0, marginBottom: 12, fontSize: 13 }}>← Volver</button>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ color: "#b91c1c", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>
          Misión {mission.id}
        </div>
        <h2 style={{ color: "#d4b896", fontSize: 20, fontWeight: 800, margin: "4px 0" }}>{mission.nombre}</h2>
        <div style={{ color: "#6b7280", fontSize: 12 }}>Libro de Campaña p.{mission.pagina}</div>
      </div>

      <Collapsible title="Condición de entrada" icon="🔑" defaultOpen>
        <p style={{ color: "#d4b896", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{mission.condicion}</p>
      </Collapsible>

      <Collapsible title="Objetivo Primario" icon="🎯" defaultOpen>
        <p style={{ color: "#d4b896", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{mission.objetivo_primario}</p>
      </Collapsible>

      <Collapsible title="Objetivo Secundario" icon="📌">
        <p style={{ color: "#d4b896", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{mission.objetivo_secundario}</p>
      </Collapsible>

      {mission.reglas_especiales.length > 0 && (
        <Collapsible title="Reglas Especiales" icon="📖">
          {mission.reglas_especiales.map((r, i) => (
            <div key={i} style={{ marginBottom: i < mission.reglas_especiales.length - 1 ? 10 : 0 }}>
              <div style={{ color: "#fca5a5", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{r.nombre}</div>
              <p style={{ color: "#d4b896", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{r.desc}</p>
            </div>
          ))}
        </Collapsible>
      )}

      <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 14, border: "1px solid #2d2d44", marginBottom: 8 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>
          Setup físico
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div style={{ background: "#0f172a", borderRadius: 8, padding: 10 }}>
            <div style={{ color: "#6b7280", fontSize: 10 }}>Registro Amenaza</div>
            <div style={{ color: "#d4b896", fontSize: 16, fontWeight: 800 }}>Cara {mission.amenaza.cara}</div>
            <div style={{ color: "#9ca3af", fontSize: 12 }}>{mission.amenaza.clavijas} clavijas iniciales</div>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 8, padding: 10 }}>
            <div style={{ color: "#6b7280", fontSize: 10 }}>Mazo Eventos</div>
            <div style={{ color: "#d4b896", fontSize: 11, lineHeight: 1.5 }}>{mission.mazo_eventos}</div>
          </div>
        </div>
        {mission.asignacion_busqueda && (
          <div style={{ background: "#0f172a", borderRadius: 8, padding: 10 }}>
            <div style={{ color: "#6b7280", fontSize: 10 }}>Asignación Búsqueda</div>
            <div style={{ color: "#d4b896", fontSize: 12 }}>{mission.asignacion_busqueda}</div>
          </div>
        )}
      </div>

      <Collapsible title="Consecuencias" icon="🔮">
        <p style={{ color: "#d4b896", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{mission.consecuencias}</p>
      </Collapsible>

      <button onClick={onStartMission}
        style={{ width: "100%", padding: 16, borderRadius: 10, border: "none",
          background: "linear-gradient(135deg, #b91c1c, #991b1b)", color: "#fff",
          fontSize: 16, fontWeight: 800, cursor: "pointer", marginTop: 12, letterSpacing: 1 }}>
        ⚔️ Comenzar Partida
      </button>
    </div>
  );
}

// --- MAIN BOARD ---
function MainBoard({ missionState, adventurers, campaign, onUpdateMission, onUpdateAdventurer, onEndMission, onBack }) {
  const mission = MISSIONS[missionState.mision_id];
  const mName = mission?.nombre || missionState.mision_id;

  const handleThreatChange = (newLevel) => {
    onUpdateMission({ ...missionState, amenaza_nivel: newLevel });
  };

  const toggleMagic = () => {
    onUpdateMission({ ...missionState, magia_usada_esta_ronda: !missionState.magia_usada_esta_ronda });
  };

  const toggleStep = (phaseId, stepIdx) => {
    const key = `${phaseId}_${stepIdx}`;
    onUpdateMission({
      ...missionState,
      steps_completados: { ...missionState.steps_completados, [key]: !missionState.steps_completados[key] }
    });
  };

  const advanceRound = () => {
    onUpdateMission({
      ...missionState,
      ronda: missionState.ronda + 1,
      magia_usada_esta_ronda: false,
      steps_completados: {},
    });
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 0, fontSize: 13 }}>← Hub</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#b91c1c", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Misión {missionState.mision_id}</div>
          <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700 }}>{mName}</div>
        </div>
        <div style={{ background: "#1a1a2e", borderRadius: 8, padding: "4px 12px", border: "1px solid #2d2d44" }}>
          <div style={{ color: "#6b7280", fontSize: 9, textTransform: "uppercase" }}>Ronda</div>
          <div style={{ color: "#d4b896", fontSize: 22, fontWeight: 800, textAlign: "center" }}>{missionState.ronda}</div>
        </div>
      </div>

      {/* Threat Tracker */}
      <ThreatTracker level={missionState.amenaza_nivel} cara={missionState.amenaza_cara}
        onLevelChange={handleThreatChange}/>

      {/* Magic Toggle */}
      <button onClick={toggleMagic}
        style={{ width: "100%", padding: 10, borderRadius: 8, marginTop: 8, marginBottom: 12,
          border: missionState.magia_usada_esta_ronda ? "2px solid #3b82f6" : "1px solid #374151",
          background: missionState.magia_usada_esta_ronda ? "#3b82f622" : "#1a1a2e",
          color: missionState.magia_usada_esta_ronda ? "#60a5fa" : "#6b7280",
          fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
        ✦ {missionState.magia_usada_esta_ronda ? "Magia usada esta ronda (+1 Amenaza)" : "¿Se usó magia esta ronda?"}
      </button>

      {/* Phase Checklist */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase",
          letterSpacing: 2, marginBottom: 8 }}>Fases del turno</div>
        <PhaseChecklist phases={TURN_PHASES}
          completedPhases={missionState.fases_completadas || {}}
          completedSteps={missionState.steps_completados || {}}
          onTogglePhase={() => {}}
          onToggleStep={toggleStep}/>
      </div>

      {/* Advance Round */}
      <button onClick={advanceRound}
        style={{ width: "100%", padding: 14, borderRadius: 10, border: "2px solid #eab308",
          background: "#eab30815", color: "#eab308", fontSize: 15, fontWeight: 700,
          cursor: "pointer", marginBottom: 12 }}>
        ▶ Avanzar a Ronda {missionState.ronda + 1}
      </button>

      {/* Adventurer Cards */}
      <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase",
        letterSpacing: 2, marginBottom: 8 }}>Aventureros</div>
      {adventurers.map(a => (
        <div key={a.id} style={{ background: "#1a1a2e", borderRadius: 10, padding: 12,
          border: "1px solid #2d2d44", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <span style={{ color: "#d4b896", fontSize: 14, fontWeight: 700 }}>{a.nombre}</span>
              <span style={{ color: "#6b7280", fontSize: 12, marginLeft: 8 }}>{a.clase || a.especie}</span>
            </div>
            {a.status_effects.length > 0 && (
              <div style={{ display: "flex", gap: 2 }}>
                {[...new Set(a.status_effects)].map(se => {
                  const s = STATUS_EFFECTS.find(x => x.id === se);
                  return s ? <span key={se} title={s.name} style={{ fontSize: 14 }}>{s.icon}</span> : null;
                })}
              </div>
            )}
          </div>
          <PegBar label="HP" icon="♥" current={a.salud_actual} max={a.salud_max}
            color="#22c55e" onChange={v => onUpdateAdventurer({ ...a, salud_actual: v })}/>
          <PegBar label="MP" icon="✦" current={a.magia_actual} max={a.magia_max}
            color="#3b82f6" onChange={v => onUpdateAdventurer({ ...a, magia_actual: v })}/>
          <PegBar label="SP" icon="◆" current={a.habilidad_actual} max={a.habilidad_max}
            color="#eab308" onChange={v => onUpdateAdventurer({ ...a, habilidad_actual: v })}/>
        </div>
      ))}

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
        {mission?.reglas_especiales?.length > 0 && (
          <button onClick={() => {}}
            style={{ padding: 12, borderRadius: 8, border: "1px solid #2d2d44", background: "#1a1a2e",
              color: "#d4b896", fontSize: 12, cursor: "pointer" }}>📋 Reglas Especiales</button>
        )}
        <button onClick={() => window.open("https://xinix.github.io/maladum/", "_blank")}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #2d2d44", background: "#1a1a2e",
            color: "#d4b896", fontSize: 12, cursor: "pointer" }}>📦 Items DB</button>
        <button onClick={onEndMission}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #7f1d1d", background: "#7f1d1d22",
            color: "#fca5a5", fontSize: 12, cursor: "pointer", gridColumn: "1 / -1" }}>✅ Fin de Misión</button>
      </div>
    </div>
  );
}

// --- CAMPAIGN REGISTRY ---
function RegistryScreen({ campaign, onUpdate, onBack }) {
  const reg = campaign.registro;

  const updateField = (path, val) => {
    const parts = path.split(".");
    const newReg = JSON.parse(JSON.stringify(reg));
    let obj = newReg;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    obj[parts[parts.length - 1]] = val;
    onUpdate({ ...campaign, registro: newReg });
  };

  const numField = (label, path, val) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "#0f172a", borderRadius: 8, padding: "8px 12px", marginBottom: 4 }}>
      <span style={{ color: "#d4b896", fontSize: 13 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button onClick={() => updateField(path, Math.max(0, val - 1))}
          style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid #374151",
            background: "transparent", color: "#d4b896", fontSize: 16, cursor: "pointer" }}>−</button>
        <span style={{ color: "#d4b896", fontSize: 16, fontWeight: 700, width: 28, textAlign: "center" }}>{val}</span>
        <button onClick={() => updateField(path, val + 1)}
          style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid #374151",
            background: "transparent", color: "#d4b896", fontSize: 16, cursor: "pointer" }}>+</button>
      </div>
    </div>
  );

  const boolField = (label, path, val) => (
    <button onClick={() => updateField(path, !val)}
      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 12px",
        borderRadius: 8, background: "#0f172a", border: "none", marginBottom: 4, cursor: "pointer", textAlign: "left" }}>
      <div style={{ width: 22, height: 22, borderRadius: 4, border: val ? "2px solid #22c55e" : "2px solid #4b5563",
        background: val ? "#22c55e22" : "transparent", display: "flex", alignItems: "center",
        justifyContent: "center", color: "#22c55e", fontSize: 14, flexShrink: 0 }}>{val ? "✓" : ""}</div>
      <span style={{ color: val ? "#d4b896" : "#6b7280", fontSize: 13 }}>{label}</span>
    </button>
  );

  return (
    <div style={{ padding: 16 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 0, marginBottom: 12, fontSize: 13 }}>← Volver</button>
      <h2 style={{ color: "#d4b896", fontSize: 18, fontWeight: 800, margin: "0 0 16px" }}>📜 Registro de Campaña</h2>

      {/* Demora */}
      <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 14, border: "1px solid #2d2d44", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase" }}>Demora</div>
            <div style={{ color: campaign.demora >= 7 ? "#ef4444" : "#eab308", fontSize: 28, fontWeight: 800 }}>{campaign.demora}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => onUpdate({ ...campaign, demora: Math.max(0, campaign.demora - 1) })}
              style={{ width: 44, height: 44, borderRadius: 8, border: "1px solid #374151",
                background: "#0f172a", color: "#d4b896", fontSize: 20, cursor: "pointer" }}>−</button>
            <button onClick={() => onUpdate({ ...campaign, demora: Math.min(12, campaign.demora + 1) })}
              style={{ width: 44, height: 44, borderRadius: 8, border: "1px solid #374151",
                background: "#0f172a", color: "#d4b896", fontSize: 20, cursor: "pointer" }}>+</button>
          </div>
        </div>
        <div style={{ width: "100%", height: 8, background: "#0f172a", borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
          <div style={{ width: `${(campaign.demora / 12) * 100}%`, height: "100%",
            background: campaign.demora >= 7 ? "#ef4444" : "#eab308", borderRadius: 4, transition: "width 0.3s" }}/>
        </div>
      </div>

      {/* Contadores */}
      <Collapsible title="Contadores" icon="🔢" defaultOpen>
        {numField("Malagaunt derrotado", "malagauntDerrotado", reg.malagauntDerrotado)}
        {numField("Cadáveres examinados", "cadaveres_examinados", reg.cadaveres_examinados)}
        {numField("Sepulturas registradas", "sepulturas_registradas", reg.sepulturas_registradas)}
        {numField("Invasores escapados", "invasores_escapados", reg.invasores_escapados)}
        {numField("Disminuir la horda", "disminuir_horda", reg.disminuir_horda)}
        {numField("Salas santificadas", "salas_santificadas", reg.salas_santificadas)}
      </Collapsible>

      {/* Logros */}
      <Collapsible title="Logros" icon="🏆">
        {boolField("Deuda de Favor", "logros.deuda_de_favor", reg.logros.deuda_de_favor)}
        {boolField("Rastro Esquelético", "logros.rastro_esqueletico", reg.logros.rastro_esqueletico)}
        {boolField("Parafernalia Oculta", "logros.parafernalia_oculta", reg.logros.parafernalia_oculta)}
        {boolField("Aprendiz Derrotado", "logros.aprendiz_derrotado", reg.logros.aprendiz_derrotado)}
        {boolField("Aprendiz Liberado", "logros.aprendiz_liberado", reg.logros.aprendiz_liberado)}
        {boolField("Troll Derrotado", "logros.troll_derrotado_logro", reg.logros.troll_derrotado_logro)}
        {boolField("Investigación en Curso", "logros.investigacion_en_curso", reg.logros.investigacion_en_curso)}
        {boolField("Escudo de Almas", "logros.escudo_de_almas", reg.logros.escudo_de_almas)}
      </Collapsible>

      {/* Recompensas */}
      <Collapsible title="Recompensas" icon="🎁">
        {numField("Perspectiva Táctica", "recompensas.perspectiva_tactica", reg.recompensas.perspectiva_tactica)}
        {numField("Sabiduría de Mazmorra", "recompensas.sabiduria_de_mazmorra", reg.recompensas.sabiduria_de_mazmorra)}
        {boolField("Resistencia al Veneno", "recompensas.resistencia_al_veneno", reg.recompensas.resistencia_al_veneno)}
        {boolField("Debilidad del Objetivo", "recompensas.debilidad_del_objetivo", reg.recompensas.debilidad_del_objetivo)}
        {boolField("Experiencia de Combate", "recompensas.experiencia_de_combate", reg.recompensas.experiencia_de_combate)}
        {boolField("Saqueo de Sepulturas", "recompensas.saqueo_de_sepulturas", reg.recompensas.saqueo_de_sepulturas)}
        {boolField("Signos Reveladores", "recompensas.signos_reveladores", reg.recompensas.signos_reveladores)}
        {boolField("Ritual de Consagración", "recompensas.ritual_de_consagracion", reg.recompensas.ritual_de_consagracion)}
        {boolField("Oferta de Ayuda", "recompensas.oferta_de_ayuda", reg.recompensas.oferta_de_ayuda)}
        {boolField("Contactos en Gremio", "recompensas.contactos_en_gremio", reg.recompensas.contactos_en_gremio)}
      </Collapsible>

      {/* Puntos de Entrada Mapeados */}
      <Collapsible title="Puntos de Entrada Mapeados" icon="🗺️">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[1,2,3,4,5,6].map(n => {
            const mapped = reg.puntos_entrada_mapeados.includes(n);
            return (
              <button key={n} onClick={() => {
                const arr = mapped
                  ? reg.puntos_entrada_mapeados.filter(x => x !== n)
                  : [...reg.puntos_entrada_mapeados, n];
                updateField("puntos_entrada_mapeados", arr);
              }}
              style={{ width: 44, height: 44, borderRadius: 8,
                border: mapped ? "2px solid #22c55e" : "1px solid #374151",
                background: mapped ? "#22c55e22" : "#0f172a",
                color: mapped ? "#22c55e" : "#6b7280",
                fontSize: 18, fontWeight: 700, cursor: "pointer" }}>{n}</button>
            );
          })}
        </div>
      </Collapsible>

      {/* Mission selector */}
      <Collapsible title="Misión Actual" icon="📍">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["Intro","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T"].map(m => (
            <button key={m} onClick={() => onUpdate({ ...campaign, currentMission: m })}
              style={{ minWidth: 40, height: 36, borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer",
                border: campaign.currentMission === m ? "2px solid #b91c1c" : "1px solid #374151",
                background: campaign.currentMission === m ? "#b91c1c33" : "#0f172a",
                color: campaign.currentMission === m ? "#fca5a5" : "#6b7280" }}>{m}</button>
          ))}
        </div>
      </Collapsible>
    </div>
  );
}

// ========== MAIN APP ==========
function App() {
  const [screen, setScreen] = useState("loading");
  const [campaigns, setCampaigns] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [adventurers, setAdventurers] = useState([]);
  const [missionState, setMissionState] = useState(null);
  const [subScreen, setSubScreen] = useState("hub");

  // Load data
  useEffect(() => {
    (async () => {
      const campList = await DB.load("campaigns_list") || [];
      setCampaigns(campList);
      const lastCampId = await DB.load("last_campaign_id");
      if (lastCampId) {
        const c = await DB.load("campaign_" + lastCampId);
        if (c) {
          setCampaign(c);
          const advs = await DB.load("adventurers_" + lastCampId) || [];
          setAdventurers(advs);
          const ms = await DB.load("mission_state_" + lastCampId);
          if (ms) setMissionState(ms);
          setSubScreen("hub");
          setScreen("campaign");
          return;
        }
      }
      setScreen("home");
    })();
  }, []);

  // Auto-save
  useEffect(() => {
    if (!campaign) return;
    DB.save("campaign_" + campaign.id, campaign);
    DB.save("last_campaign_id", campaign.id);
    const list = campaigns.map(c => c.id === campaign.id ? { id: c.id, name: campaign.name, currentMission: campaign.currentMission, demora: campaign.demora } : c);
    if (!list.find(c => c.id === campaign.id)) {
      list.push({ id: campaign.id, name: campaign.name, currentMission: campaign.currentMission, demora: campaign.demora });
    }
    setCampaigns(list);
    DB.save("campaigns_list", list);
  }, [campaign]);

  useEffect(() => {
    if (!campaign || !adventurers) return;
    DB.save("adventurers_" + campaign.id, adventurers);
  }, [adventurers]);

  useEffect(() => {
    if (!campaign || !missionState) return;
    DB.save("mission_state_" + campaign.id, missionState);
  }, [missionState]);

  const createCampaign = (name) => {
    const c = defaultCampaign(name);
    setCampaign(c);
    setAdventurers([]);
    setMissionState(null);
    setSubScreen("hub");
    setScreen("campaign");
  };

  const loadCampaign = async (summary) => {
    const c = await DB.load("campaign_" + summary.id);
    if (c) {
      setCampaign(c);
      const advs = await DB.load("adventurers_" + summary.id) || [];
      setAdventurers(advs);
      const ms = await DB.load("mission_state_" + summary.id);
      setMissionState(ms || null);
      setSubScreen("hub");
      setScreen("campaign");
    }
  };

  const addAdventurer = (charData) => {
    const adv = defaultAdventurer(campaign.id, charData);
    setAdventurers(prev => [...prev, adv]);
  };

  const updateAdventurer = (updated) => {
    setAdventurers(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const removeAdventurer = (id) => {
    setAdventurers(prev => prev.filter(a => a.id !== id));
  };

  const startMission = () => {
    const ms = defaultMissionState(campaign.id, campaign.currentMission);
    setMissionState(ms);
    setSubScreen("board");
  };

  const goHome = () => {
    setCampaign(null);
    setAdventurers([]);
    setMissionState(null);
    setScreen("home");
    DB.remove("last_campaign_id");
  };

  // Render
  if (screen === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#0c0c1d", color: "#d4b896", fontSize: 18 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚔️</div>
          <div>Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0c0c1d 0%, #121225 100%)",
      fontFamily: "'Cinzel', 'Georgia', serif",
      color: "#d4b896",
      maxWidth: 500,
      margin: "0 auto",
      position: "relative",
      paddingBottom: 80,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>

      {screen === "home" && (
        <HomeScreen campaigns={campaigns} onCreateCampaign={createCampaign} onLoadCampaign={loadCampaign}/>
      )}

      {screen === "campaign" && subScreen === "hub" && campaign && (
        <CampaignHub campaign={campaign} adventurers={adventurers}
          onNavigate={(s) => setSubScreen(s)}/>
      )}

      {screen === "campaign" && subScreen === "adventurers" && (
        <AdventurersScreen campaign={campaign} adventurers={adventurers}
          onUpdate={updateAdventurer} onAdd={addAdventurer} onRemove={removeAdventurer}/>
      )}

      {screen === "campaign" && subScreen === "mission-setup" && (
        <MissionSetupScreen campaign={campaign}
          onStartMission={startMission}
          onBack={() => setSubScreen("hub")}/>
      )}

      {screen === "campaign" && subScreen === "board" && missionState && (
        <MainBoard missionState={missionState} adventurers={adventurers} campaign={campaign}
          onUpdateMission={setMissionState}
          onUpdateAdventurer={updateAdventurer}
          onEndMission={() => { setMissionState(null); setSubScreen("hub"); }}
          onBack={() => setSubScreen("hub")}/>
      )}

      {screen === "campaign" && subScreen === "registry" && (
        <RegistryScreen campaign={campaign}
          onUpdate={setCampaign}
          onBack={() => setSubScreen("hub")}/>
      )}

      {/* Bottom Nav */}
      {screen === "campaign" && (
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 500, background: "#0c0c1dee", backdropFilter: "blur(10px)",
          borderTop: "1px solid #2d2d44", display: "flex", zIndex: 100 }}>
          {[
            { id: "hub", icon: "🏠", label: "Hub" },
            { id: "adventurers", icon: "🛡️", label: "Grupo" },
            { id: "board", icon: "⚔️", label: "Partida" },
            { id: "registry", icon: "📜", label: "Registro" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setSubScreen(tab.id)}
              style={{ flex: 1, padding: "10px 0", background: "none", border: "none",
                cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
              <span style={{ fontSize: 9, color: subScreen === tab.id ? "#d4b896" : "#4b5563",
                fontWeight: subScreen === tab.id ? 700 : 400 }}>{tab.label}</span>
            </button>
          ))}
          <button onClick={goHome}
            style={{ padding: "10px 16px", background: "none", border: "none", borderLeft: "1px solid #2d2d44",
              cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 20 }}>🚪</span>
            <span style={{ fontSize: 9, color: "#4b5563" }}>Salir</span>
          </button>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
