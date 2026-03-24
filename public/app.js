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

const CLASS_DATA = {
  Barbarian: { spell: false, skills: ["Frenzy","Reflexes","Brutal Assault","Onslaught","Impervious","Combat Arts","Intimidating"] },
  Rogue: { spell: false, skills: ["Light Fingers","Reflexes","Tricks of the Trade","Distraction","Persuasion","Camouflage","Duck for Cover","Tracking"] },
  Sellsword: { spell: false, skills: ["Reflexes","Frenzy","Weapons Master","Counter Shot","Bullseye","Training","Quick Recovery","Ambush"] },
  Assassin: { spell: false, skills: ["Reflexes","Combat Arts","Acrobatics","Hard to Hit","Disarm","Trick Shot","Quick Recovery","Malacyte Mastery"] },
  Scavenger: { spell: false, skills: ["Acrobatics","Fleet of Foot","Combat Arts","Tricks of the Trade","Light Fingers","Hard to Hit","Barter","Ready for Anything"] },
  Swindler: { spell: false, skills: ["Bombast","Disarm","Light Fingers","Distraction","Reflexes","Bullseye","Trick Shot","Entertainer"] },
  Marksman: { spell: false, skills: ["Trick Shot","Ranged Expert","Counter Shot","Bullseye","Ambush","Duck for Cover","Fleet of Foot","Reflexes"] },
  Guardian: { spell: false, skills: ["Onslaught","Quick Recovery","Steady","Impervious","Weapons Master","Frenzy","Brutal Assault","Ready for Anything"] },
  Blacksmith: { spell: false, skills: ["Smithing","Weapons Master","Steady","Impervious","Ranged Expert","Barter","Tricks of the Trade","Duck for Cover"] },
  Curator: { spell: false, skills: ["Loremaster","Herbalism","Unlikely Hero","Smithing","Tactical Gift","Duck for Cover","Barter","Tracking","Natural Remedies","Malacyte Mastery"] },
  Contender: { spell: false, skills: ["Acrobatics","Bombast","Steady","Tactical Gift","Weapons Master","Intimidating","Reflexes","Onslaught"] },
  Strategist: { spell: false, skills: ["Tactical Gift","Bombast","Training","Ready for Anything","Ranged Expert","Counter Shot","Distraction"] },
  Maestro: { spell: false, skills: ["Entertainer","Unlikely Hero","Inspiring","Barter","Hard to Hit","Persuasion","Quick Recovery","Malacyte Mastery"] },
  Rook: { spell: true, skills: ["Power Manipulation","Malacyte Mastery","Distraction","Persuasion","Barter","Duck for Cover"] },
  Paladin: { spell: true, skills: ["Inspiring","Barter","Steady","Impervious","Weapons Master","Disarm","Persuasion"] },
  Prymorist: { spell: true, skills: ["Power Manipulation","Malacyte Mastery","Hard to Hit","Fortified Mind","Natural Remedies","Counter Shot"] },
  Eudaemon: { spell: true, skills: ["Malacyte Mastery","Impervious","Inspiring","Fortified Mind","Reflexes","Onslaught"] },
  Ranger: { spell: false, skills: ["Ambush","Camouflage","Tracking","Ranged Expert","Reflexes","Quick Recovery","One with Nature","Ready for Anything"] },
  Druid: { spell: true, skills: ["Tracking","Distraction","One with Nature","Reflexes","Fortified Mind","Natural Remedies","Ambush"] },
  Magus: { spell: true, skills: ["Quick Recovery","Power Manipulation","Reflexes","Intimidating","Fortified Mind","Ready for Anything","Frenzy"] },
  Rambler: { spell: false, skills: ["Herbalism","Tracking","Fleet of Foot","Quick Recovery","Tricks of the Trade","Hard to Hit","One with Nature"] },
};

const OFFICIAL_SPELLS = {
  Rook: [
    { name: "Bendicion", level: 1 }, { name: "Reflejar", level: 1 }, { name: "Mentes Nubladas", level: 1 },
    { name: "Concentracion", level: 1 }, { name: "Energia Concentrada", level: 1 }, { name: "Telequinesis", level: 1 },
    { name: "Nauseas", level: 2 }, { name: "Encantamiento", level: 2 }, { name: "Ilusion", level: 2 },
    { name: "Perspicacia", level: 2 }, { name: "Debilitar Armadura", level: 2 }, { name: "Sensibilidad Magica", level: 3 },
    { name: "Aturdido", level: 3 }, { name: "Hervir la Sangre", level: 3 }, { name: "Alterar Apariencia", level: 3 },
    { name: "Ilusion Avanzada", level: 4 }, { name: "Rafaga de Energia", level: 4 }, { name: "Encantamiento Avanzado", level: 5 },
  ],
  Paladin: [
    { name: "Curacion", level: 1 }, { name: "Concentracion", level: 1 }, { name: "Fuerza", level: 1 },
    { name: "Piel Endurecida", level: 1 }, { name: "Bendicion", level: 1 }, { name: "Calma", level: 1 },
    { name: "Fortaleza", level: 1 }, { name: "Perspicacia", level: 2 }, { name: "Fortalecer", level: 2 },
    { name: "Aturdido", level: 3 }, { name: "Despertar", level: 3 }, { name: "Resistencia Remota", level: 4 },
  ],
  Prymorist: [
    { name: "Energia Concentrada", level: 1 }, { name: "Abrir Puerta", level: 1 }, { name: "Telequinesis", level: 1 },
    { name: "Extinguir", level: 1 }, { name: "Detectar", level: 1 }, { name: "Proteger", level: 1 },
    { name: "Invisibilidad", level: 2 }, { name: "Telequinesis Avanzada", level: 2 }, { name: "Empujar", level: 2 },
    { name: "Barricada", level: 2 }, { name: "Deteccion Avanzada", level: 2 }, { name: "Percepcion Magica", level: 3 },
    { name: "Bola de Fuego", level: 3 }, { name: "Torrente", level: 3 }, { name: "Capullo", level: 3 },
    { name: "Rafaga de Energia", level: 4 }, { name: "Reconstruir", level: 4 }, { name: "Portal", level: 5 },
  ],
  Eudaemon: [
    { name: "Curacion", level: 1 }, { name: "Concentracion", level: 1 }, { name: "Fuerza", level: 1 },
    { name: "Velocidad", level: 1 }, { name: "Recuperacion", level: 1 }, { name: "Calma", level: 1 },
    { name: "Escudo Magico", level: 2 }, { name: "HiperConciencia", level: 2 }, { name: "Saltar", level: 2 },
    { name: "Fortalecer", level: 2 }, { name: "Manos Sanadoras", level: 2 }, { name: "Aura Magica", level: 3 },
    { name: "Curacion Avanzada", level: 3 }, { name: "Levitacion", level: 3 }, { name: "Capullo", level: 3 },
    { name: "Desfasamiento", level: 4 }, { name: "Resistencia Remota", level: 4 }, { name: "Reorganizar Celulas", level: 5 },
  ],
  Druid: [
    { name: "Curacion", level: 1 }, { name: "Fuerza", level: 1 }, { name: "Velocidad", level: 1 },
    { name: "Proteger", level: 1 }, { name: "Extinguir", level: 1 }, { name: "HiperConciencia", level: 2 },
    { name: "Invisibilidad", level: 2 }, { name: "Manos Sanadoras", level: 2 }, { name: "Barricada", level: 2 },
    { name: "Alterar Apariencia", level: 3 }, { name: "Torrente", level: 3 }, { name: "Reorganizar Celulas", level: 4 },
  ],
  Magus: [
    { name: "Concentracion", level: 1 }, { name: "Fuerza", level: 1 }, { name: "Piel Endurecida", level: 1 },
    { name: "Velocidad", level: 1 }, { name: "Recuperacion", level: 1 }, { name: "Mentes Nubladas", level: 1 },
    { name: "HiperConciencia", level: 2 }, { name: "Saltar", level: 2 }, { name: "Aturdido", level: 3 },
    { name: "Hervir la Sangre", level: 3 }, { name: "Bola de Fuego", level: 3 }, { name: "Rafaga de Energia", level: 4 },
  ],
};

const OFFICIAL_SPELL_DETAILS = {
  "Abrir Puerta": { summary: "Abrir o cerrar una puerta desbloqueada, o bloquear o desbloquear una puerta o pieza de terreno." },
  "Alterar Apariencia": { summary: "Te haces pasar por otro tipo de personaje de tamano similar usando contadores de recordatorio." },
  "Aturdido": { summary: "El objetivo sufre X contadores de Fatiga." },
  "Aura Magica": { summary: "Pasiva: los hechizos proximos de nivel 1-3 pueden repartirse entre aliados adyacentes." },
  "Barricada": { summary: "Crea una barricada o cubre hasta X casillas de foso." },
  "Bendicion": { summary: "El objetivo gana X contadores de Bendicion." },
  "Bola de Fuego": { summary: "Ataque a distancia con X dados desde una fuente de fuego, con explosion y quemadura." },
  "Calma": { summary: "El objetivo elimina un contador de Aterrorizado." },
  "Capullo": { summary: "Descanso magico incluso con enemigos cerca; puede afectar a X aliados en radio X." },
  "Concentracion": { summary: "Gana X contadores de Bendicion." },
  "Curacion": { summary: "Restaura hasta X puntos de Salud, maximo 3." },
  "Curacion Avanzada": { summary: "Combina restaurar Salud, Habilidad y quitar un estado." },
  "Debilitar Armadura": { summary: "Reduce la Proteccion del objetivo en X hasta el final de la ronda." },
  "Desfasamiento": { summary: "Mueve hasta X casillas ignorando muros, terreno y ataques de oportunidad." },
  "Despertar": { summary: "El objetivo elimina un contador de Aturdido." },
  "Detectar": { summary: "Mejora la busqueda general: coger objetos extra, resolver trampas y dispersar otros." },
  "Deteccion Avanzada": { summary: "Mira dentro de terreno de hasta X casillas; puede retirar trampas gastando magia extra." },
  "Empujar": { summary: "Mueve un objeto, personaje o terreno hasta X casillas sin ataques de oportunidad." },
  "Encantamiento": { summary: "El objetivo es movido X casillas." },
  "Encantamiento Avanzado": { summary: "El objetivo realiza hasta X acciones bajo tu control, maximo 3." },
  "Energia Concentrada": { summary: "Ataque a distancia con X dados de energia." },
  "Escudo Magico": { summary: "Aumenta la Proteccion en X, con maximo 1." },
  "Extinguir": { summary: "Elimina un contador de Quemado, Antorcha o Brasero." },
  "Fortalecer": { summary: "El objetivo elimina X contadores de Fatiga." },
  "Fortaleza": { summary: "El objetivo no puede sufrir estados hasta el final de la ronda." },
  "Fuerza": { summary: "Gana +X de Fuerza hasta el final de la ronda." },
  "Hervir la Sangre": { summary: "El objetivo sufre un ataque de 1 dado y dano directo." },
  "HiperConciencia": { summary: "Te vuelves Bendito y puedes descartar un recordatorio para hacer una accion." },
  "Ilusion": { summary: "Coloca una Ilusion en linea de vision; el enemigo elegido queda distraido." },
  "Ilusion Avanzada": { summary: "Coloca hasta X ilusiones y puedes mover una de ellas." },
  "Invisibilidad": { summary: "Obtienes distintos niveles de invisibilidad segun X y mejoras el movimiento." },
  "Levitacion": { summary: "Durante el Movimiento ignoras terreno, personajes y ataques de oportunidad." },
  "Manos Sanadoras": { summary: "El objetivo recupera X puntos de Salud, maximo 3." },
  "Mentes Nubladas": { summary: "Coloca recordatorios que castigan actuar fuera de turno." },
  "Nauseas": { summary: "El objetivo queda Envenenado." },
  "Percepcion Magica": { summary: "Pasiva: hechizos elementales pueden afectar objetos cercanos sin linea de vision." },
  "Perspicacia": { summary: "+X impactos a Persuadir hasta el final de la ronda." },
  "Piel Endurecida": { summary: "Obtienes +X de Proteccion hasta el final de la ronda." },
  "Portal": { summary: "Coloca un Portal en una casilla vacia." },
  "Proteger": { summary: "El objetivo obtiene +X de Proteccion hasta el final de la ronda." },
  "Rafaga de Energia": { summary: "Aleja personajes o terreno y puede derribarlos." },
  "Recuperacion": { summary: "Elimina Fatiga y Envenenado." },
  "Reconstruir": { summary: "Mueve un muro de hasta longitud X dentro del corto alcance." },
  "Reflejar": { summary: "El objetivo aumenta su Proteccion en X, maximo 1, hasta el final de la ronda." },
  "Reorganizar Celulas": { summary: "Mutacion temporal: sube estadisticas y puede anadir iconos de ataque." },
  "Resistencia Remota": { summary: "Pasiva: puedes resistir hechizos lanzados a corta distancia." },
  "Saltar": { summary: "Se aleja X+1 casillas." },
  "Sensibilidad Magica": { summary: "Pasiva: hechizos vicarios pueden lanzarse a corta distancia y sin linea de vision." },
  "Telequinesis": { summary: "Mueve objetos, permite recogerlos o lanzarlos, y puede propagar fuego." },
  "Telequinesis Avanzada": { summary: "Mueve terreno, personajes u objetos; puede empujar o convertir armas en lanzamiento." },
  "Torrente": { summary: "Con agua cerca puede retirar fuego, derribar personajes o lanzar dados de fatiga/ataque." },
  "Velocidad": { summary: "Durante el Movimiento ganas X+1 casillas adicionales." },
};

const CLASS_SPELL_NOTES = {
  Druid: {
    "Reorganizar Celulas": "La carta de Druid indica que este hechizo puede dominarse a un rango mas bajo de lo normal.",
  },
};

const ITEM_SOURCE_URLS = {
  maladum: "https://xinix.github.io/maladum/maladum46271.js",
  adventure: "https://xinix.github.io/maladum/adventure46271.js",
  beasts: "https://xinix.github.io/maladum/beasts46271.js",
};

let officialItemCatalogCache = null;
let officialItemCatalogPromise = null;

