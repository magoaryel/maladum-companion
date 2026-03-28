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
    { name: "Disquiet", color: "#22c55e", slots: 6 },
    { name: "Distress", color: "#84cc16", slots: 9 },
    { name: "Dismay", color: "#eab308", slots: 7 },
    { name: "Desperation", color: "#f97316", slots: 6 },
    { name: "Disaster", color: "#ef4444", slots: 6 },
    { name: "Doom", color: "#991b1b", slots: 1 },
  ],
  B: [
    { name: "Disquiet", color: "#22c55e", slots: 3 },
    { name: "Distress", color: "#84cc16", slots: 3 },
    { name: "Dismay", color: "#eab308", slots: 4 },
    { name: "Desperation", color: "#f97316", slots: 4 },
    { name: "Disaster", color: "#ef4444", slots: 5 },
    { name: "Doom", color: "#991b1b", slots: 5 },
  ],
};

const STATUS_EFFECTS = [
  { id: "fatigued", name: "Fatigado", icon: "FAT", color: "#eab308" },
  { id: "poisoned", name: "Envenenado", icon: "VEN", color: "#22c55e" },
  { id: "cursed", name: "Maldito", icon: "MAL", color: "#7c3aed" },
  { id: "burning", name: "Quemando", icon: "FUE", color: "#ef4444" },
  { id: "terrified", name: "Aterrorizado", icon: "TER", color: "#a855f7" },
  { id: "stunned", name: "Aturdido", icon: "ATU", color: "#3b82f6" },
  { id: "wounded", name: "Herido", icon: "HER", color: "#dc2626" },
  { id: "blessed", name: "Bendito", icon: "BEN", color: "#fbbf24" },
  { id: "corrupted", name: "Corrompido", icon: "COR", color: "#1e1b4b" },
  { id: "prone", name: "Derribado", icon: "DER", color: "#6b7280" },
];