const SKILL_DATA = {
  "Acrobatics": { category: "Agilidad", tags: ["move","melee"], summary: "Movilidad agresiva: derribar, reposicionarse y entrar o salir del combate con ventaja." },
  "Ambush": { category: "Sigilo", tags: ["ranged","reaction"], summary: "Emboscadas desde cobertura con ataques y movimientos de reaccion." },
  "Barter": { category: "Apoyo", tags: ["market"], summary: "Mejora compras, ventas y costes durante la fase de Mercado." },
  "Bombast": { category: "Ciudadano", tags: ["support"], summary: "Gestiona Renombre y ayuda a exprimir resultados de taberna y descanso." },
  "Brutal Assault": { category: "Melee", tags: ["melee"], summary: "Golpes brutales que tiran al enemigo, lanzan objetivos o encadenan ataques." },
  "Bullseye": { category: "Distancia", tags: ["ranged"], summary: "Ataques a distancia precisos que ignoran parte de la cobertura y armadura." },
  "Camouflage": { category: "Sigilo", tags: ["move","reaction"], summary: "Ocultarse en terreno o cobertura para evitar ser objetivo y disparar desde las sombras." },
  "Combat Arts": { category: "Agilidad", tags: ["melee"], summary: "Tecnicas ofensivas de cuerpo a cuerpo con desarmes, ataques extra y combos." },
  "Counter Shot": { category: "Distancia", tags: ["ranged","reaction","magic"], summary: "Contraataques a distancia o con hechizos fuera del turno propio." },
  "Detect": { category: "Innata", tags: ["utility","search"], summary: "Permite mirar dentro de terreno buscable y retirar trampas si gastas magia adicional." },
  "Disarm": { category: "Melee", tags: ["melee","reaction"], summary: "Quita armas al rival y puede convertir la defensa en robo o represalia." },
  "Distraction": { category: "Astucia", tags: ["control"], summary: "Fatiga, reposiciona y desorganiza al objetivo para abrir huecos tacticos." },
  "Duck for Cover": { category: "Sigilo", tags: ["reaction","defense"], summary: "Moverse a cobertura para negar o reducir ataques a distancia." },
  "Entertainer": { category: "Ciudadano", tags: ["rest","support"], summary: "Potencia descanso, bendiciones y el uso alternativo de clavijas de magia." },
  "Fleet of Foot": { category: "Agilidad", tags: ["move"], summary: "Velocidad pura: mas movimiento, ignorar oportunidades y mejorar desplazamientos." },
  "Fortified Mind": { category: "Magia", tags: ["magic","defense","reaction"], summary: "Resistencia mental y apoyo defensivo con armadura magica y autoresistencia." },
  "Frenzy": { category: "Melee", tags: ["melee"], summary: "Aumenta 2 dados en melee y puede repartir golpes entre varios enemigos." },
  "Hard to Hit": { category: "Sigilo", tags: ["defense"], summary: "Hace muy dificil ser impactado, sobre todo a distancia o tras moverse bien." },
  "Herbalism": { category: "Ciudadano", tags: ["rest","craft"], summary: "Mejora hierbas, pociones y fabricacion improvisada durante la mision." },
  "Impervious": { category: "Resistencia", tags: ["defense","status","reaction"], summary: "Niega estados, absorbe dano y aguanta rondas enteras bajo presion." },
  "Inspiring": { category: "Apoyo", tags: ["support"], summary: "Quita terror y fatiga, y permite acciones extra al grupo cercano." },
  "Intimidating": { category: "Apoyo", tags: ["control","reaction"], summary: "Controla objetivos enemigos, los aturde o redirige su conducta." },
  "Light Fingers": { category: "Astucia", tags: ["utility","move"], summary: "Robar, saquear o desordenar inventarios enemigos sin quedarte trabado." },
  "Loremaster": { category: "Ciudadano", tags: ["search","market"], summary: "Mejora busqueda, libros, hallazgos raros y aprendizaje auxiliar del grupo." },
  "Malacyte Mastery": { category: "Magia", tags: ["magic","spell"], summary: "Permite lanzar hechizos fuera de tu acceso normal y manipular mejor el dado magico." },
  "Natural Remedies": { category: "Supervivencia", tags: ["rest","heal"], summary: "Curacion, limpieza de veneno o heridas y apoyo de descanso." },
  "Night Vision": { category: "Innata", tags: ["utility"], summary: "Resumen pendiente de verificar en la Reference Section." },
  "One with Nature": { category: "Supervivencia", tags: ["beast","utility"], summary: "Forrajea y controla bestias errantes o evita que te ataquen." },
  "Onslaught": { category: "Resistencia", tags: ["melee"], summary: "Cadena ataques, remata enemigos y convierte el avance en presion ofensiva." },
  "Persuasion": { category: "Astucia", tags: ["support"], summary: "Refuerza tiradas de Persuasion y permite doblegar objetivos a traves de impactos sociales." },
  "Power Manipulation": { category: "Magia", tags: ["magic","spell"], summary: "Recupera magia, mejora hechizos y descarga objetos canalizados con mas fuerza." },
  "Quick Recovery": { category: "Resistencia", tags: ["heal","status"], summary: "Recupera vida, limpia estados y permite levantarse tras caer." },
  "Ranged Expert": { category: "Distancia", tags: ["ranged"], summary: "Mejora uso de armas a distancia, disparos sin esfuerzo y criticos con dado azul." },
  "Ready for Anything": { category: "Supervivencia", tags: ["reaction","utility"], summary: "Acciones fuera de secuencia y respuestas flexibles en casi cualquier momento." },
  "Reflexes": { category: "Agilidad", tags: ["reaction","defense"], summary: "Reacciones defensivas y movilidad contra ataques, enganches y oportunidades." },
  "Smithing": { category: "Ciudadano", tags: ["market","craft"], summary: "Repara y fabrica equipo durante la mision o en Mercado." },
  "Steady": { category: "Resistencia", tags: ["defense"], summary: "Mantener la linea: evita control enemigo y premia el combate sin moverte." },
  "Tactical Gift": { category: "Ciudadano", tags: ["support"], summary: "Comparte acciones, reorganiza la escena y hasta compra tiempo frente al Dread." },
  "Tracking": { category: "Supervivencia", tags: ["spawn","move"], summary: "Lee entradas, anticipa llegadas enemigas y suaviza terreno dificil." },
  "Training": { category: "Apoyo", tags: ["support","campaign"], summary: "Duplica acciones utiles en mision y tambien reparte XP en Avance." },
  "Trick Shot": { category: "Distancia", tags: ["ranged"], summary: "Disparos especiales con rerolls, desarmes a distancia y division de impactos." },
  "Tricks of the Trade": { category: "Astucia", tags: ["search","trap"], summary: "Abrir o cerrar, buscar mejor y anular trampas al vuelo." },
  "Unlikely Hero": { category: "Ciudadano", tags: ["campaign","utility"], summary: "Talento comodin para modificar fases de campana, upkeep y eventos." },
  "Weapons Master": { category: "Melee", tags: ["melee","defense"], summary: "Especialista en armas: ataques mejores, escudo agil y combos de equipo." },
};

const SKILL_ALIASES = {
  nature: "One with Nature",
};

const SKILL_LEVEL_DATA = {
  "Barter": [
    "Mercado: compra un objeto de cualquier valor, o roba un raro adicional, o vende un objeto por su valor de compra hasta 10 x tu rango.",
    "Mercado: reduce hasta 2 al precio de compra o suma 2 al de venta en hasta tres objetos, en cualquier combinacion.",
    "Pasiva: reduce hasta 2 el coste de un objeto o del mantenimiento de un aventurero en cada Mercado. Ademas, los beneficios de objetivos de mision aumentan un 50%, redondeando hacia arriba.",
  ],
  "Distraction": [
    "Un personaje a media distancia y en LoS queda Fatigado.",
    "Haz un ataque a distancia o lanza un objeto. El objetivo, u otro enemigo a corto alcance de este, sufre dos Fatigas ademas del dano. Luego haces un Movimiento.",
    "Puedes mover a un personaje a media distancia y en LoS sin ponerlo en dano directo; sufre dos Fatigas. Antes o despues puedes hacer tu propio Movimiento y Ataque en cualquier orden.",
  ],
  "Persuasion": [
    "Antes de una tirada de Persuadir, anade dos impactos automaticos.",
    "Haz una accion de Persuadir contra un aventurero de otra partida para disuadirle. Sufre una Fatiga por cada impacto no bloqueado.",
    "Pasiva: ganas un dado extra al Persuadir. Ademas puedes hacer una accion de Persuadir contra cualquier personaje con tres impactos automaticos; los aventureros de otras partidas no se uniran a ti.",
  ],
  "Duck for Cover": [
    "Reaccion: tras ser objetivo de un ataque a distancia o hechizo, si estas a 4 casillas o menos de cobertura, te mueves a cobertura.",
    "Reaccion: como nivel 1, pero ignoras todos los efectos de ese ataque.",
    "Reaccion: en cualquier momento, mueve a cobertura ignorando ataques de oportunidad y luego ataca. Mientras no te muevas de ahi, no pueden afectarte ataques a distancia hasta el final de la ronda.",
  ],
  "Camouflage": [
    "Mientras estes en contacto con una pared no puedes ser objetivo el resto de la ronda.",
    "Haz un Movimiento o Ataque a Distancia. Mientras estes en contacto con terreno no puedes ser objetivo el resto de la ronda.",
    "Mientras no estes en contacto con un enemigo no puedes ser objetivo el resto de la ronda. Ademas, durante una ronda en la que estes camuflado puedes hacer un ataque a distancia como reaccion y quedar Fatigado.",
  ],
  "Malacyte Mastery": [
    "Lanza cualquier hechizo no prohibido de nivel 1 aunque no tengas acceso normal a el, gastando accion o accion sin esfuerzo de forma normal.",
    "Reaccion: despues de tirar el Dado Magico, vuelvelo a tirar y elige cual de los dos resultados aplicar.",
    "Reaccion: tras obtener un resultado Imparable en tu turno, lanzas inmediatamente un hechizo al que tengas acceso con valor de lanzamiento 2, sin gastar clavijas. Eliges el resultado del dado y luego haces una accion gratis.",
  ],
  "Power Manipulation": [
    "Pasiva: ganas Regeneration 1 y recuperas 1 clavija de Magia en la fase de Evaluacion.",
    "Reaccion: uso magico avanzado segun la Reference Section. La transcripcion completa de este nivel sigue pendiente de pulido, pero la habilidad mejora el lanzamiento flexible de hechizos.",
    "Pasiva: puedes gastar cualquier numero de clavijas de Habilidad al lanzar un hechizo para aumentar su valor de lanzamiento en esa misma cantidad, incluso superando tu rango. Tambien mejora el uso de objetos con Channel.",
  ],
  "Frenzy": [
    "Usa antes de hacer un ataque melee: anades 2 dados al ataque.",
    "Usa antes de hacer un ataque melee: anades 3 dados al ataque.",
    "Usa antes de hacer un ataque melee: anades 4 dados. Despues de tirar, puedes repartir los impactos entre varios enemigos al alcance del arma; otros efectos del arma se aplican a todos los enemigos que sufran al menos 1 impacto.",
  ],
  "Weapons Master": [
    "Pasiva: ganas First Strike.",
    "Haz un ataque melee con un arma. Puedes repetir 1 dado de combate.",
    "Pasiva: puedes usar Shield Block como accion sin esfuerzo. Si lo usas fuera de tu turno sigues quedando Fatigado.",
  ],
};

const ATTRIBUTE_DATA = {
  melee: { label: "Melee", summary: "Puede usarse como arma de cuerpo a cuerpo." },
  balanced: { label: "Balanced", summary: "Si esta arma se lanza, tira 1 dado extra." },
  quickstrike: { label: "Quickstrike", summary: "Si esta arma saca critico en un ataque melee, despues de resolver ese ataque puedes hacer gratis un Dash o un nuevo ataque con esta u otra arma." },
  first_strike: { label: "First Strike", summary: "Ventaja al golpear primero en el intercambio." },
  parry: { label: "Parry", summary: "Cuando el usuario sufre un ataque melee, puedes tirar 1 dado de combate. Cada impacto anula 1 impacto enemigo como si fuera armadura fisica. Luego quedas Fatigado." },
  reach: { label: "Reach", summary: "Permite atacar con mas alcance que un arma cuerpo a cuerpo normal." },
  channel: { label: "Channel", summary: "Necesita gastar al menos 1 clavija de Magia para activar o mejorar su efecto." },
  burning: { label: "Burning", summary: "En un critico puede aplicar Quemado; ademas se considera fuente de fuego." },
  sharp: { label: "Sharp", summary: "Si esta arma saca critico, el objetivo queda Herido aunque no haya sufrido dano." },
  forceful_melee: { label: "Forceful Melee", summary: "Golpe cuerpo a cuerpo con gran empuje o potencia." },
  shield_block: { label: "Shield Block", summary: "Puedes gastar una accion para alzar el escudo y ganar su defensa hasta que hagas otra accion que no sea Mover o Dash, sufras dano o quedes Aturdido. Si te atacan fuera de tu turno puedes alzarlo antes de tirar dados, pero luego quedas Fatigado." },
  armour: { label: "Armour", summary: "Otorga proteccion adicional." },
  camouflage: { label: "Camouflage", summary: "Solo puede ser objetivo de ataques a distancia desde corto alcance." },
  ammo_arrow: { label: "Ammo Arrow", summary: "Necesita flechas para dispararse." },
  ammo_bullet: { label: "Ammo Bullet", summary: "Necesita municion de bala para dispararse." },
  restore_health: { label: "Restore Health", summary: "Recupera Salud." },
  restore_magic: { label: "Restore Magic", summary: "Recupera Magia." },
  restore_skill: { label: "Restore Skill", summary: "Recupera Habilidad." },
  restore_action: { label: "Restore Action", summary: "Permite recuperar o ganar una accion." },
  discard: { label: "Discard", summary: "Normalmente se descarta tras usarse." },
  effortless: { label: "Effortless", summary: "Puede usarse como accion sin esfuerzo." },
  cleave: { label: "Cleave", summary: "Si derrotas a un enemigo en melee puedes encadenar el mismo ataque contra otro objetivo valido reduciendo impactos." },
  entangling: { label: "Entangling", summary: "Ayuda a trabar o limitar el movimiento del objetivo." },
  piercing: { label: "Piercing", summary: "La armadura fisica no puede anular impactos de esta arma." },
  range_plus_1: { label: "Range +1", summary: "Aumenta en 1 el alcance del arma o efecto." },
  magical_armour: { label: "Magical Armour", summary: "Aporta defensa magica." },
  magical_armour_1: { label: "Magical Armour 1", summary: "Aporta defensa magica de nivel 1." },
  magical_armour_2: { label: "Magical Armour 2", summary: "Aporta defensa magica de nivel 2." },
  vicious: { label: "Vicious", summary: "Hace el ataque especialmente peligroso o castigador." },
  retaliation: { label: "Retaliation", summary: "Puede devolver dano o efectos al atacante." },
};

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
    currentMission: "Intro",
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
    clase_habilidades: {},
    hechizos: [],
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

function slugKey(value) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function createEmptyClassSkills(cls) {
  const skills = {};
  (CLASS_DATA[cls]?.skills || []).forEach(skill => {
    skills[skill] = 0;
  });
  return skills;
}

function normalizeSpell(spell) {
  if (typeof spell === "string") {
    return {
      id: "sp_" + slugKey(spell),
      name: spell,
      level: 1,
      school: "Manual",
      notes: "",
      summary: "",
    };
  }
  return {
    id: spell?.id || ("sp_" + Math.random().toString(36).slice(2, 10)),
    name: spell?.name || "Hechizo",
    level: Math.max(1, Number(spell?.level) || 1),
    school: spell?.school || "Manual",
    notes: spell?.notes || "",
    summary: spell?.summary || "",
  };
}

function normalizeInventoryItem(item) {
  return {
    id: item?.id || ("it_" + Math.random().toString(36).slice(2, 10)),
    name: item?.name || "Item",
    summary: item?.summary || "",
    type: item?.type || "",
    source: item?.source || "",
    rarity: item?.rarity || "",
    color: item?.color || "",
    size: item?.size || "",
    buy: Number.isFinite(Number(item?.buy)) ? Number(item.buy) : null,
    sell: Number.isFinite(Number(item?.sell)) ? Number(item.sell) : null,
    range: Array.isArray(item?.range) ? item.range.map(v => Number(v) || 0).filter(v => v > 0) : [],
    attributes: Array.isArray(item?.attributes) ? item.attributes.filter(Boolean) : [],
    meleeDice: Math.max(0, Number(item?.meleeDice) || 0),
    rangedDice: Math.max(0, Number(item?.rangedDice) || 0),
    shield: Math.max(0, Number(item?.shield) || 0),
    armor: Math.max(0, Number(item?.armor) || 0),
    magic: !!item?.magic,
    equipped: !!item?.equipped,
  };
}

function normalizeAdventurer(adv) {
  const currentClass = adv?.clase || "";
  const fallbackSkills = currentClass ? createEmptyClassSkills(currentClass) : {};
  const hasSkillMap = adv?.clase_habilidades && Object.keys(adv.clase_habilidades).length > 0;
  return {
    ...adv,
    clase_habilidades: hasSkillMap ? { ...fallbackSkills, ...adv.clase_habilidades } : fallbackSkills,
    hechizos: (adv?.hechizos || []).map(normalizeSpell),
    inventario: (adv?.inventario || []).map(normalizeInventoryItem),
  };
}

function updateAdventurerClass(adv, cls) {
  const normalized = normalizeAdventurer(adv);
  if (!cls) {
    return { ...normalized, clase: "", clase_habilidades: {}, hechizos: [] };
  }
  if (normalized.clase === cls && Object.keys(normalized.clase_habilidades || {}).length > 0) {
    return { ...normalized, clase: cls };
  }
  return {
    ...normalized,
    clase: cls,
    clase_habilidades: createEmptyClassSkills(cls),
    hechizos: CLASS_DATA[cls]?.spell ? normalized.hechizos : [],
  };
}

function getSpentXP(adv) {
  const normalized = normalizeAdventurer(adv);
  const skillPoints = Object.values(normalized.clase_habilidades || {}).reduce((sum, level) => sum + (Number(level) || 0), 0);
  return skillPoints + (normalized.hechizos?.length || 0);
}

function getRemainingXP(adv) {
  return Math.max(0, (Number(adv?.experiencia) || 0) - getSpentXP(adv));
}

function normalizeSkillLookupName(name) {
  const raw = String(name || "").trim();
  if (SKILL_DATA[raw] || SKILL_LEVEL_DATA[raw]) return raw;
  const stripped = raw.replace(/\s+\d+$/, "");
  if (SKILL_DATA[stripped] || SKILL_LEVEL_DATA[stripped]) return stripped;
  return raw;
}

function getSkillEntry(name, level, source) {
  const skillName = normalizeSkillLookupName(name);
  const normalizedLevel = Math.max(1, Number(level) || 1);
  const meta = SKILL_DATA[skillName] || {};
  const levelSummary = getSkillLevelDetails(skillName)[normalizedLevel - 1];
  return {
    name: skillName,
    level: normalizedLevel,
    source: source || meta.category || "Habilidad",
    summary: levelSummary || meta.summary || "Resumen pendiente de verificar en manual oficial.",
    tags: meta.tags || [],
  };
}

function resolveSkillNameFromToken(token) {
  const cleaned = String(token || "").replace(/^skill_/, "").replace(/_level_/g, "_").replace(/_\d+$/, "");
  const alias = SKILL_ALIASES[cleaned];
  if (alias) return alias;
  const normalized = cleaned.replace(/_/g, " ");
  return Object.keys(SKILL_DATA).find(name => slugKey(name) === slugKey(normalized)) || titleCaseToken(normalized);
}

function getSkillLevelDetails(name) {
  return SKILL_LEVEL_DATA[normalizeSkillLookupName(name)] || [];
}

function getAttributeEntry(attr) {
  if (!attr) return null;
  const skillMatch = String(attr).match(/^skill_(.+?)(?:_level)?_(\d+)$/);
  if (skillMatch) {
    const skillName = resolveSkillNameFromToken("skill_" + skillMatch[1]);
    const level = Number(skillMatch[2]) || 1;
    return {
      label: `Skill ${skillName} ${level}`,
      summary: `Otorga ${skillName} nivel ${level} mientras el objeto este equipado.`,
    };
  }
  const meta = ATTRIBUTE_DATA[attr];
  if (meta) return meta;
  return {
    label: titleCaseToken(attr),
    summary: "Atributo oficial del catalogo. Su detalle completo aun no esta transcrito en esta app.",
  };
}

function getGrantedSkillsFromItem(item) {
  return (item?.attributes || []).map(attr => {
    const match = String(attr).match(/^skill_(.+?)(?:_level)?_(\d+)$/);
    if (!match) return null;
    const name = resolveSkillNameFromToken("skill_" + match[1]);
    const level = Number(match[2]) || 1;
    return getSkillEntry(name, level, item?.name ? `Item: ${item.name}` : "Item");
  }).filter(Boolean);
}

function getLearnedSkills(adv) {
  const normalized = normalizeAdventurer(adv);
  const learned = [];
  (normalized.innatas || []).forEach(name => learned.push(getSkillEntry(name, 1, "Innata")));
  Object.entries(normalized.clase_habilidades || {}).forEach(([name, level]) => {
    if ((Number(level) || 0) > 0) learned.push(getSkillEntry(name, level, normalized.clase || "Clase"));
  });
  summarizeEquippedItems(normalized).forEach(item => {
    getGrantedSkillsFromItem(item).forEach(skill => learned.push(skill));
  });
  return learned;
}

function getKnownSpells(adv) {
  return normalizeAdventurer(adv).hechizos || [];
}

function getOfficialSpellsForClass(adv) {
  const cls = adv?.clase;
  return (OFFICIAL_SPELLS[cls] || []).map(spell => normalizeSpell({
    ...spell,
    id: "off_" + slugKey(cls) + "_" + slugKey(spell.name),
    school: "Oficial",
    ...(OFFICIAL_SPELL_DETAILS[spell.name] || {}),
    ...((CLASS_SPELL_NOTES[cls] || {})[spell.name] ? { notes: CLASS_SPELL_NOTES[cls][spell.name] } : {}),
  }));
}

function getAvailableOfficialSpells(adv) {
  const learned = new Set(getKnownSpells(adv).map(spell => slugKey(spell.name)));
  const rank = Math.max(1, Number(adv?.rango) || 1);
  return getOfficialSpellsForClass(adv).filter(spell => spell.level <= rank && !learned.has(slugKey(spell.name)));
}

function canLearnSpell(adv, spellLevel) {
  return !!CLASS_DATA[adv?.clase]?.spell && Number(spellLevel) <= Math.max(1, Number(adv?.rango) || 1) && getRemainingXP(adv) > 0;
}

function summarizeEquippedItems(adv) {
  return (normalizeAdventurer(adv).inventario || []).filter(item => item.equipped || isWeaponItem(item));
}

function getEquipmentStats(adv) {
  return summarizeEquippedItems(adv).reduce((stats, item) => ({
    meleeDice: stats.meleeDice + item.meleeDice,
    rangedDice: stats.rangedDice + item.rangedDice,
    shield: stats.shield + item.shield,
    armor: stats.armor + item.armor,
    magicItems: stats.magicItems + (item.magic ? 1 : 0),
  }), { meleeDice: 0, rangedDice: 0, shield: 0, armor: 0, magicItems: 0 });
}

function isWeaponItem(item) {
  const attrs = new Set(item?.attributes || []);
  return !!(
    item?.meleeDice > 0 ||
    item?.rangedDice > 0 ||
    (item?.range || []).length > 0 ||
    attrs.has("melee") ||
    attrs.has("forceful_melee") ||
    attrs.has("quickstrike") ||
    attrs.has("first_strike") ||
    attrs.has("parry") ||
    attrs.has("reach") ||
    attrs.has("sharp") ||
    attrs.has("piercing") ||
    attrs.has("blast") ||
    attrs.has("ammo_arrow") ||
    attrs.has("ammo_bullet") ||
    attrs.has("trap_melee")
  );
}

const EQUIPMENT_FIELD_HELP = {
  meleeDice: "Dados que aporta al ataque cuerpo a cuerpo de ese objeto o arma.",
  rangedDice: "Dados que aporta al ataque a distancia de ese objeto o arma.",
  shield: "Cuantos impactos puede anular como escudo o bloqueo defensivo.",
  armor: "Proteccion que aporta el equipo, armadura o casco.",
};

function titleCaseToken(value) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function summarizeCatalogEntry(entry) {
  const parts = [];
  if (entry.source) parts.push(titleCaseToken(entry.source));
  if (entry.rarity) parts.push(titleCaseToken(entry.rarity));
  if (entry.size) parts.push("Tam " + String(entry.size).toUpperCase());
  if (entry.buy != null && entry.buy >= 0) parts.push("Compra " + entry.buy + "G");
  if (entry.sell != null && entry.sell >= 0) parts.push("Venta " + entry.sell + "G");
  if (entry.range?.length) parts.push("Rango " + entry.range.join("/"));
  if (entry.attributes?.length) parts.push("Atributos: " + entry.attributes.slice(0, 4).map(titleCaseToken).join(", "));
  return parts.join(" | ");
}

function inferInventoryFlagsFromCatalog(entry) {
  const attrs = new Set(entry.attributes || []);
  const magic = attrs.has("channel") || attrs.has("starting_magic") || attrs.has("x_dice") || attrs.has("magic_resist");
  const shield = attrs.has("shield") || attrs.has("shield_block") ? 1 : 0;
  const armor = attrs.has("armour") || attrs.has("armored") ? 1 : 0;
  return { magic, shield, armor };
}

function catalogEntryToInventoryItem(entry) {
  const inferred = inferInventoryFlagsFromCatalog(entry);
  return normalizeInventoryItem({
    name: entry.name,
    summary: summarizeCatalogEntry(entry),
    type: titleCaseToken(entry.color || entry.type || "Catalogo"),
    source: entry.source,
    rarity: entry.rarity,
    color: entry.color,
    size: entry.size,
    buy: entry.buy,
    sell: entry.sell,
    range: entry.range,
    attributes: entry.attributes,
    magic: inferred.magic,
    shield: inferred.shield,
    armor: inferred.armor,
    equipped: false,
  });
}

function parseRemoteItemModule(text) {
  const startMarker = "const e=";
  const endMarker = ";export{e as default};";
  const startIndex = text.indexOf(startMarker);
  const endIndex = text.lastIndexOf(endMarker);
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error("No se pudo leer el modulo remoto");
  }
  const expression = text.slice(startIndex + startMarker.length, endIndex).trim();
  return Function('"use strict"; return (' + expression + ');')();
}

async function loadOfficialItemCatalog() {
  if (officialItemCatalogCache) return officialItemCatalogCache;
  if (officialItemCatalogPromise) return officialItemCatalogPromise;

  officialItemCatalogPromise = Promise.all(
    Object.entries(ITEM_SOURCE_URLS).map(async ([source, url]) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Catalogo no disponible: " + source);
      const text = await response.text();
      const items = parseRemoteItemModule(text);
      return (Array.isArray(items) ? items : []).map(item => ({
        ...item,
        source,
        attributes: Array.isArray(item.attributes) ? item.attributes : [],
        range: Array.isArray(item.range) ? item.range : [],
      }));
    })
  ).then(groups => {
    officialItemCatalogCache = groups.flat().sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return officialItemCatalogCache;
  }).finally(() => {
    officialItemCatalogPromise = null;
  });

  return officialItemCatalogPromise;
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