const BASE_CHARACTERS = [
  { nombre: "Grogmar", especie: "Ormen", salud_max: 7, habilidad_max: 3, magia_max: 2, acciones: 2, coste: 73, innatas: ["Quick Recovery"] },
  { nombre: "Moranna", especie: "Human", salud_max: 5, habilidad_max: 5, magia_max: 4, acciones: 2, coste: 80, innatas: ["Impervious", "Malacyte Mastery"] },
  { nombre: "Greet", especie: "Grobbler", salud_max: 5, habilidad_max: 5, magia_max: 3, acciones: 3, coste: 75, innatas: ["Barter", "Tricks of the Trade"] },
  { nombre: "Syrio", especie: "Eld", salud_max: 6, habilidad_max: 4, magia_max: 3, acciones: 2, coste: 64, innatas: ["Reflexes"] },
  { nombre: "Callan", especie: "Human", salud_max: 5, habilidad_max: 4, magia_max: 3, acciones: 2, coste: 54, innatas: ["Frenzy"] },
  { nombre: "Nerinda", especie: "Human", salud_max: 5, habilidad_max: 4, magia_max: 2, acciones: 2, coste: 80, innatas: ["Weapons Master 1"] },
  { nombre: "Unger", especie: "Tregar", salud_max: 4, habilidad_max: 3, magia_max: 1, acciones: 2, coste: 73, innatas: ["Persuasion", "Detect"] },
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
let craftingCatalogCache = null;
let craftingCatalogPromise = null;

const SKILL_DATA = {
  "Acrobatics": { category: "Agilidad", tags: ["move","reaction","defense"], summary: "Movimiento acrobatico, defensa reactiva y salida agresiva del combate." },
  "Ambush": { category: "Sigilo", tags: ["ranged","reaction"], summary: "Emboscadas desde cobertura con ataques y movimientos de reaccion." },
  "Barter": { category: "Apoyo", tags: ["market"], summary: "Mejora compras, ventas y costes durante la fase de Mercado." },
  "Bombast": { category: "Ciudadano", tags: ["support","renown","rest"], summary: "Convierte carisma en Renombre extra, ahorro de Renombre y ayuda en el descanso." },
  "Brutal Assault": { category: "Melee", tags: ["melee"], summary: "Golpes brutales que tiran al enemigo, lanzan objetivos o encadenan ataques." },
  "Bullseye": { category: "Distancia", tags: ["ranged"], summary: "Ataques a distancia precisos que ignoran parte de la cobertura y armadura." },
  "Camouflage": { category: "Sigilo", tags: ["move","reaction"], summary: "Ocultarse en terreno o cobertura para evitar ser objetivo y disparar desde las sombras." },
  "Combat Arts": { category: "Agilidad", tags: ["melee"], summary: "Barridos, ataques rapidos y reacciones de posicionamiento contra enemigos trabados." },
  "Counter Shot": { category: "Distancia", tags: ["ranged","reaction","magic"], summary: "Contraataques a distancia o con hechizos fuera del turno propio." },
  "Detect": { category: "Innata", tags: ["utility","search"], summary: "Mejora la busqueda: roba objetos extra, resuelve trampas al momento y en su forma avanzada mira dentro del terreno buscable." },
  "Disarm": { category: "Melee", tags: ["melee","reaction"], summary: "Quita armas al rival y puede convertir la defensa en robo o represalia." },
  "Distraction": { category: "Astucia", tags: ["control"], summary: "Fatiga, reposiciona y desorganiza al objetivo para abrir huecos tacticos." },
  "Duck for Cover": { category: "Sigilo", tags: ["reaction","defense"], summary: "Moverse a cobertura para negar o reducir ataques a distancia." },
  "Entertainer": { category: "Ciudadano", tags: ["rest","support","magic"], summary: "Refuerza descansos con Bendicion y acaba permitiendo gastar Magia como si fuera Habilidad." },
  "Fleet of Foot": { category: "Agilidad", tags: ["move"], summary: "Velocidad directa: mover mejor, ganar Rapido y atravesar zonas de amenaza." },
  "Fortified Mind": { category: "Magia", tags: ["magic","defense","reaction"], summary: "Resistencia mental y apoyo defensivo con armadura magica y autoresistencia." },
  "Frenzy": { category: "Melee", tags: ["melee"], summary: "Antes de atacar en melee, anade dados al ataque y en alto nivel desata ataques demoledores." },
  "Hard to Hit": { category: "Sigilo", tags: ["defense"], summary: "Hace muy dificil ser impactado, sobre todo a distancia o tras moverse bien." },
  "Herbalism": { category: "Ciudadano", tags: ["rest","craft"], summary: "Mejora hierbas, pociones y fabricacion improvisada durante la mision." },
  "Impervious": { category: "Resistencia", tags: ["defense","status","reaction"], summary: "Resiste estados, gana aguante extra y puede ignorar una ronda entera de castigo." },
  "Inspiring": { category: "Apoyo", tags: ["support"], summary: "Quita terror y fatiga, y permite acciones extra al grupo cercano." },
  "Intimidating": { category: "Apoyo", tags: ["control","reaction"], summary: "Controla objetivos enemigos, los aturde o redirige su conducta." },
  "Light Fingers": { category: "Astucia", tags: ["utility","move"], summary: "Robar, saquear o desordenar inventarios enemigos sin quedarte trabado." },
  "Loremaster": { category: "Ciudadano", tags: ["search","market","loot"], summary: "Aumenta hallazgos raros, localizaciones ocultas y resultados ligados a libros y preparacion." },
  "Malacyte Mastery": { category: "Magia", tags: ["magic","spell"], summary: "Permite lanzar hechizos fuera de tu acceso normal y manipular mejor el dado magico." },
  "Natural Remedies": { category: "Supervivencia", tags: ["rest","heal"], summary: "Curacion, limpieza de veneno o heridas y apoyo de descanso." },
  "Night Vision": { category: "Innata", tags: ["utility"], summary: "Ignora todos los efectos de la Oscuridad." },
  "One with Nature": { category: "Supervivencia", tags: ["beast","utility"], summary: "Forrajea y controla bestias errantes o evita que te ataquen." },
  "Onslaught": { category: "Resistencia", tags: ["melee"], summary: "Cadena ataques, remata enemigos y convierte el avance en presion ofensiva." },
  "Persuasion": { category: "Astucia", tags: ["support"], summary: "Refuerza tiradas de Persuasion y permite doblegar objetivos a traves de impactos sociales." },
  "Power Manipulation": { category: "Magia", tags: ["magic","spell"], summary: "Recupera magia, mejora hechizos y descarga objetos canalizados con mas fuerza." },
  "Quick Recovery": { category: "Resistencia", tags: ["heal","status"], summary: "Recupera vida, limpia estados y permite levantarse tras caer." },
  "Ranged Expert": { category: "Distancia", tags: ["ranged"], summary: "Mejora uso de armas a distancia, disparos sin esfuerzo y criticos con dado azul." },
  "Ready for Anything": { category: "Supervivencia", tags: ["reaction","utility"], summary: "Acciones fuera de secuencia y respuestas flexibles en casi cualquier momento." },
  "Reflexes": { category: "Agilidad", tags: ["reaction","defense"], summary: "Reacciones defensivas y movilidad contra ataques, enganches y oportunidades." },
  "Smithing": { category: "Ciudadano", tags: ["market","craft"], summary: "Repara objetos rotos y fabrica armas o armaduras con mejores limites de rareza y recursos segun X." },
  "Steady": { category: "Resistencia", tags: ["defense"], summary: "Aguanta la posicion, resiste control y castiga a quien intenta desplazarte." },
  "Tactical Gift": { category: "Ciudadano", tags: ["support"], summary: "Comparte acciones, reorganiza la escena y hasta compra tiempo frente al Dread." },
  "Tracking": { category: "Supervivencia", tags: ["spawn","move"], summary: "Lee entradas, anticipa llegadas enemigas y suaviza terreno dificil." },
  "Training": { category: "Apoyo", tags: ["support","campaign"], summary: "Duplica acciones utiles en mision y tambien reparte XP en Avance." },
  "Trick Shot": { category: "Distancia", tags: ["ranged"], summary: "Disparos especiales con rerolls, desarmes a distancia y division de impactos." },
  "Tricks of the Trade": { category: "Astucia", tags: ["search","trap"], summary: "Abrir o cerrar, buscar mejor y anular trampas al vuelo." },
  "Unlikely Hero": { category: "Ciudadano", tags: ["campaign","utility"], summary: "Talento comodin para modificar fases de campana, upkeep y eventos." },
  "Weapons Master": { category: "Melee", tags: ["melee","defense"], summary: "Dominio tecnico del arma: relanzar, herir y combinar armas o escudo con precision." },
};

const SKILL_ALIASES = {
  nature: "One with Nature",
};

const SKILL_LEVEL_DATA = {
  "Acrobatics": [
    "Haz una accion de Movimiento usando Trepar 2/3. Pasiva: puedes Levantarte como accion sin esfuerzo.",
    "Reaccion: cuando eres objetivo de un ataque, tira 3 dados de combate. Cada impacto anula 1 impacto enemigo; si no queda ningun impacto, ignoras tambien todos los demas efectos del ataque. Pasiva: tratas Terreno Dificil 1 como un valor mas bajo.",
    "Sales del combate. Cada enemigo enfrentado contigo puede ser empujado hasta 2 casillas en la direccion que elijas, deteniendose si golpea pared u obstaculo. No hay ataques de oportunidad; cada enemigo desplazado sufre un ataque de 2 dados. Luego haces un Movimiento.",
  ],
  "Bombast": [
    "Fase de Descanso: despues de cualquier resultado de Noche de Juerga, ganas X de Renombre adicional. Pasiva: cuando fueras a gastar Renombre, este personaje puede gastar sus clavijas de Habilidad en su lugar siguiendo las restricciones normales del uso de skills.",
    "Reaccion: usala cuando tu grupo gane Renombre. Ganais 1 Renombre adicional.",
    "Quita 1 contador de Fatiga a otro personaje a corto alcance. Fase de Descanso: suma hasta 2 a cualquier tirada de Posada sin gastar Renombre.",
  ],
  "Brutal Assault": [
    "Haz un Ataque Melee usando solo Combate sin Armas con 1 dado extra. Si el objetivo sobrevive, queda Derribado.",
    "Elige un personaje enfrentado contigo que no sea mas grande que tu y muevelo a cualquier casilla a corto alcance y con LoS. No sufre ataques de oportunidad por ese movimiento. Sufre un ataque igual a tu Combate sin Armas +1, con 1 dado extra si una pared u otra pieza de terreno impidio lanzarlo del todo. Luego queda Derribado. Si la trayectoria fue bloqueada por un personaje, ese personaje tambien sufre ese ataque. Pasiva: puedes ignorar la regla Aparatoso en armas cuerpo a cuerpo.",
    "Haz hasta 3 acciones de Ataque Melee usando solo Combate sin Armas +1. Si un objetivo sobrevive, Derribalo. Luego haz una accion de Mover.",
  ],
  "Disarm": [
    "Reaccion: tras sufrir un ataque melee sin dano, el arma usada por el atacante se quita de su tablero y queda dispersada.",
    "Reaccion: como nivel 1, pero el arma robada pasa a tu tablero. Si no tienes espacio, debes soltarla o soltar otro objeto.",
    "Reaccion: como nivel 2, y ademas haces inmediatamente un Ataque Melee con el arma robada seguido de un Movimiento sin ataques de oportunidad.",
  ],
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
  "Entertainer": [
    "Usalo al Descansar. Bendice a cada personaje amigo, incluido este, a corto alcance. Puedes aumentar la Amenaza hasta en 2 para Bendecir a cada personaje esa misma cantidad de veces adicionales.",
    "Fase de Descanso: al final de la fase, Bendice a todos los personajes de tu grupo.",
    "Coloca 3 contadores recordatorio en el tablero de este personaje. Mientras sigan ahi, todos los personajes amigos a corto alcance pueden usar sus clavijas de Magia como si fueran clavijas de Habilidad. Retira 1 contador en cada Fase de Evaluacion. Pasiva: este personaje puede usar sus propias clavijas de Magia como si fueran de Habilidad.",
  ],
  "Combat Arts": [
    "Haz un Barrido a los pies de tu enemigo. Un enemigo en contacto queda Derribado. Pasiva: los ataques de este personaje ganan Quickstrike, asi que si obtienen un critico puedes Desplazarte o hacer otro ataque gratis despues de resolver el primero. Si ademas el arma tambien tiene Quickstrike, puedes encadenar Desplazarte y Atacar.",
    "Reaccion: usala cuando un enemigo enfrentado vaya a atacar, y antes de que ataque. Su ataque no tiene ningun efecto. Intercambia posiciones con el enemigo y luego haz un Movimiento sin ataques de oportunidad o una accion de Empujar con +1 dado.",
    "Salta desde un nivel superior, aumentando tu distancia segura en 3. Todos los personajes de tu mismo tamano o menores adyacentes a tu casilla de destino quedan Derribados. Luego realiza un Ataque Melee con dados adicionales iguales a la distancia del salto.",
  ],
  "Fleet of Foot": [
    "Haz una accion de Movimiento.",
    "Pasiva: ganas Rapido 1.",
    "Haz una accion de Movimiento. Esta y todas tus otras acciones de movimiento de este turno ignoran ataques de oportunidad. Haz un ataque de 1 dado contra cada enemigo en contacto durante tus movimientos. Cualquier impacto tambien lo Derriba, aunque no causes dano.",
  ],
  "Camouflage": [
    "Mientras estes en contacto con una pared no puedes ser objetivo el resto de la ronda.",
    "Haz un Movimiento o Ataque a Distancia. Mientras estes en contacto con terreno no puedes ser objetivo el resto de la ronda.",
    "Mientras no estes en contacto con un enemigo no puedes ser objetivo el resto de la ronda. Ademas, durante una ronda en la que estes camuflado puedes hacer un ataque a distancia como reaccion y quedar Fatigado.",
  ],
  "Malacyte Mastery": [
    "Lanza cualquier hechizo de nivel 1, tengas acceso a el o no, gastando una accion o una accion sin esfuerzo de forma normal.",
    "Reaccion: usalo despues de lanzar el Dado Magico para lanzarlo de nuevo y elegir cual de los dos resultados aplicar.",
    "Reaccion: despues de obtener un resultado de Imparable durante tu turno, lanza inmediatamente cualquier hechizo al que tengas acceso con valor de lanzamiento 2, sin gastar clavijas. En lugar de lanzar el Dado Magico, eliges que resultado aplicar a ese hechizo. Luego realizas cualquier accion de forma gratuita. Pasiva: obtienes Regeneracion 1 de Magia y restauras 1 clavija de Magia en la Fase de Evaluacion.",
  ],
  "Power Manipulation": [
    "Reaccion: usalo en cualquier momento. Lanza cualquier hechizo al que tengas acceso.",
    "Pasiva: puedes gastar cualquier cantidad de clavijas de Habilidad al lanzar un hechizo para aumentar su valor de lanzamiento en la cantidad de clavijas gastadas. Esto puede exceder tu rango.",
    "Fuerzas una enorme explosion de energia a traves de uno de tus objetos magicos. Elige un arma con icono Channel o Canalizar y decide cuantas clavijas magicas gastar, minimo 1. Realiza un ataque a distancia a corto alcance usando una cantidad de dados igual a las clavijas gastadas +3. Todos los iconos del arma elegida se aplican al ataque. Los resultados de Sobrecarga Mental del Dado Magico se ignoran sin efecto. Pasiva: cuando usas un elemento con icono Channel o Canalizar, resuelves los efectos como si hubieras gastado 1 clavija adicional.",
  ],
  "Light Fingers": [
    "Reaccion: tras sufrir un ataque melee sin dano, robas cualquier objeto del inventario del atacante salvo el arma usada. Si no tienes espacio, sueltas otro objeto.",
    "Muevete al contacto y haz Carterista o Pickpocket: puedes dispersar un objeto al azar o robar uno del objetivo segun el resultado del dado. Luego haces otro Movimiento sin ataques de oportunidad.",
    "Pasiva: ganas acceso permanente a la accion Carterista o Pickpocket.",
  ],
  "Loremaster": [
    "Usalo al Buscar, en terreno o Busqueda General, para robar X fichas adicionales de la bolsa. Si alguna de esas fichas extra es una Localizacion Oculta o un objeto Raro, puedes elegir una y quedartela ademas de lo encontrado normalmente. Si no, las fichas extra vuelven a la bolsa sin efecto.",
    "Usalo antes de preparar una mision para anadir a la bolsa una ficha aleatoria adicional de objeto raro.",
    "Pasiva, Fase de Mercado: puedes repetir la tirada al resolver un Libro.",
  ],
  "Tricks of the Trade": [
    "Puedes bloquear o desbloquear una puerta o terreno en contacto; o al Buscar ignorar las fichas de trampa robadas.",
    "Reaccion: si una carta o ficha de trampa te apunta a ti o a un aliado cercano con LoS, desactivas el disparador y la descartas sin efecto.",
    "Pasiva: puedes hacer Busqueda General como accion sin esfuerzo. Ademas, al Buscar robas una ficha extra y 1 objeto uncommon aleatorio, sin resolver trampas de esas robadas extra.",
  ],
  "Quick Recovery": [
    "Recupera 1 Salud.",
    "Antes de activarte, elimina Aturdido, Envenenado o Herido.",
    "Reaccion: tras ser derrotado, dejas de estarlo, recuperas 1 Salud y te levantas. Pasiva: al comienzo de tu turno puedes eliminar 1 contador de Fatiga.",
  ],
  "Onslaught": [
    "Reaccion: despues de causar 1 o mas impactos en melee, haces otra accion de Ataque Melee.",
    "Reaccion: despues de causar 1 o mas impactos con cualquier ataque, puedes moverte y luego hacer otra accion de Ataque Melee.",
    "Usa durante un Movimiento: ignoras ataques de oportunidad durante ese Movimiento y haces un ataque melee contra cada enemigo con el que entres en contacto.",
  ],
  "Fortified Mind": [
    "Usa antes de lanzar un hechizo para poder lanzarlo aunque estes trabado en combate.",
    "Reaccion: cuando un aliado a corto alcance sufra un ataque, usa tu armadura magica para negar impactos. Puedes gastar Magia tuya y del objetivo para aumentarla.",
    "Hasta fin de ronda, los hechizos dirigidos a aliados a corto alcance se resisten automaticamente sin gastar clavijas, salvo con Imparable. Los ataques contra aliados a corta distancia pueden anularse usando tu armadura magica y clavijas tuyas y del objetivo para aumentarla. Pasiva: cuando lanzas hechizos de nivel inferior a tu rango, no te Fatigas al sufrir Sobrecarga Mental.",
  ],
  "Frenzy": [
    "Usa antes de hacer un ataque melee: anades 2 dados al ataque.",
    "Usa antes de hacer un ataque melee: anades 3 dados al ataque.",
    "Usa antes de hacer un ataque melee: anades 4 dados. Despues de tirar, puedes repartir los impactos entre varios enemigos dentro del alcance del arma. Cualquier otro efecto, como Contundente, se aplica a todos los enemigos que sufran al menos 1 impacto. Pasiva: ganas First Strike, es decir, al entrar en alcance cuerpo a cuerpo de un enemigo obtienes un Ataque Melee gratuito inmediato.",
  ],
  "Impervious": [
    "Reaccion: usalo siempre que sufras un contador de estado de cualquier tipo. Descarta ese contador sin efecto.",
    "Ganas +2 a tu defensa indicada por la carta hasta el final de la ronda.",
    "Restaura 1 de Salud, incluso por encima de tu valor inicial si tienes espacio en el tablero, y puedes descartar cualquier contador de estado que quieras. Ademas, hasta el final de la ronda ignoras todo el dano, resistes todos los hechizos sin gastar clavijas y descartas todos los contadores de estado sin efecto.",
  ],
  "Weapons Master": [
    "Haz un Ataque Melee con un arma. Puedes volver a lanzar 1 dado. Pasiva: puedes usar Shield Block como accion sin esfuerzo, es decir, levantar el escudo para aplicar su defensa sin gastar accion normal; si lo haces fuera de tu turno, aun quedas Fatigado.",
    "Usalo despues de realizar un ataque melee con un arma. El objetivo queda Herido y Aturdido. Pasiva: puedes realizar un Ataque Melee como accion sin esfuerzo.",
    "Usalo despues de lanzar un ataque melee con un arma. Puedes volver a lanzar para obtener un arma diferente de tu inventario, combinando golpes y efectos; los resultados de calavera se aplican a cada arma por separado. Luego realiza una accion de Derribar con +1 dado o una accion de Movimiento ignorando ataques de oportunidad. Pasiva: al realizar ataques cuerpo a cuerpo, los resultados del dado azul son golpes criticos.",
  ],
  "Bullseye": [
    "Haz un ataque a distancia a corto alcance que no tira dados: hace 1 impacto automatico e ignora cobertura.",
    "Haz un ataque a distancia hasta media distancia con 1 impacto automatico que ignora cobertura y armadura fisica. Pasiva: tus ataques a distancia ignoran cobertura a corto alcance.",
    "Haz un ataque a distancia hasta media distancia con 2 impactos automaticos que ignoran cobertura y armadura fisica. Pasiva: tus ataques a distancia ignoran cobertura a media distancia.",
  ],
  "Counter Shot": [
    "Reaccion: despues de ser objetivo de un ataque a distancia o un hechizo, y antes de resolverlo, haces un ataque a distancia o lanzas un hechizo contra el atacante.",
    "Reaccion: despues de que un enemigo objetivo haga su primera accion de la ronda, haces un ataque a distancia o lanzas un hechizo contra el.",
    "Reaccion: en cualquier momento, haces un ataque a distancia o lanzas un hechizo con 1 dado extra y luego haces un Movimiento.",
  ],
  "Ranged Expert": [
    "Cuando harias un ataque melee puedes usar un arma a distancia en su lugar, usando el perfil de corto alcance y con 1 dado extra. Pasiva: preparar un arma con Preparation puede hacerse como accion sin esfuerzo.",
    "Puedes lanzar cualquier arma melee con 2 dados extra, o lanzar cualquier otro objeto como si fuera un arma tirando 2 dados. Pasiva: puedes hacer un ataque a distancia como accion sin esfuerzo.",
    "Haz un ataque con un arma de tipo Shot: ignora Unreliable y anade Bludgeoning, Sharp y Piercing. Pasiva: en ataques a distancia o lanzados, el dado azul hace critico.",
  ],
  "Trick Shot": [
    "Haz un ataque a distancia y puedes repetir 1 dado.",
    "Disparas un objeto de la mano del enemigo: si logras al menos 1 impacto no haces dano, pero mueves un objeto elegido de su inventario hasta 6 casillas.",
    "Haz un ataque a distancia con 3 dados extra. Despues de tirar, puedes repartir los impactos entre varios objetivos validos dentro del alcance y cerca unos de otros.",
  ],
  "Ambush": [
    "Reaccion: cuando un enemigo termina un movimiento a 4 casillas o menos y estas en cobertura parcial o total, haces un ataque a distancia. Puedes hacer un Dash o Desplazamiento antes o despues.",
    "Reaccion: en la misma situacion, haces un Movimiento y luego un Ataque. Puedes hacer un Dash o Desplazamiento antes o despues de cualquiera de esas acciones.",
    "Reaccion: en la misma situacion, haces Movimiento, un Ataque contra cualquier enemigo y otro Movimiento. Puedes hacer un Dash o Desplazamiento antes o despues de cualquiera de esas acciones.",
  ],
  "Hard to Hit": [
    "Mientras estes en cobertura, no puedes ser afectado por ataques a distancia hasta final de ronda, aunque si puedes ser objetivo.",
    "Mientras estes en cobertura o a mas de corto alcance, no puedes ser afectado por ataques a distancia hasta final de ronda.",
    "Haz un Movimiento ignorando ataques de oportunidad. Hasta final de ronda no puedes ser afectado por ataques a distancia enemigos, aunque si pueden elegirte como objetivo.",
  ],
  "Inspiring": [
    "Quita 1 contador de Aterrorizado a un aliado a corto alcance.",
    "Reaccion: al derrotar un enemigo, los demas aliados a corto alcance pueden quitarse Aterrorizado o hacer 1 accion.",
    "Pasiva: cualquier aliado que empiece turno a corto alcance y con LoS quita 1 Aterrorizado antes de activarse. Ademas, puedes limpiar todo Terror y Fatiga del grupo cercano y cada uno hace 1 accion.",
  ],
  "Intimidating": [
    "Reaccion: cuando un enemigo con LoS se activa, eliges su objetivo de la ronda entre los personajes validos que vea.",
    "Reaccion: cuando un enemigo entra en LoS o empieza turno en LoS, su turno termina inmediatamente y queda Aturdido.",
    "Todos los enemigos de rango igual o menor al tuyo a corto alcance y con LoS quedan Aturdidos y Aterrorizados. Pasiva: ganas Terrifying o Terrorifico, asi que tus criticos pueden Aterrorizar y los enemigos cercanos pueden acabar Aterrorizados segun esa regla.",
  ],
  "Training": [
    "Despues de hacer una accion, otro aventurero del grupo a corto alcance y con LoS hace gratis la misma accion si puede.",
    "Fase de Avance: da 1 PX a otro aventurero del grupo. Esa PX solo puede ir a Agilidad, Resistencia, Melee, Distancia o Sigilo. El alumno no puede superar tu limite de rango X.",
    "Fase de Avance: da 1 PX a dos aventureros. Uno puede ser de cualquier rango; el otro no puede superar tu limite de rango X.",
  ],
  "Natural Remedies": [
    "Al descansar, tu y los aliados que tambien descansen recuperais 1 Salud extra y 1 Magia extra.",
    "Tu o un aliado en contacto elimina Herido o Envenenado y recupera 1 Salud.",
    "Tu y todos los aliados en contacto quedais Benditos y podeis hacer 1 accion adicional esta ronda.",
  ],
  "One with Nature": [
    "Durante una Busqueda General forrajeas y robas recursos extra segun el Dado Magico. Pasiva: en Descanso en la Naturaleza puedes hacer esa tirada una vez por personaje con esta skill.",
    "Al inicio de tu turno, eliges una bestia errante no Mitica a media distancia y con LoS; puedes usar tus acciones de este turno para controlarla.",
    "Eliges una bestia errante no Mitica aleatoria de rango 1-3; entra por el punto que elijas y la controlas el resto de la partida. Pasiva: las bestias errantes no Miticas nunca te eligen como objetivo.",
  ],
  "Ready for Anything": [
    "Reaccion: en cualquier momento, haces 1 accion.",
    "Pasiva: una vez por ronda, en cualquier momento, haces 1 accion y luego quedas Fatigado.",
    "Reaccion: en cualquier momento, incluso en mitad del movimiento enemigo, puedes hacer hasta 2 acciones y 1 accion sin esfuerzo.",
  ],
  "Tracking": [
    "Mira las 3 primeras cartas del mazo de Eventos.",
    "Segun la Amenaza actual, tiras la llegada de todos los PNJ de esta ronda y los colocas junto a sus Puntos de Entrada; luego puedes mover los de un Punto de Entrada a otro. Pasiva: si el Punto de Reagrupamiento se intercambia al azar, tiras dos veces el Dado Magico y eliges.",
    "Reaccion: antes o despues de que un enemigo entre en LoS o en mesa, este personaje hace un turno gratis inmediato y todos los aliados cercanos hacen 1 accion; las acciones contra ese enemigo ganan 1 dado extra. Pasiva: tratas Terreno Dificil 2 como dos valores mas bajo.",
  ],
  "Reflexes": [
    "Reaccion: cuando un enemigo te engancha, haces un Movimiento ignorando ataques de oportunidad. Pasiva: ignoras 1 impacto en cualquier ataque de oportunidad que recibas.",
    "Reaccion: cuando un enemigo te engancha, haces un Movimiento ignorando ataques de oportunidad y un Ataque, en cualquier orden. Pasiva: puedes usar Parry tambien contra ataques a distancia, o sea tirar tu dado de Parada para anular impactos aunque el ataque no sea cuerpo a cuerpo.",
    "Reaccion: cuando un enemigo te engancha, el atacante queda Aturdido; luego haces dos Movimientos ignorando ataques de oportunidad y un Ataque, en cualquier orden. Pasiva: puedes ignorar un ataque de oportunidad usando una accion sin esfuerzo.",
  ],
  "Steady": [
    "Hasta el final de la ronda no puedes quedar Aturdido, Derribado ni Empujado.",
    "No puedes moverte este turno, pero ganas 1 dado extra en todos tus ataques y Empujes hasta el final de la ronda. Pasiva: puedes ignorar la regla Aparatoso en cualquier turno en el que te muevas.",
    "Hasta el final de la ronda no puedes quedar Fatigado, Aturdido, Empujado ni Derribado. Los enemigos no pueden salir del contacto contigo salvo que tu lo permitas. Despues de cualquier ataque cuerpo a cuerpo contra ti, puedes hacer una accion gratuita de Empujar al atacante. Si un enemigo se mueve dentro de 2 casillas, puedes hacer un desplazamiento gratuito para enfrentarlo y convertirte en su objetivo si aun no lo eres.",
  ],
  "Herbalism": [
    "Reaccion: cuando un aliado cercano haga un ataque, puedes anadir Poison o Veneno; si ya tenia Poison, anades Vicious o haces que los resultados indicados del dado azul cuenten como criticos.",
    "Pasiva: puedes aplicar Herbs, Fungus o Minerals como accion normal en vez de solo durante Descanso.",
    "Durante una mision puedes fabricar una pocion gastando 2 acciones en la misma ronda como si usaras el Artisan's Guild; en Mercado haces lo mismo gratis.",
  ],
  "Smithing": [
    "Durante una mision, gastas 1 accion para reparar un objeto roto gratis como si estuvieras en el gremio. Con X determinas que rarezas puedes reparar. En Mercado haces lo mismo gratis.",
    "Durante una mision, gastas 2 acciones en la misma ronda para fabricar un arma o armadura gratis como en el gremio, con limite de recursos segun X. En Mercado haces lo mismo gratis.",
    "La maestria del oficio sigue escalando con X. Este nivel aun necesita una referencia visual mas limpia antes de fijar su texto exacto en la app.",
  ],
  "Tactical Gift": [
    "Gasta 1 accion para crear una Barricada en una casilla adyacente.",
    "Reaccion de trabajo en equipo: cuando este personaje o un aliado cercano hace un ataque, por cada aliado en contacto con el atacante o el objetivo puedes anadir 1 dado o Vicious, es decir, que los resultados indicados del dado azul cuenten como criticos, hasta el maximo X.",
    "Reaccion: tras robar una Carta de Evento o tras tirar llegadas en un Punto de Entrada con LoS, este personaje y los aliados cercanos hacen 1 accion gratis y pueden fatigarse para una segunda; luego se reanuda la resolucion. Pasiva: entre acciones de un aliado, otro no activado puede fatigarse para hacer 1 accion si ambos estan cerca de esta skill.",
  ],
  "Unlikely Hero": [
    "En una sala sin enemigos puedes cerrar puertas, voltear Puntos de Entrada cercanos, recolocar personajes y convertir clavijas de la Amenaza en verdes temporales.",
    "En fases de campana puedes gastar hasta X clavijas para modificar Dado por Muerto, dar 1 PX a un aventurero, ignorar Mantenimiento o repetir resultados de posada o naturaleza.",
    "Pasiva: no te eligen como objetivo salvo que seas el unico en LoS, y puedes gastar el Renombre del grupo como si fueran clavijas de Habilidad. Reaccion: tras una tirada de ataque a favor o en contra, si atacas haces +1 dano y el resultado cuenta como critico; si te atacan ignoras todo y Aturdes al atacante. Luego robas y resuelves una Carta de Evento.",
  ],
};

const ATTRIBUTE_DATA = {
  melee: { label: "Melee", summary: "Puede usarse como arma de cuerpo a cuerpo." },
  bludgeoning: { label: "Bludgeoning", summary: "Contundente: si el ataque obtiene un critico, el objetivo queda Fatigado aunque no reciba dano; ademas puede anadir fatiga extra o dados contra terreno segun el efecto." },
  balanced: { label: "Balanced", summary: "Equilibrada: esta arma lanza 1 dado extra cuando se lanza." },
  quickstrike: { label: "Quickstrike", summary: "Ataque Rapido: si esta arma obtiene un golpe critico durante un ataque cuerpo a cuerpo, despues de resolver ese ataque puedes Desplazarte o realizar otro ataque gratis con esta u otra arma." },
  first_strike: { label: "First Strike", summary: "Danar Primero: cuando este personaje entra dentro del alcance cuerpo a cuerpo de un enemigo, incluso al aparecer o al abrirse una puerta, obtiene una accion de Ataque Melee gratuita e inmediata." },
  parry: { label: "Parry", summary: "Parada: cuando el usuario de este objeto es objetivo de un ataque cuerpo a cuerpo, puedes tirar 1 dado de combate. Cada impacto anula 1 impacto enemigo como si fuera armadura fisica. Luego quedas Fatigado." },
  reach: { label: "Reach", summary: "Permite atacar con mas alcance que un arma cuerpo a cuerpo normal." },
  channel: { label: "Channel", summary: "Necesita gastar al menos 1 clavija de Magia para activar o mejorar su efecto." },
  x_dice: { label: "X Dice", summary: "+X Dados: el ataque puede lanzar dados adicionales iguales a la cantidad de clavijas gastadas o al valor X indicado por la carta." },
  "x-dice": { label: "X Dice", summary: "+X Dados: el ataque puede lanzar dados adicionales iguales a la cantidad de clavijas gastadas o al valor X indicado por la carta." },
  burning: { label: "Burning", summary: "En un critico puede aplicar Quemado; ademas se considera fuente de fuego." },
  sharp: { label: "Sharp", summary: "Si esta arma saca critico, el objetivo queda Herido aunque no haya sufrido dano." },
  forceful_melee: { label: "Forceful Melee", summary: "Golpe cuerpo a cuerpo potente: usa el perfil melee del arma y suele combinarse con empuje, potencia u otros efectos indicados en la carta." },
  shield_block: { label: "Shield Block", summary: "Bloqueo de Escudo: puedes levantar el escudo para aplicar su defensa y los efectos de su icono. Normalmente cuesta 1 accion; la ficha vuelve al inventario cuando haces una accion que no sea Mover o Desplazarte, sufres dano o quedas Aturdido. Fuera de tu turno puedes levantarlo antes del ataque, pero despues quedas Fatigado. Solo puede levantarse 1 escudo a la vez." },
  armour: { label: "Armour", summary: "Otorga proteccion adicional." },
  defensive_re_roll: { label: "Defensive Re-roll", summary: "Relanzamiento Defensivo: puedes obligar a repetir 1 dado de un ataque contra ti, salvo si el ataque ignora la armadura fisica. Los criticos no se repiten." },
  immunity: { label: "Immunity", summary: "Inmunidad: el personaje no sufre ninguno de los contadores o efectos indicados por este icono o por la carta." },
  immunity_sharp: { label: "Immunity Sharp", summary: "Inmunidad al efecto Afilado o a ese tipo concreto de efecto indicado por la carta." },
  immunity_burning: { label: "Immunity Burning", summary: "Inmunidad a Quemado o al efecto de fuego indicado por la carta." },
  immunity_poison: { label: "Immunity Poison", summary: "Inmunidad a Envenenado o al veneno indicado por la carta." },
  immunity_bludgeoning: { label: "Immunity Bludgeoning", summary: "Inmunidad al efecto Contundente o al tipo de impacto indicado por la carta." },
  bludgeoning_immunity: { label: "Bludgeoning Immunity", summary: "Inmunidad al efecto Contundente o al tipo de impacto indicado por la carta." },
  camouflage: { label: "Camouflage", summary: "Solo puede ser objetivo de ataques a distancia desde corto alcance." },
  ammo_arrow: { label: "Ammo Arrow", summary: "Municion de flechas: un arma con este icono necesita una ficha de flechas para disparar. Si en el dado azul sale una calavera, descarta esa ficha de municion." },
  ammo_bullet: { label: "Ammo Bullet", summary: "Municion de bala: un arma con este icono necesita una ficha de balas para disparar. Si en el dado azul sale una calavera, descarta esa ficha de municion." },
  loud: { label: "Loud", summary: "Ruido: al usar este objeto, la Amenaza aumenta en 1." },
  cumbersome: { label: "Cumbersome", summary: "Aparatoso: ciertos resultados del ataque pueden atascar o inutilizar el arma hasta prepararla o repararla, segun la carta." },
  indestructible: { label: "Indestructible", summary: "Indestructible: este objeto no se rompe por los resultados normales que afectarian a otros objetos." },
  preparation: { label: "Preparation", summary: "Preparacion: despues de usar esta arma u objeto, se gira; necesitas una accion para prepararla y volver a usarla." },
  re_roll: { label: "Re-roll", summary: "Relanzar: permite repetir 1 dado segun indique la carta o el tipo de accion." },
  melee_re_roll: { label: "Melee Re-roll", summary: "Permite repetir 1 dado de un ataque cuerpo a cuerpo." },
  poison: { label: "Poison", summary: "Veneno: si este ataque obtiene un critico, el objetivo queda Envenenado aunque no haya sufrido dano." },
  lasting: { label: "Lasting", summary: "Efecto duradero: el objeto o beneficio no se agota en el mismo instante, sino que permanece activo durante el tiempo indicado por la carta." },
  unreliable: { label: "Unreliable", summary: "No fiable: ciertos resultados pueden atascar o inutilizar el arma hasta prepararla o repararla, segun la carta." },
  infinite_ammo: { label: "Infinite Ammo", summary: "Municion infinita: ignoras los resultados que te dejarian sin municion y descartarian el arma." },
  light: { label: "Light", summary: "Aporta luz o interactua con reglas de Oscuridad y vision segun la carta." },
  crafting: { label: "Crafting", summary: "Sirve como componente o referencia de crafteo segun las reglas de mercado y fabricacion." },
  location_specific: { label: "Location Specific", summary: "Solo funciona en la mision o localizacion indicada, o en la siguiente si asi lo especifica la carta." },
  rest: { label: "Rest", summary: "Descanso: este efecto solo se usa durante una accion de Descanso." },
  book: { label: "Book", summary: "Objeto de tipo libro o manual: suele remitir a reglas o efectos especiales de la propia carta." },
  key: { label: "Key", summary: "Llave: permite bloquear o desbloquear puertas o elementos del terreno como indique la carta." },
  trap: { label: "Trap", summary: "Trampa: interactua con reglas de trampa, colocacion o activacion segun la carta." },
  trap_melee: { label: "Trap Melee", summary: "Arma o efecto de trampa en cuerpo a cuerpo; consulta el perfil exacto de la carta." },
  "2_actions": { label: "2 Actions", summary: "Permite realizar o recuperar dos acciones, segun indique la carta." },
  magic: { label: "Magic", summary: "El objeto es magico o interactua directamente con reglas de magia." },
  starting_magic: { label: "Starting Magic", summary: "Aporta una reserva o uso inicial de magia segun la carta." },
  terrifying: { label: "Terrifying", summary: "Terrorifico: en un critico puede Aterrorizar, o puede aplicar ese efecto a enemigos cercanos segun la carta." },
  vampiric: { label: "Vampiric", summary: "Vampirico: en un critico hace perder una clavija al objetivo y puede restaurar una del atacante segun la carta." },
  regeneration: { label: "Regeneration", summary: "Regeneracion: restaura clavijas del tipo indicado en la Fase de Evaluacion." },
  hit_and_run: { label: "Hit and Run", summary: "Golpea y muevete: permite atacar y reposicionarte o salir del contacto segun la carta." },
  relentless: { label: "Relentless", summary: "Implacable: mantiene la presion ofensiva y ayuda a encadenar ataques o persecuciones segun la carta." },
  harpoons: { label: "Harpoons", summary: "Arpones: arma o municion especial con reglas propias de arrastre, alcance o fijacion segun la carta." },
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
  vicious: { label: "Vicious", summary: "Vicioso: los resultados indicados en el dado azul para esta arma cuentan como golpes criticos." },
  retaliation: { label: "Retaliation", summary: "Puede devolver dano o efectos al atacante." },
  blast: { label: "Blast", summary: "Afecta a varios objetivos o zonas cercanas segun el perfil del arma o efecto." },
  malacyte_regeneration_1: { label: "Malacyte Regeneration 1", summary: "Regeneracion de malacita 1: restaura 1 clavija de Magia en la Fase de Evaluacion o segun indique la carta." },
  focused_energy: { label: "Focused Energy", summary: "Energia concentrada: este objeto canaliza una descarga o golpe energetico propio. Usa el perfil exacto de la carta para resolverlo." },
  stash: { label: "Stash", summary: "Reserva: el objeto representa dinero o botin guardado para anadir a tu reserva o a la economia del grupo." },
  fireball: { label: "Fireball", summary: "Bola de fuego: el objeto permite resolver un ataque o efecto explosivo de fuego propio de la carta." },
  malacyte_enhancement: { label: "Malacyte Enhancement", summary: "Mejora de malacita: potencia el arma o el efecto magico del objeto segun el texto de su carta." },
  darts: { label: "Darts", summary: "Municion de dardos: este objeto dispara dardos con su propio perfil de ataque. Si el dado azul muestra la perdida de municion indicada por la carta, se descarta la ficha usada." },
  darkness: { label: "Darkness", summary: "Oscuridad: crea o aplica un efecto de Oscuridad segun el perfil de esta carta." },
  plunderer: { label: "Plunderer", summary: "Saqueador: el objeto ayuda a desarmar, dispersar o robar equipo del objetivo segun el ataque resuelto." },
  fatigue: { label: "Fatigue", summary: "Fatiga: este ataque o efecto hace que el objetivo sufra Fatiga." },
  hawkeye: { label: "Hawkeye", summary: "Ojo de Halcon: el ataque ignora la cobertura parcial y puede disparar a personajes enfrentados a cualquier distancia sin aleatorizar el objetivo." },
  scramble: { label: "Scramble", summary: "Trepar: ayuda a subir, bajar o cruzar obstaculos usando el valor de Trepar de la carta." },
  learn_spells_one_level_higher: { label: "Learn Spells One Level Higher", summary: "Permite aprender hechizos de 1 nivel por encima de lo normal para tu rango, segun la carta." },
  dart: { label: "Dart", summary: "Dardo: ataque o municion de dardo con el perfil concreto indicado en la carta." },
  skill: { label: "Skill", summary: "Restaura o interactua con clavijas de Habilidad segun el objeto." },
  rope: { label: "Rope", summary: "Cuerda: ayuda a Trepar, Saltar o mover objetos/terreno segun la situacion y la carta." },
  reactive: { label: "Reactive", summary: "Reactivo: este objeto se usa o responde como reaccion cuando se cumple su desencadenante." },
  size: { label: "Size", summary: "Tamano: modifica el tamano efectivo del personaje u objeto y sus reglas asociadas." },
  malacyte_stability: { label: "Malacyte Stability", summary: "Estabilidad de malacita: hace mas estable la canalizacion o el uso magico del objeto segun su carta." },
  stars: { label: "Stars", summary: "Estrellas arrojadizas: ataque o lanzamiento rapido con el perfil indicado por la carta." },
  x_actions: { label: "X Actions", summary: "Concede X acciones adicionales o efectos ligados a acciones, segun el objeto y su carta." },
  fast: { label: "Fast", summary: "Rapido: al realizar una accion de Movimiento, este personaje puede mover X casillas adicionales. Si tiene varias fuentes, usa el valor mas alto." },
  hidden_location: { label: "Hidden Location", summary: "Localizacion oculta: revela o interactua con una ubicacion secreta segun la mision o la carta." },
  warded: { label: "Warded", summary: "Protegido: el objetivo o usuario queda resguardado frente a magia o efectos hostiles segun la carta." },
  remove_poison: { label: "Remove Poison", summary: "Elimina un contador o efecto de Envenenado." },
  remove_wounded: { label: "Remove Wounded", summary: "Elimina un contador o efecto de Herido." },
  malacytic_conduit: { label: "Malacytic Conduit", summary: "Conducto malacitico: usa malacita para canalizar o amplificar efectos magicos del objeto." },
  regen_magic: { label: "Regen Magic", summary: "Regenera 1 clavija de Magia en la Fase de Evaluacion o segun indique la carta." },
};

const TERM_GLOSSARY = [
  { term: "First Strike", summary: "Danar Primero: al entrar en alcance melee de un enemigo obtienes un Ataque Melee gratuito inmediato." },
  { term: "Parry", summary: "Parada: tiras 1 dado de combate; cada impacto anula 1 impacto enemigo como armadura fisica y despues quedas Fatigado." },
  { term: "Shield Block", summary: "Bloqueo de Escudo: levantas el escudo para aplicar su defensa y efectos. Normalmente cuesta 1 accion; fuera de tu turno puedes hacerlo antes del ataque, pero luego quedas Fatigado." },
  { term: "Quickstrike", summary: "Ataque Rapido: si el ataque melee obtiene un critico, puedes Desplazarte o hacer otro ataque gratis despues de resolver el primero." },
  { term: "Ataque Rapido", summary: "Si el ataque melee obtiene un critico, puedes Desplazarte o hacer otro ataque gratis despues de resolver el primero." },
  { term: "Danar Primero", summary: "Al entrar en alcance melee de un enemigo obtienes un Ataque Melee gratuito inmediato." },
  { term: "Parada", summary: "Tiras 1 dado de combate; cada impacto anula 1 impacto enemigo como armadura fisica y despues quedas Fatigado." },
  { term: "Bloqueo de Escudo", summary: "Levantas el escudo para aplicar su defensa y efectos. Normalmente cuesta 1 accion; fuera de tu turno puedes hacerlo antes del ataque, pero luego quedas Fatigado." },
  { term: "Equilibrada", summary: "Si el arma se lanza, tira 1 dado extra." },
  { term: "Vision Nocturna", summary: "Ignoras todos los efectos de la Oscuridad." },
  { term: "Rapido", summary: "Al realizar una accion de Movimiento, este personaje puede mover X casillas adicionales. Si lo obtiene de varias fuentes, usa solo el valor mas alto." },
  { term: "Relanzamiento Defensivo", summary: "Puedes obligar a repetir 1 solo dado de cualquier ataque contra ti, salvo si el ataque ignora la armadura fisica. Los criticos no se repiten." },
  { term: "Fatigado", summary: "Estado de Fatiga. Varias habilidades lo ponen o lo limpian; el personaje queda mas limitado hasta recuperarse." },
  { term: "Fatigued", summary: "Estado de Fatiga. Varias habilidades lo ponen o lo limpian; el personaje queda mas limitado hasta recuperarse." },
  { term: "Stunned", summary: "Estado de Aturdido. Normalmente impide actuar con normalidad hasta que se elimine." },
  { term: "Aturdido", summary: "Estado de Aturdido. Normalmente impide actuar con normalidad hasta que se elimine." },
  { term: "Wounded", summary: "Estado de Herido. Es un estado negativo y varias habilidades o remedios lo eliminan." },
  { term: "Herido", summary: "Estado de Herido. Es un estado negativo y varias habilidades o remedios lo eliminan." },
  { term: "Poisoned", summary: "Estado de Envenenado. Puede eliminarse con ciertas skills, descansos o remedios." },
  { term: "Envenenado", summary: "Estado de Envenenado. Puede eliminarse con ciertas skills, descansos o remedios." },
  { term: "Blessed", summary: "Estado de Bendecido/Bendito. Suele mejorar tiradas o apoyar acciones." },
  { term: "Bendito", summary: "Estado de Bendecido/Bendito. Suele mejorar tiradas o apoyar acciones." },
  { term: "Terrified", summary: "Estado de Aterrorizado. Muchas skills de apoyo lo quitan." },
  { term: "Aterrorizado", summary: "Estado de Aterrorizado. Muchas skills de apoyo lo quitan." },
  { term: "Dash", summary: "Desplazamiento rapido: una recolocacion corta distinta de una accion completa de Movimiento." },
  { term: "Desplazamiento", summary: "Reposicion corta distinta de una accion completa de Movimiento." },
  { term: "Move action", summary: "Accion completa de Movimiento, no solo 1 casilla." },
  { term: "Movimiento", summary: "Cuando la skill dice Movimiento, se refiere a una accion completa de Mover, no a una sola casilla." },
  { term: "Melee Attack", summary: "Accion completa de ataque cuerpo a cuerpo." },
  { term: "Ranged Attack", summary: "Accion completa de ataque a distancia." },
  { term: "LoS", summary: "Linea de vision: debe existir vision clara entre el origen y el objetivo para poder aplicar ese efecto." },
  { term: "Vicious", summary: "Vicioso: los resultados indicados en el dado azul para ese ataque cuentan como golpes criticos." },
  { term: "Poison", summary: "Veneno: si el ataque obtiene un critico, el objetivo queda Envenenado aunque no haya sufrido dano." },
  { term: "Channel", summary: "Canalizar: debes gastar al menos 1 clavija de Magia para activar o mejorar ese efecto." },
  { term: "Canalizar", summary: "Debes gastar al menos 1 clavija de Magia para activar o mejorar ese efecto." },
  { term: "Event Card", summary: "Carta de Evento: se roba y resuelve siguiendo el mazo de eventos de la mision." },
  { term: "Carta de Evento", summary: "Se roba y resuelve siguiendo el mazo de eventos de la mision." },
  { term: "Entry Point", summary: "Punto de Entrada: lugar del mapa por donde aparecen o se colocan enemigos y otros elementos." },
  { term: "Punto de Entrada", summary: "Lugar del mapa por donde aparecen o se colocan enemigos y otros elementos." },
  { term: "Staging Point", summary: "Punto de Reagrupamiento o llegada alternativa que algunas reglas cambian o recolocan." },
  { term: "Punto de Reagrupamiento", summary: "Punto de llegada o reagrupamiento que algunas reglas cambian o recolocan." },
  { term: "Dread", summary: "Amenaza actual de la mision; varias reglas usan su valor o su cara para determinar efectos." },
  { term: "Amenaza", summary: "Marcador de peligro de la mision; varias reglas usan su valor o su cara para determinar efectos." },
  { term: "Rough Ground", summary: "Terreno dificil que penaliza el movimiento segun su valor." },
  { term: "Terrifying", summary: "Terrorifico: en un critico puede Aterrorizar, o puede aplicar ese efecto a enemigos cercanos segun la regla que lo conceda." },
  { term: "Otherworldly", summary: "Mitico: criatura o personaje especial que no cuenta como bestia errante normal para esas reglas." },
  { term: "Mitica", summary: "Criatura o personaje especial que no cuenta como bestia errante normal para esas reglas." },
  { term: "PNJ", summary: "Personaje no jugador o enemigo controlado por la mision." },
  { term: "NPC", summary: "Personaje no jugador o enemigo controlado por la mision." },
  { term: "Left for Dead", summary: "Dado por Muerto: tabla o tirada de secuelas cuando un aventurero cae al final de una mision." },
  { term: "Dado por Muerto", summary: "Tabla o tirada de secuelas cuando un aventurero cae al final de una mision." },
  { term: "Upkeep", summary: "Mantenimiento: coste de conservar al grupo entre misiones." },
  { term: "Mantenimiento", summary: "Coste de conservar al grupo entre misiones." },
  { term: "Skill", summary: "Clavija o recurso de Habilidad del personaje." },
  { term: "Habilidad", summary: "Clavija o recurso de Habilidad del personaje cuando el contexto habla de gastar pegs." },
  { term: "physical armour", summary: "Armadura fisica o Proteccion normal del objetivo." },
  { term: "armadura fisica", summary: "Armadura fisica o Proteccion normal del objetivo." },
];

const MISSIONS = {
  Intro: {
    id: "Intro", nombre: "De Moneda y Gloria", pagina: 4,
    condicion: "Mision independiente rejugable. Puede jugarse antes de la campana o entre misiones (cuesta 1 espacio de Demora si se juega dentro de la campana).",
    objetivo_primario: "Recolectar armas, armaduras y recursos. Ganar experiencia de combate.",
    objetivo_secundario: "Recuperar Objetivos 7 y 8 de la bolsa de fichas. Cada uno vale 1 Renombre en Mercado.",
    reglas_especiales: [
      { nombre: "Mecanismos Antiguos", desc: "4 palancas activas. Al interactuar con cada una, girar la ficha y resolver: 1=roto sin efecto, 2=abre tragaluz/retira Oscuridad, 3=cierra tragaluz/anade Oscuridad, 4=cierra puerta al azar, 5=desbloquea puerta al azar, 6=retira pared amarilla -> acceso a Camara del Arcanista." }
    ],
    amenaza: { cara: "A", clavijas: 0 },
    mazo_eventos: "8x Lamentor, 2x Hellfront, 8x Mapa, 2x Malagaunt + dificultad",
    consecuencias: "Ninguna (mision independiente). Si se juega en campana: +1 Demora.",
  },
  A: {
    id: "A", nombre: "Secretos en la Oscuridad", pagina: 6,
    condicion: "Primera mision de la campana.",
    objetivo_primario: "Recuperar Reliquias de Objetivos 1-8 (una por cada caja, cofre y tumba). Cada reliquia vale 6G en Mercado. Anotar numero de reliquias recuperadas en Registro.",
    objetivo_secundario: "Recuperar Objetivo 9 del Escritorio del Arcanista. Representa mapas y diarios. Si se recupera: descartarlo en Descanso y marcar Logro Parafernalia Oculta.",
    reglas_especiales: [],
    amenaza: { cara: "A", clavijas: 0 },
    mazo_eventos: "8x Lamentor, 8x Mapa, 2x Hellfront, 2x Malagaunt + dificultad",
    asignacion_busqueda: "Dejar 2 negras aparte. 6x fichas + 1x mapa en terreno buscable.",
    consecuencias: "Si recuperaste Objetivo 1 -> puedes jugar Mision B. Si 5+ reliquias -> Mision C. Si 4 o menos -> Mision D.",
  },
  B: {
    id: "B", nombre: "La Reliquia", pagina: 8,
    condicion: "Opcional. Se juega despues de A si recuperaste Objetivo 1.",
    objetivo_primario: "Encontrar al familiar del aldeano atrincherado. Si se rescata por Punto de Reagrupamiento: familia paga 10G + 2 Renombre + marcar Logro Deuda de Favor.",
    objetivo_secundario: "Saquear todo lo posible.",
    reglas_especiales: [
      { nombre: "Oscuridad", desc: "Toda el area sigue reglas de Oscuridad. El Habitante no se activa hasta que un Aventurero entre en contacto corto o sea atacado -> aumenta Amenaza en 3." }
    ],
    amenaza: { cara: "A", clavijas: 2 },
    mazo_eventos: "8x Lamentor, 8x Mapa, 3x Hellfront, 1x Malagaunt + dificultad",
    consecuencias: "+1 Demora. Luego: 5+ reliquias -> C, 4 o menos -> D.",
  },
  C: {
    id: "C", nombre: "Un Nuevo Poder en Ascenso", pagina: 10,
    condicion: "Recuperaste 5+ reliquias en Mision A.",
    objetivo_primario: "Recuperar partes de criaturas derrotadas como Objetivos: Primer Lamentor tras Amenaza >= Distress -> Obj 1-3. Primera Myria tras >= Distress -> Obj 4-5. Primer Hellfront -> Obj 6. Rot Troll -> Obj 9.",
    objetivo_secundario: "Recuperar Objetivos 7 y 8. Si ambos: marcar Logro Rastro Esqueletico.",
    reglas_especiales: [
      { nombre: "Sombras Cambiantes", desc: "Oscuridad activa. Al inicio lanzar Dado Magico 3 veces -> colocar Luz. Desde Distress: mover luz al siguiente numero mas alto. Palancas para mover luz." }
    ],
    amenaza: { cara: "A", clavijas: 2 },
    mazo_eventos: "8x Lamentor, 8x Mapa, 2x Hellfront, 2x Malagaunt + dificultad",
    consecuencias: "Si Obj 7 u 8 -> elegir ruta. Carretera -> Mision E. Tuneles -> Mision F. Sin Obj 7/8 -> Mision E.",
  },
  D: {
    id: "D", nombre: "Resurrectionistas", pagina: 12,
    condicion: "Recuperaste 4 o menos reliquias en Mision A.",
    objetivo_primario: "Acumular botin. 1 Renombre por cada 20G de aumento en Mercado.",
    objetivo_secundario: "Mapeo de Tuneles: Interactuar con puntos de entrada para mapearlos. Robo de Tumbas: Buscar en Espacios de Sepultura. Anotar en Registro.",
    reglas_especiales: [
      { nombre: "Spawn", desc: "Si Revenants llegan y no hay ninguno activo -> colocarlos en punto de entrada mas cercano." }
    ],
    amenaza: { cara: "A", clavijas: 1 },
    mazo_eventos: "7x Lamentor, 2x Malagaunt, 6x Mapa, 2x Hellfront, 3x Malagaunt, 1x Omega + dificultad",
    consecuencias: "Siguiente mision: Mision F.",
  },
};

const MISSION_IDS = ["Intro","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T"];

const MISSION_SUGGESTIONS = {
  Intro: ["A"],
  A: ["B","C","D"],
  B: ["C","D"],
  C: ["E","F"],
  D: ["F"],
};

function getSuggestedNextMissionIds(missionId) {
  return MISSION_SUGGESTIONS[missionId] || [];
}

const RESOURCE_LETTERS = ["W","S","T","H","F","M","R","V","K","B","G","I","A","E","N"];
const RESOURCE_LABELS = {
  W: "Wood",
  S: "Steel",
  T: "Textiles",
  H: "Herbs",
  F: "Fungus",
  M: "Minerals",
  R: "Riches",
  V: "Serpent Venom",
  K: "Keltic Steel",
  B: "Powdered Drakon Bone",
  G: "Graam Ore",
  I: "Issen Oil",
  A: "Alary Carapace",
  E: "Extract of Maladite",
  N: "Necrotic Fluids",
};

const REST_REFERENCE = {
  posada: [
    "Coste: 2G por aventurero.",
    "1-2: Bendecir a todos los aventureros o 1 aventurero aleatorio gana 1 PX.",
    "3-4: Vuelve a lanzar. 1-2: coge una ficha poco comun al azar. 3-4: roba 2 poco comunes y 1 rara; puedes comprar a precio de venta. 5-6: al comienzo de la siguiente partida, mira las 3 primeras cartas de Evento o mira una pieza de terreno buscable.",
    "5-6: Vuelve a lanzar. 1: -1 Salud a un aventurero aleatorio. 2: coge Provisiones. 3-4: gana 2 de Renombre. 5-6: puedes apostar XG y, si ganas la moneda, recibes 2XG.",
  ],
  naturaleza: [
    "Coste: gratis.",
    "1: Pierde D6G. Un aventurero aleatorio pierde dos objetos. Puedes sufrir -1 Salud y -1 Habilidad para evitar todos los efectos.",
    "2: Vuelve a lanzar. Un aventurero al azar empieza la siguiente partida con 1-3: Fatiga o 4-6: Herido.",
    "3-4: Tira por cada miembro del grupo. Empieza la siguiente partida con 1-2: -1 Salud, 3-4: -1 Habilidad, 5-6: -1 Magia.",
    "5-6: Sin efecto.",
  ],
};

const DEMORA_EFFECTS = [
  { min: 0, max: 2, desc: "Sin efectos negativos." },
  { min: 3, max: 4, desc: "Aumenta la dificultad base de las misiones." },
  { min: 5, max: 6, desc: "Efectos moderados en las misiones." },
  { min: 7, max: 8, desc: "Efectos severos. La situacion empeora." },
  { min: 9, max: 10, desc: "Casi al limite. Consecuencias graves." },
  { min: 11, max: 12, desc: "Maxima presion. El tiempo se acaba." },
];

const TURN_PHASES = [
  {
    id: "dread", name: "Fase de Amenaza", icon: "AM",
    steps: [
      "Avanzar Amenaza +1",
      "Si magia fue usada esta ronda -> +1 adicional",
      "Si clavija entra en espacio rojo -> lanzar Dado Magico",
      "Robar Carta de Evento (desde ronda 2)",
      "Resolver efecto segun nivel de Amenaza actual",
    ]
  },
  {
    id: "adventurers", name: "Fase de Aventureros", icon: "AV",
    steps: [
      "Activar Aventureros alternando entre jugadores",
      "Cada Aventurero: hasta 2 acciones + 1 sin esfuerzo",
      "Todos los Aventureros activados",
    ]
  },
  {
    id: "adversary", name: "Fase de Adversarios", icon: "EN",
    steps: [
      "Nuevas llegadas segun banda de Amenaza",
      "Activar Adversarios por Rango (mayor primero)",
      "Resolver IA de cada uno",
    ]
  },
  {
    id: "npc", name: "Fase de PNJs", icon: "PNJ",
    steps: [
      "Activar Wandering Beasts",
      "Activar Denizens / Habitantes",
    ]
  },
  {
    id: "assessment", name: "Fase de Evaluacion", icon: "EV",
    steps: [
      "Resolver efectos de estado (Burning, Poisoned, etc.)",
      "Retirar contadores segun reglas",
      "Retirar contadores de Activacion",
      "Siguiente primer jugador en sentido horario",
    ]
  },
];

TURN_PHASES[0].steps = [
  "Avanzar Amenaza +1",
  "Si clavija entra en espacio rojo -> lanzar Dado Magico",
  "Robar Carta de Evento (desde ronda 2)",
  "Resolver efecto segun nivel de Amenaza actual",
];

function defaultCampaign(name) {
  return {
    id: "camp_" + Date.now(),
    name,
    createdAt: new Date().toISOString(),
    currentMission: "Intro",
    demora: 0,
    renombre: 0,
    oro: 0,
    historial_misiones: [],
    registro: {
      malagauntDerrotado: 0, troll_derrotado: false,
      aprendiz_estado: null, aprendiz_nombre: null,
      reliquias_encontradas: 0,
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
  const emptyMaterials = Object.fromEntries(RESOURCE_LETTERS.map(letter => [letter, 0]));
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
    primary_complete: false,
    secondary_complete: false,
    success: true,
    xp_base: 1,
    xp_extra: 0,
    renombre_ganado: 0,
    oro_ganado: 0,
    demora_cambio: 0,
    next_mission: missionId,
    rest_mode: "none",
    rest_notes: "",
    maintenance_cost: 0,
    lodging_cost: 0,
    materials_gained: emptyMaterials,
    magic_threat_levels: [],
    crafted_items: [],
    purchased_items: [],
    repaired_items: [],
    sold_items: [],
    notas: "",
    loot_notes: "",
  };
}

function normalizeCampaign(campaign) {
  if (!campaign) return null;
  const base = defaultCampaign(campaign.name || "Campana");
  return {
    ...base,
    ...campaign,
    demora: Math.max(0, Math.min(12, Number(campaign.demora ?? base.demora) || 0)),
    renombre: Math.max(0, Number(campaign.renombre ?? 0) || 0),
    oro: Math.max(0, Number(campaign.oro ?? 0) || 0),
    historial_misiones: Array.isArray(campaign.historial_misiones) ? campaign.historial_misiones : [],
    registro: {
      ...base.registro,
      ...(campaign.registro || {}),
      logros: {
        ...base.registro.logros,
        ...((campaign.registro || {}).logros || {}),
      },
      recompensas: {
        ...base.registro.recompensas,
        ...((campaign.registro || {}).recompensas || {}),
      },
    },
  };
}

function normalizeMissionState(state) {
  if (!state) return null;
  const base = defaultMissionState(state.campaign_id, state.mision_id);
  const materials = { ...base.materials_gained, ...(state.materials_gained || {}) };
  return {
    ...base,
    ...state,
    amenaza_nivel: Math.max(0, Number(state.amenaza_nivel ?? base.amenaza_nivel) || 0),
    ronda: Math.max(1, Number(state.ronda ?? base.ronda) || 1),
    primary_complete: !!state.primary_complete,
    secondary_complete: !!state.secondary_complete,
    success: state.success !== false,
    xp_base: Math.max(1, Number(state.xp_base ?? 1) || 1),
    xp_extra: Math.max(0, Number(state.xp_extra ?? 0) || 0),
    renombre_ganado: Math.max(0, Number(state.renombre_ganado ?? 0) || 0),
    oro_ganado: Math.max(0, Number(state.oro_ganado ?? 0) || 0),
    demora_cambio: Math.max(0, Number(state.demora_cambio ?? 0) || 0),
    next_mission: state.next_mission || state.mision_id || base.next_mission,
    rest_mode: ["none", "posada", "naturaleza"].includes(state.rest_mode) ? state.rest_mode : "none",
    rest_notes: String(state.rest_notes || ""),
    maintenance_cost: Math.max(0, Number(state.maintenance_cost ?? 0) || 0),
    lodging_cost: Math.max(0, Number(state.lodging_cost ?? 0) || 0),
    materials_gained: Object.fromEntries(Object.entries(materials).map(([key, value]) => [key, Math.max(0, Number(value) || 0)])),
    magic_threat_levels: Array.isArray(state.magic_threat_levels) ? state.magic_threat_levels.map(v => Math.max(1, Number(v) || 1)) : [],
    crafted_items: Array.isArray(state.crafted_items) ? state.crafted_items : [],
    purchased_items: Array.isArray(state.purchased_items) ? state.purchased_items : [],
    repaired_items: Array.isArray(state.repaired_items) ? state.repaired_items : [],
    sold_items: Array.isArray(state.sold_items) ? state.sold_items : [],
    fases_completadas: state.fases_completadas || {},
    steps_completados: state.steps_completados || {},
    notas: String(state.notas || ""),
    loot_notes: String(state.loot_notes || ""),
  };
}

function addMagicThreatToMission(state) {
  const mission = normalizeMissionState(state);
  if (mission.magia_usada_esta_ronda) return mission;
  const nextLevel = mission.amenaza_nivel + 1;
  return normalizeMissionState({
    ...mission,
    magia_usada_esta_ronda: true,
    amenaza_nivel: nextLevel,
    magic_threat_levels: [...(mission.magic_threat_levels || []), nextLevel],
  });
}

function trimMagicThreatLevels(level, magicThreatLevels) {
  return (magicThreatLevels || []).filter(value => Number(value) <= Number(level));
}

const MAGIC_DIE_OUTCOMES = {
  1: "La magia no se resuelve. El personaje queda Fatigado.",
  2: "Sin efecto adicional del dado magico.",
  3: "Recupera 1 clavija de Magia.",
  4: "Otros personajes en 2 casillas se alejan 1 casilla y quedan Derribados. Pueden gastar 1 clavija de Habilidad para evitarlo.",
  5: "Este y otros personajes en 2 casillas ganan 1 clavija de Magia. Pueden superar su valor inicial.",
  6: "Resuelve el hechizo como si hubieras gastado 1 clavija extra. No se puede resistir.",
};

function createCraftedInventoryItem(recipe, payload) {
  if (payload) {
    return normalizeInventoryItem({
      ...payload,
      source: payload.source || "Crafteo",
      summary: payload.summary || `Crafteado con ${recipe.res_required}.`,
      buy: Number.isFinite(Number(payload.buy)) ? Number(payload.buy) : Number(recipe.price || 0),
    });
  }
  return normalizeInventoryItem({
    name: recipe.name,
    type: recipe.type,
    size: recipe.size,
    source: "Crafteo",
    buy: Number(recipe.price || 0),
    summary: `Crafteado con ${recipe.res_required}${recipe.expansion ? ` | ${recipe.expansion}` : ""}.`,
    equipped: false,
  });
}

function canAffordRecipeWithGold(goldAvailable, craftedSpend, recipe) {
  return goldAvailable - craftedSpend - Number(recipe?.price || 0) >= 0;
}

function consumeRecipeMaterials(materials, recipe) {
  const next = { ...(materials || {}) };
  Object.entries(recipe?.requirements || {}).forEach(([letter, need]) => {
    next[letter] = Math.max(0, Number(next[letter] || 0) - Number(need || 0));
  });
  return next;
}

function restoreRecipeMaterials(materials, craftedItem) {
  const next = { ...(materials || {}) };
  Object.entries(craftedItem?.requirements || {}).forEach(([letter, need]) => {
    next[letter] = Math.max(0, Number(next[letter] || 0) + Number(need || 0));
  });
  return next;
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
    stowed: !!item?.stowed,
    broken: !!item?.broken,
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

function parseSkillWithLevel(raw, fallbackLevel = 1) {
  const value = String(raw || "").trim();
  const match = value.match(/^(.*?)(?:\s+(\d+))?$/);
  const baseName = normalizeSkillLookupName(match?.[1] || value);
  const parsedLevel = Number(match?.[2]);
  return {
    name: baseName,
    level: Math.max(1, Number.isFinite(parsedLevel) && parsedLevel > 0 ? parsedLevel : fallbackLevel),
  };
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

function resolveSpellNameFromToken(token) {
  const cleaned = String(token || "").replace(/^spell_/, "");
  const normalized = cleaned.replace(/_/g, " ");
  const candidates = new Set([
    ...Object.keys(OFFICIAL_SPELL_DETAILS || {}),
    ...Object.values(OFFICIAL_SPELLS || {}).flat().map(spell => spell.name),
  ]);
  return [...candidates].find(name => slugKey(name) === slugKey(normalized)) || titleCaseToken(normalized);
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
  const spellMatch = String(attr).match(/^spell_(.+)$/);
  if (spellMatch) {
    const spellName = resolveSpellNameFromToken(attr);
    const spellMeta = OFFICIAL_SPELL_DETAILS[spellName];
    return {
      label: `Spell ${spellName}`,
      summary: spellMeta?.summary
        ? `Otorga acceso al hechizo ${spellName}. ${spellMeta.summary}`
        : `Otorga acceso al hechizo ${spellName} mientras el objeto este disponible.`,
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

function getInnateSkillEntries(adv) {
  return (normalizeAdventurer(adv).innatas || []).map(raw => {
    const parsed = parseSkillWithLevel(raw, 1);
    return getSkillEntry(parsed.name, parsed.level, "Innata");
  });
}

function getInnateSkillLevel(adv, skillName) {
  const target = normalizeSkillLookupName(skillName);
  return getInnateSkillEntries(adv)
    .filter(entry => normalizeSkillLookupName(entry.name) === target)
    .reduce((max, entry) => Math.max(max, Number(entry.level) || 0), 0);
}

function getPurchasedSkillLevel(adv, skillName) {
  return Math.max(0, Number(normalizeAdventurer(adv).clase_habilidades?.[skillName]) || 0);
}

function getEffectiveSkillLevel(adv, skillName) {
  return Math.min(3, getInnateSkillLevel(adv, skillName) + getPurchasedSkillLevel(adv, skillName));
}

function combineSkillSources(existingSource, nextSource) {
  const parts = new Set(
    [existingSource, nextSource]
      .flatMap(value => String(value || "").split(" + ").map(part => part.trim()))
      .filter(Boolean)
  );
  return Array.from(parts).join(" + ");
}

function getGlossaryMatches(text) {
  const source = String(text || "");
  const lowered = source.toLowerCase();
  return TERM_GLOSSARY.filter(entry => lowered.includes(entry.term.toLowerCase()))
    .filter((entry, index, arr) => arr.findIndex(other => other.term.toLowerCase() === entry.term.toLowerCase()) === index);
}

function getLearnedSkills(adv) {
  const normalized = normalizeAdventurer(adv);
  const learned = new Map();
  const addOrMerge = (entry) => {
    const key = normalizeSkillLookupName(entry.name);
    const existing = learned.get(key);
    if (!existing) {
      learned.set(key, { ...entry });
      return;
    }
    const mergedLevel = Math.max(Number(existing.level) || 0, Number(entry.level) || 0);
    learned.set(key, {
      ...existing,
      level: mergedLevel,
      source: combineSkillSources(existing.source, entry.source),
      summary: getSkillEntry(entry.name, mergedLevel, entry.source).summary,
    });
  };
  getInnateSkillEntries(normalized).forEach(addOrMerge);
  Object.entries(normalized.clase_habilidades || {}).forEach(([name, level]) => {
    if ((Number(level) || 0) > 0) {
      addOrMerge(getSkillEntry(name, getEffectiveSkillLevel(normalized, name), normalized.clase || "Clase"));
    }
  });
  summarizeEquippedItems(normalized).forEach(item => {
    getGrantedSkillsFromItem(item).forEach(addOrMerge);
  });
  return Array.from(learned.values());
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
  return (normalizeAdventurer(adv).inventario || []).filter(item => {
    if (item.broken) return false;
    if (isWeaponItem(item)) return true;
    return item.equipped;
  });
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

function getItemPreviewBadges(item) {
  const normalized = normalizeInventoryItem(item);
  const badges = [];
  if (normalized.meleeDice > 0) badges.push({ label: `ATQ ${normalized.meleeDice}`, tone: "attack" });
  else if ((normalized.attributes || []).some(attr => ["melee", "forceful_melee", "quickstrike", "reach"].includes(attr))) badges.push({ label: "C/C", tone: "attack" });
  if (normalized.rangedDice > 0) badges.push({ label: `DIST ${normalized.rangedDice}`, tone: "range" });
  else if ((normalized.range || []).length > 0) badges.push({ label: `ALC ${normalized.range.join("/")}`, tone: "range" });
  if (normalized.shield > 0) badges.push({ label: `ESC ${normalized.shield}`, tone: "shield" });
  if (normalized.armor > 0) badges.push({ label: `PROT ${normalized.armor}`, tone: "armor" });
  if (normalized.magic) badges.push({ label: "MAGIA", tone: "magic" });
  (normalized.attributes || []).slice(0, 3).forEach(attr => {
    const label = getAttributeEntry(attr)?.label || titleCaseToken(attr);
    if (!badges.some(badge => badge.label === label)) badges.push({ label, tone: "special" });
  });
  return badges;
}

function getItemPreviewBadgeStyle(tone) {
  const tones = {
    attack: { color: "#fde68a", border: "#92400e" },
    range: { color: "#fca5a5", border: "#7f1d1d" },
    shield: { color: "#bfdbfe", border: "#1d4ed8" },
    armor: { color: "#cbd5e1", border: "#475569" },
    magic: { color: "#c4b5fd", border: "#4338ca" },
    special: { color: "#d4b896", border: "#374151" },
  };
  return tones[tone] || tones.special;
}

function getItemEffectPreview(item) {
  const normalized = normalizeInventoryItem(item);
  const attributeSummaries = (normalized.attributes || [])
    .map(attr => getAttributeEntry(attr)?.summary)
    .filter(Boolean);
  if (attributeSummaries.length > 0) return attributeSummaries.slice(0, 2);
  if (normalized.summary) return [normalized.summary];
  return [];
}

function getCombatSkillEntries(adv, tags) {
  const tagList = Array.isArray(tags) ? tags : [tags];
  return getLearnedSkills(adv).filter(skill => (skill.tags || []).some(tag => tagList.includes(tag)));
}

function getCombatSpellEntries(adv) {
  return getKnownSpells(adv).map(spell => ({
    name: spell.name,
    level: spell.level,
    summary: spell.summary || spell.notes || "Texto oficial pendiente de transcribir.",
  }));
}

function getRelevantCombatAttributes(item, mode) {
  const allowed = COMBAT_ATTRIBUTE_GROUPS[mode] || new Set();
  return (item?.attributes || [])
    .filter(attr => allowed.has(attr))
    .map(attr => ({
      id: attr,
      label: getAttributeEntry(attr)?.label || titleCaseToken(attr),
      summary: getAttributeEntry(attr)?.summary || "Detalle pendiente.",
    }));
}

function getCombatWeaponOptions(adv, mode) {
  return summarizeEquippedItems(adv)
    .filter(item => {
      const attrs = new Set(item?.attributes || []);
      if (mode === "melee") {
        return item?.meleeDice > 0 || attrs.has("melee") || attrs.has("forceful_melee") || attrs.has("quickstrike") || attrs.has("parry") || attrs.has("reach");
      }
      if (mode === "ranged") {
        return item?.rangedDice > 0 || (item?.range || []).length > 0 || attrs.has("ammo_arrow") || attrs.has("ammo_bullet") || attrs.has("blast") || attrs.has("trap_melee");
      }
      return false;
    })
    .map(item => ({
      id: item.id,
      name: item.name,
      summary: item.summary || summarizeCatalogEntry(item) || "",
      dice: mode === "melee" ? Number(item.meleeDice || 0) : Number(item.rangedDice || 0),
      range: Array.isArray(item.range) ? item.range.filter(value => Number(value) > 0) : [],
      attributes: getRelevantCombatAttributes(item, mode),
      rawAttributes: Array.isArray(item.attributes) ? item.attributes : [],
    }));
}

function getFrenzyBonusDice(level) {
  if (level >= 3) return 4;
  if (level === 2) return 3;
  if (level === 1) return 2;
  return 0;
}

function applyAdventurerResourceSpend(adv, costs = {}) {
  const normalized = normalizeAdventurer(adv);
  return normalizeAdventurer({
    ...normalized,
    magia_actual: Math.max(0, normalized.magia_actual - Math.max(0, Number(costs.magic) || 0)),
    habilidad_actual: Math.max(0, normalized.habilidad_actual - Math.max(0, Number(costs.skill) || 0)),
    salud_actual: Math.max(0, normalized.salud_actual - Math.max(0, Number(costs.health) || 0)),
  });
}

function getSpellCastingPreview(spell, pegs) {
  if (!spell) return "Resuelve el texto oficial del hechizo.";
  const amount = Math.max(1, Number(pegs) || 1);
  const summary = String(spell.summary || "").toLowerCase();
  if (summary.includes("x dados") || summary.includes("x dado")) {
    return `Tira ${amount} dado${amount === 1 ? "" : "s"}.`;
  }
  return `Usa X = ${amount} y resuelve el texto oficial del hechizo.`;
}

function getMagicPegOptions(currentMagic) {
  return Array.from({ length: Math.max(0, Number(currentMagic) || 0) }, (_, index) => index + 1);
}

function getStatusMeta(effectId) {
  return STATUS_EFFECTS.find(effect => effect.id === effectId) || null;
}

function removeFirstStatusEffect(effects, effectId) {
  const source = Array.isArray(effects) ? effects : [];
  const index = source.indexOf(effectId);
  if (index === -1) return [...source];
  const next = [...source];
  next.splice(index, 1);
  return next;
}

function applyMissionRestToAdventurer(adv, options = {}) {
  const normalized = normalizeAdventurer(adv);
  const recoverTrack = options.recoverTrack || "none";
  const removeStatus = options.removeStatus || null;
  let statusEffects = [...(normalized.status_effects || [])];
  statusEffects = removeFirstStatusEffect(statusEffects, "fatigued");
  statusEffects = removeFirstStatusEffect(statusEffects, "prone");
  if (removeStatus) {
    statusEffects = removeFirstStatusEffect(statusEffects, removeStatus);
  }
  return normalizeAdventurer({
    ...normalized,
    magia_actual: Math.min(normalized.magia_max, normalized.magia_actual + 2),
    salud_actual: recoverTrack === "health" ? Math.min(normalized.salud_max, normalized.salud_actual + 1) : normalized.salud_actual,
    habilidad_actual: recoverTrack === "skill" ? Math.min(normalized.habilidad_max, normalized.habilidad_actual + 1) : normalized.habilidad_actual,
    status_effects: statusEffects,
  });
}

function getCombatEquipmentNames(items, mode) {
  return (items || [])
    .filter(item => {
      const attrs = new Set(item?.attributes || []);
      if (mode === "melee") {
        return item?.meleeDice > 0 || attrs.has("melee") || attrs.has("forceful_melee") || attrs.has("quickstrike") || attrs.has("parry") || attrs.has("reach");
      }
      if (mode === "ranged") {
        return item?.rangedDice > 0 || (item?.range || []).length > 0 || attrs.has("ammo_arrow") || attrs.has("ammo_bullet") || attrs.has("blast") || attrs.has("trap_melee");
      }
      if (mode === "shield") {
        return item?.shield > 0 || attrs.has("shield") || attrs.has("shield_block");
      }
      if (mode === "armor") {
        return item?.armor > 0 || attrs.has("armour") || attrs.has("armored") || attrs.has("magical_armour") || attrs.has("magical_armour_1") || attrs.has("magical_armour_2");
      }
      return false;
    })
    .map(item => item.name)
    .filter(Boolean);
}

function formatCombatStatLine(label, value, fallback, names) {
  if (value > 0) return `${label}: ${value}`;
  if (Array.isArray(names) && names.length > 0) {
    return `${label}: ${names.join(", ")} equipada`;
  }
  return `${label}: ${fallback}`;
}

function getUniqueCraftedNames(adventurers, missionState) {
  const names = new Set();
  (adventurers || []).forEach(adv => {
    normalizeAdventurer(adv).inventario.forEach(item => {
      if (item?.name) names.add(String(item.name).toLowerCase());
    });
  });
  (missionState?.crafted_items || []).forEach(item => {
    if (item?.name) names.add(String(item.name).toLowerCase());
  });
  return names;
}

function getRepairCost(item) {
  const rarity = String(item?.rarity || "").toLowerCase();
  if (rarity === "common") return 1;
  if (rarity === "uncommon") return 3;
  if (rarity === "rare") return 5;
  return null;
}

function makeOwnedItemKey(adventurerId, itemId) {
  return `${adventurerId}::${itemId}`;
}

function makeRepairKey(adventurerId, itemId) {
  return makeOwnedItemKey(adventurerId, itemId);
}

const COMBAT_ATTRIBUTE_GROUPS = {
  melee: new Set(["melee", "forceful_melee", "quickstrike", "first_strike", "reach", "sharp", "piercing", "balanced", "cleave", "burning", "entangling", "vicious"]),
  ranged: new Set(["ammo_arrow", "ammo_bullet", "range_plus_1", "sharp", "piercing", "balanced", "burning", "blast", "vicious", "channel"]),
  defense: new Set(["parry", "shield_block", "armour", "defensive_re_roll", "camouflage", "magical_armour", "magical_armour_1", "magical_armour_2", "retaliation"]),
};

function getCombatAttributeEntries(items, mode) {
  const allowed = COMBAT_ATTRIBUTE_GROUPS[mode] || new Set();
  const seen = new Set();
  const entries = [];
  (items || []).forEach(item => {
    (item?.attributes || []).forEach(attr => {
      if (!allowed.has(attr)) return;
      const meta = getAttributeEntry(attr);
      const label = meta?.label || titleCaseToken(attr);
      const key = label.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      entries.push({
        label,
        summary: meta?.summary || "Detalle pendiente.",
        source: item?.name || "Equipo",
      });
    });
  });
  return entries;
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

async function loadCraftingCatalog() {
  if (craftingCatalogCache) return craftingCatalogCache;
  if (craftingCatalogPromise) return craftingCatalogPromise;
  craftingCatalogPromise = fetch("/crafting-data.json")
    .then(async response => {
      if (!response.ok) throw new Error("No se pudo cargar crafting-data.json");
      return response.json();
    })
    .then(data => {
      craftingCatalogCache = Array.isArray(data) ? data : [];
      return craftingCatalogCache;
    })
    .finally(() => {
      craftingCatalogPromise = null;
    });
  return craftingCatalogPromise;
}

// ========== COMPONENTS ==========

// --- PEG BAR ---
function PegBar({ label, icon, current, max, color, onChange }) {
  const displayMax = Math.max(Number(max) || 0, Number(current) || 0);
  const pegs = [];
  for (let i = 0; i < displayMax; i++) {
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
        <span style={{ color: "#d4b896", fontSize: 13, fontWeight: 600 }}>{label}</span>
        <span style={{ color: "#9ca3af", fontSize: 12, marginLeft: "auto" }}>{current}/{max}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>{pegs}</div>
    </div>
  );
}

function BottomNavIcon({ id, active }) {
  const color = active ? "#d4b896" : "#6b7280";
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

  if (id === "hub") {
    return (
      <svg {...common}>
        <path d="M3 11.5L12 4l9 7.5" />
        <path d="M6 10.5V20h12v-9.5" />
        <path d="M10 20v-5h4v5" />
      </svg>
    );
  }

  if (id === "adventurers") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="2.5" />
        <circle cx="16.5" cy="9" r="2" />
        <path d="M4.5 18c.8-2.5 2.7-4 4.5-4s3.7 1.5 4.5 4" />
        <path d="M13.5 18c.5-1.8 1.8-3 3.4-3 1.2 0 2.4.7 3.1 2" />
      </svg>
    );
  }

  if (id === "board") {
    return (
      <svg {...common}>
        <path d="M12 3v18" />
        <path d="M8.5 6.5L12 3l3.5 3.5" />
        <path d="M8.5 17.5L12 21l3.5-3.5" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (id === "registry") {
    return (
      <svg {...common}>
        <path d="M7 4.5h8l3 3V19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1z" />
        <path d="M15 4.5V8h3" />
        <path d="M9 12h6" />
        <path d="M9 15.5h6" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M8 8l8 8" />
      <path d="M16 8l-8 8" />
      <path d="M5 4h6" />
      <path d="M5 20h6" />
      <path d="M19 6v12" />
    </svg>
  );
}

function PhaseIcon({ id }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "#d4b896", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

  if (id === "dread") {
    return (
      <svg {...common}>
        <path d="M13 2L5 14h5l-1 8 8-12h-5l1-8z" />
      </svg>
    );
  }

  if (id === "adventurers") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="2.5" />
        <circle cx="16.5" cy="9" r="2" />
        <path d="M4.5 18c.8-2.5 2.7-4 4.5-4s3.7 1.5 4.5 4" />
        <path d="M13.5 18c.5-1.8 1.8-3 3.4-3 1.2 0 2.4.7 3.1 2" />
      </svg>
    );
  }

  if (id === "adversary") {
    return (
      <svg {...common}>
        <path d="M8 6l2-2 2 2 2-2 2 2" />
        <path d="M7 10c0-2.2 2.2-4 5-4s5 1.8 5 4v5c0 2.2-2.2 4-5 4s-5-1.8-5-4v-5z" />
        <path d="M10 13h.01" />
        <path d="M14 13h.01" />
        <path d="M10 17c.8.7 1.6 1 2 1s1.2-.3 2-1" />
      </svg>
    );
  }

  if (id === "npc") {
    return (
      <svg {...common}>
        <circle cx="12" cy="7.5" r="2.5" />
        <path d="M7.5 20c.7-3 2.4-5 4.5-5s3.8 2 4.5 5" />
        <path d="M5 11l2 1" />
        <path d="M19 11l-2 1" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M6 4.5h12" />
      <path d="M6 9h12" />
      <path d="M6 13.5h8" />
      <path d="M6 18h6" />
      <path d="M17 16l1.5 1.5L21 14" />
    </svg>
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
              {count > 1 && <span style={{fontWeight:700}}>x{count}</span>}
            </button>
            {active && (
              <button onClick={() => { const i = effects.indexOf(se.id); if(i>-1){const n=[...effects];n.splice(i,1);onChange(n);} }}
                style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #ef4444",
                  background: "transparent", color: "#ef4444", fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- THREAT TRACKER ---
function ThreatTracker({ level, cara, onLevelChange, magicLevels }) {
  const bands = THREAT_BANDS[cara] || THREAT_BANDS.A;
  const magicSet = new Set((magicLevels || []).map(value => Number(value)));
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
              background: "#1e293b", color: "#d4b896", fontSize: 20, cursor: "pointer" }}>-</button>
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
            const filled = slotIdx < level;
            const isMagic = magicSet.has(slotIdx + 1) && filled;
            slots.push(
              <div key={s} style={{ flex: 1, height: "100%", borderRadius: 3,
                background: filled ? (isMagic ? "#3b82f6" : band.color) : band.color + "22",
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
        Cara {cara} | {level}/{totalSlots} clavijas
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
              <PhaseIcon id={phase.id} />
              <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 700 }}>{phase.name}</span>
              {allDone && <span style={{ color: "#22c55e", fontSize: 18 }}>OK</span>}
              <span style={{ color: "#d4b896", fontSize: 12, transform: isOpen ? "rotate(180deg)" : "", transition: "0.2s" }}>⌄</span>
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
                        color: "#22c55e", fontSize: 14 }}>{done ? "OK" : ""}</div>
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
        <span style={{ fontSize: 12, transform: open ? "rotate(180deg)" : "", transition: "0.2s" }}>v</span>
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
    stowed: false,
    broken: false,
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
        stowed: false,
        broken: false,
      });
  };

  return (
    <Collapsible title="Inventario y Equipo" icon="INV">
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
    stowed: false,
    broken: false,
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

  const patchItem = (id, updates) => {
    onUpdate({
      ...adv,
      inventario: normalizeAdventurer(adv).inventario.map(item => item.id === id ? normalizeInventoryItem({ ...item, ...updates }) : item),
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
      stowed: false,
      broken: false,
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

      <div style={{ background: "#111827", border: "1px solid #2d2d44", borderRadius: 10, padding: 10, marginBottom: 12 }}>
        <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Agregar desde catalogo oficial</div>
        <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 10 }}>
          Busca por nombre, fuente o atributo. Al agregarlo podras ajustar despues los valores de combate si hace falta, marcarlo roto o guardarlo si no lo llevas activo.
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
            const markBroken = () => {
              if (item.broken) return;
              patchItem(item.id, {
                broken: true,
                equipped: false,
              });
            };
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

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {item.broken && <span style={{ fontSize: 11, color: "#fca5a5", padding: "2px 8px", borderRadius: 999, border: "1px solid #7f1d1d" }}>Roto</span>}
                {isWeaponItem(item) && !item.broken && <span style={{ fontSize: 11, color: "#fde68a", padding: "2px 8px", borderRadius: 999, border: "1px solid #92400e" }}>Arma equipada</span>}
                {!isWeaponItem(item) && item.equipped && <span style={{ fontSize: 11, color: "#bbf7d0", padding: "2px 8px", borderRadius: 999, border: "1px solid #166534" }}>Equipado</span>}
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
                    background: "#92400e22", color: item.broken ? "#9ca3af" : "#fde68a",
                    fontSize: 12, fontWeight: 700, opacity: item.broken ? 0.6 : 1 }}>
                    {item.broken ? "Arma rota: fuera de combate" : "Arma siempre equipada"}
                  </span>
                ) : (
                  <button onClick={() => updateItem(item.id, "equipped", !item.equipped)}
                    disabled={item.broken}
                    style={{ padding: "8px 10px", borderRadius: 999, border: item.equipped ? "1px solid #22c55e" : "1px solid #374151",
                      background: item.equipped ? "#16653422" : "transparent", color: item.equipped ? "#bbf7d0" : "#9ca3af",
                      fontSize: 12, fontWeight: 700, cursor: item.broken ? "default" : "pointer", opacity: item.broken ? 0.5 : 1 }}>
                    {item.equipped ? "Equipado" : "No equipado"}
                  </button>
                )}
                <button onClick={() => updateItem(item.id, "magic", !item.magic)}
                  style={{ padding: "8px 10px", borderRadius: 999, border: item.magic ? "1px solid #3b82f6" : "1px solid #374151",
                    background: item.magic ? "#1d4ed822" : "transparent", color: item.magic ? "#bfdbfe" : "#9ca3af",
                    fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {item.magic ? "Magico" : "No magico"}
                </button>
                <button onClick={markBroken} disabled={item.broken}
                  style={{ padding: "8px 10px", borderRadius: 999, border: item.broken ? "1px solid #7f1d1d" : "1px solid #374151",
                    background: item.broken ? "#7f1d1d22" : "transparent", color: item.broken ? "#fca5a5" : "#9ca3af",
                    fontSize: 12, fontWeight: 700, cursor: item.broken ? "default" : "pointer", opacity: item.broken ? 0.75 : 1 }}>
                  {item.broken ? "Roto: reparar post mision" : "Marcar roto"}
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
    <Collapsible title="Libro de Hechizos" icon="MAG" defaultOpen>
      <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 10 }}>
        Cada hechizo aprendido gasta 1 PX. El nivel maximo del hechizo es tu rango actual.
      </div>
      <div style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 10 }}>
        Rango actual: {rank} | PX libre: {remainingXP}
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

function CombatAbilitiesModal({ adv, missionState, onUpdateMission, onCastMagic, onClose }) {
  const normalized = normalizeAdventurer(adv);
  const [filter, setFilter] = useState("all");
  const learnedSkills = getLearnedSkills(normalized);
  const spells = getKnownSpells(normalized);
  const magicPegOptions = getMagicPegOptions(normalized.magia_actual);
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
      spell,
    })),
    ...learnedSkills.map((skill, index) => ({
      id: "skill_" + slugKey(skill.name) + "_" + index,
      name: skill.name,
      level: skill.level,
      source: skill.source,
      summary: skill.summary,
      tags: skill.tags || [],
      accent: "#d4b896",
      meta: skill.tags?.length ? skill.tags.join(" | ") : skill.source,
      magic: (skill.tags || []).includes("magic") || (skill.tags || []).includes("spell"),
      spell: null,
    })),
  ];

  const visible = entries.filter(entry => filter === "all" || (entry.tags || []).includes(filter));

  const markFirstMagicUse = () => {
    if (!missionState || missionState.magia_usada_esta_ronda) return;
    onUpdateMission(addMagicThreatToMission(missionState));
  };

  const castSpellFromAbilities = (spell, pegs) => {
    if (!spell || typeof onCastMagic !== "function") return;
    onCastMagic({
      adventurerId: normalized.id,
      adventurerName: normalized.nombre,
      spell: {
        name: spell.name,
        level: spell.level,
        summary: spell.summary || spell.notes || "",
      },
      pegs,
    });
    onClose();
  };

  return (
    <ModalSheet title="Habilidades" subtitle={normalized.nombre + (normalized.clase ? " | " + normalized.clase : "")} onClose={onClose}>
      {normalized.magia_max > 0 && (
        <div style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 12, marginBottom: 12 }}>
          <div style={{ color: "#93c5fd", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
            MP actual {normalized.magia_actual}/{normalized.magia_max}
          </div>
          <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5, marginBottom: !missionState?.magia_usada_esta_ronda ? 8 : 0 }}>
            Si lanzas un hechizo desde aqui, se descontaran las clavijas automaticamente y se abrira el resultado del dado magico.
          </div>
          {!missionState?.magia_usada_esta_ronda && (
            <button onClick={markFirstMagicUse}
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #3b82f6", background: "#3b82f622", color: "#dbeafe", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Marcar primer uso de magia (+1 Amenaza)
            </button>
          )}
        </div>
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

              {entry.source === "Hechizo" && (
                <div style={{ marginTop: 10, background: "#111827", borderRadius: 8, border: "1px solid #1f2937", padding: 10 }}>
                  <div style={{ color: "#93c5fd", fontSize: 11, marginBottom: 8 }}>
                    {normalized.magia_actual > 0 ? "Elige cuantas clavijas gastar para lanzarlo." : "Sin clavijas de Magia disponibles."}
                  </div>
                  {magicPegOptions.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {magicPegOptions.map(value => (
                        <button key={value} onClick={() => castSpellFromAbilities(entry.spell, value)}
                          style={{ padding: "8px 10px", borderRadius: 999, border: "1px solid #3b82f6", background: "#1d4ed822", color: "#dbeafe", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          Usar {value}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: "#6b7280", fontSize: 13 }}>No hay entradas para este filtro.</div>
      )}
    </ModalSheet>
  );
}

function CombatQuickReferenceModal({ adv, missionState, onCastMagic, onApplyAdventurerUpdate, startMode, onClose }) {
  const normalized = normalizeAdventurer(adv);
  const equippedItems = summarizeEquippedItems(normalized);
  const equipment = getEquipmentStats(normalized);
  const shieldNames = getCombatEquipmentNames(equippedItems, "shield");
  const armorNames = getCombatEquipmentNames(equippedItems, "armor");
  const meleeWeapons = getCombatWeaponOptions(normalized, "melee");
  const rangedWeapons = getCombatWeaponOptions(normalized, "ranged");
  const spells = getCombatSpellEntries(normalized).slice(0, 8);
  const defenseSkills = getCombatSkillEntries(normalized, ["defense", "reaction"]).slice(0, 5);
  const defenseAttributeEntries = getCombatAttributeEntries(equippedItems, "defense");
  const activeStatuses = [...new Set(normalized.status_effects || [])].map(getStatusMeta).filter(Boolean);
  const frenzyEntry = getLearnedSkills(normalized).find(skill => skill.name === "Frenzy") || null;
  const canUseFrenzy = !!frenzyEntry && normalized.habilidad_actual > 0;
  const availableAttackModes = [
    { id: "melee", label: "Ataque C/C", enabled: true },
    { id: "ranged", label: "Ataque Dist", enabled: rangedWeapons.length > 0 || equipment.rangedDice > 0 },
    { id: "magic", label: "Magia", enabled: spells.length > 0 && normalized.magia_actual > 0 },
  ].filter(option => option.enabled);
  const defaultAttackMode = availableAttackModes[0]?.id || "melee";
  const forcedAttackMode = ["melee", "ranged", "magic"].includes(startMode) ? startMode : null;
  const [mode, setMode] = useState(startMode === "defense" ? "defense" : (forcedAttackMode && availableAttackModes.some(option => option.id === forcedAttackMode) ? forcedAttackMode : defaultAttackMode));
  const [selectedMeleeId, setSelectedMeleeId] = useState(meleeWeapons[0]?.id || null);
  const [selectedRangedId, setSelectedRangedId] = useState(rangedWeapons[0]?.id || null);
  const [selectedSpellId, setSelectedSpellId] = useState(spells[0]?.name || null);
  const [selectedMagicPegs, setSelectedMagicPegs] = useState(1);
  const [useFrenzy, setUseFrenzy] = useState(false);
  const [useForceful, setUseForceful] = useState(false);
  const sectionTitleStyle = { color: "#9ca3af", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 };
  const cardStyle = { background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 12 };
  const selectedMelee = meleeWeapons.find(item => item.id === selectedMeleeId) || meleeWeapons[0] || null;
  const selectedRanged = rangedWeapons.find(item => item.id === selectedRangedId) || rangedWeapons[0] || null;
  const selectedSpell = spells.find(spell => spell.name === selectedSpellId) || spells[0] || null;
  const magicPegOptions = getMagicPegOptions(normalized.magia_actual);
  const frenzyBonus = useFrenzy ? getFrenzyBonusDice(frenzyEntry?.level || 0) : 0;
  const meleeDiceTotal = (selectedMelee?.dice || equipment.meleeDice || 0) + frenzyBonus;

  useEffect(() => {
    if (startMode === "defense") {
      setMode("defense");
      return;
    }
    if (forcedAttackMode && availableAttackModes.some(option => option.id === forcedAttackMode)) {
      setMode(forcedAttackMode);
      return;
    }
    if (mode === "defense" || !availableAttackModes.some(option => option.id === mode)) {
      setMode(defaultAttackMode);
    }
  }, [availableAttackModes, defaultAttackMode, forcedAttackMode, mode, startMode]);

  useEffect(() => {
    if (meleeWeapons.length && !meleeWeapons.some(item => item.id === selectedMeleeId)) {
      setSelectedMeleeId(meleeWeapons[0].id);
    }
  }, [meleeWeapons, selectedMeleeId]);

  useEffect(() => {
    if (rangedWeapons.length && !rangedWeapons.some(item => item.id === selectedRangedId)) {
      setSelectedRangedId(rangedWeapons[0].id);
    }
  }, [rangedWeapons, selectedRangedId]);

  useEffect(() => {
    if (spells.length && !spells.some(spell => spell.name === selectedSpellId)) {
      setSelectedSpellId(spells[0].name);
    }
  }, [selectedSpellId, spells]);

  useEffect(() => {
    if (!magicPegOptions.length) {
      setSelectedMagicPegs(1);
      return;
    }
    if (!magicPegOptions.includes(selectedMagicPegs)) {
      setSelectedMagicPegs(magicPegOptions[0]);
    }
  }, [magicPegOptions, selectedMagicPegs]);

  useEffect(() => {
    if (!canUseFrenzy) setUseFrenzy(false);
  }, [canUseFrenzy]);

  useEffect(() => {
    if (!selectedMelee?.rawAttributes?.includes("forceful_melee")) {
      setUseForceful(false);
    }
  }, [selectedMelee]);

  const applyPhysicalAttack = () => {
    if (useFrenzy && typeof onApplyAdventurerUpdate === "function") {
      onApplyAdventurerUpdate(applyAdventurerResourceSpend(normalized, { skill: 1 }));
    }
    onClose();
  };

  const castSelectedSpell = () => {
    if (!selectedSpell || !selectedMagicPegs || typeof onCastMagic !== "function") return;
    onCastMagic({
      adventurerId: normalized.id,
      adventurerName: normalized.nombre,
      spell: selectedSpell,
      pegs: selectedMagicPegs,
    });
    onClose();
  };

  const renderTagList = (entries, tone = "neutral") => {
    if (!entries || entries.length === 0) return null;
    const styleMap = {
      neutral: { color: "#d4b896", border: "#374151" },
      attack: { color: "#fde68a", border: "#92400e" },
      defense: { color: "#bfdbfe", border: "#1d4ed8" },
    };
    const style = styleMap[tone] || styleMap.neutral;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {entries.map((entry, index) => (
          <span key={(entry.id || entry.label || entry.name) + "_" + index}
            title={entry.summary || ""}
            style={{ fontSize: 11, color: style.color, padding: "4px 8px", borderRadius: 999, border: `1px solid ${style.border}`, background: "#111827" }}>
            {entry.label || entry.name}
          </span>
        ))}
      </div>
    );
  };

  const modalTitle = mode === "defense"
    ? "Defensa"
    : mode === "ranged"
      ? "Ataque Dist"
      : mode === "magic"
        ? "Magia"
        : "Ataque C/C";

  return (
    <ModalSheet title={modalTitle} subtitle={normalized.nombre + (normalized.clase ? " | " + normalized.clase : "")} onClose={onClose}>
      <div style={{ ...cardStyle, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#22c55e", padding: "4px 8px", borderRadius: 999, border: "1px solid #166534" }}>HP {normalized.salud_actual}/{normalized.salud_max}</span>
          <span style={{ fontSize: 11, color: "#d946ef", padding: "4px 8px", borderRadius: 999, border: "1px solid #86198f" }}>SP {normalized.habilidad_actual}/{normalized.habilidad_max}</span>
          <span style={{ fontSize: 11, color: "#60a5fa", padding: "4px 8px", borderRadius: 999, border: "1px solid #1d4ed8" }}>MP {normalized.magia_actual}/{normalized.magia_max}</span>
        </div>
        {activeStatuses.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ color: "#6b7280", fontSize: 10, marginBottom: 4 }}>Estados activos</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {activeStatuses.map(status => (
                <span key={status.id} style={{ fontSize: 11, color: status.color, padding: "4px 8px", borderRadius: 999, border: `1px solid ${status.color}55`, background: "#111827" }}>
                  {status.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {mode !== "defense" && !forcedAttackMode && availableAttackModes.length > 1 && (
        <div style={{ marginBottom: 12 }}>
          <div style={sectionTitleStyle}>Tipo de ataque</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {availableAttackModes.map(option => (
              <button key={option.id} onClick={() => setMode(option.id)}
                style={{ padding: "8px 12px", borderRadius: 999, border: mode === option.id ? "1px solid #eab308" : "1px solid #374151", background: mode === option.id ? "#eab30822" : "#111827", color: mode === option.id ? "#fde68a" : "#9ca3af", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === "melee" && (
        <>
          <div style={{ marginBottom: 12 }}>
            <div style={sectionTitleStyle}>Arma cuerpo a cuerpo</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {meleeWeapons.length > 0 ? meleeWeapons.map(item => (
                <button key={item.id} onClick={() => setSelectedMeleeId(item.id)}
                  style={{ ...cardStyle, textAlign: "left", cursor: "pointer", border: selectedMelee?.id === item.id ? "1px solid #eab308" : "1px solid #2d2d44" }}>
                  <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ color: "#9ca3af", fontSize: 11 }}>
                    {item.dice > 0 ? `Tira ${item.dice} dado${item.dice === 1 ? "" : "s"}.` : "Usa el perfil de la carta del arma."}
                  </div>
                </button>
              )) : (
                <div style={cardStyle}>
                  <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Combate sin armas</div>
                  <div style={{ color: "#9ca3af", fontSize: 11 }}>No hay arma melee cargada. Usa el perfil oficial que corresponda.</div>
                </div>
              )}
            </div>
          </div>

          {selectedMelee && (
            <div style={{ ...cardStyle, marginBottom: 12 }}>
              <div style={{ color: "#d4b896", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{selectedMelee.name}</div>
              <div style={{ color: "#fde68a", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                {selectedMelee.dice > 0 ? `Tira ${selectedMelee.dice} dado${selectedMelee.dice === 1 ? "" : "s"} base.` : "Usa el perfil de la carta del arma."}
              </div>
              {!!selectedMelee.summary && <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>{selectedMelee.summary}</div>}
              {renderTagList(selectedMelee.attributes, "attack")}
            </div>
          )}

          {(selectedMelee?.rawAttributes?.includes("forceful_melee") || frenzyEntry) && (
            <div style={{ marginBottom: 12 }}>
              <div style={sectionTitleStyle}>Opciones de ataque</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedMelee?.rawAttributes?.includes("forceful_melee") && (
                  <button onClick={() => setUseForceful(prev => !prev)}
                    style={{ ...cardStyle, cursor: "pointer", textAlign: "left", border: useForceful ? "1px solid #eab308" : "1px solid #2d2d44" }}>
                    <div style={{ color: useForceful ? "#fde68a" : "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Potenciar</div>
                    <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>
                      {useForceful ? "Marcado. Aplica el efecto exacto de Forceful segun la carta del arma." : "Disponible en esta arma. Marcalo aqui si quieres recordarlo al resolver el ataque."}
                    </div>
                  </button>
                )}
                {frenzyEntry && (
                  <button onClick={() => canUseFrenzy && setUseFrenzy(prev => !prev)} disabled={!canUseFrenzy}
                    style={{ ...cardStyle, cursor: canUseFrenzy ? "pointer" : "default", textAlign: "left", opacity: canUseFrenzy ? 1 : 0.5, border: useFrenzy ? "1px solid #d946ef" : "1px solid #2d2d44" }}>
                    <div style={{ color: useFrenzy ? "#f5d0fe" : "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      Frenzy {frenzyEntry.level ? `| Nivel ${frenzyEntry.level}` : ""}
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>
                      {canUseFrenzy ? `Anade ${getFrenzyBonusDice(frenzyEntry.level)} dado${getFrenzyBonusDice(frenzyEntry.level) === 1 ? "" : "s"} y descuenta 1 SP al confirmar.` : "No hay SP disponible para activar Frenzy ahora."}
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          <div style={{ ...cardStyle, marginBottom: 12 }}>
            <div style={{ color: "#6b7280", fontSize: 10, marginBottom: 4 }}>Resumen</div>
            <div style={{ color: "#d4b896", fontSize: 13, lineHeight: 1.6 }}>
              {selectedMelee ? (selectedMelee.dice > 0 ? `Dados a tirar: ${meleeDiceTotal}` : "Dados: usa la carta del arma.") : "Sin arma melee seleccionada."}
            </div>
            {useFrenzy && <div style={{ color: "#d946ef", fontSize: 11, marginTop: 6 }}>Al confirmar se descontara 1 SP.</div>}
            {useForceful && <div style={{ color: "#fde68a", fontSize: 11, marginTop: 6 }}>Potenciar queda marcado como recordatorio.</div>}
          </div>

          <button onClick={applyPhysicalAttack}
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #92400e", background: "#92400e22", color: "#fde68a", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Atacar
          </button>
        </>
      )}

      {mode === "ranged" && (
        <>
          <div style={{ marginBottom: 12 }}>
            <div style={sectionTitleStyle}>Arma a distancia</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {rangedWeapons.length > 0 ? rangedWeapons.map(item => (
                <button key={item.id} onClick={() => setSelectedRangedId(item.id)}
                  style={{ ...cardStyle, textAlign: "left", cursor: "pointer", border: selectedRanged?.id === item.id ? "1px solid #eab308" : "1px solid #2d2d44" }}>
                  <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ color: "#9ca3af", fontSize: 11 }}>
                    {item.dice > 0 ? `Tira ${item.dice} dado${item.dice === 1 ? "" : "s"}.` : "Usa el perfil de la carta del arma."}
                    {item.range.length > 0 ? ` Alcance ${item.range.join("/")}.` : ""}
                  </div>
                </button>
              )) : (
                <div style={cardStyle}>
                  <div style={{ color: "#9ca3af", fontSize: 11 }}>No hay arma a distancia cargada en la ficha.</div>
                </div>
              )}
            </div>
          </div>

          {selectedRanged && (
            <div style={{ ...cardStyle, marginBottom: 12 }}>
              <div style={{ color: "#d4b896", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{selectedRanged.name}</div>
              <div style={{ color: "#fca5a5", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                {selectedRanged.dice > 0 ? `Tira ${selectedRanged.dice} dado${selectedRanged.dice === 1 ? "" : "s"}.` : "Usa el perfil de la carta del arma."}
              </div>
              {selectedRanged.range.length > 0 && <div style={{ color: "#d4b896", fontSize: 12, marginBottom: 6 }}>Alcance: {selectedRanged.range.join("/")}</div>}
              {!!selectedRanged.summary && <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>{selectedRanged.summary}</div>}
              {renderTagList(selectedRanged.attributes, "attack")}
            </div>
          )}

          <button onClick={applyPhysicalAttack}
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #7f1d1d", background: "#7f1d1d22", color: "#fca5a5", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Atacar
          </button>
        </>
      )}

      {mode === "magic" && (
        <>
          <div style={{ marginBottom: 12 }}>
            <div style={sectionTitleStyle}>Hechizo</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {spells.map((spell, index) => (
                <button key={spell.name + "_" + index} onClick={() => setSelectedSpellId(spell.name)}
                  style={{ ...cardStyle, textAlign: "left", cursor: "pointer", border: selectedSpell?.name === spell.name ? "1px solid #3b82f6" : "1px solid #2d2d44" }}>
                  <div style={{ color: "#93c5fd", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{spell.name} | Nivel {spell.level}</div>
                  <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>{spell.summary}</div>
                </button>
              ))}
            </div>
          </div>

          {selectedSpell && (
            <div style={{ ...cardStyle, marginBottom: 12 }}>
              <div style={{ color: "#93c5fd", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{selectedSpell.name}</div>
              <div style={{ color: "#9ca3af", fontSize: 11, marginBottom: 6 }}>Clavijas de Magia a gastar</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {magicPegOptions.map(value => (
                  <button key={value} onClick={() => setSelectedMagicPegs(value)}
                    style={{ padding: "6px 10px", borderRadius: 999, border: selectedMagicPegs === value ? "1px solid #3b82f6" : "1px solid #374151", background: selectedMagicPegs === value ? "#1d4ed822" : "#0f172a", color: selectedMagicPegs === value ? "#dbeafe" : "#9ca3af", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    {value}
                  </button>
                ))}
              </div>
              <div style={{ color: "#d4b896", fontSize: 12, lineHeight: 1.6, marginBottom: 6 }}>
                {getSpellCastingPreview(selectedSpell, selectedMagicPegs)}
              </div>
              <div style={{ color: missionState?.magia_usada_esta_ronda ? "#93c5fd" : "#60a5fa", fontSize: 11, lineHeight: 1.5 }}>
                {missionState?.magia_usada_esta_ronda ? "La Amenaza azul de esta ronda ya esta marcada." : "Si es la primera magia de la ronda, al confirmar se marcara automaticamente +1 Amenaza azul."}
              </div>
            </div>
          )}

          <button onClick={castSelectedSpell} disabled={!selectedSpell || !selectedMagicPegs}
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #1d4ed8", background: selectedSpell ? "#1d4ed822" : "#111827", color: selectedSpell ? "#dbeafe" : "#6b7280", fontSize: 12, fontWeight: 700, cursor: selectedSpell ? "pointer" : "default" }}>
            Atacar con magia
          </button>
        </>
      )}

      {mode === "defense" && (
        <>
          <div style={{ ...cardStyle, marginBottom: 12 }}>
            <div style={{ color: "#d4b896", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Defensa actual</div>
            <div style={{ color: "#d4b896", fontSize: 13, lineHeight: 1.6 }}>
              {formatCombatStatLine("Escudo", equipment.shield, "Sin escudo adicional", shieldNames)}
              <br />
              {formatCombatStatLine("Prot", equipment.armor, "Sin proteccion adicional")}
              <br />
              {armorNames.length > 0 ? `Armadura: ${armorNames.join(", ")}` : "Armadura: sin armadura adicional"}
            </div>
            {renderTagList(defenseAttributeEntries, "defense")}
          </div>

          {defenseSkills.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={sectionTitleStyle}>Reacciones y skills</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {defenseSkills.map((skill, index) => (
                  <div key={skill.name + "_" + index} style={cardStyle}>
                    <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{skill.name} | Nivel {skill.level}</div>
                    <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>{skill.summary}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </ModalSheet>
  );
}

function MagicResultModal({ state, adventurers, onApplyResult, onClose }) {
  const [result, setResult] = useState(null);
  const [appliedRecovery, setAppliedRecovery] = useState(false);
  const [selectedNearbyIds, setSelectedNearbyIds] = useState([]);
  const [appliedNearbyMagic, setAppliedNearbyMagic] = useState(false);
  if (!state) return null;
  const nearbyCandidates = (adventurers || []).filter(adv => adv.id !== state.adventurerId).map(normalizeAdventurer);

  useEffect(() => {
    setResult(null);
    setAppliedRecovery(false);
    setSelectedNearbyIds([]);
    setAppliedNearbyMagic(false);
  }, [state?.adventurerId, state?.spell?.name, state?.pegs]);

  useEffect(() => {
    if (!state || result !== 3 || appliedRecovery || typeof onApplyResult !== "function") return;
    onApplyResult(3, state);
    setAppliedRecovery(true);
  }, [appliedRecovery, onApplyResult, result, state]);

  const toggleNearbyAdventurer = (adventurerId) => {
    setSelectedNearbyIds(prev => prev.includes(adventurerId)
      ? prev.filter(id => id !== adventurerId)
      : [...prev, adventurerId]);
  };

  const applyNearbyMagicResult = () => {
    if (typeof onApplyResult !== "function" || appliedNearbyMagic) return;
    onApplyResult(5, { ...state, nearbyAdventurerIds: selectedNearbyIds });
    setAppliedNearbyMagic(true);
  };

  return (
    <ModalSheet title="Resultado dado magico" subtitle={`${state.adventurerName} | ${state.spell?.name || "Hechizo"}`} onClose={onClose}>
      <div style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 12, marginBottom: 12 }}>
        <div style={{ color: "#93c5fd", fontSize: 12, marginBottom: 6 }}>{`Clavijas gastadas: ${state.pegs} MP`}</div>
        {typeof state.magia_antes === "number" && typeof state.magia_despues === "number" && (
          <div style={{ color: "#60a5fa", fontSize: 11, marginBottom: 6 }}>{`MP ${state.magia_antes} -> ${state.magia_despues}`}</div>
        )}
        <div style={{ color: "#fde68a", fontSize: 12, marginBottom: 6 }}>
          Resuelve el hechizo segun su texto oficial y aplica tambien este resultado del dado magico.
        </div>
        <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>{state.spell?.summary || "Sin resumen cargado."}</div>
      </div>
      <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
        Que salio en el dado magico?
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
        {[1,2,3,4,5,6].map(value => (
          <button key={value} onClick={() => setResult(value)}
            style={{ padding: 12, borderRadius: 10, border: result === value ? "1px solid #3b82f6" : "1px solid #374151", background: result === value ? "#1d4ed822" : "#111827", color: result === value ? "#dbeafe" : "#d4b896", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
            {value}
          </button>
        ))}
      </div>
      {result && (
        <div style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 12, marginBottom: 12 }}>
          <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{`Resultado ${result}`}</div>
          <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.6 }}>{MAGIC_DIE_OUTCOMES[result]}</div>
          {result === 3 && (
            <div style={{ color: "#93c5fd", fontSize: 11, marginTop: 8 }}>
              {appliedRecovery ? "Se ha aplicado +1 MP a la ficha del aventurero, hasta su maximo." : "Se aplicara +1 MP al aventurero."}
            </div>
          )}
          {result === 5 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ color: "#93c5fd", fontSize: 11, lineHeight: 1.5, marginBottom: 8 }}>
                El lanzador gana +1 MP siempre. Marca aqui que otros aventureros estan a 2 casillas para darles tambien +1 MP. Este resultado puede superar el maximo inicial.
              </div>
              {nearbyCandidates.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {nearbyCandidates.map(adv => {
                    const selected = selectedNearbyIds.includes(adv.id);
                    return (
                      <button key={adv.id} onClick={() => toggleNearbyAdventurer(adv.id)}
                        style={{ padding: "7px 10px", borderRadius: 999, border: selected ? "1px solid #3b82f6" : "1px solid #374151", background: selected ? "#1d4ed822" : "#111827", color: selected ? "#dbeafe" : "#d4b896", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                        {adv.nombre}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: "#6b7280", fontSize: 11, marginBottom: 8 }}>
                  No hay otros aventureros cargados para elegir.
                </div>
              )}
              <button onClick={applyNearbyMagicResult} disabled={appliedNearbyMagic}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: appliedNearbyMagic ? "1px solid #166534" : "1px solid #3b82f6", background: appliedNearbyMagic ? "#16653422" : "#1d4ed822", color: appliedNearbyMagic ? "#bbf7d0" : "#dbeafe", fontSize: 12, fontWeight: 700, cursor: appliedNearbyMagic ? "default" : "pointer" }}>
                {appliedNearbyMagic ? "Resultado 5 aplicado" : "Aplicar +1 MP al lanzador y cercanos"}
              </button>
            </div>
          )}
        </div>
      )}
      <button onClick={onClose}
        style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #374151", background: "#111827", color: "#d4b896", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
        Cerrar
      </button>
    </ModalSheet>
  );
}

function InventoryModal({ adv, onUpdateAdventurer, onClose }) {
  const normalized = normalizeAdventurer(adv);
  return (
    <ModalSheet
      title="Items encontrados"
      subtitle={normalized.nombre + (normalized.clase ? " | " + normalized.clase : "")}
      onClose={onClose}
    >
      <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>
        Aqui puedes anadir, equipar o ajustar los objetos del aventurero durante la mision sin salir del tablero.
      </div>
      <InventoryEditor adv={normalized} onUpdate={onUpdateAdventurer} />
    </ModalSheet>
  );
}

function MissionRestModal({ adv, onConfirm, onClose }) {
  const normalized = normalizeAdventurer(adv);
  const hasBurning = (normalized.status_effects || []).includes("burning");
  const healthMissing = normalized.salud_actual < normalized.salud_max;
  const skillMissing = normalized.habilidad_actual < normalized.habilidad_max;
  const canRemoveWounded = (normalized.status_effects || []).includes("wounded");
  const canRemovePoisoned = (normalized.status_effects || []).includes("poisoned");
  const [confirmActions, setConfirmActions] = useState(false);
  const [confirmSafety, setConfirmSafety] = useState(false);
  const [recoverTrack, setRecoverTrack] = useState(healthMissing ? "health" : (skillMissing ? "skill" : "none"));
  const [removeStatus, setRemoveStatus] = useState(canRemoveWounded ? "wounded" : (canRemovePoisoned ? "poisoned" : "none"));

  useEffect(() => {
    setConfirmActions(false);
    setConfirmSafety(false);
    setRecoverTrack(healthMissing ? "health" : (skillMissing ? "skill" : "none"));
    setRemoveStatus(canRemoveWounded ? "wounded" : (canRemovePoisoned ? "poisoned" : "none"));
  }, [adv?.id, canRemovePoisoned, canRemoveWounded, healthMissing, skillMissing]);

  const canApply = !hasBurning && confirmActions && confirmSafety;
  const preview = applyMissionRestToAdventurer(normalized, {
    recoverTrack,
    removeStatus: removeStatus === "none" ? null : removeStatus,
  });

  return (
    <ModalSheet title="Descansar en mision" subtitle={normalized.nombre + (normalized.clase ? " | " + normalized.clase : "")} onClose={onClose}>
      <div style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 12, marginBottom: 12 }}>
        <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Texto oficial resumido</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, color: "#9ca3af", fontSize: 12, lineHeight: 1.5 }}>
          <div>Requiere 2 acciones consecutivas en la misma ronda.</div>
          <div>Solo si no hay enemigos en la misma sala ni a corto alcance y con LdV.</div>
          <div>No puede hacerse si el aventurero esta Quemado.</div>
          <div>Restaura hasta 2 MP, recupera 1 Salud o 1 Habilidad, elimina Fatigado, elimina 1 Herido o Envenenado y le hace levantarse si estaba Derribado.</div>
        </div>
      </div>

      {hasBurning && (
        <div style={{ background: "#7f1d1d22", borderRadius: 10, border: "1px solid #7f1d1d", padding: 12, color: "#fca5a5", fontSize: 12, marginBottom: 12 }}>
          Este aventurero esta Quemado, asi que no puede Descansar segun el manual.
        </div>
      )}

      <div style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 12, marginBottom: 12 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "flex-start", color: "#d4b896", fontSize: 12, marginBottom: 10, cursor: hasBurning ? "default" : "pointer" }}>
          <input type="checkbox" checked={confirmActions} disabled={hasBurning} onChange={e => setConfirmActions(e.target.checked)} />
          <span>Confirmo que este aventurero gasta 2 acciones consecutivas para descansar.</span>
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "flex-start", color: "#d4b896", fontSize: 12, cursor: hasBurning ? "default" : "pointer" }}>
          <input type="checkbox" checked={confirmSafety} disabled={hasBurning} onChange={e => setConfirmSafety(e.target.checked)} />
          <span>Confirmo que no hay enemigos en la misma sala ni a corto alcance y con LdV.</span>
        </label>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Recuperar peg</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { id: "health", label: "Salud +1", disabled: !healthMissing },
            { id: "skill", label: "Habilidad +1", disabled: !skillMissing },
            { id: "none", label: "No recuperar", disabled: false },
          ].map(option => (
            <button key={option.id} onClick={() => setRecoverTrack(option.id)} disabled={option.disabled || hasBurning}
              style={{ padding: "8px 10px", borderRadius: 999, border: recoverTrack === option.id ? "1px solid #22c55e" : "1px solid #374151", background: recoverTrack === option.id ? "#14532d" : "#111827", color: option.disabled ? "#4b5563" : (recoverTrack === option.id ? "#bbf7d0" : "#d4b896"), fontSize: 12, cursor: option.disabled || hasBurning ? "default" : "pointer" }}>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Quitar estado</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { id: "wounded", label: "Herido", disabled: !canRemoveWounded },
            { id: "poisoned", label: "Envenenado", disabled: !canRemovePoisoned },
            { id: "none", label: "No quitar", disabled: false },
          ].map(option => (
            <button key={option.id} onClick={() => setRemoveStatus(option.id)} disabled={option.disabled || hasBurning}
              style={{ padding: "8px 10px", borderRadius: 999, border: removeStatus === option.id ? "1px solid #3b82f6" : "1px solid #374151", background: removeStatus === option.id ? "#1d4ed822" : "#111827", color: option.disabled ? "#4b5563" : (removeStatus === option.id ? "#dbeafe" : "#d4b896"), fontSize: 12, cursor: option.disabled || hasBurning ? "default" : "pointer" }}>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #2d2d44", padding: 12, marginBottom: 12 }}>
        <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Resultado en la ficha</div>
        <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.6 }}>
          {`MP ${normalized.magia_actual}/${normalized.magia_max} -> ${preview.magia_actual}/${preview.magia_max}`}
          <br />
          {`HP ${normalized.salud_actual}/${normalized.salud_max} -> ${preview.salud_actual}/${preview.salud_max}`}
          <br />
          {`SP ${normalized.habilidad_actual}/${normalized.habilidad_max} -> ${preview.habilidad_actual}/${preview.habilidad_max}`}
        </div>
      </div>

      <button onClick={() => canApply && onConfirm(preview)} disabled={!canApply}
        style={{ width: "100%", padding: 12, borderRadius: 8, border: canApply ? "1px solid #166534" : "1px solid #374151", background: canApply ? "#16653422" : "#111827", color: canApply ? "#bbf7d0" : "#6b7280", fontSize: 12, fontWeight: 700, cursor: canApply ? "pointer" : "default" }}>
        Aplicar descanso a la ficha
      </button>
    </ModalSheet>
  );
}

MainBoardV2 = function MainBoardV2Patched({ missionState, adventurers, campaign, onUpdateMission, onUpdateAdventurer, onEndMission, onBack }) {
  const mission = MISSIONS[missionState.mision_id];
  const mName = mission?.nombre || missionState.mision_id;
  const [activeCombatAdv, setActiveCombatAdv] = useState(null);
  const [activeCombatMode, setActiveCombatMode] = useState("melee");
  const [magicResultState, setMagicResultState] = useState(null);
  const [activeAbilityAdv, setActiveAbilityAdv] = useState(null);
  const [activeItemAdv, setActiveItemAdv] = useState(null);
  const [activeRestAdv, setActiveRestAdv] = useState(null);
  const patchMission = (updates) => onUpdateMission(normalizeMissionState({ ...missionState, ...updates }));

  const handleThreatChange = (newLevel) => {
    patchMission({ amenaza_nivel: newLevel, magic_threat_levels: trimMagicThreatLevels(newLevel, missionState.magic_threat_levels) });
  };

  const markMagicThreat = () => {
    onUpdateMission(addMagicThreatToMission(missionState));
  };

  const toggleStep = (phaseId, stepIdx) => {
    const key = `${phaseId}_${stepIdx}`;
    const nextDone = !missionState.steps_completados[key];
    const updates = {
      steps_completados: { ...missionState.steps_completados, [key]: nextDone }
    };
    if (phaseId === "dread" && stepIdx === 0) {
      updates.amenaza_nivel = Math.max(0, missionState.amenaza_nivel + (nextDone ? 1 : -1));
    }
    patchMission(updates);
  };

  const advanceRound = () => {
    patchMission({
      ronda: missionState.ronda + 1,
      magia_usada_esta_ronda: false,
      steps_completados: {},
    });
  };

  const selectedCombatAdv = adventurers.find(a => a.id === activeCombatAdv) || null;
  const selectedAbilityAdv = adventurers.find(a => a.id === activeAbilityAdv) || null;
  const selectedItemAdv = adventurers.find(a => a.id === activeItemAdv) || null;
  const selectedRestAdv = adventurers.find(a => a.id === activeRestAdv) || null;
  const handleCastMagic = (payload) => {
    if (!payload?.adventurerId) return;
    const adventurer = adventurers.find(entry => entry.id === payload.adventurerId);
    if (!adventurer) return;
    const normalized = normalizeAdventurer(adventurer);
    const pegs = Math.max(1, Math.min(Number(payload.pegs) || 1, normalized.magia_actual));
    const updatedAdventurer = applyAdventurerResourceSpend(normalized, { magic: pegs });
    onUpdateAdventurer(updatedAdventurer);
    if (!missionState.magia_usada_esta_ronda) {
      onUpdateMission(addMagicThreatToMission(missionState));
    }
    setMagicResultState({
      ...payload,
      pegs,
      magia_antes: normalized.magia_actual,
      magia_despues: updatedAdventurer.magia_actual,
    });
    setActiveCombatAdv(null);
    setActiveAbilityAdv(null);
  };
  const handleMagicResultApply = (result, payload) => {
    if (!payload?.adventurerId) return;
    if (result === 3) {
      const adventurer = adventurers.find(entry => entry.id === payload.adventurerId);
      if (!adventurer) return;
      const normalized = normalizeAdventurer(adventurer);
      const baseMagic = typeof payload.magia_despues === "number"
        ? Math.max(0, Math.min(normalized.magia_max, Number(payload.magia_despues) || 0))
        : normalized.magia_actual;
      if (baseMagic >= normalized.magia_max) return;
      onUpdateAdventurer({
        ...normalized,
        magia_actual: Math.min(normalized.magia_max, baseMagic + 1),
      });
      return;
    }
    if (result === 5) {
      const targetIds = Array.from(new Set([payload.adventurerId, ...(payload.nearbyAdventurerIds || [])]));
      targetIds.forEach(targetId => {
        const adventurer = adventurers.find(entry => entry.id === targetId);
        if (!adventurer) return;
        const normalized = normalizeAdventurer(adventurer);
        const nextMagic = targetId === payload.adventurerId && typeof payload.magia_despues === "number"
          ? Math.max(0, Number(payload.magia_despues) || 0) + 1
          : Math.max(0, Number(normalized.magia_actual) || 0) + 1;
        onUpdateAdventurer({
          ...normalized,
          magia_actual: nextMagic,
        });
      });
    }
  };
  const handleMissionRest = (updatedAdventurer) => {
    onUpdateAdventurer(updatedAdventurer);
    setActiveRestAdv(null);
  };

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

      <ThreatTracker level={missionState.amenaza_nivel} cara={missionState.amenaza_cara} onLevelChange={handleThreatChange} magicLevels={missionState.magic_threat_levels}/>
      <div style={{ color: "#6b7280", fontSize: 11, textAlign: "center", marginTop: 6, marginBottom: 2 }}>
        Registro de Amenaza en Lado {missionState.amenaza_cara} para esta mision
      </div>

      <button onClick={markMagicThreat} disabled={missionState.magia_usada_esta_ronda}
        style={{ width: "100%", padding: 10, borderRadius: 8, marginTop: 8, marginBottom: 12,
          border: missionState.magia_usada_esta_ronda ? "2px solid #3b82f6" : "1px solid #374151",
          background: missionState.magia_usada_esta_ronda ? "#3b82f622" : "#1a1a2e",
          color: missionState.magia_usada_esta_ronda ? "#60a5fa" : "#6b7280",
          fontSize: 13, cursor: missionState.magia_usada_esta_ronda ? "default" : "pointer", fontWeight: 600 }}>
        {missionState.magia_usada_esta_ronda ? "Magia ya marcada esta ronda (+1 Amenaza azul)" : "Marcar magia usada esta ronda (+1 Amenaza azul)"}
      </button>

      <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
          Objetivo de mision
        </div>
        <button onClick={() => patchMission({ primary_complete: !missionState.primary_complete })}
          style={{ width: "100%", display: "flex", gap: 10, alignItems: "flex-start", background: "transparent", border: "none", padding: 0, marginBottom: 10, cursor: "pointer", textAlign: "left" }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, border: missionState.primary_complete ? "2px solid #22c55e" : "2px solid #4b5563", background: missionState.primary_complete ? "#22c55e22" : "transparent", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>{missionState.primary_complete ? "OK" : ""}</div>
          <div>
            <div style={{ color: "#fca5a5", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Objetivo primario</div>
            <div style={{ color: "#d4b896", fontSize: 12, lineHeight: 1.5 }}>{mission?.objetivo_primario || "Sin texto cargado."}</div>
          </div>
        </button>
        <button onClick={() => patchMission({ secondary_complete: !missionState.secondary_complete })}
          style={{ width: "100%", display: "flex", gap: 10, alignItems: "flex-start", background: "transparent", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, border: missionState.secondary_complete ? "2px solid #22c55e" : "2px solid #4b5563", background: missionState.secondary_complete ? "#22c55e22" : "transparent", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>{missionState.secondary_complete ? "OK" : ""}</div>
          <div>
            <div style={{ color: "#fca5a5", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Objetivo secundario</div>
            <div style={{ color: "#d4b896", fontSize: 12, lineHeight: 1.5 }}>{mission?.objetivo_secundario || "Sin objetivo secundario."}</div>
          </div>
        </button>
        {mission?.reglas_especiales?.length > 0 && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #2d2d44" }}>
            <div style={{ color: "#9ca3af", fontSize: 11, marginBottom: 6 }}>Reglas especiales</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {mission.reglas_especiales.map((rule, index) => (
                <div key={rule.nombre + "_" + index} style={{ background: "#0f172a", borderRadius: 8, padding: 8, border: "1px solid #1f2937" }}>
                  <div style={{ color: "#fca5a5", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{rule.nombre}</div>
                  <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>{rule.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
          Notas de partida
        </div>
        <textarea value={missionState.notas || ""} onChange={e => patchMission({ notas: e.target.value })}
          placeholder="Botin, eventos clave, puertas abiertas, enemigos especiales, recordatorios..."
          style={{ width: "100%", minHeight: 96, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", padding: 10, resize: "vertical", fontFamily: "inherit", fontSize: 12, lineHeight: 1.5 }} />
      </div>

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
        const knownSpells = getKnownSpells(normalized);
        const actionButtons = [
          { id: "melee", label: "Ataque C/C", enabled: true, tone: "attack" },
          { id: "ranged", label: "Ataque Dist", enabled: equipment.rangedDice > 0 || equipped.some(item => (item.ranged || 0) > 0), tone: "ranged" },
          { id: "magic", label: "Magia", enabled: knownSpells.length > 0, disabled: normalized.magia_actual <= 0, tone: "magic" },
          { id: "defense", label: "Defensa", enabled: true, tone: "defense" },
          { id: "rest", label: "Descansar", enabled: true, tone: "rest" },
          { id: "abilities", label: "Habilidades", enabled: true, tone: "neutral" },
          { id: "items", label: "Items", enabled: true, tone: "neutral" },
        ].filter(button => button.enabled);
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

            <div style={{ marginBottom: 10 }}>
              <div style={{ color: "#6b7280", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>
                Estados
              </div>
              <StatusEffects
                effects={normalized.status_effects || []}
                onChange={status_effects => onUpdateAdventurer({ ...normalized, status_effects })}
              />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {equipment.meleeDice > 0 && <span style={{ fontSize: 11, color: "#fde68a", padding: "2px 8px", borderRadius: 999, border: "1px solid #92400e" }}>Melee +{equipment.meleeDice}</span>}
              {equipment.rangedDice > 0 && <span style={{ fontSize: 11, color: "#fca5a5", padding: "2px 8px", borderRadius: 999, border: "1px solid #7f1d1d" }}>Dist +{equipment.rangedDice}</span>}
              {equipment.shield > 0 && <span style={{ fontSize: 11, color: "#bfdbfe", padding: "2px 8px", borderRadius: 999, border: "1px solid #1d4ed8" }}>Escudo {equipment.shield}</span>}
              {equipment.armor > 0 && <span style={{ fontSize: 11, color: "#cbd5e1", padding: "2px 8px", borderRadius: 999, border: "1px solid #475569" }}>Prot +{equipment.armor}</span>}
              {knownSpells.length > 0 && <span style={{ fontSize: 11, color: "#c4b5fd", padding: "2px 8px", borderRadius: 999, border: "1px solid #4338ca" }}>{knownSpells.length} hechizos</span>}
            </div>

            {equipped.length > 0 && (
              <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.4, marginBottom: 8 }}>
                Equipo: {equipped.map(item => item.name).join(", ")}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
              {actionButtons.map(button => {
                const palette = {
                  attack: { border: "#92400e", background: "#92400e22", color: "#fde68a" },
                  ranged: { border: "#7f1d1d", background: "#7f1d1d22", color: "#fca5a5" },
                  magic: { border: "#1d4ed8", background: "#1d4ed822", color: "#dbeafe" },
                  defense: { border: "#1d4ed8", background: "#1d4ed822", color: "#bfdbfe" },
                  rest: { border: "#166534", background: "#16653422", color: "#bbf7d0" },
                  neutral: { border: "#2d2d44", background: "#0f172a", color: "#d4b896" },
                };
                const style = palette[button.tone] || palette.neutral;
                const disabled = !!button.disabled;
                const handleClick = () => {
                  if (disabled) return;
                  if (button.id === "rest") {
                    setActiveRestAdv(normalized.id);
                    return;
                  }
                  if (button.id === "abilities") {
                    setActiveAbilityAdv(normalized.id);
                    return;
                  }
                  if (button.id === "items") {
                    setActiveItemAdv(normalized.id);
                    return;
                  }
                  setActiveCombatMode(button.id);
                  setActiveCombatAdv(normalized.id);
                };
                return (
                  <button key={button.id} onClick={handleClick} disabled={disabled}
                    style={{ padding: 12, borderRadius: 8, border: `1px solid ${style.border}`, background: disabled ? "#111827" : style.background, color: disabled ? "#4b5563" : style.color, fontSize: 12, fontWeight: 700, cursor: disabled ? "default" : "pointer" }}>
                    {button.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
        <button onClick={() => window.open("https://xinix.github.io/maladum/", "_blank")}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #2d2d44", background: "#1a1a2e",
            color: "#d4b896", fontSize: 12, cursor: "pointer" }}>Items DB</button>
        <button onClick={onEndMission}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #7f1d1d", background: "#7f1d1d22",
            color: "#fca5a5", fontSize: 12, cursor: "pointer" }}>Cerrar mision</button>
      </div>

      {selectedCombatAdv && (
        <CombatQuickReferenceModal
          adv={selectedCombatAdv}
          missionState={missionState}
          onCastMagic={handleCastMagic}
          onApplyAdventurerUpdate={onUpdateAdventurer}
          startMode={activeCombatMode}
          onClose={() => setActiveCombatAdv(null)}
        />
      )}

      {magicResultState && (
        <MagicResultModal
          state={magicResultState}
          adventurers={adventurers}
          onApplyResult={handleMagicResultApply}
          onClose={() => setMagicResultState(null)}
        />
      )}

      {selectedAbilityAdv && (
        <CombatAbilitiesModal
          adv={selectedAbilityAdv}
          missionState={missionState}
          onUpdateMission={onUpdateMission}
          onCastMagic={handleCastMagic}
          onClose={() => setActiveAbilityAdv(null)}
        />
      )}

      {selectedItemAdv && (
        <InventoryModal
          adv={selectedItemAdv}
          missionState={missionState}
          onUpdateMission={onUpdateMission}
          onUpdateAdventurer={onUpdateAdventurer}
          onClose={() => setActiveItemAdv(null)}
        />
      )}

      {selectedRestAdv && (
        <MissionRestModal
          adv={selectedRestAdv}
          onConfirm={handleMissionRest}
          onClose={() => setActiveRestAdv(null)}
        />
      )}
    </div>
  );
};

function MissionResolutionScreen({ campaign, missionState, adventurers, onUpdateMission, onConfirm, onBack }) {
  const mission = MISSIONS[missionState.mision_id];
  const suggestedNextMissionIds = getSuggestedNextMissionIds(missionState.mision_id);
  const postMissionSteps = [
    { id: "escape", label: "Fase de Huida" },
    { id: "xp", label: "Experiencia" },
    { id: "rest", label: "Posada o Bosque" },
    { id: "repair", label: "Reparar" },
    { id: "sell", label: "Vender" },
    { id: "market", label: "Comprar / Craftear" },
    { id: "summary", label: "Resumen final" },
  ];
  const xpEach = Math.max(1, Number(missionState.xp_base || 1)) + Math.max(0, Number(missionState.xp_extra || 0));
  const patchMission = (updates) => onUpdateMission(normalizeMissionState({ ...missionState, ...updates }));
  const [craftingCatalog, setCraftingCatalog] = useState([]);
  const [officialItems, setOfficialItems] = useState([]);
  const [craftingError, setCraftingError] = useState("");
  const [selectedRecipeName, setSelectedRecipeName] = useState("");
  const [marketQuery, setMarketQuery] = useState("");
  const [marketSource, setMarketSource] = useState("all");
  const [selectedMarketKey, setSelectedMarketKey] = useState("");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const adjustNumber = (field, delta, min = 0) => {
    patchMission({ [field]: Math.max(min, Number(missionState[field] || 0) + delta) });
  };
  const maintenanceCost = adventurers.reduce((sum, adv) => sum + 1 + Math.max(1, Number(adv.rango || 1)), 0);
  const lodgingCost = missionState.rest_mode === "posada" ? adventurers.length * 2 : 0;
  const currentGroupGold = Math.max(0, Number(campaign.oro || 0) || 0);
  const brokenItems = adventurers.flatMap(adv => {
    const normalized = normalizeAdventurer(adv);
    return (normalized.inventario || [])
      .filter(item => item.broken)
      .map(item => {
        const repairKey = makeRepairKey(normalized.id, item.id);
        const selected = (missionState.repaired_items || []).find(entry => entry.key === repairKey);
        return {
          key: repairKey,
          adventurerId: normalized.id,
          adventurerName: normalized.nombre,
          item,
          autoCost: getRepairCost(item),
          selected,
        };
      });
  });
  const craftedSpend = (missionState.crafted_items || []).reduce((sum, item) => sum + Number(item.price || 0), 0);
  const marketSpend = (missionState.purchased_items || []).reduce((sum, item) => sum + Number(item.price || 0), 0);
  const repairSpend = (missionState.repaired_items || []).reduce((sum, item) => sum + Math.max(0, Number(item.cost) || 0), 0);
  const soldIncome = (missionState.sold_items || []).reduce((sum, item) => sum + Math.max(0, Number(item.price) || 0), 0);
  const availableGoldBeforeCraft = currentGroupGold + Number(missionState.oro_ganado || 0) + soldIncome - maintenanceCost - lodgingCost - repairSpend - marketSpend;
  const availableGoldBeforeMarket = currentGroupGold + Number(missionState.oro_ganado || 0) + soldIncome - maintenanceCost - lodgingCost - repairSpend - craftedSpend;
  const phaseGoldDelta = Number(missionState.oro_ganado || 0) + soldIncome - maintenanceCost - lodgingCost - craftedSpend - repairSpend - marketSpend;
  const totalGoldAfterPhase = Math.max(0, currentGroupGold + phaseGoldDelta);
  const totalGoldAfterRest = Math.max(0, currentGroupGold + Number(missionState.oro_ganado || 0) - maintenanceCost - lodgingCost);
  const currentStep = postMissionSteps[activeStepIndex] || postMissionSteps[0];
  useEffect(() => {
    loadCraftingCatalog()
      .then(setCraftingCatalog)
      .catch(() => setCraftingError("No pude cargar el catalogo de crafteo."));
  }, []);
  useEffect(() => {
    loadOfficialItemCatalog().then(setOfficialItems).catch(() => {});
  }, []);

  useEffect(() => {
    if (missionState.maintenance_cost !== maintenanceCost || missionState.lodging_cost !== lodgingCost) {
      patchMission({ maintenance_cost: maintenanceCost, lodging_cost: lodgingCost });
    }
  }, [maintenanceCost, lodgingCost]);

  useEffect(() => {
    if (selectedRecipeName && !craftingCatalog.some(item => item.name === selectedRecipeName)) {
      setSelectedRecipeName("");
    }
  }, [selectedRecipeName, craftingCatalog]);

  useEffect(() => {
    if (selectedMarketKey && !marketCatalog.some(item => (item.source + "_" + item.slug) === selectedMarketKey)) {
      setSelectedMarketKey("");
    }
  }, [selectedMarketKey, officialItems, marketSource, marketQuery]);

  const uniqueCraftedNames = getUniqueCraftedNames(adventurers, missionState);
  const craftableItems = craftingCatalog.filter(item => {
    const hasMaterials = Object.entries(item.requirements || {}).every(([letter, need]) => (missionState.materials_gained?.[letter] || 0) >= need);
    const alreadyOwnedOrCrafted = uniqueCraftedNames.has(String(item.name || "").toLowerCase());
    return hasMaterials && !alreadyOwnedOrCrafted;
  });
  const selectedRecipe = craftableItems.find(item => item.name === selectedRecipeName) || null;
  const marketCatalog = officialItems.filter(item => Number(item.buy) > 0);
  const marketResults = marketCatalog.filter(item => {
    if (marketSource !== "all" && item.source !== marketSource) return false;
    const query = marketQuery.trim().toLowerCase();
    if (!query) return true;
    const haystack = [
      item.name,
      item.source,
      item.rarity,
      item.size,
      ...(item.attributes || []),
    ].join(" ").toLowerCase();
    return haystack.includes(query);
  }).slice(0, 24);
  const selectedMarketItem = marketResults.find(item => (item.source + "_" + item.slug) === selectedMarketKey) || marketCatalog.find(item => (item.source + "_" + item.slug) === selectedMarketKey) || null;

  const canAffordMarketItem = (item) => {
    return availableGoldBeforeMarket - marketSpend - Math.max(0, Number(item?.buy || 0)) >= 0;
  };

  const updateMaterialCount = (letter, delta) => {
    patchMission({
      materials_gained: {
        ...(missionState.materials_gained || {}),
        [letter]: Math.max(0, Number((missionState.materials_gained || {})[letter] || 0) + delta),
      },
    });
  };

  const sellableItems = adventurers.flatMap(adv => {
    const normalized = normalizeAdventurer(adv);
    return (normalized.inventario || [])
      .filter(item => Number.isFinite(Number(item.sell)) && Number(item.sell) >= 0)
      .map(item => {
        const key = makeOwnedItemKey(normalized.id, item.id);
        const selected = (missionState.sold_items || []).find(entry => entry.key === key);
        return {
          key,
          adventurerId: normalized.id,
          adventurerName: normalized.nombre,
          item,
          selected,
        };
      });
  });

  const toggleSoldItem = (entry) => {
    const existing = (missionState.sold_items || []).find(item => item.key === entry.key);
    if (existing) {
      patchMission({
        sold_items: (missionState.sold_items || []).filter(item => item.key !== entry.key),
      });
      return;
    }
    patchMission({
      sold_items: [
        ...(missionState.sold_items || []),
        {
          key: entry.key,
          adventurerId: entry.adventurerId,
          itemId: entry.item.id,
          itemName: entry.item.name,
          price: Math.max(0, Number(entry.item.sell) || 0),
        },
      ],
    });
  };

  const assignCraftedItem = (recipe, adventurerId) => {
    if (!recipe) return;
    const price = Number(recipe.price || 0);
    if (!canAffordRecipeWithGold(availableGoldBeforeCraft, craftedSpend, recipe)) return;
    const officialMatch = officialItems.find(item => String(item.name || "").toLowerCase() === String(recipe.name || "").toLowerCase());
    const payload = officialMatch ? catalogEntryToInventoryItem(officialMatch) : createCraftedInventoryItem(recipe);
    patchMission({
      materials_gained: consumeRecipeMaterials(missionState.materials_gained, recipe),
      crafted_items: [
        ...(missionState.crafted_items || []),
        {
          id: "craft_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
          adventurerId,
          name: recipe.name,
          price,
          requirements: { ...(recipe.requirements || {}) },
          res_required: recipe.res_required || "",
          expansion: recipe.expansion || "",
          payload,
        },
      ],
    });
    setSelectedRecipeName("");
  };

  const removeCraftedItem = (id) => {
    const craftedItem = (missionState.crafted_items || []).find(item => item.id === id);
    patchMission({
      materials_gained: craftedItem ? restoreRecipeMaterials(missionState.materials_gained, craftedItem) : missionState.materials_gained,
      crafted_items: (missionState.crafted_items || []).filter(item => item.id !== id),
    });
  };

  const assignPurchasedItem = (entry, adventurerId) => {
    if (!entry || !canAffordMarketItem(entry)) return;
    patchMission({
      purchased_items: [
        ...(missionState.purchased_items || []),
        {
          id: "buy_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
          adventurerId,
          name: entry.name,
          price: Math.max(0, Number(entry.buy || 0)),
          payload: catalogEntryToInventoryItem(entry),
        },
      ],
    });
    setSelectedMarketKey("");
  };

  const removePurchasedItem = (id) => {
    patchMission({
      purchased_items: (missionState.purchased_items || []).filter(item => item.id !== id),
    });
  };

  const toggleRepairItem = (entry) => {
    const existing = (missionState.repaired_items || []).find(item => item.key === entry.key);
    if (existing) {
      patchMission({
        repaired_items: (missionState.repaired_items || []).filter(item => item.key !== entry.key),
      });
      return;
    }
    const cost = entry.autoCost != null ? entry.autoCost : 0;
    patchMission({
      repaired_items: [
        ...(missionState.repaired_items || []),
        {
          key: entry.key,
          adventurerId: entry.adventurerId,
          itemId: entry.item.id,
          itemName: entry.item.name,
          cost,
        },
      ],
    });
  };

  const updateRepairCost = (entry, cost) => {
    patchMission({
      repaired_items: (missionState.repaired_items || []).map(item => item.key === entry.key ? { ...item, cost: Math.max(0, Number(cost) || 0) } : item),
    });
  };

  return (
    <div style={{ padding: 16 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 0, marginBottom: 12, fontSize: 13 }}>Volver a la partida</button>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ color: "#b91c1c", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>
          Cierre de mision
        </div>
        <h2 style={{ color: "#d4b896", fontSize: 20, fontWeight: 800, margin: "4px 0" }}>{mission?.nombre || missionState.mision_id}</h2>
        <div style={{ color: "#6b7280", fontSize: 12 }}>Paso {activeStepIndex + 1} de {postMissionSteps.length} | {currentStep.label}</div>
        <div style={{ color: "#4b5563", fontSize: 11, marginTop: 4 }}>Ronda final {missionState.ronda} | Amenaza {missionState.amenaza_nivel}</div>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
        {postMissionSteps.map((step, index) => (
          <button key={step.id} onClick={() => setActiveStepIndex(index)}
            style={{ flex: "0 0 auto", padding: "10px 12px", borderRadius: 999, border: index === activeStepIndex ? "1px solid #eab308" : "1px solid #374151", background: index === activeStepIndex ? "#eab30822" : "#111827", color: index === activeStepIndex ? "#fde68a" : "#9ca3af", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
            {index + 1}. {step.label}
          </button>
        ))}
      </div>

      {activeStepIndex === 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <button onClick={() => patchMission({ success: true })}
              style={{ padding: 12, borderRadius: 10, border: missionState.success ? "2px solid #166534" : "1px solid #374151", background: missionState.success ? "#16653422" : "#1a1a2e", color: missionState.success ? "#bbf7d0" : "#9ca3af", fontWeight: 700, cursor: "pointer" }}>
              Mision superada
            </button>
            <button onClick={() => patchMission({ success: false })}
              style={{ padding: 12, borderRadius: 10, border: !missionState.success ? "2px solid #7f1d1d" : "1px solid #374151", background: !missionState.success ? "#7f1d1d22" : "#1a1a2e", color: !missionState.success ? "#fca5a5" : "#9ca3af", fontWeight: 700, cursor: "pointer" }}>
              Retirada / derrota
            </button>
          </div>

          <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", marginBottom: 12 }}>
            <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
              Resultado de objetivos
            </div>
            <button onClick={() => patchMission({ primary_complete: !missionState.primary_complete })}
              style={{ width: "100%", display: "flex", gap: 10, alignItems: "flex-start", background: "transparent", border: "none", padding: 0, marginBottom: 10, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: missionState.primary_complete ? "2px solid #22c55e" : "2px solid #4b5563", background: missionState.primary_complete ? "#22c55e22" : "transparent", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>{missionState.primary_complete ? "OK" : ""}</div>
              <div>
                <div style={{ color: "#fca5a5", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Objetivo primario</div>
                <div style={{ color: "#d4b896", fontSize: 12, lineHeight: 1.5 }}>{mission?.objetivo_primario || "Sin texto cargado."}</div>
              </div>
            </button>
            <button onClick={() => patchMission({ secondary_complete: !missionState.secondary_complete })}
              style={{ width: "100%", display: "flex", gap: 10, alignItems: "flex-start", background: "transparent", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: missionState.secondary_complete ? "2px solid #22c55e" : "2px solid #4b5563", background: missionState.secondary_complete ? "#22c55e22" : "transparent", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>{missionState.secondary_complete ? "OK" : ""}</div>
              <div>
                <div style={{ color: "#fca5a5", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Objetivo secundario</div>
                <div style={{ color: "#d4b896", fontSize: 12, lineHeight: 1.5 }}>{mission?.objetivo_secundario || "Sin objetivo secundario."}</div>
              </div>
            </button>
          </div>
        </>
      )}

      {activeStepIndex === 1 && (
      <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
          Recompensas del grupo
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div style={{ background: "#0f172a", borderRadius: 8, padding: 10 }}>
            <div style={{ color: "#6b7280", fontSize: 10, marginBottom: 4 }}>PX base por aventurero</div>
            <div style={{ color: "#bbf7d0", fontSize: 22, fontWeight: 800 }}>1</div>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 8, padding: 10 }}>
            <div style={{ color: "#6b7280", fontSize: 10, marginBottom: 4 }}>PX total por aventurero</div>
            <div style={{ color: "#fde68a", fontSize: 22, fontWeight: 800 }}>{xpEach}</div>
          </div>
        </div>

        {[
          { field: "xp_extra", label: "PX extra por aventurero", suffix: "" },
          { field: "renombre_ganado", label: "Renombre ganado", suffix: "" },
          { field: "demora_cambio", label: "Demora a sumar", suffix: "" },
        ].map(({ field, label, suffix }) => (
          <div key={field} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0f172a", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>
            <span style={{ color: "#9ca3af", fontSize: 12 }}>{label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => adjustNumber(field, -1)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #374151", background: "transparent", color: "#d4b896", fontSize: 16, cursor: "pointer" }}>-</button>
              <span style={{ color: "#d4b896", fontSize: 16, fontWeight: 700, width: 34, textAlign: "center" }}>{missionState[field] || 0}{suffix}</span>
              <button onClick={() => adjustNumber(field, 1)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #374151", background: "transparent", color: "#d4b896", fontSize: 16, cursor: "pointer" }}>+</button>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0f172a", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>
          <span style={{ color: "#9ca3af", fontSize: 12 }}>Oro ganado</span>
          <input type="number" min="0" value={missionState.oro_ganado || 0} onChange={e => patchMission({ oro_ganado: Math.max(0, Number(e.target.value) || 0) })}
            style={{ width: 120, padding: 8, borderRadius: 8, border: "1px solid #374151", background: "#111827", color: "#d4b896", fontSize: 14, textAlign: "right", boxSizing: "border-box" }} />
        </div>
      </div>
      )}

      {activeStepIndex === 2 && (
      <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
          Posada o Bosque
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <button onClick={() => patchMission({ rest_mode: "posada" })}
            style={{ padding: 12, borderRadius: 10, border: missionState.rest_mode === "posada" ? "2px solid #166534" : "1px solid #374151", background: missionState.rest_mode === "posada" ? "#16653422" : "#0f172a", color: missionState.rest_mode === "posada" ? "#bbf7d0" : "#9ca3af", fontWeight: 700, cursor: "pointer" }}>
            Posada
          </button>
          <button onClick={() => patchMission({ rest_mode: "naturaleza" })}
            style={{ padding: 12, borderRadius: 10, border: missionState.rest_mode === "naturaleza" ? "2px solid #166534" : "1px solid #374151", background: missionState.rest_mode === "naturaleza" ? "#16653422" : "#0f172a", color: missionState.rest_mode === "naturaleza" ? "#bbf7d0" : "#9ca3af", fontWeight: 700, cursor: "pointer" }}>
            Bosque
          </button>
        </div>
        {missionState.rest_mode === "none" && (
          <div style={{ background: "#7f1d1d22", borderRadius: 8, padding: 10, border: "1px solid #7f1d1d", color: "#fca5a5", fontSize: 11, marginBottom: 8 }}>
            Falta elegir si el grupo va a Posada o a Bosque.
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div style={{ background: "#0f172a", borderRadius: 8, padding: 10 }}>
            <div style={{ color: "#6b7280", fontSize: 10, marginBottom: 4 }}>Mantenimiento</div>
            <div style={{ color: "#d4b896", fontSize: 20, fontWeight: 800 }}>{maintenanceCost}G</div>
            <div style={{ color: "#6b7280", fontSize: 11 }}>1G por aventurero + 1G por rango</div>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 8, padding: 10 }}>
            <div style={{ color: "#6b7280", fontSize: 10, marginBottom: 4 }}>Descanso</div>
            <div style={{ color: "#d4b896", fontSize: 20, fontWeight: 800 }}>{lodgingCost}G</div>
            <div style={{ color: "#6b7280", fontSize: 11 }}>{missionState.rest_mode === "posada" ? "2G por aventurero" : "Bosque sin coste"}</div>
          </div>
        </div>
        <div style={{ background: "#0f172a", borderRadius: 8, padding: 10, border: "1px solid #2d2d44", marginBottom: 8 }}>
          <div style={{ color: "#6b7280", fontSize: 10, marginBottom: 4 }}>Oro del grupo tras mision, mantenimiento y descanso</div>
          <div style={{ color: "#d4b896", fontSize: 20, fontWeight: 800 }}>{totalGoldAfterRest}G</div>
        </div>
        <div style={{ background: phaseGoldDelta >= 0 ? "#132034" : "#3a1212", borderRadius: 8, padding: 10, border: "1px solid #2d2d44", marginBottom: 8 }}>
          <div style={{ color: "#6b7280", fontSize: 10, marginBottom: 4 }}>Balance neto provisional del cierre</div>
          <div style={{ color: phaseGoldDelta >= 0 ? "#bbf7d0" : "#fca5a5", fontSize: 20, fontWeight: 800 }}>{phaseGoldDelta >= 0 ? "+" : ""}{phaseGoldDelta}G</div>
          <div style={{ color: "#6b7280", fontSize: 11 }}>Oro ganado + ventas - mantenimiento - descanso - reparaciones - crafteo - compras</div>
        </div>
        <div style={{ background: "#132034", borderRadius: 8, padding: 10, border: "1px solid #2d2d44", marginBottom: 8 }}>
          <div style={{ color: "#6b7280", fontSize: 10, marginBottom: 4 }}>Oro total del grupo tras este cierre</div>
          <div style={{ color: "#bbf7d0", fontSize: 20, fontWeight: 800 }}>{totalGoldAfterPhase}G</div>
          <div style={{ color: "#6b7280", fontSize: 11 }}>Incluye el oro acumulado de misiones anteriores</div>
        </div>
        {missionState.rest_mode !== "none" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
            {REST_REFERENCE[missionState.rest_mode].map((line, index) => (
              <div key={index} style={{ background: "#0f172a", borderRadius: 8, padding: 8, border: "1px solid #1f2937", color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>
                {line}
              </div>
            ))}
          </div>
        )}
        <textarea value={missionState.rest_notes || ""} onChange={e => patchMission({ rest_notes: e.target.value })}
          placeholder="Anota aqui el resultado de la Posada o del Bosque, bendiciones, PX extra, renombre, penalizaciones..."
          style={{ width: "100%", minHeight: 76, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", padding: 10, resize: "vertical", fontFamily: "inherit", fontSize: 12, lineHeight: 1.5 }} />
      </div>
      )}

      {activeStepIndex === 3 && (
      <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
          Reparacion de objetos
        </div>
        <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.5, marginBottom: 8 }}>
          Marca aqui los objetos rotos que quieres reparar durante la fase de mercado. Comun 1G, Poco comun 3G, Raro 5G. Si una carta especial no entra en esos rangos, puedes escribir el coste manualmente.
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, color: "#9ca3af", fontSize: 11, marginBottom: 8 }}>
          <span>Objetos rotos: {brokenItems.length}</span>
          <span>Gasto en reparacion: {repairSpend}G</span>
        </div>
        {brokenItems.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {brokenItems.map(entry => {
              const selected = !!entry.selected;
              const cost = selected ? Math.max(0, Number(entry.selected?.cost) || 0) : (entry.autoCost ?? 0);
              const projectedTotalGold = currentGroupGold + Number(missionState.oro_ganado || 0) - maintenanceCost - lodgingCost - craftedSpend - (repairSpend + (selected ? 0 : cost)) - marketSpend;
              const canAffordRepair = selected || projectedTotalGold >= 0;
              return (
                <div key={entry.key} style={{ background: "#0f172a", borderRadius: 8, padding: 10, border: "1px solid #1f2937" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700 }}>{entry.item.name}</div>
                      <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>
                        {entry.adventurerName} | {titleCaseToken(entry.item.rarity || "especial")} | {titleCaseToken(entry.item.size || "")}
                      </div>
                    </div>
                    <button onClick={() => toggleRepairItem(entry)} disabled={!canAffordRepair}
                      style={{ padding: "8px 10px", borderRadius: 8, border: selected ? "1px solid #166534" : "1px solid #374151", background: selected ? "#16653422" : "#132034", color: selected ? "#bbf7d0" : "#d4b896", cursor: canAffordRepair ? "pointer" : "default", opacity: canAffordRepair ? 1 : 0.5 }}>
                      {selected ? "Reparacion marcada" : "Reparar"}
                    </button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: entry.autoCost == null && selected ? 8 : 0 }}>
                    <div style={{ color: "#6b7280", fontSize: 11 }}>
                      {entry.autoCost != null ? `Coste automatico: ${entry.autoCost}G` : "Coste manual"}
                    </div>
                    <div style={{ color: "#d4b896", fontSize: 12, fontWeight: 700 }}>{cost}G</div>
                  </div>
                  {entry.autoCost == null && selected && (
                    <input type="number" min="0" value={entry.selected?.cost || 0} onChange={e => updateRepairCost(entry, e.target.value)}
                      style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #374151", background: "#111827", color: "#d4b896", fontSize: 13, boxSizing: "border-box" }} />
                  )}
                  {!canAffordRepair && (
                    <div style={{ color: "#fca5a5", fontSize: 11, marginTop: 6 }}>
                      No alcanza el oro total disponible del grupo para sumar esta reparacion.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: "#6b7280", fontSize: 12 }}>No hay objetos rotos pendientes de reparar.</div>
        )}
      </div>
      )}

      {activeStepIndex === 4 && (
      <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
          Vender
        </div>
        <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.5, marginBottom: 8 }}>
          Marca aqui los objetos del inventario que vas a vender. Su valor se suma al oro del grupo y el objeto se retirara al aplicar el cierre.
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, color: "#9ca3af", fontSize: 11, marginBottom: 8 }}>
          <span>Objetos vendibles: {sellableItems.length}</span>
          <span>Ingreso por ventas: +{soldIncome}G</span>
        </div>
        {sellableItems.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sellableItems.map(entry => {
              const selected = !!entry.selected;
              return (
                <div key={entry.key} style={{ background: "#0f172a", borderRadius: 8, padding: 10, border: "1px solid #1f2937" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                    <div>
                      <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700 }}>{entry.item.name}</div>
                      <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>
                        {entry.adventurerName} | Venta {Math.max(0, Number(entry.item.sell) || 0)}G
                      </div>
                    </div>
                    <button onClick={() => toggleSoldItem(entry)}
                      style={{ padding: "8px 10px", borderRadius: 8, border: selected ? "1px solid #166534" : "1px solid #374151", background: selected ? "#16653422" : "#132034", color: selected ? "#bbf7d0" : "#d4b896", cursor: "pointer" }}>
                      {selected ? "Venta marcada" : "Vender"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: "#6b7280", fontSize: 12 }}>No hay objetos con valor de venta registrado en el grupo.</div>
        )}
        {(missionState.sold_items || []).length > 0 && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
              Ventas preparadas
            </div>
            {(missionState.sold_items || []).map(item => (
              <div key={item.key} style={{ background: "#132034", borderRadius: 8, padding: 10, border: "1px solid #2d2d44", display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <div>
                  <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700 }}>{item.itemName}</div>
                  <div style={{ color: "#9ca3af", fontSize: 11 }}>+{item.price || 0}G</div>
                </div>
                <button onClick={() => patchMission({ sold_items: (missionState.sold_items || []).filter(entry => entry.key !== item.key) })}
                  style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #7f1d1d", background: "#7f1d1d22", color: "#fca5a5", cursor: "pointer" }}>
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {activeStepIndex === 5 && (
      <>
      <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
          Crafteo y materiales
        </div>
        <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.5, marginBottom: 8 }}>
          Introduce los materiales obtenidos. Al tocar una receta elegiras que aventurero la recibe, se descontaran las letras usadas y el coste se restara del oro neto. Si un objeto unico ya fue fabricado o ya esta en el grupo, desaparece de esta lista.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10 }}>
          {RESOURCE_LETTERS.map(letter => (
            <div key={letter} style={{ background: "#0f172a", borderRadius: 8, padding: 8, border: "1px solid #1f2937" }}>
              <div style={{ color: "#d4b896", fontSize: 12, fontWeight: 700 }}>{letter}</div>
              <div style={{ color: "#6b7280", fontSize: 10, minHeight: 26 }}>{RESOURCE_LABELS[letter]}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                <button onClick={() => updateMaterialCount(letter, -1)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #374151", background: "transparent", color: "#d4b896", cursor: "pointer" }}>-</button>
                <span style={{ color: "#d4b896", fontSize: 14, fontWeight: 700, width: 20, textAlign: "center" }}>{missionState.materials_gained?.[letter] || 0}</span>
                <button onClick={() => updateMaterialCount(letter, 1)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #374151", background: "transparent", color: "#d4b896", cursor: "pointer" }}>+</button>
              </div>
            </div>
          ))}
        </div>
        {craftingError && <div style={{ color: "#fca5a5", fontSize: 12, marginBottom: 8 }}>{craftingError}</div>}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, color: "#9ca3af", fontSize: 11, marginBottom: 8 }}>
          <span>Fabricables ahora: {craftableItems.length}</span>
          <span>Gasto en crafteo: {craftedSpend}G</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
          {craftableItems.length > 0 ? craftableItems.map(item => {
            const officialMatch = officialItems.find(entry => String(entry.name || "").toLowerCase() === String(item.name || "").toLowerCase());
            const previewItem = officialMatch ? catalogEntryToInventoryItem(officialMatch) : createCraftedInventoryItem(item);
            const badges = getItemPreviewBadges(previewItem);
            const effectPreview = getItemEffectPreview(previewItem);
            return (
            <button key={item.name} onClick={() => setSelectedRecipeName(item.name)}
              style={{ background: selectedRecipeName === item.name ? "#1d3557" : "#132034", borderRadius: 8, padding: 10, border: selectedRecipeName === item.name ? "1px solid #60a5fa" : "1px solid #2d2d44", textAlign: "left", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700 }}>{item.name}</div>
                <div style={{ color: "#fde68a", fontSize: 12, fontWeight: 700 }}>{item.price}G</div>
              </div>
              <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>
                {item.type} | Tam {item.size} | {item.expansion}
              </div>
              {badges.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {badges.map((badge, index) => {
                    const tone = getItemPreviewBadgeStyle(badge.tone);
                    return (
                      <span key={badge.label + "_" + index} style={{ fontSize: 11, color: tone.color, padding: "2px 8px", borderRadius: 999, border: `1px solid ${tone.border}` }}>
                        {badge.label}
                      </span>
                    );
                  })}
                </div>
              )}
              {effectPreview.length > 0 && (
                <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5, marginTop: 6 }}>
                  {effectPreview.join(" | ")}
                </div>
              )}
              <div style={{ color: "#6b7280", fontSize: 11, marginTop: 4 }}>
                Requiere: {item.res_required}
              </div>
              {!!previewItem.attributes?.length && (
                <details style={{ marginTop: 8 }}>
                  <summary style={{ color: "#6b7280", fontSize: 11, cursor: "pointer" }}>Ver atributos</summary>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                    {previewItem.attributes.slice(0, 6).map(attr => {
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
              {!canAffordRecipeWithGold(availableGoldBeforeCraft, craftedSpend, item) && (
                <div style={{ color: "#fca5a5", fontSize: 11, marginTop: 6 }}>
                  No alcanza el oro total disponible del grupo para fabricarlo ahora.
                </div>
              )}
            </button>
          )}) : (
            <div style={{ color: "#6b7280", fontSize: 12 }}>Todavia no hay recetas que cumplan con los materiales indicados.</div>
          )}
        </div>
        {selectedRecipe && (
          <div style={{ marginTop: 10, background: "#0f172a", borderRadius: 8, padding: 10, border: "1px solid #374151" }}>
            <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{selectedRecipe.name}</div>
            <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5, marginBottom: 8 }}>
              Elige que aventurero se lo lleva. Se anadira a su ficha al aplicar el cierre.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {adventurers.map(adv => (
                <button key={adv.id} onClick={() => assignCraftedItem(selectedRecipe, adv.id)}
                  disabled={!canAffordRecipeWithGold(availableGoldBeforeCraft, craftedSpend, selectedRecipe)}
                  style={{ padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#132034", color: "#d4b896", cursor: canAffordRecipeWithGold(availableGoldBeforeCraft, craftedSpend, selectedRecipe) ? "pointer" : "default", opacity: canAffordRecipeWithGold(availableGoldBeforeCraft, craftedSpend, selectedRecipe) ? 1 : 0.5 }}>
                  {adv.nombre}
                </button>
              ))}
            </div>
          </div>
        )}
        {(missionState.crafted_items || []).length > 0 && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
              Crafteo preparado
            </div>
            {(missionState.crafted_items || []).map(item => {
              const owner = adventurers.find(adv => adv.id === item.adventurerId);
              return (
                <div key={item.id} style={{ background: "#132034", borderRadius: 8, padding: 10, border: "1px solid #2d2d44", display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <div>
                    <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700 }}>{item.name}</div>
                    <div style={{ color: "#9ca3af", fontSize: 11 }}>
                      Para {owner?.nombre || "Aventurero"} | {Number(item.price || 0)}G | {item.res_required || ""}
                    </div>
                  </div>
                  <button onClick={() => removeCraftedItem(item.id)}
                    style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #7f1d1d", background: "#7f1d1d22", color: "#fca5a5", cursor: "pointer" }}>
                    Quitar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
          Mercado y compras
        </div>
        <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.5, marginBottom: 8 }}>
          Compra items usando el oro total del grupo. Al elegir un item, asignalo al aventurero que lo compra y se anadira a su inventario al aplicar el cierre.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 8, marginBottom: 8 }}>
          <input value={marketQuery} onChange={e => setMarketQuery(e.target.value)}
            placeholder="Buscar item o atributo"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13, boxSizing: "border-box" }}/>
          <select value={marketSource} onChange={e => setMarketSource(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 13 }}>
            <option value="all">Todo</option>
            <option value="maladum">Caja base</option>
            <option value="adventure">Adventure</option>
            <option value="beasts">Beasts</option>
          </select>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, color: "#9ca3af", fontSize: 11, marginBottom: 8 }}>
          <span>Items visibles: {marketResults.length}</span>
          <span>Gasto en compras: {marketSpend}G</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
          {marketResults.length > 0 ? marketResults.map(item => {
            const previewItem = catalogEntryToInventoryItem(item);
            const badges = getItemPreviewBadges(previewItem);
            const effectPreview = getItemEffectPreview(previewItem);
            const itemKey = item.source + "_" + item.slug;
            return (
              <button key={itemKey} onClick={() => setSelectedMarketKey(itemKey)}
                style={{ background: selectedMarketKey === itemKey ? "#1d3557" : "#132034", borderRadius: 8, padding: 10, border: selectedMarketKey === itemKey ? "1px solid #60a5fa" : "1px solid #2d2d44", textAlign: "left", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                  <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700 }}>{item.name}</div>
                  <div style={{ color: "#fde68a", fontSize: 12, fontWeight: 700 }}>{item.buy}G</div>
                </div>
                <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>
                  {summarizeCatalogEntry(item)}
                </div>
                {badges.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                    {badges.map((badge, index) => {
                      const tone = getItemPreviewBadgeStyle(badge.tone);
                      return (
                        <span key={badge.label + "_" + index} style={{ fontSize: 11, color: tone.color, padding: "2px 8px", borderRadius: 999, border: `1px solid ${tone.border}` }}>
                          {badge.label}
                        </span>
                      );
                    })}
                  </div>
                )}
                {effectPreview.length > 0 && (
                  <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5, marginTop: 6 }}>
                    {effectPreview.join(" | ")}
                  </div>
                )}
                {!canAffordMarketItem(item) && (
                  <div style={{ color: "#fca5a5", fontSize: 11, marginTop: 6 }}>
                    No alcanza el oro total disponible del grupo para comprarlo ahora.
                  </div>
                )}
              </button>
            );
          }) : (
            <div style={{ color: "#6b7280", fontSize: 12 }}>No hay items que coincidan con ese filtro.</div>
          )}
        </div>
        {selectedMarketItem && (
          <div style={{ marginTop: 10, background: "#0f172a", borderRadius: 8, padding: 10, border: "1px solid #374151" }}>
            <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{selectedMarketItem.name}</div>
            <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5, marginBottom: 8 }}>
              Elige que aventurero lo compra. Se descontaran {selectedMarketItem.buy}G del oro del grupo al aplicar el cierre.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {adventurers.map(adv => (
                <button key={adv.id} onClick={() => assignPurchasedItem(selectedMarketItem, adv.id)}
                  disabled={!canAffordMarketItem(selectedMarketItem)}
                  style={{ padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#132034", color: "#d4b896", cursor: canAffordMarketItem(selectedMarketItem) ? "pointer" : "default", opacity: canAffordMarketItem(selectedMarketItem) ? 1 : 0.5 }}>
                  {adv.nombre}
                </button>
              ))}
            </div>
          </div>
        )}
        {(missionState.purchased_items || []).length > 0 && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
              Compras preparadas
            </div>
            {(missionState.purchased_items || []).map(item => {
              const owner = adventurers.find(adv => adv.id === item.adventurerId);
              return (
                <div key={item.id} style={{ background: "#132034", borderRadius: 8, padding: 10, border: "1px solid #2d2d44", display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <div>
                    <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700 }}>{item.name}</div>
                    <div style={{ color: "#9ca3af", fontSize: 11 }}>
                      Para {owner?.nombre || "Aventurero"} | {Number(item.price || 0)}G
                    </div>
                  </div>
                  <button onClick={() => removePurchasedItem(item.id)}
                    style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #7f1d1d", background: "#7f1d1d22", color: "#fca5a5", cursor: "pointer" }}>
                    Quitar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </>
      )}

      {activeStepIndex === 6 && (
      <>
      <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
          Siguiente paso de campana
        </div>
        <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.5, marginBottom: 8 }}>
          Aqui veras la siguiente mision mas probable o las opciones posibles segun el punto actual de campana. Si necesitas desviarte por una regla especial del libro, abajo puedes ajustarlo manualmente.
        </div>
        {suggestedNextMissionIds.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: suggestedNextMissionIds.length > 1 ? "1fr 1fr" : "1fr", gap: 8, marginBottom: 8 }}>
            {suggestedNextMissionIds.map(id => (
              <button key={id} onClick={() => patchMission({ next_mission: id })}
                style={{ padding: 12, borderRadius: 10, border: (missionState.next_mission || campaign.currentMission) === id ? "2px solid #166534" : "1px solid #374151", background: (missionState.next_mission || campaign.currentMission) === id ? "#16653422" : "#0f172a", color: (missionState.next_mission || campaign.currentMission) === id ? "#bbf7d0" : "#d4b896", fontWeight: 700, cursor: "pointer", textAlign: "left" }}>
                <div>{id} | {MISSIONS[id]?.nombre || "Pendiente"}</div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ color: "#9ca3af", fontSize: 11, marginBottom: 8 }}>
            No hay una ruta unica confirmada en la app para esta mision; usa la seleccion manual.
          </div>
        )}
        <details>
          <summary style={{ color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>Elegir manualmente</summary>
          <select value={missionState.next_mission || campaign.currentMission} onChange={e => patchMission({ next_mission: e.target.value })}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 14, marginTop: 8 }}>
            {MISSION_IDS.map(id => <option key={id} value={id}>{id} | {MISSIONS[id]?.nombre || "Pendiente"}</option>)}
          </select>
        </details>
      </div>

      <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
          Resumen del cierre
        </div>
        <textarea value={missionState.loot_notes || ""} onChange={e => patchMission({ loot_notes: e.target.value })}
          placeholder="Botin, recompensas, objetos especiales, personajes rescatados..."
          style={{ width: "100%", minHeight: 80, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", padding: 10, resize: "vertical", fontFamily: "inherit", fontSize: 12, lineHeight: 1.5, marginBottom: 8 }} />
        <textarea value={missionState.notas || ""} onChange={e => patchMission({ notas: e.target.value })}
          placeholder="Notas de cierre, heridas pendientes, decisiones del libro, recordatorios para mercado/descanso..."
          style={{ width: "100%", minHeight: 90, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", padding: 10, resize: "vertical", fontFamily: "inherit", fontSize: 12, lineHeight: 1.5 }} />
      </div>

      <div style={{ background: "#132034", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
          Aplicacion al grupo
        </div>
        <div style={{ color: "#d4b896", fontSize: 12, lineHeight: 1.6 }}>
          Se aplicaran {xpEach} PX a cada aventurero del grupo, {missionState.renombre_ganado || 0} de Renombre, {phaseGoldDelta >= 0 ? "+" : ""}{phaseGoldDelta}G en esta fase y el grupo quedara con {totalGoldAfterPhase}G en total, ademas de +{missionState.demora_cambio || 0} de Demora en la campana.
        </div>
        {(missionState.repaired_items || []).length > 0 && (
          <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5, marginTop: 8 }}>
            Objetos reparados: {(missionState.repaired_items || []).map(item => `${item.itemName || "Objeto"} (${item.cost || 0}G)`).join(" | ")}
          </div>
        )}
        {(missionState.sold_items || []).length > 0 && (
          <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5, marginTop: 8 }}>
            Ventas: {(missionState.sold_items || []).map(item => `${item.itemName || "Objeto"} (+${item.price || 0}G)`).join(" | ")}
          </div>
        )}
        {(missionState.crafted_items || []).length > 0 && (
          <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5, marginTop: 8 }}>
            Items crafteados: {(missionState.crafted_items || []).map(item => {
              const owner = adventurers.find(adv => adv.id === item.adventurerId);
              return `${item.name} -> ${owner?.nombre || "Aventurero"}`;
            }).join(" | ")}
          </div>
        )}
        {(missionState.purchased_items || []).length > 0 && (
          <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5, marginTop: 8 }}>
            Compras: {(missionState.purchased_items || []).map(item => {
              const owner = adventurers.find(adv => adv.id === item.adventurerId);
              return `${item.name} -> ${owner?.nombre || "Aventurero"} (${item.price || 0}G)`;
            }).join(" | ")}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {adventurers.map(adv => (
            <span key={adv.id} style={{ fontSize: 11, color: "#d4b896", padding: "4px 8px", borderRadius: 999, border: "1px solid #374151" }}>
              {adv.nombre} +{xpEach} PX
            </span>
          ))}
        </div>
      </div>

      <button onClick={onConfirm}
        style={{ width: "100%", padding: 16, borderRadius: 10, border: "2px solid #166534", background: "#16653422", color: "#bbf7d0", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
        Aplicar cierre de mision
      </button>
      </>
      )}

      <div style={{ display: "grid", gridTemplateColumns: activeStepIndex === 6 ? "1fr" : "1fr 1fr", gap: 8, marginTop: 12 }}>
        {activeStepIndex < 6 && (
          <button onClick={() => setActiveStepIndex(index => Math.min(6, index + 1))}
            style={{ padding: 14, borderRadius: 10, border: "2px solid #eab308", background: "#eab30815", color: "#fde68a", fontSize: 13, fontWeight: 800, cursor: "pointer", order: 2 }}>
            Continuar
          </button>
        )}
        <button onClick={() => setActiveStepIndex(index => Math.max(0, index - 1))} disabled={activeStepIndex === 0}
          style={{ padding: 14, borderRadius: 10, border: "1px solid #374151", background: activeStepIndex === 0 ? "#111827" : "#1a1a2e", color: activeStepIndex === 0 ? "#4b5563" : "#d4b896", fontSize: 13, fontWeight: 700, cursor: activeStepIndex === 0 ? "default" : "pointer", order: 1 }}>
          Paso anterior
        </button>
      </div>
    </div>
  );
}

function HomeScreen({ onCreateCampaign, onLoadCampaign, campaigns }) {
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div style={{ padding: 16, maxWidth: 500, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32, paddingTop: 24 }}>
        <div style={{ fontSize: 42, marginBottom: 8 }}>⚔️</div>
        <h1 style={{ color: "#d4b896", fontSize: 26, fontWeight: 800, margin: 0, fontFamily: "'Cinzel', serif", letterSpacing: 2 }}>MALADUM</h1>
        <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 4, letterSpacing: 3, textTransform: "uppercase" }}>Companion App</div>
        <div style={{ width: 60, height: 2, background: "linear-gradient(90deg, transparent, #b91c1c, transparent)", margin: "12px auto" }} />
      </div>

      {campaigns.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Campanas guardadas</div>
          {campaigns.map(c => (
            <button key={c.id} onClick={() => onLoadCampaign(c)}
              style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid #2d2d44", background: "#1a1a2e", marginBottom: 8, cursor: "pointer", textAlign: "left" }}>
              <div style={{ color: "#d4b896", fontSize: 15, fontWeight: 700 }}>{c.name}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 12, color: "#9ca3af" }}>
                <span>Mision: {c.currentMission}</span>
                <span>Demora: {c.demora}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {!showCreate ? (
        <button onClick={() => setShowCreate(true)}
          style={{ width: "100%", padding: 16, borderRadius: 10, border: "2px solid #b91c1c", background: "#b91c1c22", color: "#fca5a5", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>
          + Nueva Campana
        </button>
      ) : (
        <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 16, border: "1px solid #2d2d44" }}>
          <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Nombre de la campana</div>
          <input value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Ej: Campana de los Aventureros"
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #374151", background: "#0f172a", color: "#d4b896", fontSize: 15, boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={() => setShowCreate(false)}
              style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #374151", background: "transparent", color: "#9ca3af", fontSize: 14, cursor: "pointer" }}>
              Cancelar
            </button>
            <button onClick={() => {
              if (newName.trim()) {
                onCreateCampaign(newName.trim());
                setNewName("");
                setShowCreate(false);
              }
            }}
              style={{ flex: 1, padding: 12, borderRadius: 8, border: "none", background: "#b91c1c", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Crear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignHub({ campaign, adventurers, onNavigate }) {
  const demoraEffect = DEMORA_EFFECTS.find(d => campaign.demora >= d.min && campaign.demora <= d.max);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>Campana</div>
        <h2 style={{ color: "#d4b896", fontSize: 20, fontWeight: 800, margin: "4px 0" }}>{campaign.name}</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", textAlign: "center" }}>
          <div style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase" }}>Mision Actual</div>
          <div style={{ color: "#d4b896", fontSize: 24, fontWeight: 800 }}>{campaign.currentMission}</div>
          <div style={{ color: "#6b7280", fontSize: 11 }}>{MISSIONS[campaign.currentMission]?.nombre || ""}</div>
        </div>
        <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", textAlign: "center" }}>
          <div style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase" }}>Demora</div>
          <div style={{ color: campaign.demora >= 7 ? "#ef4444" : campaign.demora >= 4 ? "#eab308" : "#22c55e", fontSize: 24, fontWeight: 800 }}>{campaign.demora}/12</div>
          <div style={{ color: "#6b7280", fontSize: 10 }}>{demoraEffect?.desc}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", textAlign: "center" }}>
          <div style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase" }}>Renombre</div>
          <div style={{ color: "#fbbf24", fontSize: 22, fontWeight: 800 }}>{campaign.renombre || 0}</div>
          <div style={{ color: "#6b7280", fontSize: 10 }}>Total del grupo</div>
        </div>
        <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", textAlign: "center" }}>
          <div style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase" }}>Oro</div>
          <div style={{ color: "#d4b896", fontSize: 22, fontWeight: 800 }}>{campaign.oro || 0}G</div>
          <div style={{ color: "#6b7280", fontSize: 10 }}>Reserva del grupo</div>
        </div>
      </div>

      {adventurers.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Grupo ({adventurers.length})</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {adventurers.map(a => (
              <div key={a.id} style={{ background: "#1a1a2e", borderRadius: 8, padding: "6px 12px", border: "1px solid #2d2d44", fontSize: 13, color: "#d4b896" }}>
                {a.nombre} {a.clase && `(${a.clase})`}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <NavButton icon="⚔️" label="Comenzar Mision" sub="Setup y partida" onClick={() => onNavigate("mission-setup")} accent />
        <NavButton icon="🛡️" label="Gestionar Grupo" sub="Fichas de aventureros" onClick={() => onNavigate("adventurers")} />
        <NavButton icon="📜" label="Registro de Campana" sub="Logros y recompensas" onClick={() => onNavigate("registry")} />
      </div>
    </div>
  );
}

function NavButton({ icon, label, sub, onClick, accent }) {
  return (
    <button onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 10, border: accent ? "2px solid #b91c1c" : "1px solid #2d2d44", background: accent ? "#b91c1c18" : "#1a1a2e", cursor: "pointer", textAlign: "left", width: "100%" }}>
      <span style={{ fontSize: 24, width: 40, textAlign: "center" }}>{icon}</span>
      <div>
        <div style={{ color: accent ? "#fca5a5" : "#d4b896", fontSize: 15, fontWeight: 700 }}>{label}</div>
        {sub && <div style={{ color: "#6b7280", fontSize: 12 }}>{sub}</div>}
      </div>
    </button>
  );
}

function AdventurersScreen({ adventurers, onUpdate, onAdd, onRemove, onDone }) {
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(adventurers.length === 0);

  useEffect(() => {
    if (adventurers.length === 0) setShowAdd(true);
  }, [adventurers.length]);

  if (selected) {
    const adv = adventurers.find(a => a.id === selected);
    if (!adv) {
      setSelected(null);
      return null;
    }
    return (
      <AdventurerSheetV2
        adv={adv}
        onUpdate={updated => onUpdate(updated)}
        onBack={() => setSelected(null)}
        onRemove={() => {
          onRemove(adv.id);
          setSelected(null);
        }}
      />
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ color: "#9ca3af", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Aventureros del Grupo</div>
      {adventurers.length === 0 && (
        <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", marginBottom: 12 }}>
          <div style={{ color: "#d4b896", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Arma tu grupo inicial</div>
          <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.5 }}>Anade aventureros, revisa su ficha y pulsa "Grupo finalizado" cuando termines.</div>
        </div>
      )}

      {adventurers.map(a => (
        <button key={a.id} onClick={() => setSelected(a.id)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 10, border: "1px solid #2d2d44", background: "#1a1a2e", marginBottom: 8, cursor: "pointer", textAlign: "left" }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#d4b896", fontSize: 15, fontWeight: 700 }}>{a.nombre}</div>
            <div style={{ color: "#6b7280", fontSize: 12 }}>{a.especie} · {a.clase || "Sin clase"} · Rango {a.rango}</div>
          </div>
          <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
            <span style={{ color: "#22c55e" }}>HP {a.salud_actual}</span>
            <span style={{ color: "#3b82f6" }}>MP {a.magia_actual}</span>
            <span style={{ color: "#eab308" }}>SP {a.habilidad_actual}</span>
          </div>
        </button>
      ))}

      {!showAdd ? (
        <button onClick={() => setShowAdd(true)}
          style={{ width: "100%", padding: 14, borderRadius: 10, border: "2px dashed #374151", background: "transparent", color: "#9ca3af", fontSize: 14, cursor: "pointer", marginTop: 8 }}>
          + Anadir Aventurero
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
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #2d2d44", background: "#0f172a", marginBottom: 4, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#d4b896", fontSize: 14, fontWeight: 600 }}>{ch.nombre}</div>
                  <div style={{ color: "#6b7280", fontSize: 11 }}>{ch.especie} · HP {ch.salud_max} · MP {ch.magia_max} · SP {ch.habilidad_max}</div>
                </div>
                <div style={{ color: "#9ca3af", fontSize: 11 }}>{ch.coste}G</div>
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdd(false)}
            style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 8, border: "1px solid #374151", background: "transparent", color: "#9ca3af", fontSize: 13, cursor: "pointer" }}>
            Cancelar
          </button>
        </div>
      )}

      <button onClick={onDone} disabled={adventurers.length === 0}
        style={{ width: "100%", padding: 14, marginTop: 12, borderRadius: 10, border: adventurers.length === 0 ? "1px solid #374151" : "2px solid #b91c1c", background: adventurers.length === 0 ? "#111827" : "#b91c1c22", color: adventurers.length === 0 ? "#4b5563" : "#fca5a5", fontSize: 14, fontWeight: 700, cursor: adventurers.length === 0 ? "not-allowed" : "pointer" }}>
        Grupo finalizado
      </button>
    </div>
  );
}

function MissionSetupScreen({ campaign, onStartMission, onBack }) {
  const mission = MISSIONS[campaign.currentMission];

  if (!mission) {
    return (
      <div style={{ padding: 16 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 0, marginBottom: 12 }}>Volver</button>
        <div style={{ color: "#d4b896", textAlign: "center", padding: 40 }}>Mision {campaign.currentMission} aun no implementada en esta fase.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 0, marginBottom: 12, fontSize: 13 }}>Volver</button>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ color: "#b91c1c", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Mision {mission.id}</div>
        <h2 style={{ color: "#d4b896", fontSize: 20, fontWeight: 800, margin: "4px 0" }}>{mission.nombre}</h2>
        <div style={{ color: "#6b7280", fontSize: 12 }}>Libro de Campana p.{mission.pagina}</div>
      </div>

      <Collapsible title="Condicion de entrada" icon="🔑" defaultOpen>
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
          {mission.reglas_especiales.map((rule, index) => (
            <div key={index} style={{ marginBottom: index < mission.reglas_especiales.length - 1 ? 10 : 0 }}>
              <div style={{ color: "#fca5a5", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{rule.nombre}</div>
              <p style={{ color: "#d4b896", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{rule.desc}</p>
            </div>
          ))}
        </Collapsible>
      )}

      <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 14, border: "1px solid #2d2d44", marginBottom: 12 }}>
        <div style={{ color: "#9ca3af", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Preparacion rapida</div>
        <div style={{ color: "#d4b896", fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
          Amenaza inicial: lado {mission.amenaza?.cara || "A"} · {mission.amenaza?.clavijas || 0} clavijas
        </div>
        {mission.mazo_eventos && <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>Mazo de eventos: {mission.mazo_eventos}</div>}
        {mission.asignacion_busqueda && <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.5 }}>{mission.asignacion_busqueda}</div>}
      </div>

      <button onClick={onStartMission}
        style={{ width: "100%", padding: 16, borderRadius: 10, border: "2px solid #b91c1c", background: "#b91c1c22", color: "#fca5a5", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
        Comenzar Partida
      </button>
    </div>
  );
}

// --- CAMPAIGN REGISTRY ---
function RegistryScreen({ campaign, onUpdate, onBack }) {
  const reg = campaign.registro;
  const completedMissionIds = new Set((campaign.historial_misiones || []).filter(entry => entry.success).map(entry => entry.missionId));
  const updateCampaignNumber = (field, value) => {
    onUpdate({ ...campaign, [field]: Math.max(0, Number(value) || 0) });
  };

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
            background: "transparent", color: "#d4b896", fontSize: 16, cursor: "pointer" }}>-</button>
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
        justifyContent: "center", color: "#22c55e", fontSize: 14, flexShrink: 0 }}>{val ? "OK" : ""}</div>
      <span style={{ color: val ? "#d4b896" : "#6b7280", fontSize: 13 }}>{label}</span>
    </button>
  );

  const campaignStatCard = (label, value, color, suffix, field) => (
    <div style={{ background: "#1a1a2e", borderRadius: 10, padding: 12, border: "1px solid #2d2d44", textAlign: "center" }}>
      <div style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <button onClick={() => updateCampaignNumber(field, value - 1)}
          style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #374151",
            background: "#0f172a", color: "#d4b896", fontSize: 18, cursor: "pointer" }}>-</button>
        <input
          type="number"
          min="0"
          value={value}
          onChange={e => updateCampaignNumber(field, e.target.value)}
          style={{ width: 88, textAlign: "center", background: "#0f172a", border: "1px solid #374151",
            borderRadius: 8, color, fontSize: 22, fontWeight: 800, padding: "6px 8px" }}
        />
        <button onClick={() => updateCampaignNumber(field, value + 1)}
          style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #374151",
            background: "#0f172a", color: "#d4b896", fontSize: 18, cursor: "pointer" }}>+</button>
      </div>
      <div style={{ color, fontSize: 12, fontWeight: 700, marginTop: 6 }}>{value || 0}{suffix}</div>
    </div>
  );

  return (
    <div style={{ padding: 16 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 0, marginBottom: 12, fontSize: 13 }}>&lt;- Volver</button>
      <h2 style={{ color: "#d4b896", fontSize: 18, fontWeight: 800, margin: "0 0 16px" }}>REG Registro de Campana</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {campaignStatCard("Renombre", Math.max(0, Number(campaign.renombre || 0) || 0), "#fbbf24", "", "renombre")}
        {campaignStatCard("Oro", Math.max(0, Number(campaign.oro || 0) || 0), "#d4b896", "G", "oro")}
      </div>
      <div style={{ color: "#6b7280", fontSize: 11, margin: "0 0 12px" }}>
        Ajusta estos valores aqui si retomas una campana avanzada o necesitas reflejar el estado real del grupo.
      </div>

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
                background: "#0f172a", color: "#d4b896", fontSize: 20, cursor: "pointer" }}>-</button>
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
      <Collapsible title="Contadores" icon="NUM" defaultOpen>
        {numField("Malagaunt derrotado", "malagauntDerrotado", reg.malagauntDerrotado)}
        {numField("Reliquias encontradas", "reliquias_encontradas", reg.reliquias_encontradas)}
        {numField("Cadaveres examinados", "cadaveres_examinados", reg.cadaveres_examinados)}
        {numField("Sepulturas registradas", "sepulturas_registradas", reg.sepulturas_registradas)}
        {numField("Invasores escapados", "invasores_escapados", reg.invasores_escapados)}
        {numField("Disminuir la horda", "disminuir_horda", reg.disminuir_horda)}
        {numField("Salas santificadas", "salas_santificadas", reg.salas_santificadas)}
      </Collapsible>

      {/* Logros */}
      <Collapsible title="Logros" icon="LOG">
        {boolField("Deuda de Favor", "logros.deuda_de_favor", reg.logros.deuda_de_favor)}
        {boolField("Rastro Esqueletico", "logros.rastro_esqueletico", reg.logros.rastro_esqueletico)}
        {boolField("Parafernalia Oculta", "logros.parafernalia_oculta", reg.logros.parafernalia_oculta)}
        {boolField("Aprendiz Derrotado", "logros.aprendiz_derrotado", reg.logros.aprendiz_derrotado)}
        {boolField("Aprendiz Liberado", "logros.aprendiz_liberado", reg.logros.aprendiz_liberado)}
        {boolField("Troll Derrotado", "logros.troll_derrotado_logro", reg.logros.troll_derrotado_logro)}
        {boolField("Investigacion en Curso", "logros.investigacion_en_curso", reg.logros.investigacion_en_curso)}
        {boolField("Escudo de Almas", "logros.escudo_de_almas", reg.logros.escudo_de_almas)}
      </Collapsible>

      {/* Recompensas */}
      <Collapsible title="Recompensas" icon="REP">
        {numField("Perspectiva Tactica", "recompensas.perspectiva_tactica", reg.recompensas.perspectiva_tactica)}
        {numField("Sabiduria de Mazmorra", "recompensas.sabiduria_de_mazmorra", reg.recompensas.sabiduria_de_mazmorra)}
        {boolField("Resistencia al Veneno", "recompensas.resistencia_al_veneno", reg.recompensas.resistencia_al_veneno)}
        {boolField("Debilidad del Objetivo", "recompensas.debilidad_del_objetivo", reg.recompensas.debilidad_del_objetivo)}
        {boolField("Experiencia de Combate", "recompensas.experiencia_de_combate", reg.recompensas.experiencia_de_combate)}
        {boolField("Saqueo de Sepulturas", "recompensas.saqueo_de_sepulturas", reg.recompensas.saqueo_de_sepulturas)}
        {boolField("Signos Reveladores", "recompensas.signos_reveladores", reg.recompensas.signos_reveladores)}
        {boolField("Ritual de Consagracion", "recompensas.ritual_de_consagracion", reg.recompensas.ritual_de_consagracion)}
        {boolField("Oferta de Ayuda", "recompensas.oferta_de_ayuda", reg.recompensas.oferta_de_ayuda)}
        {boolField("Contactos en Gremio", "recompensas.contactos_en_gremio", reg.recompensas.contactos_en_gremio)}
      </Collapsible>

      {/* Puntos de Entrada Mapeados */}
      <Collapsible title="Puntos de Entrada Mapeados" icon="MAP">
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
      <Collapsible title="Mision Actual" icon="ACT">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {MISSION_IDS.map(m => (
            <button key={m} onClick={() => onUpdate({ ...campaign, currentMission: m })}
              style={{ minWidth: 40, height: 36, borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer",
                border: campaign.currentMission === m ? "2px solid #b91c1c" : (completedMissionIds.has(m) ? "2px solid #166534" : "1px solid #374151"),
                background: campaign.currentMission === m ? "#b91c1c33" : (completedMissionIds.has(m) ? "#16653422" : "#0f172a"),
                color: campaign.currentMission === m ? "#fca5a5" : (completedMissionIds.has(m) ? "#bbf7d0" : "#6b7280") }}>{m}</button>
          ))}
        </div>
      </Collapsible>
      <Collapsible title="Historial de Misiones" icon="HIS">
        {(campaign.historial_misiones || []).length === 0 ? (
          <div style={{ color: "#6b7280", fontSize: 12 }}>Todavia no hay cierres de mision registrados.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...(campaign.historial_misiones || [])].slice().reverse().map((entry, index) => (
              <div key={entry.id || index} style={{ background: "#0f172a", borderRadius: 8, padding: 10, border: "1px solid #1f2937" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                  <div style={{ color: "#d4b896", fontSize: 13, fontWeight: 700 }}>{entry.missionId} | {entry.name}</div>
                  <div style={{ color: entry.success ? "#22c55e" : "#f87171", fontSize: 11, fontWeight: 700 }}>{entry.success ? "Superada" : "Retirada"}</div>
                </div>
                <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>
                  {entry.xpEach} PX por aventurero | +{entry.renombre || 0} Renombre | +{entry.oro || 0}G | +{entry.demora || 0} Demora
                </div>
                <div style={{ color: "#6b7280", fontSize: 11, marginTop: 4 }}>
                  {entry.primary ? "Primario completado" : "Primario pendiente"} | {entry.secondary ? "Secundario completado" : "Secundario pendiente"}
                </div>
                {entry.notes && <div style={{ color: "#6b7280", fontSize: 11, marginTop: 4, lineHeight: 1.5 }}>{entry.notes}</div>}
              </div>
            ))}
          </div>
        )}
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
          setCampaign(normalizeCampaign(c));
          const advs = (await DB.load("adventurers_" + lastCampId) || []).map(normalizeAdventurer);
          setAdventurers(advs);
          const ms = await DB.load("mission_state_" + lastCampId);
          if (ms) setMissionState(normalizeMissionState(ms));
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
    const c = normalizeCampaign(defaultCampaign(name));
    setCampaign(c);
    setAdventurers([]);
    setMissionState(null);
    setSubScreen("adventurers");
    setScreen("campaign");
  };

  const loadCampaign = async (summary) => {
    const c = await DB.load("campaign_" + summary.id);
    if (c) {
      setCampaign(normalizeCampaign(c));
      const advs = (await DB.load("adventurers_" + summary.id) || []).map(normalizeAdventurer);
      setAdventurers(advs);
      const ms = await DB.load("mission_state_" + summary.id);
      setMissionState(ms ? normalizeMissionState(ms) : null);
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
    const ms = normalizeMissionState(defaultMissionState(campaign.id, campaign.currentMission));
    setMissionState(ms);
    setSubScreen("board");
  };

  const finishMission = async () => {
    if (!campaign || !missionState) return;
    const resolvedMission = normalizeMissionState(missionState);
    const xpEach = Math.max(1, Number(resolvedMission.xp_base || 1)) + Math.max(0, Number(resolvedMission.xp_extra || 0));
    const maintenanceCost = adventurers.reduce((sum, adv) => sum + 1 + Math.max(1, Number(adv.rango || 1)), 0);
    const lodgingCost = resolvedMission.rest_mode === "posada" ? adventurers.length * 2 : 0;
    const craftedSpend = (resolvedMission.crafted_items || []).reduce((sum, item) => sum + Number(item.price || 0), 0);
    const marketSpend = (resolvedMission.purchased_items || []).reduce((sum, item) => sum + Number(item.price || 0), 0);
    const repairSpend = (resolvedMission.repaired_items || []).reduce((sum, item) => sum + Math.max(0, Number(item.cost) || 0), 0);
    const soldIncome = (resolvedMission.sold_items || []).reduce((sum, item) => sum + Math.max(0, Number(item.price) || 0), 0);
    const repairedKeys = new Set((resolvedMission.repaired_items || []).map(item => makeRepairKey(item.adventurerId, item.itemId)));
    const soldKeys = new Set((resolvedMission.sold_items || []).map(item => makeOwnedItemKey(item.adventurerId, item.itemId)));
    const repairedLabels = (resolvedMission.repaired_items || []).map(item => `${item.itemName || "Objeto"} (${item.cost || 0}G)`);
    const soldLabels = (resolvedMission.sold_items || []).map(item => `${item.itemName || "Objeto"} (${item.price || 0}G)`);
    const phaseGoldDelta = Number(resolvedMission.oro_ganado || 0) + soldIncome - maintenanceCost - lodgingCost - craftedSpend - repairSpend - marketSpend;
    const updatedAdventurers = adventurers.map(adv => {
      const normalized = normalizeAdventurer(adv);
      const craftedForAdventurer = (resolvedMission.crafted_items || [])
        .filter(item => item.adventurerId === normalized.id)
        .map(item => createCraftedInventoryItem({
          name: item.name,
          type: item.payload?.type || "Crafteo",
          size: item.payload?.size || "",
          price: item.price,
          res_required: item.res_required || "",
          expansion: item.expansion || "",
        }, item.payload));
      const purchasedForAdventurer = (resolvedMission.purchased_items || [])
        .filter(item => item.adventurerId === normalized.id)
        .map(item => normalizeInventoryItem(item.payload || { name: item.name, buy: item.price }));
      return normalizeAdventurer({
        ...normalized,
        experiencia: Math.max(0, Number(normalized.experiencia || 0) + xpEach),
        inventario: [
          ...(normalized.inventario || []).map(item => {
            if (soldKeys.has(makeOwnedItemKey(normalized.id, item.id))) return null;
            const repairKey = makeRepairKey(normalized.id, item.id);
            return repairedKeys.has(repairKey) ? normalizeInventoryItem({ ...item, broken: false }) : item;
          }).filter(Boolean),
          ...craftedForAdventurer,
          ...purchasedForAdventurer,
        ],
      });
    });
    const mission = MISSIONS[resolvedMission.mision_id];
    const updatedCampaign = normalizeCampaign({
      ...campaign,
      currentMission: resolvedMission.next_mission || campaign.currentMission,
      demora: Math.min(12, Math.max(0, Number(campaign.demora || 0) + Number(resolvedMission.demora_cambio || 0))),
      renombre: Math.max(0, Number(campaign.renombre || 0) + Number(resolvedMission.renombre_ganado || 0)),
      oro: Math.max(0, Number(campaign.oro || 0) + phaseGoldDelta),
      historial_misiones: [
        ...(campaign.historial_misiones || []),
        {
          id: resolvedMission.id,
          missionId: resolvedMission.mision_id,
          name: mission?.nombre || resolvedMission.mision_id,
          success: resolvedMission.success,
          primary: resolvedMission.primary_complete,
          secondary: resolvedMission.secondary_complete,
          xpEach,
          renombre: Number(resolvedMission.renombre_ganado || 0),
          oro: phaseGoldDelta,
          demora: Number(resolvedMission.demora_cambio || 0),
          notes: [
            resolvedMission.loot_notes,
            resolvedMission.rest_notes,
            repairedLabels.length > 0
              ? "Reparaciones: " + repairedLabels.join(", ")
              : "",
            soldLabels.length > 0
              ? "Ventas: " + soldLabels.join(", ")
              : "",
            (resolvedMission.crafted_items || []).length > 0
              ? "Crafteo: " + resolvedMission.crafted_items.map(item => item.name).join(", ")
              : "",
            (resolvedMission.purchased_items || []).length > 0
              ? "Compras: " + resolvedMission.purchased_items.map(item => item.name).join(", ")
              : "",
            resolvedMission.notas
          ].filter(Boolean).join(" | "),
          closedAt: new Date().toISOString(),
        },
      ],
    });
    setAdventurers(updatedAdventurers);
    setCampaign(updatedCampaign);
    setMissionState(null);
    setSubScreen("hub");
    await DB.remove("mission_state_" + campaign.id);
  };

  const handleNav = (target) => {
    if (target === "board" && !missionState) {
      setSubScreen("mission-setup");
      return;
    }
    setSubScreen(target);
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
          <div style={{ fontSize: 48, marginBottom: 12 }}>AV</div>
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
          onNavigate={handleNav}/>
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
          onUpdateMission={ms => setMissionState(normalizeMissionState(ms))}
          onUpdateAdventurer={updateAdventurer}
          onEndMission={() => setSubScreen("mission-resolution")}
          onBack={() => setSubScreen("hub")}/>
      )}

      {screen === "campaign" && subScreen === "mission-resolution" && missionState && (
        <MissionResolutionScreen campaign={campaign} missionState={missionState} adventurers={adventurers}
          onUpdateMission={ms => setMissionState(normalizeMissionState(ms))}
          onConfirm={finishMission}
          onBack={() => setSubScreen("board")}/>
      )}

      {screen === "campaign" && subScreen === "registry" && (
        <RegistryScreen campaign={campaign}
          onUpdate={updated => setCampaign(normalizeCampaign(updated))}
          onBack={() => setSubScreen("hub")}/>
      )}

      {/* Bottom Nav */}
      {screen === "campaign" && (
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 500, background: "#0c0c1dee", backdropFilter: "blur(10px)",
          borderTop: "1px solid #2d2d44", display: "flex", zIndex: 100 }}>
          {[
            { id: "hub", label: "Hub" },
            { id: "adventurers", label: "Grupo" },
            { id: "board", label: "Partida" },
            { id: "registry", label: "Registro" },
          ].map(tab => (
            <button key={tab.id} onClick={() => handleNav(tab.id)}
              style={{ flex: 1, padding: "10px 0", background: "none", border: "none",
                cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <BottomNavIcon id={tab.id} active={subScreen === tab.id} />
              <span style={{ fontSize: 9, color: subScreen === tab.id ? "#d4b896" : "#4b5563",
                fontWeight: subScreen === tab.id ? 700 : 400 }}>{tab.label}</span>
            </button>
          ))}
          <button onClick={goHome}
            style={{ padding: "10px 16px", background: "none", border: "none", borderLeft: "1px solid #2d2d44",
              cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <BottomNavIcon id="exit" active={false} />
            <span style={{ fontSize: 9, color: "#4b5563" }}>Salir</span>
          </button>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);