function ModalSheet({ title, subtitle, onClose, children }) {
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 250,
        display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto",
        background: "#121225", borderTop: "2px solid #b91c1c", borderRadius: "16px 16px 0 0", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ color: "#d4b896", fontSize: 18, fontWeight: 800 }}>{title}</div>
            {subtitle && <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #374151",
              background: "transparent", color: "#9ca3af", fontSize: 18, cursor: "pointer" }}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InventoryEditor({ adv, onUpdate }) {
  const [draft, setDraft] = useState({
    name: "",
    summary: "",
    type: "",
    meleeDice: 0,
    rangedDice: 0,
    shield: 0,
    armor: 0,
    magic: false,
    equipped: false,
  });

  const updateItem = (id, field, value) => {
    onUpdate({
      ...adv,
      inventario: normalizeAdventurer(adv).inventario.map(item => item.id === id ? normalizeInventoryItem({ ...item, [field]: value }) : item),
    });
  };

  const removeItem = (id) => {
    onUpdate({
      ...adv,
      inventario: normalizeAdventurer(adv).inventario.filter(item => item.id !== id),
    });
  };

  const addItem = () => {
    if (!draft.name.trim()) return;
    onUpdate({
      ...adv,
      inventario: [...normalizeAdventurer(adv).inventario, normalizeInventoryItem(draft)],
    });
    setDraft({
      name: "",
      summary: "",
      type: "",
      meleeDice: 0,
      rangedDice: 0,
      shield: 0,
      armor: 0,
      magic: false,
      equipped: false,
    });
  };

  return (
    <Collapsible title="Inventario y Equipo" icon="📦">
      <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 10 }}>
        Registra aqui lo que lleva el aventurero. Los objetos equipados se resumen luego en la mesa para ataque, defensa y uso magico.
      </div>

      {(normalizeAdventurer(adv).inventario || []).length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {normalizeAdventurer(adv).inventario.map(item => (
            <div key={item.id} style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <input value={item.name} onChange={e => updateItem(item.id, "name", e.target.value)}
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #374151", background: "#111827", color: "#d4b896", fontSize: 13, marginBottom: 6, boxSizing: "border-box" }}/>
                  <input value={item.summary} onChange={e => updateItem(item.id, "summary", e.target.value)}
                    placeholder="Que hace o que recordar"
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #374151", background: "#111827", color: "#9ca3af", fontSize: 12, boxSizing: "border-box" }}/>
                </div>
                <button onClick={() => removeItem(item.id)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #7f1d1d", background: "#7f1d1d22", color: "#fca5a5", cursor: "pointer" }}>x</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 8 }}>
                {[
                  ["meleeDice", "Melee"],
                  ["rangedDice", "Dist"],
                  ["shield", "Escudo"],
                  ["armor", "Prot"],
                ].map(([field, label]) => (
                  <div key={field}>
                    <div style={{ color: "#6b7280", fontSize: 10, marginBottom: 4 }}>{label}</div>
                    <input type="number" min="0" value={item[field]} onChange={e => updateItem(item.id, field, Number(e.target.value) || 0)}
                      style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #374151", background: "#111827", color: "#d4b896", fontSize: 13, boxSizing: "border-box" }}/>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => updateItem(item.id, "equipped", !item.equipped)}
                  style={{ padding: "8px 10px", borderRadius: 999, border: item.equipped ? "1px solid #22c55e" : "1px solid #374151",
                    background: item.equipped ? "#16653422" : "transparent", color: item.equipped ? "#bbf7d0" : "#9ca3af",
                    fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {item.equipped ? "Equipado" : "No equipado"}
                </button>
                <button onClick={() => updateItem(item.id, "magic", !item.magic)}
                  style={{ padding: "8px 10px", borderRadius: 999, border: item.magic ? "1px solid #3b82f6" : "1px solid #374151",
                    background: item.magic ? "#1d4ed822" : "transparent", color: item.magic ? "#bfdbfe" : "#9ca3af",
                    fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {item.magic ? "Magico" : "No magico"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 12 }}>Todavia no hay objetos registrados.</div>
      )}

      <div style={{ background: "#111827", border: "1px solid #2d2d44", borderRadius: 10, padding: 10 }}>
        <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Agregar item manualmente</div>
        <input value={draft.name} onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Nombre del item"
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }}/>
        <input value={draft.summary} onChange={e => setDraft(prev => ({ ...prev, summary: e.target.value }))}
          placeholder="Resumen corto"
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#9ca3af", fontSize: 12, marginBottom: 8, boxSizing: "border-box" }}/>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 8 }}>
          {[
            ["meleeDice", "Melee"],
            ["rangedDice", "Dist"],
            ["shield", "Escudo"],
            ["armor", "Prot"],
          ].map(([field, label]) => (
            <div key={field}>
              <div style={{ color: "#6b7280", fontSize: 10, marginBottom: 4 }}>{label}</div>
              <input type="number" min="0" value={draft[field]} onChange={e => setDraft(prev => ({ ...prev, [field]: Number(e.target.value) || 0 }))}
                style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, boxSizing: "border-box" }}/>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button onClick={() => setDraft(prev => ({ ...prev, equipped: !prev.equipped }))}
            style={{ flex: 1, padding: 10, borderRadius: 8, border: draft.equipped ? "1px solid #22c55e" : "1px solid #374151",
              background: draft.equipped ? "#16653422" : "transparent", color: draft.equipped ? "#bbf7d0" : "#9ca3af", cursor: "pointer", fontSize: 12 }}>
            {draft.equipped ? "Se agrega equipado" : "Agregar sin equipar"}
          </button>
          <button onClick={() => setDraft(prev => ({ ...prev, magic: !prev.magic }))}
            style={{ flex: 1, padding: 10, borderRadius: 8, border: draft.magic ? "1px solid #3b82f6" : "1px solid #374151",
              background: draft.magic ? "#1d4ed822" : "transparent", color: draft.magic ? "#bfdbfe" : "#9ca3af", cursor: "pointer", fontSize: 12 }}>
            {draft.magic ? "Es magico" : "No es magico"}
          </button>
        </div>
        <button onClick={addItem}
          style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: "#7f1d1d", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
          Agregar item
        </button>
      </div>
    </Collapsible>
  );
}

InventoryEditor = function InventoryEditorPatched({ adv, onUpdate }) {
  const [catalogItems, setCatalogItems] = useState([]);
  const [catalogStatus, setCatalogStatus] = useState("loading");
  const [catalogError, setCatalogError] = useState("");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogSource, setCatalogSource] = useState("all");
  const [draft, setDraft] = useState({
    name: "",
    summary: "",
    type: "",
    meleeDice: 0,
    rangedDice: 0,
    shield: 0,
    armor: 0,
    magic: false,
    equipped: false,
  });

  useEffect(() => {
    let cancelled = false;
    setCatalogStatus("loading");
    setCatalogError("");
    loadOfficialItemCatalog()
      .then(items => {
        if (cancelled) return;
        setCatalogItems(items);
        setCatalogStatus("ready");
      })
      .catch(error => {
        if (cancelled) return;
        setCatalogError(error?.message || "No se pudo cargar el catalogo oficial.");
        setCatalogStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateItem = (id, field, value) => {
    onUpdate({
      ...adv,
      inventario: normalizeAdventurer(adv).inventario.map(item => item.id === id ? normalizeInventoryItem({ ...item, [field]: value }) : item),
    });
  };

  const removeItem = (id) => {
    onUpdate({
      ...adv,
      inventario: normalizeAdventurer(adv).inventario.filter(item => item.id !== id),
    });
  };

  const addItem = () => {
    if (!draft.name.trim()) return;
    onUpdate({
      ...adv,
      inventario: [...normalizeAdventurer(adv).inventario, normalizeInventoryItem(draft)],
    });
    setDraft({
      name: "",
      summary: "",
      type: "",
      meleeDice: 0,
      rangedDice: 0,
      shield: 0,
      armor: 0,
      magic: false,
      equipped: false,
    });
  };

  const addCatalogItem = (entry) => {
    onUpdate({
      ...adv,
      inventario: [...normalizeAdventurer(adv).inventario, catalogEntryToInventoryItem(entry)],
    });
  };

  const catalogResults = catalogItems.filter(item => {
    if (catalogSource !== "all" && item.source !== catalogSource) return false;
    const query = catalogQuery.trim().toLowerCase();
    if (!query) return true;
    const haystack = [
      item.name,
      item.slug,
      item.source,
      item.rarity,
      item.color,
      item.size,
      ...(item.attributes || []),
    ].join(" ").toLowerCase();
    return haystack.includes(query);
  }).slice(0, 24);

  return (
    <Collapsible title="Inventario y Equipo" icon="INV">
      <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 10 }}>
        Registra aqui lo que lleva el aventurero. Los objetos equipados se resumen luego en la mesa para ataque, defensa y uso magico.
      </div>
      <div style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 10, marginBottom: 12 }}>
        <div style={{ color: "#d4b896", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Guia rapida de campos</div>
        <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.6 }}>
          Melee: dados del arma o bono cuerpo a cuerpo. Dist: dados del ataque a distancia. Escudo: impactos anulados al defender. Prot: proteccion del equipo.
        </div>
        <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.6, marginTop: 6 }}>
          Las armas cuentan como equipadas solo por estar en inventario. Marca Equipado sobre todo en armaduras, cascos, capas, escudos u otros objetos que si dependan de llevarse puestos.
        </div>
      </div>

      <div style={{ background: "#111827", border: "1px solid #2d2d44", borderRadius: 10, padding: 10, marginBottom: 12 }}>
        <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Agregar desde catalogo oficial</div>
        <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 10 }}>
          Busca por nombre, fuente o atributo. Al agregarlo podras ajustar despues los valores de combate si hace falta.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 8, marginBottom: 8 }}>
          <input value={catalogQuery} onChange={e => setCatalogQuery(e.target.value)}
            placeholder="Buscar item o atributo"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, boxSizing: "border-box" }}/>
          <select value={catalogSource} onChange={e => setCatalogSource(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13 }}>
            <option value="all">Todo</option>
            <option value="maladum">Caja base</option>
            <option value="adventure">Adventure</option>
            <option value="beasts">Beasts</option>
          </select>
        </div>

        {catalogStatus === "loading" && (
          <div style={{ color: "#9ca3af", fontSize: 12 }}>Cargando catalogo oficial...</div>
        )}

        {catalogStatus === "error" && (
          <div style={{ color: "#fca5a5", fontSize: 12 }}>{catalogError || "No se pudo cargar el catalogo oficial."}</div>
        )}

        {catalogStatus === "ready" && (
          <div>
            <div style={{ color: "#6b7280", fontSize: 11, marginBottom: 8 }}>
              {catalogResults.length} resultados visibles de {catalogItems.length} items oficiales.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
              {catalogResults.map(item => (
                <div key={item.source + "_" + item.slug} style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#d4b896", fontSize: 14, fontWeight: 700 }}>{item.name}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                        {item.source && <span style={{ fontSize: 11, color: "#cbd5e1", padding: "2px 8px", borderRadius: 999, border: "1px solid #334155" }}>{titleCaseToken(item.source)}</span>}
                        {item.rarity && <span style={{ fontSize: 11, color: "#fde68a", padding: "2px 8px", borderRadius: 999, border: "1px solid #92400e" }}>{titleCaseToken(item.rarity)}</span>}
                        {item.size && <span style={{ fontSize: 11, color: "#9ca3af", padding: "2px 8px", borderRadius: 999, border: "1px solid #374151" }}>{String(item.size).toUpperCase()}</span>}
                      </div>
                    </div>
                    <button onClick={() => addCatalogItem(item)}
                      style={{ minWidth: 84, padding: "10px 12px", borderRadius: 8, border: "1px solid #166534", background: "#16653422", color: "#bbf7d0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      Agregar
                    </button>
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>{summarizeCatalogEntry(item)}</div>
                  {!!item.attributes?.length && (
                    <details style={{ marginTop: 6 }}>
                      <summary style={{ color: "#6b7280", fontSize: 11, cursor: "pointer" }}>
                        Ver atributos y efectos
                      </summary>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                        {item.attributes.slice(0, 8).map(attr => {
                          const meta = getAttributeEntry(attr);
                          return (
                            <div key={attr} style={{ background: "#111827", borderRadius: 8, border: "1px solid #1f2937", padding: 8 }}>
                              <div style={{ color: "#d4b896", fontSize: 12, fontWeight: 700 }}>{meta?.label || titleCaseToken(attr)}</div>
                              <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>{meta?.summary || "Detalle pendiente."}</div>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  )}
                </div>
              ))}
              {catalogResults.length === 0 && (
                <div style={{ color: "#6b7280", fontSize: 12 }}>No se encontraron items con ese filtro.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {(normalizeAdventurer(adv).inventario || []).length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {normalizeAdventurer(adv).inventario.map(item => {
            const autoEquippedWeapon = isWeaponItem(item);
            return (
            <div key={item.id} style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <input value={item.name} onChange={e => updateItem(item.id, "name", e.target.value)}
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #374151", background: "#111827", color: "#d4b896", fontSize: 13, marginBottom: 6, boxSizing: "border-box" }}/>
                  <input value={item.summary} onChange={e => updateItem(item.id, "summary", e.target.value)}
                    placeholder="Que hace o que recordar"
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #374151", background: "#111827", color: "#9ca3af", fontSize: 12, boxSizing: "border-box" }}/>
                </div>
                <button onClick={() => removeItem(item.id)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #7f1d1d", background: "#7f1d1d22", color: "#fca5a5", cursor: "pointer" }}>x</button>
              </div>

              {(item.source || item.rarity || item.size || item.buy != null || item.sell != null) && (
                <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.5, marginBottom: 8 }}>
                  {summarizeCatalogEntry(item)}
                </div>
              )}

              {!!item.attributes?.length && (
                <details style={{ marginBottom: 8 }}>
                  <summary style={{ color: "#9ca3af", fontSize: 11, cursor: "pointer" }}>Atributos y habilidades del objeto</summary>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                    {item.attributes.map(attr => {
                      const meta = getAttributeEntry(attr);
                      return (
                        <div key={attr} style={{ background: "#111827", borderRadius: 8, border: "1px solid #1f2937", padding: 8 }}>
                          <div style={{ color: "#d4b896", fontSize: 12, fontWeight: 700 }}>{meta?.label || titleCaseToken(attr)}</div>
                          <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>{meta?.summary || "Detalle pendiente."}</div>
                        </div>
                      );
                    })}
                  </div>
                </details>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {item.meleeDice > 0 && <span style={{ fontSize: 11, color: "#fde68a", padding: "2px 8px", borderRadius: 999, border: "1px solid #92400e" }}>Melee +{item.meleeDice}</span>}
                {item.rangedDice > 0 && <span style={{ fontSize: 11, color: "#fca5a5", padding: "2px 8px", borderRadius: 999, border: "1px solid #7f1d1d" }}>Dist +{item.rangedDice}</span>}
                {item.shield > 0 && <span style={{ fontSize: 11, color: "#bfdbfe", padding: "2px 8px", borderRadius: 999, border: "1px solid #1d4ed8" }}>Escudo {item.shield}</span>}
                {item.armor > 0 && <span style={{ fontSize: 11, color: "#cbd5e1", padding: "2px 8px", borderRadius: 999, border: "1px solid #475569" }}>Prot +{item.armor}</span>}
                {!item.meleeDice && !item.rangedDice && !item.shield && !item.armor && (
                  <span style={{ color: "#6b7280", fontSize: 11 }}>Sin valores de combate cargados.</span>
                )}
              </div>
              <details style={{ marginBottom: 8 }}>
                <summary style={{ color: "#6b7280", fontSize: 11, cursor: "pointer" }}>Ajuste manual de combate</summary>
                <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.5, marginTop: 8, marginBottom: 8 }}>
                  Solo toca estos valores si quieres corregir o completar un item. Lo normal es dejar el autocompletado del catalogo.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                  {[
                    ["meleeDice", "Melee"],
                    ["rangedDice", "Dist"],
                    ["shield", "Escudo"],
                    ["armor", "Prot"],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <div title={EQUIPMENT_FIELD_HELP[field]} style={{ color: "#6b7280", fontSize: 10, marginBottom: 4, cursor: "help" }}>{label}</div>
                      <input type="number" min="0" value={item[field]} onChange={e => updateItem(item.id, field, Number(e.target.value) || 0)}
                        style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #374151", background: "#111827", color: "#d4b896", fontSize: 13, boxSizing: "border-box" }}/>
                    </div>
                  ))}
                </div>
              </details>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {autoEquippedWeapon ? (
                  <span style={{ padding: "8px 10px", borderRadius: 999, border: "1px solid #92400e",
                    background: "#92400e22", color: "#fde68a", fontSize: 12, fontWeight: 700 }}>
                    Arma: cuenta como equipada
                  </span>
                ) : (
                  <button onClick={() => updateItem(item.id, "equipped", !item.equipped)}
                    style={{ padding: "8px 10px", borderRadius: 999, border: item.equipped ? "1px solid #22c55e" : "1px solid #374151",
                      background: item.equipped ? "#16653422" : "transparent", color: item.equipped ? "#bbf7d0" : "#9ca3af",
                      fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {item.equipped ? "Equipado" : "No equipado"}
                  </button>
                )}
                <button onClick={() => updateItem(item.id, "magic", !item.magic)}
                  style={{ padding: "8px 10px", borderRadius: 999, border: item.magic ? "1px solid #3b82f6" : "1px solid #374151",
                    background: item.magic ? "#1d4ed822" : "transparent", color: item.magic ? "#bfdbfe" : "#9ca3af",
                    fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {item.magic ? "Magico" : "No magico"}
                </button>
              </div>
            </div>
          )})}
        </div>
      ) : (
        <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 12 }}>Todavia no hay objetos registrados.</div>
      )}

      <div style={{ background: "#111827", border: "1px solid #2d2d44", borderRadius: 10, padding: 10 }}>
        <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Agregar item manualmente</div>
        <input value={draft.name} onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Nombre del item"
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }}/>
        <input value={draft.summary} onChange={e => setDraft(prev => ({ ...prev, summary: e.target.value }))}
          placeholder="Resumen corto"
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#9ca3af", fontSize: 12, marginBottom: 8, boxSizing: "border-box" }}/>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 8 }}>
          {[
            ["meleeDice", "Melee"],
            ["rangedDice", "Dist"],
            ["shield", "Escudo"],
            ["armor", "Prot"],
          ].map(([field, label]) => (
            <div key={field}>
              <div title={EQUIPMENT_FIELD_HELP[field]} style={{ color: "#6b7280", fontSize: 10, marginBottom: 4, cursor: "help" }}>{label}</div>
              <input type="number" min="0" value={draft[field]} onChange={e => setDraft(prev => ({ ...prev, [field]: Number(e.target.value) || 0 }))}
                style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, boxSizing: "border-box" }}/>
            </div>
          ))}
        </div>
        <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.5, marginBottom: 8 }}>
          Si es un arma, normalmente basta con tenerla en inventario. Usa Equipado sobre todo para armaduras, cascos, capas o equipo defensivo.
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button onClick={() => setDraft(prev => ({ ...prev, equipped: !prev.equipped }))}
            style={{ flex: 1, padding: 10, borderRadius: 8, border: draft.equipped ? "1px solid #22c55e" : "1px solid #374151",
              background: draft.equipped ? "#16653422" : "transparent", color: draft.equipped ? "#bbf7d0" : "#9ca3af", cursor: "pointer", fontSize: 12 }}>
            {draft.equipped ? "Se agrega equipado" : "Agregar sin equipar"}
          </button>
          <button onClick={() => setDraft(prev => ({ ...prev, magic: !prev.magic }))}
            style={{ flex: 1, padding: 10, borderRadius: 8, border: draft.magic ? "1px solid #3b82f6" : "1px solid #374151",
              background: draft.magic ? "#1d4ed822" : "transparent", color: draft.magic ? "#bfdbfe" : "#9ca3af", cursor: "pointer", fontSize: 12 }}>
            {draft.magic ? "Es magico" : "No es magico"}
          </button>
        </div>
        <button onClick={addItem}
          style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: "#7f1d1d", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
          Agregar item
        </button>
      </div>
    </Collapsible>
  );
};

function SpellbookEditor({ adv, onUpdate }) {
  const [draft, setDraft] = useState({ spellId: "", name: "", level: 1, school: "Manual", notes: "" });
  const rank = Math.max(1, Number(adv?.rango) || 1);
  const remainingXP = getRemainingXP(adv);
  const officialOptions = getAvailableOfficialSpells(adv);
  const selectedOfficial = officialOptions.find(spell => spell.id === draft.spellId) || null;

  const resetDraft = () => setDraft({ spellId: "", name: "", level: 1, school: "Manual", notes: "" });

  const addOfficial = () => {
    if (!selectedOfficial || !canLearnSpell(adv, selectedOfficial.level)) return;
    onUpdate({
      ...adv,
      hechizos: [...getKnownSpells(adv), normalizeSpell(selectedOfficial)],
    });
    resetDraft();
  };

  const addManual = () => {
    const name = draft.name.trim();
    if (!name || !canLearnSpell(adv, draft.level)) return;
    onUpdate({
      ...adv,
      hechizos: [...getKnownSpells(adv), normalizeSpell({
        id: "sp_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name,
        level: Math.max(1, Math.min(rank, Number(draft.level) || 1)),
        school: draft.school || "Manual",
        notes: draft.notes.trim(),
      })],
    });
    resetDraft();
  };

  const removeSpell = (spellId) => {
    onUpdate({
      ...adv,
      hechizos: getKnownSpells(adv).filter(spell => spell.id !== spellId),
    });
  };

  return (
    <Collapsible title="Libro de Hechizos" icon="📘" defaultOpen>
      <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 10 }}>
        Cada hechizo aprendido gasta 1 PX. El nivel maximo del hechizo es tu rango actual.
      </div>
      <div style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 10 }}>
        Rango actual: {rank} · PX libre: {remainingXP}
      </div>

      <div style={{ background: "#111827", border: "1px solid #2d2d44", borderRadius: 10, padding: 10, marginBottom: 10 }}>
        <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Hechizos oficiales de tu clase</div>
        <select value={draft.spellId} onChange={e => setDraft(prev => ({ ...prev, spellId: e.target.value }))}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, marginBottom: 8 }}>
          <option value="">{officialOptions.length ? "Selecciona un hechizo oficial" : "No hay hechizos oficiales disponibles a este rango"}</option>
          {officialOptions.map(spell => (
            <option key={spell.id} value={spell.id}>Nivel {spell.level} · {spell.name}</option>
          ))}
        </select>
        {selectedOfficial && (
          <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>
            {selectedOfficial.summary || selectedOfficial.notes || "Texto oficial pendiente de transcribir."}
          </div>
        )}
        <button onClick={addOfficial} disabled={!selectedOfficial || !canLearnSpell(adv, selectedOfficial.level)}
          style={{ width: "100%", padding: 12, borderRadius: 8, border: "none",
            background: selectedOfficial && canLearnSpell(adv, selectedOfficial.level) ? "#1d4ed8" : "#1e293b",
            color: selectedOfficial && canLearnSpell(adv, selectedOfficial.level) ? "#dbeafe" : "#64748b",
            fontWeight: 700, cursor: selectedOfficial && canLearnSpell(adv, selectedOfficial.level) ? "pointer" : "default" }}>
          Aprender hechizo oficial (1 PX)
        </button>
      </div>

      <div style={{ background: "#111827", border: "1px solid #2d2d44", borderRadius: 10, padding: 10, marginBottom: 10 }}>
        <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Carga manual de respaldo</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 8, marginBottom: 8 }}>
          <input value={draft.name} onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nombre del hechizo"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, boxSizing: "border-box" }}/>
          <input type="number" min="1" max={rank} value={draft.level} onChange={e => setDraft(prev => ({ ...prev, level: Math.max(1, Math.min(rank, Number(e.target.value) || 1)) }))}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, boxSizing: "border-box" }}/>
        </div>
        <input value={draft.school} onChange={e => setDraft(prev => ({ ...prev, school: e.target.value }))}
          placeholder="Escuela"
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#9ca3af", fontSize: 12, marginBottom: 8, boxSizing: "border-box" }}/>
        <textarea value={draft.notes} onChange={e => setDraft(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Resumen o nota oficial"
          rows={3}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#9ca3af", fontSize: 12, marginBottom: 8, resize: "vertical", boxSizing: "border-box" }}/>
        <button onClick={addManual} disabled={!draft.name.trim() || !canLearnSpell(adv, draft.level)}
          style={{ width: "100%", padding: 12, borderRadius: 8, border: "none",
            background: draft.name.trim() && canLearnSpell(adv, draft.level) ? "#7f1d1d" : "#1e293b",
            color: draft.name.trim() && canLearnSpell(adv, draft.level) ? "#ffe4e6" : "#64748b",
            fontWeight: 700, cursor: draft.name.trim() && canLearnSpell(adv, draft.level) ? "pointer" : "default" }}>
          Agregar hechizo manual (1 PX)
        </button>
      </div>

      {(getKnownSpells(adv) || []).length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {getKnownSpells(adv).map(spell => (
            <div key={spell.id} style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", marginBottom: (spell.summary || spell.notes) ? 6 : 0 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ color: "#93c5fd", fontSize: 14, fontWeight: 700 }}>{spell.name}</span>
                  <span style={{ fontSize: 11, color: "#c4b5fd", padding: "2px 8px", borderRadius: 999, border: "1px solid #4338ca" }}>{spell.school}</span>
                  <span style={{ fontSize: 11, color: "#d4b896", padding: "2px 8px", borderRadius: 999, border: "1px solid #374151" }}>Nivel {spell.level}</span>
                </div>
                <button onClick={() => removeSpell(spell.id)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #7f1d1d", background: "#7f1d1d22", color: "#fca5a5", cursor: "pointer" }}>x</button>
              </div>
              {(spell.summary || spell.notes) && (
                <div style={{ color: "#d4b896", fontSize: 12, lineHeight: 1.5 }}>{spell.summary || spell.notes}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: "#6b7280", fontSize: 12 }}>Todavia no hay hechizos aprendidos.</div>
      )}
    </Collapsible>
  );
}

SpellbookEditor = function SpellbookEditorPatched({ adv, onUpdate }) {
  const [draft, setDraft] = useState({ spellId: "", name: "", level: 1, school: "Manual", notes: "" });
  const rank = Math.max(1, Number(adv?.rango) || 1);
  const remainingXP = getRemainingXP(adv);
  const officialOptions = getAvailableOfficialSpells(adv);
  const selectedOfficial = officialOptions.find(spell => spell.id === draft.spellId) || null;

  const resetDraft = () => setDraft({ spellId: "", name: "", level: 1, school: "Manual", notes: "" });

  const addOfficial = () => {
    if (!selectedOfficial || !canLearnSpell(adv, selectedOfficial.level)) return;
    onUpdate({
      ...adv,
      hechizos: [...getKnownSpells(adv), normalizeSpell(selectedOfficial)],
    });
    resetDraft();
  };

  const addManual = () => {
    const name = draft.name.trim();
    if (!name || !canLearnSpell(adv, draft.level)) return;
    onUpdate({
      ...adv,
      hechizos: [...getKnownSpells(adv), normalizeSpell({
        id: "sp_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name,
        level: Math.max(1, Math.min(rank, Number(draft.level) || 1)),
        school: draft.school || "Manual",
        notes: draft.notes.trim(),
      })],
    });
    resetDraft();
  };

  const removeSpell = (spellId) => {
    onUpdate({
      ...adv,
      hechizos: getKnownSpells(adv).filter(spell => spell.id !== spellId),
    });
  };

  return (
    <Collapsible title="Libro de Hechizos" icon="SPL" defaultOpen>
      <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 10 }}>
        Cada hechizo aprendido gasta 1 PX. El nivel maximo del hechizo usa el rango manual que hayas marcado en la ficha.
      </div>
      <div style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 10 }}>
        Rango manual actual: {rank} | PX libre: {remainingXP}
      </div>

      <div style={{ background: "#111827", border: "1px solid #2d2d44", borderRadius: 10, padding: 10, marginBottom: 10 }}>
        <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Hechizos oficiales de tu clase</div>
        <select value={draft.spellId} onChange={e => setDraft(prev => ({ ...prev, spellId: e.target.value }))}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, marginBottom: 8 }}>
          <option value="">{officialOptions.length ? "Selecciona un hechizo oficial" : "No hay hechizos oficiales disponibles a este rango"}</option>
          {officialOptions.map(spell => (
            <option key={spell.id} value={spell.id}>Nivel {spell.level} | {spell.name}</option>
          ))}
        </select>
        {selectedOfficial && (
          <div style={{ background: "#0f172a", borderRadius: 8, border: "1px solid #2d2d44", padding: 10, marginBottom: 8 }}>
            <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              Nivel {selectedOfficial.level} | {selectedOfficial.name}
            </div>
            <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: selectedOfficial.notes ? 6 : 0, lineHeight: 1.5 }}>
              {selectedOfficial.summary || "Texto oficial pendiente de transcribir."}
            </div>
            {selectedOfficial.notes && (
              <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.5 }}>{selectedOfficial.notes}</div>
            )}
          </div>
        )}
        <details style={{ marginBottom: 8 }}>
          <summary style={{ color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>Vista rapida de hechizos disponibles</summary>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {officialOptions.map(spell => (
              <button key={spell.id} onClick={() => setDraft(prev => ({ ...prev, spellId: spell.id }))}
                style={{ textAlign: "left", background: selectedOfficial?.id === spell.id ? "#132034" : "#0f172a", border: "1px solid #2d2d44", borderRadius: 8, padding: 10, cursor: "pointer" }}>
                <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Nivel {spell.level} | {spell.name}</div>
                <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.5 }}>{spell.summary || spell.notes || "Texto oficial pendiente de transcribir."}</div>
              </button>
            ))}
          </div>
        </details>
        <button onClick={addOfficial} disabled={!selectedOfficial || !canLearnSpell(adv, selectedOfficial.level)}
          style={{ width: "100%", padding: 12, borderRadius: 8, border: "none",
            background: selectedOfficial && canLearnSpell(adv, selectedOfficial.level) ? "#1d4ed8" : "#1e293b",
            color: selectedOfficial && canLearnSpell(adv, selectedOfficial.level) ? "#dbeafe" : "#64748b",
            fontWeight: 700, cursor: selectedOfficial && canLearnSpell(adv, selectedOfficial.level) ? "pointer" : "default" }}>
          Aprender hechizo oficial (1 PX)
        </button>
      </div>

      <div style={{ background: "#111827", border: "1px solid #2d2d44", borderRadius: 10, padding: 10, marginBottom: 10 }}>
        <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Carga manual de respaldo</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 8, marginBottom: 8 }}>
          <input value={draft.name} onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nombre del hechizo"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, boxSizing: "border-box" }}/>
          <input type="number" min="1" max={rank} value={draft.level} onChange={e => setDraft(prev => ({ ...prev, level: Number(e.target.value) || 1 }))}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, boxSizing: "border-box" }}/>
        </div>
        <input value={draft.school} onChange={e => setDraft(prev => ({ ...prev, school: e.target.value }))}
          placeholder="Escuela o clase"
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }}/>
        <textarea value={draft.notes} onChange={e => setDraft(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Resumen del hechizo"
          rows={3}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#9ca3af", fontSize: 12, marginBottom: 8, boxSizing: "border-box", resize: "vertical" }}/>
        <button onClick={addManual} disabled={!draft.name.trim() || !canLearnSpell(adv, draft.level)}
          style={{ width: "100%", padding: 12, borderRadius: 8, border: "none",
            background: draft.name.trim() && canLearnSpell(adv, draft.level) ? "#7f1d1d" : "#1e293b",
            color: draft.name.trim() && canLearnSpell(adv, draft.level) ? "#fff" : "#64748b",
            fontWeight: 700, cursor: draft.name.trim() && canLearnSpell(adv, draft.level) ? "pointer" : "default" }}>
          Agregar hechizo manual (1 PX)
        </button>
      </div>

      {getKnownSpells(adv).length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {getKnownSpells(adv).map(spell => (
            <div key={spell.id} style={{ background: "#0f172a", border: "1px solid #2d2d44", borderRadius: 10, padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <div style={{ color: "#d4b896", fontSize: 14, fontWeight: 700 }}>{spell.name}</div>
                  <div style={{ color: "#6b7280", fontSize: 11 }}>Nivel {spell.level} | {spell.school}</div>
                </div>
                <button onClick={() => removeSpell(spell.id)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #7f1d1d", background: "#7f1d1d22", color: "#fca5a5", cursor: "pointer" }}>x</button>
              </div>
              <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.5 }}>{spell.summary || spell.notes || "Resumen pendiente."}</div>
            </div>
          ))}
        </div>
      )}
    </Collapsible>
  );
};

SpellbookEditor = function SpellbookEditorSafe({ adv, onUpdate }) {
  const [draft, setDraft] = useState({ spellId: "", name: "", level: 1, school: "Manual", notes: "" });
  const rank = Math.max(1, Number(adv?.rango) || 1);
  const remainingXP = getRemainingXP(adv);
  const officialOptions = getAvailableOfficialSpells(adv);
  const selectedOfficial = officialOptions.find(spell => spell.id === draft.spellId) || null;

  const resetDraft = () => setDraft({ spellId: "", name: "", level: 1, school: "Manual", notes: "" });

  const addOfficial = () => {
    if (!selectedOfficial || !canLearnSpell(adv, selectedOfficial.level)) return;
    onUpdate({
      ...adv,
      hechizos: [...getKnownSpells(adv), normalizeSpell(selectedOfficial)],
    });
    resetDraft();
  };

  const addManual = () => {
    const name = draft.name.trim();
    if (!name || !canLearnSpell(adv, draft.level)) return;
    onUpdate({
      ...adv,
      hechizos: [...getKnownSpells(adv), normalizeSpell({
        id: "sp_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name,
        level: Math.max(1, Math.min(rank, Number(draft.level) || 1)),
        school: draft.school || "Manual",
        notes: draft.notes.trim(),
      })],
    });
    resetDraft();
  };

  const removeSpell = (spellId) => {
    onUpdate({
      ...adv,
      hechizos: getKnownSpells(adv).filter(spell => spell.id !== spellId),
    });
  };

  return (
    <Collapsible title="Libro de Hechizos" icon="SPL" defaultOpen>
      <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 10 }}>
        Cada hechizo aprendido gasta 1 PX. El nivel maximo del hechizo usa el rango manual que hayas marcado en la ficha.
      </div>
      <div style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 10 }}>
        Rango manual actual: {rank} | PX libre: {remainingXP}
      </div>

      <div style={{ background: "#111827", border: "1px solid #2d2d44", borderRadius: 10, padding: 10, marginBottom: 10 }}>
        <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Hechizos oficiales de tu clase</div>
        <select value={draft.spellId} onChange={e => setDraft(prev => ({ ...prev, spellId: e.target.value }))}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, marginBottom: 8 }}>
          <option value="">{officialOptions.length ? "Selecciona un hechizo oficial" : "No hay hechizos oficiales disponibles a este rango"}</option>
          {officialOptions.map(spell => (
            <option key={spell.id} value={spell.id}>Nivel {spell.level} | {spell.name}</option>
          ))}
        </select>
        {selectedOfficial && (
          <div style={{ background: "#0f172a", border: "1px solid #2d2d44", borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              Nivel {selectedOfficial.level} | {selectedOfficial.name}
            </div>
            <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.5 }}>
              {selectedOfficial.summary || selectedOfficial.notes || "Texto oficial pendiente de transcribir."}
            </div>
          </div>
        )}
        <button onClick={addOfficial} disabled={!selectedOfficial || !canLearnSpell(adv, selectedOfficial.level)}
          style={{ width: "100%", padding: 12, borderRadius: 8, border: "none",
            background: selectedOfficial && canLearnSpell(adv, selectedOfficial.level) ? "#1d4ed8" : "#1e293b",
            color: selectedOfficial && canLearnSpell(adv, selectedOfficial.level) ? "#dbeafe" : "#64748b",
            fontWeight: 700, cursor: selectedOfficial && canLearnSpell(adv, selectedOfficial.level) ? "pointer" : "default" }}>
          Aprender hechizo oficial (1 PX)
        </button>
      </div>

      <div style={{ background: "#111827", border: "1px solid #2d2d44", borderRadius: 10, padding: 10, marginBottom: 10 }}>
        <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Carga manual de respaldo</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 8, marginBottom: 8 }}>
          <input value={draft.name} onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nombre del hechizo"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, boxSizing: "border-box" }}/>
          <input type="number" min="1" max={rank} value={draft.level} onChange={e => setDraft(prev => ({ ...prev, level: Number(e.target.value) || 1 }))}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, boxSizing: "border-box" }}/>
        </div>
        <input value={draft.school} onChange={e => setDraft(prev => ({ ...prev, school: e.target.value }))}
          placeholder="Escuela o clase"
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }}/>
        <textarea value={draft.notes} onChange={e => setDraft(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Resumen del hechizo"
          rows={3}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#9ca3af", fontSize: 12, marginBottom: 8, boxSizing: "border-box", resize: "vertical" }}/>
        <button onClick={addManual} disabled={!draft.name.trim() || !canLearnSpell(adv, draft.level)}
          style={{ width: "100%", padding: 12, borderRadius: 8, border: "none",
            background: draft.name.trim() && canLearnSpell(adv, draft.level) ? "#7f1d1d" : "#1e293b",
            color: draft.name.trim() && canLearnSpell(adv, draft.level) ? "#fff" : "#64748b",
            fontWeight: 700, cursor: draft.name.trim() && canLearnSpell(adv, draft.level) ? "pointer" : "default" }}>
          Agregar hechizo manual (1 PX)
        </button>
      </div>

      {getKnownSpells(adv).length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {getKnownSpells(adv).map(spell => (
            <div key={spell.id} style={{ background: "#0f172a", border: "1px solid #2d2d44", borderRadius: 10, padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <div style={{ color: "#d4b896", fontSize: 14, fontWeight: 700 }}>{spell.name}</div>
                  <div style={{ color: "#6b7280", fontSize: 11 }}>Nivel {spell.level} | {spell.school}</div>
                </div>
                <button onClick={() => removeSpell(spell.id)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #7f1d1d", background: "#7f1d1d22", color: "#fca5a5", cursor: "pointer" }}>x</button>
              </div>
              <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.5 }}>{spell.summary || spell.notes || "Resumen pendiente."}</div>
            </div>
          ))}
        </div>
      )}
    </Collapsible>
  );
};

function CombatAbilitiesModal({ adv, missionState, onUpdateMission, onClose }) {
  const [filter, setFilter] = useState("all");
  const learnedSkills = getLearnedSkills(adv);
  const spells = getKnownSpells(adv);
  const filters = [
    { id: "all", label: "Todo" },
    { id: "magic", label: "Magia" },
    { id: "reaction", label: "Reaccion" },
    { id: "melee", label: "Melee" },
    { id: "ranged", label: "Distancia" },
    { id: "defense", label: "Defensa" },
    { id: "support", label: "Apoyo" },
  ];

  const entries = [
    ...spells.map(spell => ({
      id: "spell_" + spell.id,
      name: spell.name,
      level: spell.level,
      source: "Hechizo",
      summary: spell.summary || spell.notes || "Texto oficial pendiente de transcribir desde la carta.",
      tags: ["magic","spell", (spell.school || "oficial").toLowerCase()],
      accent: "#93c5fd",
      meta: spell.school || "Oficial",
      magic: true,
    })),
    ...learnedSkills.map((skill, index) => ({
      id: "skill_" + slugKey(skill.name) + "_" + index,
      name: skill.name,
      level: skill.level,
      source: skill.source,
      summary: skill.summary,
      tags: skill.tags || [],
      accent: "#d4b896",
      meta: skill.tags?.length ? skill.tags.join(" · ") : skill.source,
      magic: (skill.tags || []).includes("magic") || (skill.tags || []).includes("spell"),
    })),
  ];

  const visible = entries.filter(entry => filter === "all" || (entry.tags || []).includes(filter));

  const markFirstMagicUse = () => {
    if (!missionState || missionState.magia_usada_esta_ronda) return;
    onUpdateMission({ ...missionState, magia_usada_esta_ronda: true, amenaza_nivel: missionState.amenaza_nivel + 1 });
  };

  return (
    <ModalSheet title="Habilidades" subtitle={adv.nombre + (adv.clase ? " · " + adv.clase : "")} onClose={onClose}>
      {adv.magia_max > 0 && (
        <button onClick={markFirstMagicUse} disabled={!missionState || missionState.magia_usada_esta_ronda}
          style={{ width: "100%", padding: 12, borderRadius: 8, marginBottom: 12,
            border: missionState?.magia_usada_esta_ronda ? "1px solid #1d4ed8" : "1px solid #3b82f6",
            background: missionState?.magia_usada_esta_ronda ? "#1d4ed822" : "#3b82f622",
            color: missionState?.magia_usada_esta_ronda ? "#93c5fd" : "#dbeafe",
            fontSize: 13, fontWeight: 700, cursor: missionState?.magia_usada_esta_ronda ? "default" : "pointer" }}>
          {missionState?.magia_usada_esta_ronda ? "Magia ya marcada esta ronda" : "Marcar primer uso de magia (+1 Amenaza)"}
        </button>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {filters.map(filterOption => (
          <button key={filterOption.id} onClick={() => setFilter(filterOption.id)}
            style={{ padding: "8px 10px", borderRadius: 999,
              border: filter === filterOption.id ? "1px solid #eab308" : "1px solid #374151",
              background: filter === filterOption.id ? "#eab30822" : "#0f172a",
              color: filter === filterOption.id ? "#fde68a" : "#9ca3af",
              fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {filterOption.label}
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {visible.map(entry => (
            <div key={entry.id} style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{ color: entry.accent, fontSize: 14, fontWeight: 700 }}>{entry.name}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af", padding: "2px 8px", borderRadius: 999, border: "1px solid #374151" }}>{entry.source}</span>
                    <span style={{ fontSize: 11, color: "#fca5a5", padding: "2px 8px", borderRadius: 999, border: "1px solid #7f1d1d" }}>Nivel {entry.level}</span>
                    {entry.meta && <span style={{ fontSize: 11, color: "#c4b5fd", padding: "2px 8px", borderRadius: 999, border: "1px solid #4338ca" }}>{entry.meta}</span>}
                  </div>
                  {entry.tags?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                      {entry.tags.map(tag => (
                        <span key={tag} style={{ fontSize: 10, color: "#9ca3af", padding: "2px 6px", borderRadius: 999, border: "1px solid #374151", textTransform: "capitalize" }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ color: "#d4b896", fontSize: 12, lineHeight: 1.5 }}>{entry.summary}</div>
                </div>
                {entry.magic && !missionState?.magia_usada_esta_ronda && (
                  <button onClick={markFirstMagicUse}
                    style={{ minWidth: 44, minHeight: 44, padding: "0 8px", borderRadius: 8, border: "1px solid #3b82f6", background: "#3b82f622", color: "#dbeafe", cursor: "pointer", fontSize: 12 }}>
                    + Amenaza
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: "#6b7280", fontSize: 13 }}>No hay entradas para este filtro.</div>
      )}
    </ModalSheet>
  );
}

function AdventurerSheetV2({ adv, onUpdate, onBack, onRemove }) {
  const normalized = normalizeAdventurer(adv);
  const update = (field, value) => onUpdate(normalizeAdventurer({ ...normalized, [field]: value }));
  const learnedSkills = getLearnedSkills(normalized);
  const spentXP = getSpentXP(normalized);
  const freeXP = getRemainingXP(normalized);
  const isMagicalClass = !!CLASS_DATA[normalized.clase]?.spell;

  const updateSkillLevel = (skillName, delta) => {
    const current = Number(normalized.clase_habilidades?.[skillName]) || 0;
    const next = Math.max(0, current + delta);
    if (delta > 0 && freeXP <= 0) return;
    onUpdate(normalizeAdventurer({
      ...normalized,
      clase_habilidades: {
        ...normalized.clase_habilidades,
        [skillName]: next,
      },
    }));
  };

  return (
    <div style={{ padding: 16 }}>
      <button onClick={onBack}
        style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 13,
          cursor: "pointer", marginBottom: 12, padding: 0 }}>â† Volver al grupo</button>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#d4b896", fontSize: 22, fontWeight: 800, margin: 0 }}>{normalized.nombre}</h2>
        <div style={{ color: "#6b7280", fontSize: 13 }}>{normalized.especie} Â· Rango {normalized.rango} Â· {normalized.coste}â‚²</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Clase</div>
        <select value={normalized.clase} onChange={e => onUpdate(updateAdventurerClass(normalized, e.target.value))}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151",
            background: "#0f172a", color: "#d4b896", fontSize: 14 }}>
          <option value="">â€” Sin clase â€”</option>
          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 14, border: "1px solid #2d2d44", marginBottom: 12 }}>
        <PegBar label="Salud" icon="â™¥" current={normalized.salud_actual} max={normalized.salud_max}
          color="#22c55e" onChange={v => update("salud_actual", v)}/>
        <PegBar label="Magia" icon="âœ¦" current={normalized.magia_actual} max={normalized.magia_max}
          color="#3b82f6" onChange={v => update("magia_actual", v)}/>
        <PegBar label="Habilidad" icon="â—†" current={normalized.habilidad_actual} max={normalized.habilidad_max}
          color="#eab308" onChange={v => update("habilidad_actual", v)}/>
      </div>

      <Collapsible title="Estados" icon="ðŸ’€" defaultOpen={normalized.status_effects.length > 0}>
        <StatusEffects effects={normalized.status_effects} onChange={v => update("status_effects", v)}/>
      </Collapsible>

      {normalized.innatas.length > 0 && (
        <Collapsible title="Habilidades Innatas" icon="â­">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {normalized.innatas.map(h => (
              <span key={h} style={{ padding: "4px 10px", borderRadius: 6, background: "#eab30822",
                border: "1px solid #eab30844", color: "#eab308", fontSize: 12 }}>{h}</span>
            ))}
          </div>
        </Collapsible>
      )}

      {normalized.clase && (
        <Collapsible title="Progresion de Clase" icon="🗡️" defaultOpen>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div style={{ background: "#0f172a", borderRadius: 8, padding: 10 }}>
              <div style={{ color: "#6b7280", fontSize: 10, textTransform: "uppercase" }}>PX gastada</div>
              <div style={{ color: "#d4b896", fontSize: 20, fontWeight: 800 }}>{spentXP}</div>
            </div>
            <div style={{ background: "#0f172a", borderRadius: 8, padding: 10 }}>
              <div style={{ color: "#6b7280", fontSize: 10, textTransform: "uppercase" }}>PX libre</div>
              <div style={{ color: freeXP > 0 ? "#22c55e" : "#9ca3af", fontSize: 20, fontWeight: 800 }}>{freeXP}</div>
            </div>
          </div>
          <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 10 }}>
            Aqui puedes reflejar lo aprendido gastando PX. No impongo topes automaticos porque aun nos faltan cartas completas de avance por validar.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(CLASS_DATA[normalized.clase]?.skills || []).map(skillName => {
              const level = Number(normalized.clase_habilidades?.[skillName]) || 0;
              const meta = SKILL_DATA[skillName] || {};
              const levelDetails = getSkillLevelDetails(skillName);
              return (
                <div key={skillName} style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ color: "#d4b896", fontSize: 14, fontWeight: 700 }}>{skillName}</span>
                        {meta.category && <span style={{ fontSize: 11, color: "#9ca3af", padding: "2px 8px", borderRadius: 999, border: "1px solid #374151" }}>{meta.category}</span>}
                        <span style={{ fontSize: 11, color: level > 0 ? "#fde68a" : "#6b7280", padding: "2px 8px", borderRadius: 999, border: "1px solid #374151" }}>Nivel {level}</span>}
                      </div>
                      <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.5 }}>{meta.summary || "Resumen pendiente de verificar en manual oficial."}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => updateSkillLevel(skillName, -1)}
                        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #374151", background: "transparent", color: "#d4b896", cursor: "pointer" }}>-</button>
                      <div style={{ minWidth: 26, textAlign: "center", color: "#d4b896", fontWeight: 700 }}>{level}</div>
                      <button onClick={() => updateSkillLevel(skillName, 1)} disabled={freeXP <= 0}
                        style={{ width: 32, height: 32, borderRadius: 8, border: freeXP > 0 ? "1px solid #166534" : "1px solid #374151",
                          background: freeXP > 0 ? "#16653422" : "transparent", color: freeXP > 0 ? "#bbf7d0" : "#4b5563", cursor: freeXP > 0 ? "pointer" : "default" }}>+</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Collapsible>
      )}

      {learnedSkills.length > 0 && (
        <Collapsible title="Habilidades Aprendidas" icon="✨">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {learnedSkills.map((skill, index) => (
              <div key={skill.name + "_" + index} style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 10 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ color: "#d4b896", fontSize: 14, fontWeight: 700 }}>{skill.name}</span>
                  <span style={{ fontSize: 11, color: "#9ca3af", padding: "2px 8px", borderRadius: 999, border: "1px solid #374151" }}>{skill.source}</span>
                  <span style={{ fontSize: 11, color: "#fde68a", padding: "2px 8px", borderRadius: 999, border: "1px solid #374151" }}>Nivel {skill.level}</span>
                </div>
                <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.5 }}>{skill.summary}</div>
              </div>
            ))}
          </div>
        </Collapsible>
      )}

      {isMagicalClass && <SpellbookEditor adv={normalized} onUpdate={onUpdate}/>}

      <InventoryEditor adv={normalized} onUpdate={onUpdate}/>

      <Collapsible title="Estadisticas" icon="ðŸ“Š">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          {[
            { label: "Experiencia", field: "experiencia" },
            { label: "Rango", field: "rango" },
          ].map(({ label, field }) => (
            <div key={field} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#0f172a", borderRadius: 8, padding: "8px 10px" }}>
              <span style={{ color: "#9ca3af", fontSize: 12 }}>{label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => update(field, Math.max(field === "rango" ? 1 : 0, normalized[field] - 1))}
                  style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #374151",
                    background: "transparent", color: "#d4b896", fontSize: 16, cursor: "pointer" }}>-</button>
                <span style={{ color: "#d4b896", fontSize: 16, fontWeight: 700, width: 24, textAlign: "center" }}>{normalized[field]}</span>
                <button onClick={() => update(field, normalized[field] + 1)}
                  style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #374151",
                    background: "transparent", color: "#d4b896", fontSize: 16, cursor: "pointer" }}>+</button>
              </div>
            </div>
          ))}
        </div>
      </Collapsible>

      <button onClick={onBack}
        style={{ width: "100%", padding: 12, marginTop: 12, borderRadius: 8, border: "2px solid #166534",
          background: "#16653422", color: "#bbf7d0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
        Confirmar aventurero
      </button>

      <button onClick={onRemove}
        style={{ width: "100%", padding: 12, marginTop: 12, borderRadius: 8, border: "1px solid #7f1d1d",
          background: "#7f1d1d22", color: "#fca5a5", fontSize: 13, cursor: "pointer" }}>
        Retirar del grupo
      </button>
    </div>
  );
}

function InventoryModal({ adv, missionState, onUpdateMission, onClose }) {
  const items = normalizeAdventurer(adv).inventario || [];

  const markFirstMagicUse = () => {
    if (!missionState || missionState.magia_usada_esta_ronda) return;
    onUpdateMission({ ...missionState, magia_usada_esta_ronda: true, amenaza_nivel: missionState.amenaza_nivel + 1 });
  };

  return (
    <ModalSheet title="Items" subtitle={adv.nombre + " · " + items.length + " registrados"} onClose={onClose}>
      {items.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 12 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                <span style={{ color: "#d4b896", fontSize: 14, fontWeight: 700 }}>{item.name}</span>
                {item.equipped && <span style={{ fontSize: 11, color: "#bbf7d0", padding: "2px 8px", borderRadius: 999, border: "1px solid #166534" }}>Equipado</span>}
                {item.magic && <span style={{ fontSize: 11, color: "#bfdbfe", padding: "2px 8px", borderRadius: 999, border: "1px solid #1d4ed8" }}>Magico</span>}
                {item.meleeDice > 0 && <span style={{ fontSize: 11, color: "#fde68a", padding: "2px 8px", borderRadius: 999, border: "1px solid #92400e" }}>Melee +{item.meleeDice}</span>}
                {item.rangedDice > 0 && <span style={{ fontSize: 11, color: "#fca5a5", padding: "2px 8px", borderRadius: 999, border: "1px solid #7f1d1d" }}>Dist +{item.rangedDice}</span>}
                {item.shield > 0 && <span style={{ fontSize: 11, color: "#93c5fd", padding: "2px 8px", borderRadius: 999, border: "1px solid #1d4ed8" }}>Escudo {item.shield}</span>}
                {item.armor > 0 && <span style={{ fontSize: 11, color: "#cbd5e1", padding: "2px 8px", borderRadius: 999, border: "1px solid #475569" }}>Prot {item.armor}</span>}
              </div>
              {item.summary && <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.5, marginBottom: item.magic ? 8 : 0 }}>{item.summary}</div>}
              {item.magic && !missionState?.magia_usada_esta_ronda && (
                <button onClick={markFirstMagicUse}
                  style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #3b82f6", background: "#3b82f622", color: "#dbeafe", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                  Marcar primer uso magico (+1 Amenaza)
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: "#6b7280", fontSize: 13 }}>Este aventurero todavia no tiene items registrados.</div>
      )}
    </ModalSheet>
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
function AdventurersScreen({ adventurers, campaign, onUpdate, onAdd, onRemove, onDone }) {
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(adventurers.length === 0);

  useEffect(() => {
    if (adventurers.length === 0) setShowAdd(true);
  }, [adventurers.length]);

  if (selected) {
    const adv = adventurers.find(a => a.id === selected);
    if (!adv) { setSelected(null); return null; }
    return (
      <AdventurerSheetV2 adv={adv}
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
      {adventurers.length === 0 && (
        <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", marginBottom: 12 }}>
          <div style={{ color: "#d4b896", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Arma tu grupo inicial</div>
          <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.5 }}>
            Añade aventureros, revisa su ficha y pulsa "Grupo finalizado" cuando termines.
          </div>
        </div>
      )}
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
              <button key={ch.nombre} onClick={() => {
                const created = onAdd(ch);
                setShowAdd(false);
                if (created?.id) setSelected(created.id);
              }}
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

      <button onClick={onDone} disabled={adventurers.length === 0}
        style={{ width: "100%", padding: 14, marginTop: 12, borderRadius: 10,
          border: adventurers.length === 0 ? "1px solid #374151" : "2px solid #b91c1c",
          background: adventurers.length === 0 ? "#111827" : "#b91c1c22",
          color: adventurers.length === 0 ? "#4b5563" : "#fca5a5",
          fontSize: 14, fontWeight: 700, cursor: adventurers.length === 0 ? "not-allowed" : "pointer" }}>
        Grupo finalizado
      </button>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          {[
            { label: "Experiencia", field: "experiencia" },
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

      <button onClick={onBack}
        style={{ width: "100%", padding: 12, marginTop: 12, borderRadius: 8, border: "2px solid #166534",
          background: "#16653422", color: "#bbf7d0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
        Confirmar aventurero
      </button>

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

function MainBoardV2({ missionState, adventurers, campaign, onUpdateMission, onUpdateAdventurer, onEndMission, onBack }) {
  const mission = MISSIONS[missionState.mision_id];
  const mName = mission?.nombre || missionState.mision_id;
  const [activeAbilityAdv, setActiveAbilityAdv] = useState(null);
  const [activeItemAdv, setActiveItemAdv] = useState(null);

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

  const selectedAbilityAdv = adventurers.find(a => a.id === activeAbilityAdv) || null;
  const selectedItemAdv = adventurers.find(a => a.id === activeItemAdv) || null;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 0, fontSize: 13 }}>â† Hub</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#b91c1c", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>MisiÃ³n {missionState.mision_id}</div>
          <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700 }}>{mName}</div>
        </div>
        <div style={{ background: "#1a1a2e", borderRadius: 8, padding: "4px 12px", border: "1px solid #2d2d44" }}>
          <div style={{ color: "#6b7280", fontSize: 9, textTransform: "uppercase" }}>Ronda</div>
          <div style={{ color: "#d4b896", fontSize: 22, fontWeight: 800, textAlign: "center" }}>{missionState.ronda}</div>
        </div>
      </div>

      <ThreatTracker level={missionState.amenaza_nivel} cara={missionState.amenaza_cara} onLevelChange={handleThreatChange}/>

      <button onClick={toggleMagic}
        style={{ width: "100%", padding: 10, borderRadius: 8, marginTop: 8, marginBottom: 12,
          border: missionState.magia_usada_esta_ronda ? "2px solid #3b82f6" : "1px solid #374151",
          background: missionState.magia_usada_esta_ronda ? "#3b82f622" : "#1a1a2e",
          color: missionState.magia_usada_esta_ronda ? "#60a5fa" : "#6b7280",
          fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
        âœ¦ {missionState.magia_usada_esta_ronda ? "Magia usada esta ronda (+1 Amenaza)" : "Â¿Se usÃ³ magia esta ronda?"}
      </button>

      <div style={{ marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase",
          letterSpacing: 2, marginBottom: 8 }}>Fases del turno</div>
        <PhaseChecklist phases={TURN_PHASES}
          completedPhases={missionState.fases_completadas || {}}
          completedSteps={missionState.steps_completados || {}}
          onTogglePhase={() => {}}
          onToggleStep={toggleStep}/>
      </div>

      <button onClick={advanceRound}
        style={{ width: "100%", padding: 14, borderRadius: 10, border: "2px solid #eab308",
          background: "#eab30815", color: "#eab308", fontSize: 15, fontWeight: 700,
          cursor: "pointer", marginBottom: 12 }}>
        â–¶ Avanzar a Ronda {missionState.ronda + 1}
      </button>

      <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase",
        letterSpacing: 2, marginBottom: 8 }}>Aventureros</div>
      {adventurers.map(a => {
        const normalized = normalizeAdventurer(a);
        const equipment = getEquipmentStats(normalized);
        const equipped = summarizeEquippedItems(normalized);
        return (
          <div key={a.id} style={{ background: "#1a1a2e", borderRadius: 10, padding: 12,
            border: "1px solid #2d2d44", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <span style={{ color: "#d4b896", fontSize: 14, fontWeight: 700 }}>{normalized.nombre}</span>
                <span style={{ color: "#6b7280", fontSize: 12, marginLeft: 8 }}>{normalized.clase || normalized.especie}</span>
              </div>
              {normalized.status_effects.length > 0 && (
                <div style={{ display: "flex", gap: 2 }}>
                  {[...new Set(normalized.status_effects)].map(se => {
                    const status = STATUS_EFFECTS.find(x => x.id === se);
                    return status ? <span key={se} title={status.name} style={{ fontSize: 14 }}>{status.icon}</span> : null;
                  })}
                </div>
              )}
            </div>

            <PegBar label="HP" icon="â™¥" current={normalized.salud_actual} max={normalized.salud_max}
              color="#22c55e" onChange={v => onUpdateAdventurer({ ...normalized, salud_actual: v })}/>
            <PegBar label="MP" icon="âœ¦" current={normalized.magia_actual} max={normalized.magia_max}
              color="#3b82f6" onChange={v => onUpdateAdventurer({ ...normalized, magia_actual: v })}/>
            <PegBar label="SP" icon="â—†" current={normalized.habilidad_actual} max={normalized.habilidad_max}
              color="#eab308" onChange={v => onUpdateAdventurer({ ...normalized, habilidad_actual: v })}/>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {equipment.meleeDice > 0 && <span style={{ fontSize: 11, color: "#fde68a", padding: "2px 8px", borderRadius: 999, border: "1px solid #92400e" }}>Melee +{equipment.meleeDice}</span>}
              {equipment.rangedDice > 0 && <span style={{ fontSize: 11, color: "#fca5a5", padding: "2px 8px", borderRadius: 999, border: "1px solid #7f1d1d" }}>Dist +{equipment.rangedDice}</span>}
              {equipment.shield > 0 && <span style={{ fontSize: 11, color: "#bfdbfe", padding: "2px 8px", borderRadius: 999, border: "1px solid #1d4ed8" }}>Escudo {equipment.shield}</span>}
              {equipment.armor > 0 && <span style={{ fontSize: 11, color: "#cbd5e1", padding: "2px 8px", borderRadius: 999, border: "1px solid #475569" }}>Prot +{equipment.armor}</span>}
              {getKnownSpells(normalized).length > 0 && <span style={{ fontSize: 11, color: "#c4b5fd", padding: "2px 8px", borderRadius: 999, border: "1px solid #4338ca" }}>{getKnownSpells(normalized).length} hechizos</span>}
            </div>

            {equipped.length > 0 && (
              <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.4, marginBottom: 8 }}>
                Equipo: {equipped.map(item => item.name).join(", ")}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button onClick={() => setActiveAbilityAdv(normalized.id)}
                style={{ padding: 12, borderRadius: 8, border: "1px solid #2d2d44", background: "#0f172a", color: "#d4b896", fontSize: 12, cursor: "pointer" }}>
                Habilidades
              </button>
              <button onClick={() => setActiveItemAdv(normalized.id)}
                style={{ padding: 12, borderRadius: 8, border: "1px solid #2d2d44", background: "#0f172a", color: "#d4b896", fontSize: 12, cursor: "pointer" }}>
                Items
              </button>
            </div>
          </div>
        );
      })}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
        {mission?.reglas_especiales?.length > 0 && (
          <button onClick={() => {}}
            style={{ padding: 12, borderRadius: 8, border: "1px solid #2d2d44", background: "#1a1a2e",
              color: "#d4b896", fontSize: 12, cursor: "pointer" }}>ðŸ“‹ Reglas Especiales</button>
        )}
        <button onClick={() => window.open("https://xinix.github.io/maladum/", "_blank")}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #2d2d44", background: "#1a1a2e",
            color: "#d4b896", fontSize: 12, cursor: "pointer" }}>ðŸ“¦ Items DB</button>
        <button onClick={onEndMission}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #7f1d1d", background: "#7f1d1d22",
            color: "#fca5a5", fontSize: 12, cursor: "pointer", gridColumn: "1 / -1" }}>âœ… Fin de MisiÃ³n</button>
      </div>

      {selectedAbilityAdv && (
        <CombatAbilitiesModal
          adv={selectedAbilityAdv}
          missionState={missionState}
          onUpdateMission={onUpdateMission}
          onClose={() => setActiveAbilityAdv(null)}
        />
      )}

      {selectedItemAdv && (
        <InventoryModal
          adv={selectedItemAdv}
          missionState={missionState}
          onUpdateMission={onUpdateMission}
          onClose={() => setActiveItemAdv(null)}
        />
      )}
    </div>
  );
}

AdventurerSheetV2 = function AdventurerSheetV2Patched({ adv, onUpdate, onBack, onRemove }) {
  const normalized = normalizeAdventurer(adv);
  const update = (field, value) => onUpdate(normalizeAdventurer({ ...normalized, [field]: value }));
  const learnedSkills = getLearnedSkills(normalized);
  const spentXP = getSpentXP(normalized);
  const freeXP = getRemainingXP(normalized);
  const isMagicalClass = !!CLASS_DATA[normalized.clase]?.spell;
  const [activeSkillInfo, setActiveSkillInfo] = useState(null);

  const updateSkillLevel = (skillName, delta) => {
    const current = Number(normalized.clase_habilidades?.[skillName]) || 0;
    const next = Math.max(0, current + delta);
    if (delta > 0 && freeXP <= 0) return;
    onUpdate(normalizeAdventurer({
      ...normalized,
      clase_habilidades: {
        ...normalized.clase_habilidades,
        [skillName]: next,
      },
    }));
  };

  const toggleSkillInfo = (name, summary, source) => {
    setActiveSkillInfo(prev => prev?.name === name ? null : { name, summary, source });
  };

  return (
    <div style={{ padding: 16 }}>
      <button onClick={onBack}
        style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 13,
          cursor: "pointer", marginBottom: 12, padding: 0 }}>Volver al grupo</button>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#d4b896", fontSize: 22, fontWeight: 800, margin: 0 }}>{normalized.nombre}</h2>
        <div style={{ color: "#6b7280", fontSize: 13 }}>{normalized.especie} | {normalized.coste} G</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Clase</div>
        <select value={normalized.clase} onChange={e => onUpdate(updateAdventurerClass(normalized, e.target.value))}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151",
            background: "#0f172a", color: "#d4b896", fontSize: 14 }}>
          <option value="">-- Sin clase --</option>
          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 14, border: "1px solid #2d2d44", marginBottom: 12 }}>
        <PegBar label="Salud" icon="HP" current={normalized.salud_actual} max={normalized.salud_max}
          color="#22c55e" onChange={v => update("salud_actual", v)}/>
        <PegBar label="Habilidad" icon="SP" current={normalized.habilidad_actual} max={normalized.habilidad_max}
          color="#d946ef" onChange={v => update("habilidad_actual", v)}/>
        <PegBar label="Magia" icon="MP" current={normalized.magia_actual} max={normalized.magia_max}
          color="#3b82f6" onChange={v => update("magia_actual", v)}/>
      </div>

      <Collapsible title="Estados" icon="EST" defaultOpen={normalized.status_effects.length > 0}>
        <StatusEffects effects={normalized.status_effects} onChange={v => update("status_effects", v)}/>
      </Collapsible>

      <Collapsible title="Estadisticas" icon="ST">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          {[
            { label: "Experiencia", field: "experiencia" },
          ].map(({ label, field }) => (
            <div key={field} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#0f172a", borderRadius: 8, padding: "8px 10px" }}>
              <span style={{ color: "#9ca3af", fontSize: 12 }}>{label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => update(field, Math.max(0, normalized[field] - 1))}
                  style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #374151",
                    background: "transparent", color: "#d4b896", fontSize: 16, cursor: "pointer" }}>-</button>
                <span style={{ color: "#d4b896", fontSize: 16, fontWeight: 700, width: 24, textAlign: "center" }}>{normalized[field]}</span>
                <button onClick={() => update(field, normalized[field] + 1)}
                  style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #374151",
                    background: "transparent", color: "#d4b896", fontSize: 16, cursor: "pointer" }}>+</button>
              </div>
            </div>
          ))}
        </div>
      </Collapsible>

      {normalized.innatas.length > 0 && (
        <Collapsible title="Habilidades Innatas" icon="INN">
          <div style={{ color: "#6b7280", fontSize: 11, marginBottom: 8 }}>Toca una habilidad para ver que hace.</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {normalized.innatas.map(h => (
              <button key={h} onClick={() => toggleSkillInfo(h, getSkillEntry(h, 1, "Innata").summary, "Innata")}
                title={getSkillEntry(h, 1, "Innata").summary}
                style={{ padding: "4px 10px", borderRadius: 6, background: activeSkillInfo?.name === h ? "#eab30833" : "#eab30822",
                  border: "1px solid #eab30844", color: "#eab308", fontSize: 12, cursor: "pointer" }}>{h}</button>
            ))}
          </div>
          {activeSkillInfo && normalized.innatas.includes(activeSkillInfo.name) && (
            <div style={{ marginTop: 8, background: "#0f172a", border: "1px solid #2d2d44", borderRadius: 8, padding: 10 }}>
              <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{activeSkillInfo.name}</div>
              <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.5 }}>{activeSkillInfo.summary}</div>
            </div>
          )}
        </Collapsible>
      )}

      {normalized.clase && (
        <Collapsible title="Progresion de Clase" icon="CLS" defaultOpen>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div style={{ background: "#0f172a", borderRadius: 8, padding: 10 }}>
              <div style={{ color: "#6b7280", fontSize: 10, textTransform: "uppercase" }}>PX gastada</div>
              <div style={{ color: "#d4b896", fontSize: 20, fontWeight: 800 }}>{spentXP}</div>
            </div>
            <div style={{ background: "#0f172a", borderRadius: 8, padding: 10 }}>
              <div style={{ color: "#6b7280", fontSize: 10, textTransform: "uppercase" }}>PX libre</div>
              <div style={{ color: freeXP > 0 ? "#22c55e" : "#9ca3af", fontSize: 20, fontWeight: 800 }}>{freeXP}</div>
            </div>
            <div style={{ background: "#0f172a", borderRadius: 8, padding: 10 }}>
              <div style={{ color: "#6b7280", fontSize: 10, textTransform: "uppercase", marginBottom: 6 }}>Rango manual</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                <button onClick={() => update("rango", Math.max(1, (Number(normalized.rango) || 1) - 1))}
                  style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #374151", background: "transparent", color: "#d4b896", cursor: "pointer" }}>-</button>
                <div style={{ color: "#d4b896", fontSize: 20, fontWeight: 800 }}>{Math.max(1, Number(normalized.rango) || 1)}</div>
                <button onClick={() => update("rango", Math.max(1, (Number(normalized.rango) || 1) + 1))}
                  style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #374151", background: "transparent", color: "#d4b896", cursor: "pointer" }}>+</button>
              </div>
            </div>
          </div>
          <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 10 }}>
            Aqui puedes reflejar lo aprendido gastando PX. La app no sube el rango automaticamente por experiencia: ese rango manual lo decides segun la mesa fisica.
          </div>
          <div style={{ color: "#6b7280", fontSize: 11, marginBottom: 10 }}>
            De momento no impongo topes automaticos de avance de clase porque aun nos faltan cartas completas de progreso por validar.
          </div>
          <div style={{ color: "#6b7280", fontSize: 11, marginBottom: 8 }}>En movil puedes tocar el nombre de una habilidad para resaltarla y ver su resumen.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(CLASS_DATA[normalized.clase]?.skills || []).map(skillName => {
              const level = Number(normalized.clase_habilidades?.[skillName]) || 0;
              const meta = SKILL_DATA[skillName] || {};
              const levelDetails = getSkillLevelDetails(skillName);
              const currentDetail = level > 0 ? (levelDetails[Math.min(level, levelDetails.length) - 1] || meta.summary || "Resumen pendiente de verificar en manual oficial.") : (meta.summary || "Resumen pendiente de verificar en manual oficial.");
              return (
                <div key={skillName} style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                        <button onClick={() => toggleSkillInfo(skillName, currentDetail, normalized.clase || "Clase")}
                          title={currentDetail}
                          style={{ color: "#d4b896", fontSize: 14, fontWeight: 700, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>{skillName}</button>
                        {meta.category && <span style={{ fontSize: 11, color: "#9ca3af", padding: "2px 8px", borderRadius: 999, border: "1px solid #374151" }}>{meta.category}</span>}
                        <span style={{ fontSize: 11, color: level > 0 ? "#fde68a" : "#6b7280", padding: "2px 8px", borderRadius: 999, border: "1px solid #374151" }}>Nivel {level}</span>
                      </div>
                      <div style={{ color: activeSkillInfo?.name === skillName ? "#d6e4ff" : "#9ca3af", fontSize: 12, lineHeight: 1.5, marginBottom: 8 }}>{currentDetail}</div>
                      {level > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {Array.from({ length: level }, (_, idx) => idx + 1).map(n => {
                            const text = levelDetails[n - 1] || "Detalle de este nivel pendiente de transcribir del manual.";
                            return (
                              <div key={n} style={{ borderRadius: 8, border: "1px solid #166534", background: "#16653418", padding: 8 }}>
                                <div style={{ color: "#bbf7d0", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                                  Nivel {n} | Disponible
                                </div>
                                <div style={{ color: "#dbeafe", fontSize: 11, lineHeight: 1.5 }}>{text}</div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ borderRadius: 8, border: "1px solid #374151", background: "#111827", padding: 8 }}>
                          <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>
                            Sin niveles comprados todavia. Usa + para reflejar lo aprendido en mesa; aqui se mostrara solo el texto oficial de los niveles que ya tenga esta habilidad.
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => updateSkillLevel(skillName, -1)}
                        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #374151", background: "transparent", color: "#d4b896", cursor: "pointer" }}>-</button>
                      <div style={{ minWidth: 26, textAlign: "center", color: "#d4b896", fontWeight: 700 }}>{level}</div>
                      <button onClick={() => updateSkillLevel(skillName, 1)} disabled={freeXP <= 0}
                        style={{ width: 32, height: 32, borderRadius: 8, border: freeXP > 0 ? "1px solid #166534" : "1px solid #374151",
                          background: freeXP > 0 ? "#16653422" : "transparent", color: freeXP > 0 ? "#bbf7d0" : "#4b5563", cursor: freeXP > 0 ? "pointer" : "default" }}>+</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Collapsible>
      )}

      {learnedSkills.length > 0 && (
        <Collapsible title="Habilidades Aprendidas" icon="HAB">
          <div style={{ color: "#6b7280", fontSize: 11, marginBottom: 8 }}>Puedes tocar una habilidad aprendida para destacar su explicacion.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {learnedSkills.map((skill, index) => (
              <div key={skill.name + "_" + index}
                onClick={() => toggleSkillInfo(skill.name, skill.summary, skill.source)}
                title={skill.summary}
                style={{ background: activeSkillInfo?.name === skill.name ? "#132034" : "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 10, cursor: "pointer" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ color: "#d4b896", fontSize: 14, fontWeight: 700 }}>{skill.name}</span>
                  <span style={{ fontSize: 11, color: "#9ca3af", padding: "2px 8px", borderRadius: 999, border: "1px solid #374151" }}>{skill.source}</span>
                  <span style={{ fontSize: 11, color: "#fde68a", padding: "2px 8px", borderRadius: 999, border: "1px solid #374151" }}>Nivel {skill.level}</span>
                </div>
                <div style={{ color: activeSkillInfo?.name === skill.name ? "#d6e4ff" : "#9ca3af", fontSize: 12, lineHeight: 1.5 }}>{skill.summary}</div>
              </div>
            ))}
          </div>
        </Collapsible>
      )}

      {isMagicalClass && <SpellbookEditor adv={normalized} onUpdate={onUpdate}/>}

      <InventoryEditor adv={normalized} onUpdate={onUpdate}/>

      <button onClick={onBack}
        style={{ width: "100%", padding: 12, marginTop: 12, borderRadius: 8, border: "2px solid #166534",
          background: "#16653422", color: "#bbf7d0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
        Confirmar aventurero
      </button>

      <button onClick={onRemove}
        style={{ width: "100%", padding: 12, marginTop: 12, borderRadius: 8, border: "1px solid #7f1d1d",
          background: "#7f1d1d22", color: "#fca5a5", fontSize: 13, cursor: "pointer" }}>
        Retirar del grupo
      </button>
    </div>
  );
};

MainBoardV2 = function MainBoardV2Patched({ missionState, adventurers, campaign, onUpdateMission, onUpdateAdventurer, onEndMission, onBack }) {
  const mission = MISSIONS[missionState.mision_id];
  const mName = mission?.nombre || missionState.mision_id;
  const [activeAbilityAdv, setActiveAbilityAdv] = useState(null);
  const [activeItemAdv, setActiveItemAdv] = useState(null);

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

  const selectedAbilityAdv = adventurers.find(a => a.id === activeAbilityAdv) || null;
  const selectedItemAdv = adventurers.find(a => a.id === activeItemAdv) || null;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 0, fontSize: 13 }}>Hub</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#b91c1c", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Mision {missionState.mision_id}</div>
          <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700 }}>{mName}</div>
        </div>
        <div style={{ background: "#1a1a2e", borderRadius: 8, padding: "4px 12px", border: "1px solid #2d2d44" }}>
          <div style={{ color: "#6b7280", fontSize: 9, textTransform: "uppercase" }}>Ronda</div>
          <div style={{ color: "#d4b896", fontSize: 22, fontWeight: 800, textAlign: "center" }}>{missionState.ronda}</div>
        </div>
      </div>

      <ThreatTracker level={missionState.amenaza_nivel} cara={missionState.amenaza_cara} onLevelChange={handleThreatChange}/>

      <button onClick={toggleMagic}
        style={{ width: "100%", padding: 10, borderRadius: 8, marginTop: 8, marginBottom: 12,
          border: missionState.magia_usada_esta_ronda ? "2px solid #3b82f6" : "1px solid #374151",
          background: missionState.magia_usada_esta_ronda ? "#3b82f622" : "#1a1a2e",
          color: missionState.magia_usada_esta_ronda ? "#60a5fa" : "#6b7280",
          fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
        {missionState.magia_usada_esta_ronda ? "Magia usada esta ronda (+1 Amenaza)" : "Se uso magia esta ronda?"}
      </button>

      <div style={{ marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase",
          letterSpacing: 2, marginBottom: 8 }}>Fases del turno</div>
        <PhaseChecklist phases={TURN_PHASES}
          completedPhases={missionState.fases_completadas || {}}
          completedSteps={missionState.steps_completados || {}}
          onTogglePhase={() => {}}
          onToggleStep={toggleStep}/>
      </div>

      <button onClick={advanceRound}
        style={{ width: "100%", padding: 14, borderRadius: 10, border: "2px solid #eab308",
          background: "#eab30815", color: "#eab308", fontSize: 15, fontWeight: 700,
          cursor: "pointer", marginBottom: 12 }}>
        Avanzar a Ronda {missionState.ronda + 1}
      </button>

      <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase",
        letterSpacing: 2, marginBottom: 8 }}>Aventureros</div>
      {adventurers.map(a => {
        const normalized = normalizeAdventurer(a);
        const equipment = getEquipmentStats(normalized);
        const equipped = summarizeEquippedItems(normalized);
        return (
          <div key={a.id} style={{ background: "#1a1a2e", borderRadius: 10, padding: 12,
            border: "1px solid #2d2d44", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <span style={{ color: "#d4b896", fontSize: 14, fontWeight: 700 }}>{normalized.nombre}</span>
                <span style={{ color: "#6b7280", fontSize: 12, marginLeft: 8 }}>{normalized.clase || normalized.especie}</span>
              </div>
              {normalized.status_effects.length > 0 && (
                <div style={{ display: "flex", gap: 2 }}>
                  {[...new Set(normalized.status_effects)].map(se => {
                    const status = STATUS_EFFECTS.find(x => x.id === se);
                    return status ? <span key={se} title={status.name} style={{ fontSize: 14 }}>{status.icon}</span> : null;
                  })}
                </div>
              )}
            </div>

            <PegBar label="HP" icon="HP" current={normalized.salud_actual} max={normalized.salud_max}
              color="#22c55e" onChange={v => onUpdateAdventurer({ ...normalized, salud_actual: v })}/>
            <PegBar label="SP" icon="SP" current={normalized.habilidad_actual} max={normalized.habilidad_max}
              color="#d946ef" onChange={v => onUpdateAdventurer({ ...normalized, habilidad_actual: v })}/>
            <PegBar label="MP" icon="MP" current={normalized.magia_actual} max={normalized.magia_max}
              color="#3b82f6" onChange={v => onUpdateAdventurer({ ...normalized, magia_actual: v })}/>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {equipment.meleeDice > 0 && <span style={{ fontSize: 11, color: "#fde68a", padding: "2px 8px", borderRadius: 999, border: "1px solid #92400e" }}>Melee +{equipment.meleeDice}</span>}
              {equipment.rangedDice > 0 && <span style={{ fontSize: 11, color: "#fca5a5", padding: "2px 8px", borderRadius: 999, border: "1px solid #7f1d1d" }}>Dist +{equipment.rangedDice}</span>}
              {equipment.shield > 0 && <span style={{ fontSize: 11, color: "#bfdbfe", padding: "2px 8px", borderRadius: 999, border: "1px solid #1d4ed8" }}>Escudo {equipment.shield}</span>}
              {equipment.armor > 0 && <span style={{ fontSize: 11, color: "#cbd5e1", padding: "2px 8px", borderRadius: 999, border: "1px solid #475569" }}>Prot +{equipment.armor}</span>}
              {getKnownSpells(normalized).length > 0 && <span style={{ fontSize: 11, color: "#c4b5fd", padding: "2px 8px", borderRadius: 999, border: "1px solid #4338ca" }}>{getKnownSpells(normalized).length} hechizos</span>}
            </div>

            {equipped.length > 0 && (
              <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.4, marginBottom: 8 }}>
                Equipo: {equipped.map(item => item.name).join(", ")}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button onClick={() => setActiveAbilityAdv(normalized.id)}
                style={{ padding: 12, borderRadius: 8, border: "1px solid #2d2d44", background: "#0f172a", color: "#d4b896", fontSize: 12, cursor: "pointer" }}>
                Habilidades
              </button>
              <button onClick={() => setActiveItemAdv(normalized.id)}
                style={{ padding: 12, borderRadius: 8, border: "1px solid #2d2d44", background: "#0f172a", color: "#d4b896", fontSize: 12, cursor: "pointer" }}>
                Items
              </button>
            </div>
          </div>
        );
      })}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
        {mission?.reglas_especiales?.length > 0 && (
          <button onClick={() => {}}
            style={{ padding: 12, borderRadius: 8, border: "1px solid #2d2d44", background: "#1a1a2e",
              color: "#d4b896", fontSize: 12, cursor: "pointer" }}>Reglas Especiales</button>
        )}
        <button onClick={() => window.open("https://xinix.github.io/maladum/", "_blank")}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #2d2d44", background: "#1a1a2e",
            color: "#d4b896", fontSize: 12, cursor: "pointer" }}>Items DB</button>
        <button onClick={onEndMission}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #7f1d1d", background: "#7f1d1d22",
            color: "#fca5a5", fontSize: 12, cursor: "pointer", gridColumn: "1 / -1" }}>Fin de Mision</button>
      </div>

      {selectedAbilityAdv && (
        <CombatAbilitiesModal
          adv={selectedAbilityAdv}
          missionState={missionState}
          onUpdateMission={onUpdateMission}
          onClose={() => setActiveAbilityAdv(null)}
        />
      )}

      {selectedItemAdv && (
        <InventoryModal
          adv={selectedItemAdv}
          missionState={missionState}
          onUpdateMission={onUpdateMission}
          onClose={() => setActiveItemAdv(null)}
        />
      )}
    </div>
  );
};

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
          const advs = (await DB.load("adventurers_" + lastCampId) || []).map(normalizeAdventurer);
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
    setSubScreen("adventurers");
    setScreen("campaign");
  };

  const loadCampaign = async (summary) => {
    const c = await DB.load("campaign_" + summary.id);
    if (c) {
      setCampaign(c);
      const advs = (await DB.load("adventurers_" + summary.id) || []).map(normalizeAdventurer);
      setAdventurers(advs);
      const ms = await DB.load("mission_state_" + summary.id);
      setMissionState(ms || null);
      setSubScreen("hub");
      setScreen("campaign");
    }
  };

  const addAdventurer = (charData) => {
    const adv = normalizeAdventurer(defaultAdventurer(campaign.id, charData));
    setAdventurers(prev => [...prev, adv]);
    return adv;
  };

  const updateAdventurer = (updated) => {
    const normalized = normalizeAdventurer(updated);
    setAdventurers(prev => prev.map(a => a.id === normalized.id ? normalized : a));
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
          onUpdate={updateAdventurer} onAdd={addAdventurer} onRemove={removeAdventurer}
          onDone={() => setSubScreen("hub")}/>
      )}

      {screen === "campaign" && subScreen === "mission-setup" && (
        <MissionSetupScreen campaign={campaign}
          onStartMission={startMission}
          onBack={() => setSubScreen("hub")}/>
      )}

      {screen === "campaign" && subScreen === "board" && missionState && (
        <MainBoardV2 missionState={missionState} adventurers={adventurers} campaign={campaign}
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
