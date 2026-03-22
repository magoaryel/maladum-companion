<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Maladum">
  <meta name="theme-color" content="#0c0c1d">
  <link rel="manifest" href="/manifest.json">
  <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%230c0c1d' width='100' height='100' rx='20'/><text x='50' y='62' text-anchor='middle' font-size='50'>⚔️</text></svg>">
  <title>Maladum Companion</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body { background: #0c0c1d; font-family: 'Cinzel', Georgia, serif; color: #d4b896; overflow-x: hidden;
      -webkit-font-smoothing: antialiased; padding-top: env(safe-area-inset-top); }
    input, select, button { font-family: inherit; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #2d2d44; border-radius: 2px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.9/babel.min.js"></script>
  <script type="text/babel" data-type="module">
const { useState, useEffect, useCallback, useRef } = React;

// ========== DATABASE LAYER (IndexedDB) ==========
const IDB = (() => {
  const DB_NAME = 'maladum_db';
  const DB_VERSION = 1;
  const STORE = 'data';
  let dbPromise = null;
  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => { req.result.createObjectStore(STORE); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }
  return {
    async get(key) {
      const db = await openDB();
      return new Promise((res, rej) => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(key);
        req.onsuccess = () => res(req.result ?? null);
        req.onerror = () => rej(req.error);
      });
    },
    async set(key, val) {
      const db = await openDB();
      return new Promise((res, rej) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(val, key);
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    },
    async del(key) {
      const db = await openDB();
      return new Promise((res, rej) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(key);
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    }
  };
})();

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
  { id:"fatigued", name:"Fatigado", icon:"😰", color:"#eab308" },
  { id:"poisoned", name:"Envenenado", icon:"☠️", color:"#22c55e" },
  { id:"cursed", name:"Maldito", icon:"💀", color:"#7c3aed" },
  { id:"burning", name:"Quemando", icon:"🔥", color:"#ef4444" },
  { id:"terrified", name:"Aterrorizado", icon:"😱", color:"#a855f7" },
  { id:"stunned", name:"Aturdido", icon:"💫", color:"#3b82f6" },
  { id:"wounded", name:"Herido", icon:"🩸", color:"#dc2626" },
  { id:"blessed", name:"Bendito", icon:"✨", color:"#fbbf24" },
  { id:"corrupted", name:"Corrompido", icon:"🌑", color:"#1e1b4b" },
  { id:"prone", name:"Derribado", icon:"⬇️", color:"#6b7280" },
];

const BASE_CHARACTERS = [
  { nombre:"Grogmar", especie:"Ormen", salud_max:7, habilidad_max:3, magia_max:2, acciones:2, coste:73, innatas:["Quick Recovery"] },
  { nombre:"Moranna", especie:"Human", salud_max:5, habilidad_max:5, magia_max:4, acciones:2, coste:80, innatas:["Impervious","Malacyte Mastery"] },
  { nombre:"Greet", especie:"Grobbler", salud_max:5, habilidad_max:5, magia_max:3, acciones:3, coste:75, innatas:["Barter","Tricks of the Trade"] },
  { nombre:"Syrio", especie:"Eld", salud_max:6, habilidad_max:4, magia_max:3, acciones:2, coste:64, innatas:["Reflexes"] },
  { nombre:"Callan", especie:"Human", salud_max:5, habilidad_max:4, magia_max:3, acciones:2, coste:54, innatas:["Frenzy"] },
  { nombre:"Nerinda", especie:"Human", salud_max:5, habilidad_max:4, magia_max:2, acciones:2, coste:80, innatas:["Weapons Master 1"] },
  { nombre:"Unger", especie:"Tregar", salud_max:4, habilidad_max:3, magia_max:1, acciones:2, coste:73, innatas:["Persuasion","Detect"] },
  { nombre:"Kriga", especie:"Human", salud_max:4, habilidad_max:3, magia_max:1, acciones:2, coste:73, innatas:[] },
  { nombre:"Beren", especie:"Human", salud_max:4, habilidad_max:4, magia_max:2, acciones:2, coste:71, innatas:["Natural Remedies","Ready for Anything"] },
  { nombre:"Hendley", especie:"Dwella", salud_max:4, habilidad_max:3, magia_max:1, acciones:2, coste:75, innatas:["Night Vision","Smithing"] },
  { nombre:"Galen", especie:"Eld", salud_max:3, habilidad_max:3, magia_max:1, acciones:2, coste:75, innatas:["Ambush"] },
  { nombre:"Artain", especie:"Human", salud_max:3, habilidad_max:3, magia_max:3, acciones:2, coste:61, innatas:["Entertainer"] },
  { nombre:"Ariah", especie:"Human", salud_max:3, habilidad_max:4, magia_max:1, acciones:2, coste:73, innatas:["Tactical Gift","Ranged Expert"] },
  { nombre:"Brahm", especie:"Human", salud_max:4, habilidad_max:4, magia_max:3, acciones:2, coste:90, innatas:["Weapons Master","Ranged Expert"] },
  { nombre:"Emmerik", especie:"Human", salud_max:3, habilidad_max:3, magia_max:4, acciones:2, coste:60, innatas:["Loremaster"] },
];

const CLASSES = ["Barbarian","Rogue","Sellsword","Assassin","Scavenger","Swindler","Marksman","Guardian","Blacksmith","Curator","Contender","Strategist","Maestro","Rook","Paladin","Prymorist","Eudaemon","Ranger","Druid","Magus","Rambler"];

const MISSIONS = {
  Intro: { id:"Intro", nombre:"De Moneda y Gloria", pagina:4,
    condicion:"Misión independiente rejugable. +1 Demora si se juega en campaña.",
    objetivo_primario:"Recolectar armas, armaduras y recursos. Ganar experiencia.",
    objetivo_secundario:"Recuperar Objetivos 7 y 8. Cada uno vale 1 Renombre en Mercado.",
    reglas_especiales:[{nombre:"Mecanismos Antiguos",desc:"4 palancas: 1=roto, 2=abre tragaluz, 3=cierra tragaluz, 4=cierra puerta, 5=desbloquea puerta, 6=retira pared → Cámara del Arcanista."}],
    amenaza:{cara:"A",clavijas:0}, mazo_eventos:"8× Lamentor, 2× Hellfront, 8× Mapa, 2× Malagaunt + dificultad",
    consecuencias:"Ninguna (independiente). En campaña: +1 Demora." },
  A: { id:"A", nombre:"Secretos en la Oscuridad", pagina:6,
    condicion:"Primera misión de la campaña.",
    objetivo_primario:"Recuperar Reliquias (Obj 1-8). Cada una vale 6₲. Anotar cantidad recuperada.",
    objetivo_secundario:"Recuperar Obj 9 del Escritorio del Arcanista → marcar Logro Parafernalia Oculta.",
    reglas_especiales:[], amenaza:{cara:"A",clavijas:0},
    mazo_eventos:"8× Lamentor, 8× Mapa, 2× Hellfront, 2× Malagaunt + dificultad",
    asignacion_busqueda:"Dejar 2 negras aparte. 6× fichas + 1× mapa en terreno buscable.",
    consecuencias:"Obj 1 → puedes jugar B. 5+ reliquias → C. 4 o menos → D." },
  B: { id:"B", nombre:"La Reliquia", pagina:8,
    condicion:"Opcional. Después de A si recuperaste Objetivo 1.",
    objetivo_primario:"Rescatar familiar del aldeano. Si escapa: 10₲ + 2 Renombre + Logro Deuda de Favor.",
    objetivo_secundario:"Saquear todo lo posible.",
    reglas_especiales:[{nombre:"Oscuridad",desc:"Toda el área en Oscuridad. Habitante no se activa hasta contacto → Amenaza +3."}],
    amenaza:{cara:"A",clavijas:2}, mazo_eventos:"8× Lamentor, 8× Mapa, 3× Hellfront, 1× Malagaunt + dificultad",
    consecuencias:"+1 Demora. 5+ reliquias → C, 4 o menos → D." },
  C: { id:"C", nombre:"Un Nuevo Poder en Ascenso", pagina:10,
    condicion:"5+ reliquias en Misión A.",
    objetivo_primario:"Recuperar partes de criaturas: Lamentor≥Distress→Obj1-3, Myria≥Distress→Obj4-5, Hellfront→Obj6, Rot Troll→Obj9.",
    objetivo_secundario:"Obj 7 y 8 juntos → Logro Rastro Esquelético.",
    reglas_especiales:[{nombre:"Sombras Cambiantes",desc:"Oscuridad activa. 3× Dado Mágico al inicio → Luz. Desde Distress: mover luz. Palancas mueven luz."}],
    amenaza:{cara:"A",clavijas:2}, mazo_eventos:"8× Lamentor, 8× Mapa, 2× Hellfront, 2× Malagaunt + dificultad",
    consecuencias:"Con Obj7/8: elegir ruta. Carretera→E, Túneles→F. Sin ellos→E." },
  D: { id:"D", nombre:"Resurrectionistas", pagina:12,
    condicion:"4 o menos reliquias en Misión A.",
    objetivo_primario:"Acumular botín. 1 Renombre / 20₲ de aumento.",
    objetivo_secundario:"Mapeo Túneles: Interactuar con puntos de entrada. Robo Tumbas: Buscar Sepulturas.",
    reglas_especiales:[{nombre:"Spawn",desc:"Si Revenants llegan sin ninguno activo → punto de entrada más cercano."}],
    amenaza:{cara:"A",clavijas:1}, mazo_eventos:"7× Lamentor, 2× Malagaunt, 6× Mapa, 2× Hellfront, 3× Malagaunt, 1× Omega + dif.",
    consecuencias:"Siguiente: Misión F." },
};

const TURN_PHASES = [
  { id:"dread", name:"Fase de Amenaza", icon:"⚡",
    steps:["Avanzar Amenaza +1","Si magia usada → +1 adicional","Si entra en espacio rojo → Dado Mágico","Robar Carta de Evento (desde ronda 2)","Resolver efecto según Amenaza"] },
  { id:"adventurers", name:"Fase de Aventureros", icon:"⚔️",
    steps:["Activar Aventureros alternando","Cada uno: hasta 2 acciones + 1 sin esfuerzo","Todos activados"] },
  { id:"adversary", name:"Fase de Adversarios", icon:"👹",
    steps:["Nuevas llegadas según Amenaza","Activar por Rango (mayor primero)","Resolver IA"] },
  { id:"npc", name:"Fase de PNJs", icon:"🧙",
    steps:["Activar Wandering Beasts","Activar Habitantes"] },
  { id:"assessment", name:"Fase de Evaluación", icon:"📋",
    steps:["Resolver estados (Burning, Poisoned...)",
      "Envenenado: 1-2=−1HP, 3-4=−1Skill, 5=Fatigado, 6=curado",
      "Retirar contadores de Activación","Siguiente primer jugador"] },
];

function defaultCampaign(name) {
  return {
    id:"camp_"+Date.now(), name, createdAt:new Date().toISOString(), currentMission:"A", demora:0,
    registro:{
      malagauntDerrotado:0, troll_derrotado:false, aprendiz_estado:null, aprendiz_nombre:null,
      cadaveres_examinados:0, sepulturas_registradas:0, invasores_escapados:0, disminuir_horda:0, salas_santificadas:0,
      puntos_entrada_mapeados:[],
      logros:{deuda_de_favor:false,rastro_esqueletico:false,parafernalia_oculta:false,aprendiz_derrotado:false,aprendiz_liberado:false,troll_derrotado_logro:false,investigacion_en_curso:false,escudo_de_almas:false},
      recompensas:{perspectiva_tactica:0,resistencia_al_veneno:false,debilidad_del_objetivo:false,experiencia_de_combate:false,saqueo_de_sepulturas:false,signos_reveladores:false,ritual_de_consagracion:false,oferta_de_ayuda:false,contactos_en_gremio:false,sabiduria_de_mazmorra:0}
    }
  };
}

function defaultAdventurer(campId, ch) {
  return {
    id:"adv_"+Date.now()+"_"+Math.random().toString(36).slice(2,6), campaign_id:campId,
    nombre:ch.nombre, clase:"", especie:ch.especie, rango:1, experiencia:0,
    salud_max:ch.salud_max, salud_actual:ch.salud_max, magia_max:ch.magia_max, magia_actual:ch.magia_max,
    habilidad_max:ch.habilidad_max, habilidad_actual:ch.habilidad_max, acciones:ch.acciones,
    coste:ch.coste, innatas:ch.innatas||[], status_effects:[], inventario:[], habilidades:[], renombre:0, vivo:true
  };
}

function defaultMissionState(campId, mid) {
  const m = MISSIONS[mid];
  return { id:"ms_"+Date.now(), campaign_id:campId, mision_id:mid, ronda:1,
    amenaza_nivel:m?.amenaza?.clavijas||0, amenaza_cara:m?.amenaza?.cara||"A",
    fase_actual:"dread", magia_usada_esta_ronda:false, fases_completadas:{}, steps_completados:{}, notas:"" };
}

// ========== COMPONENTS ==========
function PegBar({label,icon,current,max,color,onChange}) {
  const pegs = [];
  for(let i=0;i<max;i++) pegs.push(
    React.createElement('button',{key:i,onClick:()=>onChange(i<current?i:i+1),
      style:{width:28,height:28,borderRadius:'50%',border:'2px solid '+(i<current?color:'#374151'),
        background:i<current?color:'transparent',transition:'all 0.2s',cursor:'pointer',margin:2}})
  );
  return React.createElement('div',{style:{marginBottom:8}},
    React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6,marginBottom:4}},
      React.createElement('span',{style:{fontSize:16}},icon),
      React.createElement('span',{style:{color:'#d4b896',fontSize:13,fontWeight:600}},label),
      React.createElement('span',{style:{color:'#9ca3af',fontSize:12,marginLeft:'auto'}},current+'/'+max)),
    React.createElement('div',{style:{display:'flex',flexWrap:'wrap',gap:2}},pegs)
  );
}

function StatusEffects({effects,onChange}) {
  return React.createElement('div',{style:{display:'flex',flexWrap:'wrap',gap:6,marginTop:6}},
    STATUS_EFFECTS.map(se=>{
      const count=effects.filter(e=>e===se.id).length;
      const active=count>0;
      return React.createElement('div',{key:se.id,style:{display:'flex',alignItems:'center',gap:2}},
        React.createElement('button',{onClick:()=>onChange([...effects,se.id]),
          style:{minWidth:44,minHeight:36,padding:'4px 8px',borderRadius:6,
            border:active?'2px solid '+se.color:'1px solid #374151',
            background:active?se.color+'33':'transparent',color:active?se.color:'#6b7280',
            fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',gap:3}},
          React.createElement('span',null,se.icon),
          count>1&&React.createElement('span',{style:{fontWeight:700}},'×'+count)),
        active&&React.createElement('button',{onClick:()=>{const i=effects.indexOf(se.id);if(i>-1){const n=[...effects];n.splice(i,1);onChange(n);}},
          style:{width:24,height:24,borderRadius:'50%',border:'1px solid #ef4444',
            background:'transparent',color:'#ef4444',fontSize:14,cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center'}},'−')
      );
    })
  );
}

function ThreatTracker({level,cara,onLevelChange}) {
  const bands=THREAT_BANDS[cara]||THREAT_BANDS.A;
  let cum=0,bIdx=0;
  for(let i=0;i<bands.length;i++){if(level>=cum+bands[i].slots){cum+=bands[i].slots;bIdx=i+1;}else break;}
  const total=bands.reduce((s,b)=>s+b.slots,0);
  const bi=Math.min(bIdx,bands.length-1);
  return React.createElement('div',{style:{background:'#1a1a2e',borderRadius:12,padding:14,border:'1px solid #2d2d44'}},
    React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}},
      React.createElement('div',null,
        React.createElement('div',{style:{color:'#d4b896',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1}},'Amenaza'),
        React.createElement('div',{style:{color:bands[bi].color,fontSize:20,fontWeight:800}},bands[bi].name)),
      React.createElement('div',{style:{display:'flex',gap:6}},
        React.createElement('button',{onClick:()=>onLevelChange(Math.max(0,level-1)),
          style:{width:44,height:44,borderRadius:8,border:'1px solid #374151',background:'#1e293b',color:'#d4b896',fontSize:20,cursor:'pointer'}},'−'),
        React.createElement('div',{style:{width:52,height:44,borderRadius:8,background:bands[bi].color+'33',
          border:'2px solid '+bands[bi].color,display:'flex',alignItems:'center',justifyContent:'center',
          color:bands[bi].color,fontSize:22,fontWeight:800}},level),
        React.createElement('button',{onClick:()=>onLevelChange(Math.min(total,level+1)),
          style:{width:44,height:44,borderRadius:8,border:'1px solid #374151',background:'#1e293b',color:'#d4b896',fontSize:20,cursor:'pointer'}},'+'))),
    React.createElement('div',{style:{display:'flex',gap:2,height:18}},
      bands.map((band,bi2)=>{
        const sl=[];
        for(let s=0;s<band.slots;s++){
          const si=bands.slice(0,bi2).reduce((a,b2)=>a+b2.slots,0)+s;
          sl.push(React.createElement('div',{key:s,style:{flex:1,height:'100%',borderRadius:3,
            background:si<level?band.color:band.color+'22',border:'1px solid '+band.color+'44',transition:'background 0.3s'}}));
        }
        return React.createElement('div',{key:bi2,style:{display:'flex',gap:1,flex:band.slots}},sl);
      })),
    React.createElement('div',{style:{fontSize:10,color:'#6b7280',marginTop:6,textAlign:'center'}},'Cara '+cara+' · '+level+'/'+total+' clavijas')
  );
}

function Collapsible({title,icon,children,defaultOpen}) {
  const [open,setOpen]=useState(defaultOpen||false);
  return React.createElement('div',{style:{background:'#1a1a2e',borderRadius:10,border:'1px solid #2d2d44',marginBottom:8}},
    React.createElement('button',{onClick:()=>setOpen(!open),
      style:{width:'100%',padding:'12px 14px',background:'transparent',border:'none',display:'flex',alignItems:'center',gap:8,cursor:'pointer',color:'#d4b896'}},
      icon&&React.createElement('span',{style:{fontSize:18}},icon),
      React.createElement('span',{style:{flex:1,textAlign:'left',fontSize:14,fontWeight:700}},title),
      React.createElement('span',{style:{fontSize:12,transform:open?'rotate(180deg)':'',transition:'0.2s'}},'▼')),
    open&&React.createElement('div',{style:{padding:'0 14px 14px'}},children)
  );
}

function PhaseChecklist({phases,completedSteps,onToggleStep}) {
  const [expanded,setExpanded]=useState(null);
  return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:4}},
    phases.map(phase=>{
      const isOpen=expanded===phase.id;
      const allDone=phase.steps.every((_,i)=>completedSteps[phase.id+'_'+i]);
      return React.createElement('div',{key:phase.id,style:{background:'#1a1a2e',borderRadius:10,border:'1px solid #2d2d44',overflow:'hidden'}},
        React.createElement('button',{onClick:()=>setExpanded(isOpen?null:phase.id),
          style:{width:'100%',padding:'12px 14px',background:'transparent',border:'none',display:'flex',alignItems:'center',gap:10,cursor:'pointer',color:'#d4b896'}},
          React.createElement('span',{style:{fontSize:20}},phase.icon),
          React.createElement('span',{style:{flex:1,textAlign:'left',fontSize:14,fontWeight:700}},phase.name),
          allDone&&React.createElement('span',{style:{color:'#22c55e',fontSize:18}},'✓'),
          React.createElement('span',{style:{fontSize:12,transform:isOpen?'rotate(180deg)':'',transition:'0.2s'}},'▼')),
        isOpen&&React.createElement('div',{style:{padding:'0 14px 12px'}},
          phase.steps.map((step,i)=>{
            const done=completedSteps[phase.id+'_'+i];
            return React.createElement('button',{key:i,onClick:()=>onToggleStep(phase.id,i),
              style:{display:'flex',alignItems:'flex-start',gap:10,padding:'8px 0',background:'none',border:'none',
                borderTop:i>0?'1px solid #2d2d44':'none',width:'100%',cursor:'pointer',textAlign:'left'}},
              React.createElement('div',{style:{width:22,height:22,borderRadius:4,flexShrink:0,marginTop:1,
                border:done?'2px solid #22c55e':'2px solid #4b5563',background:done?'#22c55e22':'transparent',
                display:'flex',alignItems:'center',justifyContent:'center',color:'#22c55e',fontSize:14}},done?'✓':''),
              React.createElement('span',{style:{color:done?'#6b7280':'#d4b896',fontSize:13,textDecoration:done?'line-through':'none'}},step));
          }))
      );
    })
  );
}

// ========== MAIN APP ==========
function App() {
  const [screen,setScreen]=useState('loading');
  const [campaigns,setCampaigns]=useState([]);
  const [campaign,setCampaign]=useState(null);
  const [adventurers,setAdventurers]=useState([]);
  const [missionState,setMissionState]=useState(null);
  const [subScreen,setSubScreen]=useState('hub');
  const [selectedAdv,setSelectedAdv]=useState(null);
  const [showAddAdv,setShowAddAdv]=useState(false);
  const [showCreate,setShowCreate]=useState(false);
  const [newName,setNewName]=useState('');

  useEffect(()=>{
    (async()=>{
      const campList=await IDB.get('campaigns_list')||[];
      setCampaigns(campList);
      const lastId=await IDB.get('last_campaign_id');
      if(lastId){
        const c=await IDB.get('campaign_'+lastId);
        if(c){setCampaign(c);setAdventurers(await IDB.get('adventurers_'+lastId)||[]);
          setMissionState(await IDB.get('mission_state_'+lastId));setSubScreen('hub');setScreen('campaign');return;}
      }
      setScreen('home');
    })();
  },[]);

  useEffect(()=>{
    if(!campaign)return;
    IDB.set('campaign_'+campaign.id,campaign);
    IDB.set('last_campaign_id',campaign.id);
    const list=campaigns.map(c=>c.id===campaign.id?{id:c.id,name:campaign.name,currentMission:campaign.currentMission,demora:campaign.demora}:c);
    if(!list.find(c=>c.id===campaign.id))list.push({id:campaign.id,name:campaign.name,currentMission:campaign.currentMission,demora:campaign.demora});
    setCampaigns(list);IDB.set('campaigns_list',list);
  },[campaign]);
  useEffect(()=>{if(campaign)IDB.set('adventurers_'+campaign.id,adventurers);},[adventurers]);
  useEffect(()=>{if(campaign&&missionState)IDB.set('mission_state_'+campaign.id,missionState);},[missionState]);

  const createCampaign=(name)=>{const c=defaultCampaign(name);setCampaign(c);setAdventurers([]);setMissionState(null);setSubScreen('hub');setScreen('campaign');};
  const loadCampaign=async(s)=>{const c=await IDB.get('campaign_'+s.id);if(c){setCampaign(c);setAdventurers(await IDB.get('adventurers_'+s.id)||[]);setMissionState(await IDB.get('mission_state_'+s.id));setSubScreen('hub');setScreen('campaign');}};
  const addAdv=(ch)=>{setAdventurers(p=>[...p,defaultAdventurer(campaign.id,ch)]);};
  const updateAdv=(u)=>{setAdventurers(p=>p.map(a=>a.id===u.id?u:a));};
  const removeAdv=(id)=>{setAdventurers(p=>p.filter(a=>a.id!==id));};
  const startMission=()=>{setMissionState(defaultMissionState(campaign.id,campaign.currentMission));setSubScreen('board');};
  const goHome=()=>{setCampaign(null);setAdventurers([]);setMissionState(null);setScreen('home');IDB.del('last_campaign_id');};

  const S={wrap:{minHeight:'100vh',background:'linear-gradient(180deg,#0c0c1d,#121225)',fontFamily:"'Cinzel',Georgia,serif",color:'#d4b896',maxWidth:500,margin:'0 auto',position:'relative',paddingBottom:80}};

  if(screen==='loading')return React.createElement('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0c0c1d',color:'#d4b896'}},
    React.createElement('div',{style:{textAlign:'center'}},React.createElement('div',{style:{fontSize:48,marginBottom:12}},'⚔️'),React.createElement('div',null,'Cargando...')));

  // ---- HOME ----
  if(screen==='home') return React.createElement('div',{style:S.wrap},
    React.createElement('div',{style:{padding:16,maxWidth:500,margin:'0 auto'}},
      React.createElement('div',{style:{textAlign:'center',marginBottom:32,paddingTop:24}},
        React.createElement('div',{style:{fontSize:42,marginBottom:8}},'⚔️'),
        React.createElement('h1',{style:{color:'#d4b896',fontSize:26,fontWeight:800,margin:0,letterSpacing:2}},'MALADUM'),
        React.createElement('div',{style:{color:'#9ca3af',fontSize:13,marginTop:4,letterSpacing:3,textTransform:'uppercase'}},'Companion App'),
        React.createElement('div',{style:{width:60,height:2,background:'linear-gradient(90deg,transparent,#b91c1c,transparent)',margin:'12px auto'}})),
      campaigns.length>0&&React.createElement('div',{style:{marginBottom:20}},
        React.createElement('div',{style:{color:'#9ca3af',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:2,marginBottom:8}},'Campañas guardadas'),
        campaigns.map(c=>React.createElement('button',{key:c.id,onClick:()=>loadCampaign(c),
          style:{width:'100%',padding:14,borderRadius:10,border:'1px solid #2d2d44',background:'#1a1a2e',marginBottom:8,cursor:'pointer',textAlign:'left'}},
          React.createElement('div',{style:{color:'#d4b896',fontSize:15,fontWeight:700}},c.name),
          React.createElement('div',{style:{display:'flex',gap:12,marginTop:6,fontSize:12,color:'#9ca3af'}},
            React.createElement('span',null,'Misión: '+c.currentMission),React.createElement('span',null,'Demora: '+c.demora))))),
      !showCreate?React.createElement('button',{onClick:()=>setShowCreate(true),
        style:{width:'100%',padding:16,borderRadius:10,border:'2px solid #b91c1c',background:'#b91c1c22',color:'#fca5a5',fontSize:16,fontWeight:700,cursor:'pointer',letterSpacing:1}},
        '+ Nueva Campaña'):
      React.createElement('div',{style:{background:'#1a1a2e',borderRadius:12,padding:16,border:'1px solid #2d2d44'}},
        React.createElement('input',{value:newName,onChange:e=>setNewName(e.target.value),placeholder:'Nombre de la campaña',
          style:{width:'100%',padding:12,borderRadius:8,border:'1px solid #374151',background:'#0f172a',color:'#d4b896',fontSize:15,boxSizing:'border-box'}}),
        React.createElement('div',{style:{display:'flex',gap:8,marginTop:12}},
          React.createElement('button',{onClick:()=>setShowCreate(false),style:{flex:1,padding:12,borderRadius:8,border:'1px solid #374151',background:'transparent',color:'#9ca3af',fontSize:14,cursor:'pointer'}},'Cancelar'),
          React.createElement('button',{onClick:()=>{if(newName.trim()){createCampaign(newName.trim());setNewName('');setShowCreate(false);}},
            style:{flex:1,padding:12,borderRadius:8,border:'none',background:'#b91c1c',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}},'Crear')))));

  // ---- CAMPAIGN SCREENS ----
  const BottomNav=React.createElement('div',{style:{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:500,background:'#0c0c1dee',backdropFilter:'blur(10px)',borderTop:'1px solid #2d2d44',display:'flex',zIndex:100}},
    [{id:'hub',icon:'🏠',label:'Hub'},{id:'adventurers',icon:'🛡️',label:'Grupo'},{id:'board',icon:'⚔️',label:'Partida'},{id:'registry',icon:'📜',label:'Registro'}].map(t=>
      React.createElement('button',{key:t.id,onClick:()=>{setSelectedAdv(null);setSubScreen(t.id);},
        style:{flex:1,padding:'10px 0',background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2}},
        React.createElement('span',{style:{fontSize:20}},t.icon),
        React.createElement('span',{style:{fontSize:9,color:subScreen===t.id?'#d4b896':'#4b5563',fontWeight:subScreen===t.id?700:400}},t.label))),
    React.createElement('button',{onClick:goHome,style:{padding:'10px 16px',background:'none',border:'none',borderLeft:'1px solid #2d2d44',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2}},
      React.createElement('span',{style:{fontSize:20}},'🚪'),React.createElement('span',{style:{fontSize:9,color:'#4b5563'}},'Salir')));

  // HUB
  if(subScreen==='hub'&&campaign){
    return React.createElement('div',{style:S.wrap},
      React.createElement('div',{style:{padding:16}},
        React.createElement('div',{style:{textAlign:'center',marginBottom:16}},
          React.createElement('div',{style:{color:'#9ca3af',fontSize:11,textTransform:'uppercase',letterSpacing:2}},'Campaña'),
          React.createElement('h2',{style:{color:'#d4b896',fontSize:20,fontWeight:800,margin:'4px 0'}},campaign.name)),
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}},
          React.createElement('div',{style:{background:'#1a1a2e',borderRadius:10,padding:12,border:'1px solid #2d2d44',textAlign:'center'}},
            React.createElement('div',{style:{color:'#9ca3af',fontSize:10,textTransform:'uppercase'}},'Misión'),
            React.createElement('div',{style:{color:'#d4b896',fontSize:24,fontWeight:800}},campaign.currentMission),
            React.createElement('div',{style:{color:'#6b7280',fontSize:11}},MISSIONS[campaign.currentMission]?.nombre||'')),
          React.createElement('div',{style:{background:'#1a1a2e',borderRadius:10,padding:12,border:'1px solid #2d2d44',textAlign:'center'}},
            React.createElement('div',{style:{color:'#9ca3af',fontSize:10,textTransform:'uppercase'}},'Demora'),
            React.createElement('div',{style:{color:campaign.demora>=7?'#ef4444':campaign.demora>=4?'#eab308':'#22c55e',fontSize:24,fontWeight:800}},campaign.demora+'/12'))),
        adventurers.length>0&&React.createElement('div',{style:{marginBottom:16}},
          React.createElement('div',{style:{color:'#9ca3af',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:2,marginBottom:8}},'Grupo ('+adventurers.length+')'),
          React.createElement('div',{style:{display:'flex',flexWrap:'wrap',gap:6}},
            adventurers.map(a=>React.createElement('div',{key:a.id,style:{background:'#1a1a2e',borderRadius:8,padding:'6px 12px',border:'1px solid #2d2d44',fontSize:13,color:'#d4b896'}},a.nombre+(a.clase?' ('+a.clase+')':''))))),
        [{icon:'⚔️',label:'Comenzar Misión',sub:'Setup y partida',to:'mission-setup',accent:true},
         {icon:'🛡️',label:'Gestionar Grupo',sub:'Fichas de aventureros',to:'adventurers'},
         {icon:'📜',label:'Registro de Campaña',sub:'Logros y recompensas',to:'registry'}].map(b=>
          React.createElement('button',{key:b.to,onClick:()=>setSubScreen(b.to),
            style:{display:'flex',alignItems:'center',gap:14,padding:14,borderRadius:10,width:'100%',marginBottom:8,
              border:b.accent?'2px solid #b91c1c':'1px solid #2d2d44',background:b.accent?'#b91c1c18':'#1a1a2e',cursor:'pointer',textAlign:'left'}},
            React.createElement('span',{style:{fontSize:24,width:40,textAlign:'center'}},b.icon),
            React.createElement('div',null,
              React.createElement('div',{style:{color:b.accent?'#fca5a5':'#d4b896',fontSize:15,fontWeight:700}},b.label),
              b.sub&&React.createElement('div',{style:{color:'#6b7280',fontSize:12}},b.sub))))),
      BottomNav);
  }

  // ADVENTURERS
  if(subScreen==='adventurers'){
    if(selectedAdv){
      const adv=adventurers.find(a=>a.id===selectedAdv);
      if(!adv){setSelectedAdv(null);return null;}
      return React.createElement('div',{style:S.wrap},
        React.createElement('div',{style:{padding:16}},
          React.createElement('button',{onClick:()=>setSelectedAdv(null),style:{background:'none',border:'none',color:'#9ca3af',fontSize:13,cursor:'pointer',padding:0,marginBottom:12}},'← Volver al grupo'),
          React.createElement('div',{style:{textAlign:'center',marginBottom:16}},
            React.createElement('h2',{style:{color:'#d4b896',fontSize:22,fontWeight:800,margin:0}},adv.nombre),
            React.createElement('div',{style:{color:'#6b7280',fontSize:13}},adv.especie+' · Rango '+adv.rango+' · '+adv.coste+'₲')),
          React.createElement('div',{style:{marginBottom:12}},
            React.createElement('select',{value:adv.clase,onChange:e=>updateAdv({...adv,clase:e.target.value}),
              style:{width:'100%',padding:10,borderRadius:8,border:'1px solid #374151',background:'#0f172a',color:'#d4b896',fontSize:14}},
              React.createElement('option',{value:''},'— Sin clase —'),
              CLASSES.map(c=>React.createElement('option',{key:c,value:c},c)))),
          React.createElement('div',{style:{background:'#1a1a2e',borderRadius:12,padding:14,border:'1px solid #2d2d44',marginBottom:12}},
            React.createElement(PegBar,{label:'Salud',icon:'♥',current:adv.salud_actual,max:adv.salud_max,color:'#22c55e',onChange:v=>updateAdv({...adv,salud_actual:v})}),
            React.createElement(PegBar,{label:'Magia',icon:'✦',current:adv.magia_actual,max:adv.magia_max,color:'#3b82f6',onChange:v=>updateAdv({...adv,magia_actual:v})}),
            React.createElement(PegBar,{label:'Habilidad',icon:'◆',current:adv.habilidad_actual,max:adv.habilidad_max,color:'#eab308',onChange:v=>updateAdv({...adv,habilidad_actual:v})})),
          React.createElement(Collapsible,{title:'Estados',icon:'💀',defaultOpen:adv.status_effects.length>0},
            React.createElement(StatusEffects,{effects:adv.status_effects,onChange:v=>updateAdv({...adv,status_effects:v})})),
          adv.innatas.length>0&&React.createElement(Collapsible,{title:'Habilidades Innatas',icon:'⭐'},
            React.createElement('div',{style:{display:'flex',flexWrap:'wrap',gap:6}},
              adv.innatas.map(h=>React.createElement('span',{key:h,style:{padding:'4px 10px',borderRadius:6,background:'#eab30822',border:'1px solid #eab30844',color:'#eab308',fontSize:12}},h)))),
          React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8}},
            ['experiencia','renombre'].map(f=>
              React.createElement('div',{key:f,style:{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#0f172a',borderRadius:8,padding:'8px 10px'}},
                React.createElement('span',{style:{color:'#9ca3af',fontSize:12}},f.charAt(0).toUpperCase()+f.slice(1)),
                React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6}},
                  React.createElement('button',{onClick:()=>updateAdv({...adv,[f]:Math.max(0,adv[f]-1)}),style:{width:28,height:28,borderRadius:6,border:'1px solid #374151',background:'transparent',color:'#d4b896',fontSize:16,cursor:'pointer'}},'−'),
                  React.createElement('span',{style:{color:'#d4b896',fontSize:16,fontWeight:700,width:24,textAlign:'center'}},adv[f]),
                  React.createElement('button',{onClick:()=>updateAdv({...adv,[f]:adv[f]+1}),style:{width:28,height:28,borderRadius:6,border:'1px solid #374151',background:'transparent',color:'#d4b896',fontSize:16,cursor:'pointer'}},'+'))
              ))),
          React.createElement('button',{onClick:()=>{removeAdv(adv.id);setSelectedAdv(null);},
            style:{width:'100%',padding:12,marginTop:12,borderRadius:8,border:'1px solid #7f1d1d',background:'#7f1d1d22',color:'#fca5a5',fontSize:13,cursor:'pointer'}},'Retirar del grupo')),
        BottomNav);
    }
    return React.createElement('div',{style:S.wrap},
      React.createElement('div',{style:{padding:16}},
        React.createElement('div',{style:{color:'#9ca3af',fontSize:11,textTransform:'uppercase',letterSpacing:2,marginBottom:12}},'Aventureros del Grupo'),
        adventurers.map(a=>React.createElement('button',{key:a.id,onClick:()=>setSelectedAdv(a.id),
          style:{width:'100%',display:'flex',alignItems:'center',gap:12,padding:12,borderRadius:10,border:'1px solid #2d2d44',background:'#1a1a2e',marginBottom:8,cursor:'pointer',textAlign:'left'}},
          React.createElement('div',{style:{flex:1}},
            React.createElement('div',{style:{color:'#d4b896',fontSize:15,fontWeight:700}},a.nombre),
            React.createElement('div',{style:{color:'#6b7280',fontSize:12}},a.especie+' · '+(a.clase||'Sin clase')+' · Rango '+a.rango)),
          React.createElement('div',{style:{display:'flex',gap:8,fontSize:12}},
            React.createElement('span',{style:{color:'#22c55e'}},'♥'+a.salud_actual),
            React.createElement('span',{style:{color:'#3b82f6'}},'✦'+a.magia_actual),
            React.createElement('span',{style:{color:'#eab308'}},'◆'+a.habilidad_actual)))),
        !showAddAdv?React.createElement('button',{onClick:()=>setShowAddAdv(true),
          style:{width:'100%',padding:14,borderRadius:10,border:'2px dashed #374151',background:'transparent',color:'#9ca3af',fontSize:14,cursor:'pointer',marginTop:8}},
          '+ Añadir Aventurero'):
        React.createElement('div',{style:{background:'#1a1a2e',borderRadius:12,padding:12,border:'1px solid #2d2d44',marginTop:8}},
          React.createElement('div',{style:{maxHeight:300,overflowY:'auto'}},
            BASE_CHARACTERS.map(ch=>React.createElement('button',{key:ch.nombre,onClick:()=>{addAdv(ch);setShowAddAdv(false);},
              style:{width:'100%',padding:10,borderRadius:8,border:'1px solid #2d2d44',background:'#0f172a',marginBottom:4,cursor:'pointer',textAlign:'left',display:'flex',justifyContent:'space-between',alignItems:'center'}},
              React.createElement('div',null,
                React.createElement('div',{style:{color:'#d4b896',fontSize:14,fontWeight:600}},ch.nombre),
                React.createElement('div',{style:{color:'#6b7280',fontSize:11}},ch.especie+' · ♥'+ch.salud_max+' ✦'+ch.magia_max+' ◆'+ch.habilidad_max)),
              React.createElement('div',{style:{color:'#9ca3af',fontSize:11}},ch.coste+'₲')))),
          React.createElement('button',{onClick:()=>setShowAddAdv(false),
            style:{width:'100%',marginTop:8,padding:10,borderRadius:8,border:'1px solid #374151',background:'transparent',color:'#9ca3af',fontSize:13,cursor:'pointer'}},'Cancelar'))),
      BottomNav);
  }

  // MISSION SETUP
  if(subScreen==='mission-setup'){
    const m=MISSIONS[campaign.currentMission];
    if(!m)return React.createElement('div',{style:S.wrap},
      React.createElement('div',{style:{padding:16}},
        React.createElement('button',{onClick:()=>setSubScreen('hub'),style:{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',padding:0,marginBottom:12,fontSize:13}},'← Volver'),
        React.createElement('div',{style:{color:'#d4b896',textAlign:'center',padding:40}},'Misión '+campaign.currentMission+' — datos disponibles en Fase 2.')),BottomNav);
    return React.createElement('div',{style:S.wrap},
      React.createElement('div',{style:{padding:16}},
        React.createElement('button',{onClick:()=>setSubScreen('hub'),style:{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',padding:0,marginBottom:12,fontSize:13}},'← Volver'),
        React.createElement('div',{style:{textAlign:'center',marginBottom:16}},
          React.createElement('div',{style:{color:'#b91c1c',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:2}},'Misión '+m.id),
          React.createElement('h2',{style:{color:'#d4b896',fontSize:20,fontWeight:800,margin:'4px 0'}},m.nombre),
          React.createElement('div',{style:{color:'#6b7280',fontSize:12}},'p.'+m.pagina)),
        React.createElement(Collapsible,{title:'Condición',icon:'🔑',defaultOpen:true},
          React.createElement('p',{style:{color:'#d4b896',fontSize:13,lineHeight:1.6,margin:0}},m.condicion)),
        React.createElement(Collapsible,{title:'Objetivo Primario',icon:'🎯',defaultOpen:true},
          React.createElement('p',{style:{color:'#d4b896',fontSize:13,lineHeight:1.6,margin:0}},m.objetivo_primario)),
        React.createElement(Collapsible,{title:'Objetivo Secundario',icon:'📌'},
          React.createElement('p',{style:{color:'#d4b896',fontSize:13,lineHeight:1.6,margin:0}},m.objetivo_secundario)),
        m.reglas_especiales.length>0&&React.createElement(Collapsible,{title:'Reglas Especiales',icon:'📖'},
          m.reglas_especiales.map((r,i)=>React.createElement('div',{key:i,style:{marginBottom:i<m.reglas_especiales.length-1?10:0}},
            React.createElement('div',{style:{color:'#fca5a5',fontSize:13,fontWeight:700,marginBottom:4}},r.nombre),
            React.createElement('p',{style:{color:'#d4b896',fontSize:13,lineHeight:1.6,margin:0}},r.desc)))),
        React.createElement('div',{style:{background:'#1a1a2e',borderRadius:10,padding:14,border:'1px solid #2d2d44',marginBottom:8}},
          React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}},
            React.createElement('div',{style:{background:'#0f172a',borderRadius:8,padding:10}},
              React.createElement('div',{style:{color:'#6b7280',fontSize:10}},'Registro Amenaza'),
              React.createElement('div',{style:{color:'#d4b896',fontSize:16,fontWeight:800}},'Cara '+m.amenaza.cara),
              React.createElement('div',{style:{color:'#9ca3af',fontSize:12}},m.amenaza.clavijas+' clavijas')),
            React.createElement('div',{style:{background:'#0f172a',borderRadius:8,padding:10}},
              React.createElement('div',{style:{color:'#6b7280',fontSize:10}},'Mazo Eventos'),
              React.createElement('div',{style:{color:'#d4b896',fontSize:11,lineHeight:1.5}},m.mazo_eventos)))),
        React.createElement(Collapsible,{title:'Consecuencias',icon:'🔮'},
          React.createElement('p',{style:{color:'#d4b896',fontSize:13,lineHeight:1.6,margin:0}},m.consecuencias)),
        React.createElement('button',{onClick:startMission,
          style:{width:'100%',padding:16,borderRadius:10,border:'none',background:'linear-gradient(135deg,#b91c1c,#991b1b)',color:'#fff',fontSize:16,fontWeight:800,cursor:'pointer',marginTop:12,letterSpacing:1}},
          '⚔️ Comenzar Partida')),
      BottomNav);
  }

  // MAIN BOARD
  if(subScreen==='board'&&missionState){
    const m=MISSIONS[missionState.mision_id];
    return React.createElement('div',{style:S.wrap},
      React.createElement('div',{style:{padding:16}},
        React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}},
          React.createElement('button',{onClick:()=>setSubScreen('hub'),style:{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',padding:0,fontSize:13}},'← Hub'),
          React.createElement('div',{style:{textAlign:'center'}},
            React.createElement('div',{style:{color:'#b91c1c',fontSize:10,fontWeight:700,textTransform:'uppercase'}},'Misión '+missionState.mision_id),
            React.createElement('div',{style:{color:'#d4b896',fontSize:13,fontWeight:700}},m?.nombre||'')),
          React.createElement('div',{style:{background:'#1a1a2e',borderRadius:8,padding:'4px 12px',border:'1px solid #2d2d44'}},
            React.createElement('div',{style:{color:'#6b7280',fontSize:9,textTransform:'uppercase'}},'Ronda'),
            React.createElement('div',{style:{color:'#d4b896',fontSize:22,fontWeight:800,textAlign:'center'}},missionState.ronda))),
        React.createElement(ThreatTracker,{level:missionState.amenaza_nivel,cara:missionState.amenaza_cara,
          onLevelChange:v=>setMissionState({...missionState,amenaza_nivel:v})}),
        React.createElement('button',{onClick:()=>setMissionState({...missionState,magia_usada_esta_ronda:!missionState.magia_usada_esta_ronda}),
          style:{width:'100%',padding:10,borderRadius:8,marginTop:8,marginBottom:12,
            border:missionState.magia_usada_esta_ronda?'2px solid #3b82f6':'1px solid #374151',
            background:missionState.magia_usada_esta_ronda?'#3b82f622':'#1a1a2e',
            color:missionState.magia_usada_esta_ronda?'#60a5fa':'#6b7280',fontSize:13,cursor:'pointer',fontWeight:600}},
          '✦ '+(missionState.magia_usada_esta_ronda?'Magia usada (+1 Amenaza)':'¿Se usó magia?')),
        React.createElement('div',{style:{marginBottom:12}},
          React.createElement('div',{style:{color:'#9ca3af',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:2,marginBottom:8}},'Fases del turno'),
          React.createElement(PhaseChecklist,{phases:TURN_PHASES,completedSteps:missionState.steps_completados||{},
            onToggleStep:(ph,i)=>setMissionState({...missionState,steps_completados:{...missionState.steps_completados,[ph+'_'+i]:!missionState.steps_completados[ph+'_'+i]}})})),
        React.createElement('button',{onClick:()=>setMissionState({...missionState,ronda:missionState.ronda+1,magia_usada_esta_ronda:false,steps_completados:{}}),
          style:{width:'100%',padding:14,borderRadius:10,border:'2px solid #eab308',background:'#eab30815',color:'#eab308',fontSize:15,fontWeight:700,cursor:'pointer',marginBottom:12}},
          '▶ Avanzar a Ronda '+(missionState.ronda+1)),
        React.createElement('div',{style:{color:'#9ca3af',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:2,marginBottom:8}},'Aventureros'),
        adventurers.map(a=>React.createElement('div',{key:a.id,style:{background:'#1a1a2e',borderRadius:10,padding:12,border:'1px solid #2d2d44',marginBottom:8}},
          React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}},
            React.createElement('div',null,
              React.createElement('span',{style:{color:'#d4b896',fontSize:14,fontWeight:700}},a.nombre),
              React.createElement('span',{style:{color:'#6b7280',fontSize:12,marginLeft:8}},a.clase||a.especie)),
            a.status_effects.length>0&&React.createElement('div',{style:{display:'flex',gap:2}},
              [...new Set(a.status_effects)].map(se=>{const s=STATUS_EFFECTS.find(x=>x.id===se);return s?React.createElement('span',{key:se,style:{fontSize:14}},s.icon):null;}))),
          React.createElement(PegBar,{label:'HP',icon:'♥',current:a.salud_actual,max:a.salud_max,color:'#22c55e',onChange:v=>updateAdv({...a,salud_actual:v})}),
          React.createElement(PegBar,{label:'MP',icon:'✦',current:a.magia_actual,max:a.magia_max,color:'#3b82f6',onChange:v=>updateAdv({...a,magia_actual:v})}),
          React.createElement(PegBar,{label:'SP',icon:'◆',current:a.habilidad_actual,max:a.habilidad_max,color:'#eab308',onChange:v=>updateAdv({...a,habilidad_actual:v})}))),
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8}},
          React.createElement('button',{onClick:()=>window.open('https://xinix.github.io/maladum/','_blank'),
            style:{padding:12,borderRadius:8,border:'1px solid #2d2d44',background:'#1a1a2e',color:'#d4b896',fontSize:12,cursor:'pointer'}},'📦 Items DB'),
          React.createElement('button',{onClick:()=>{setMissionState(null);setSubScreen('hub');},
            style:{padding:12,borderRadius:8,border:'1px solid #7f1d1d',background:'#7f1d1d22',color:'#fca5a5',fontSize:12,cursor:'pointer'}},'✅ Fin de Misión'))),
      BottomNav);
  }

  // REGISTRY
  if(subScreen==='registry'&&campaign){
    const reg=campaign.registro;
    const updateField=(path,val)=>{const parts=path.split('.');const nr=JSON.parse(JSON.stringify(reg));let o=nr;for(let i=0;i<parts.length-1;i++)o=o[parts[i]];o[parts[parts.length-1]]=val;setCampaign({...campaign,registro:nr});};
    const NF=(l,p,v)=>React.createElement('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#0f172a',borderRadius:8,padding:'8px 12px',marginBottom:4}},
      React.createElement('span',{style:{color:'#d4b896',fontSize:13}},l),
      React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6}},
        React.createElement('button',{onClick:()=>updateField(p,Math.max(0,v-1)),style:{width:32,height:32,borderRadius:6,border:'1px solid #374151',background:'transparent',color:'#d4b896',fontSize:16,cursor:'pointer'}},'−'),
        React.createElement('span',{style:{color:'#d4b896',fontSize:16,fontWeight:700,width:28,textAlign:'center'}},v),
        React.createElement('button',{onClick:()=>updateField(p,v+1),style:{width:32,height:32,borderRadius:6,border:'1px solid #374151',background:'transparent',color:'#d4b896',fontSize:16,cursor:'pointer'}},'+')));
    const BF=(l,p,v)=>React.createElement('button',{onClick:()=>updateField(p,!v),
      style:{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'8px 12px',borderRadius:8,background:'#0f172a',border:'none',marginBottom:4,cursor:'pointer',textAlign:'left'}},
      React.createElement('div',{style:{width:22,height:22,borderRadius:4,border:v?'2px solid #22c55e':'2px solid #4b5563',background:v?'#22c55e22':'transparent',display:'flex',alignItems:'center',justifyContent:'center',color:'#22c55e',fontSize:14,flexShrink:0}},v?'✓':''),
      React.createElement('span',{style:{color:v?'#d4b896':'#6b7280',fontSize:13}},l));
    return React.createElement('div',{style:S.wrap},
      React.createElement('div',{style:{padding:16}},
        React.createElement('h2',{style:{color:'#d4b896',fontSize:18,fontWeight:800,margin:'0 0 16px'}},'📜 Registro de Campaña'),
        React.createElement('div',{style:{background:'#1a1a2e',borderRadius:10,padding:14,border:'1px solid #2d2d44',marginBottom:12}},
          React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
            React.createElement('div',null,
              React.createElement('div',{style:{color:'#9ca3af',fontSize:10,textTransform:'uppercase'}},'Demora'),
              React.createElement('div',{style:{color:campaign.demora>=7?'#ef4444':'#eab308',fontSize:28,fontWeight:800}},campaign.demora)),
            React.createElement('div',{style:{display:'flex',gap:6}},
              React.createElement('button',{onClick:()=>setCampaign({...campaign,demora:Math.max(0,campaign.demora-1)}),style:{width:44,height:44,borderRadius:8,border:'1px solid #374151',background:'#0f172a',color:'#d4b896',fontSize:20,cursor:'pointer'}},'−'),
              React.createElement('button',{onClick:()=>setCampaign({...campaign,demora:Math.min(12,campaign.demora+1)}),style:{width:44,height:44,borderRadius:8,border:'1px solid #374151',background:'#0f172a',color:'#d4b896',fontSize:20,cursor:'pointer'}},'+'))),
          React.createElement('div',{style:{width:'100%',height:8,background:'#0f172a',borderRadius:4,marginTop:8,overflow:'hidden'}},
            React.createElement('div',{style:{width:(campaign.demora/12*100)+'%',height:'100%',background:campaign.demora>=7?'#ef4444':'#eab308',borderRadius:4,transition:'width 0.3s'}}))),
        React.createElement(Collapsible,{title:'Contadores',icon:'🔢',defaultOpen:true},
          NF('Malagaunt derrotado','malagauntDerrotado',reg.malagauntDerrotado),
          NF('Cadáveres examinados','cadaveres_examinados',reg.cadaveres_examinados),
          NF('Sepulturas registradas','sepulturas_registradas',reg.sepulturas_registradas),
          NF('Invasores escapados','invasores_escapados',reg.invasores_escapados),
          NF('Disminuir la horda','disminuir_horda',reg.disminuir_horda),
          NF('Salas santificadas','salas_santificadas',reg.salas_santificadas)),
        React.createElement(Collapsible,{title:'Logros',icon:'🏆'},
          BF('Deuda de Favor','logros.deuda_de_favor',reg.logros.deuda_de_favor),
          BF('Rastro Esquelético','logros.rastro_esqueletico',reg.logros.rastro_esqueletico),
          BF('Parafernalia Oculta','logros.parafernalia_oculta',reg.logros.parafernalia_oculta),
          BF('Aprendiz Derrotado','logros.aprendiz_derrotado',reg.logros.aprendiz_derrotado),
          BF('Aprendiz Liberado','logros.aprendiz_liberado',reg.logros.aprendiz_liberado),
          BF('Troll Derrotado','logros.troll_derrotado_logro',reg.logros.troll_derrotado_logro),
          BF('Investigación en Curso','logros.investigacion_en_curso',reg.logros.investigacion_en_curso),
          BF('Escudo de Almas','logros.escudo_de_almas',reg.logros.escudo_de_almas)),
        React.createElement(Collapsible,{title:'Recompensas',icon:'🎁'},
          NF('Perspectiva Táctica','recompensas.perspectiva_tactica',reg.recompensas.perspectiva_tactica),
          NF('Sabiduría de Mazmorra','recompensas.sabiduria_de_mazmorra',reg.recompensas.sabiduria_de_mazmorra),
          BF('Resistencia al Veneno','recompensas.resistencia_al_veneno',reg.recompensas.resistencia_al_veneno),
          BF('Debilidad del Objetivo','recompensas.debilidad_del_objetivo',reg.recompensas.debilidad_del_objetivo),
          BF('Experiencia de Combate','recompensas.experiencia_de_combate',reg.recompensas.experiencia_de_combate),
          BF('Saqueo de Sepulturas','recompensas.saqueo_de_sepulturas',reg.recompensas.saqueo_de_sepulturas),
          BF('Signos Reveladores','recompensas.signos_reveladores',reg.recompensas.signos_reveladores),
          BF('Ritual de Consagración','recompensas.ritual_de_consagracion',reg.recompensas.ritual_de_consagracion),
          BF('Oferta de Ayuda','recompensas.oferta_de_ayuda',reg.recompensas.oferta_de_ayuda),
          BF('Contactos en Gremio','recompensas.contactos_en_gremio',reg.recompensas.contactos_en_gremio)),
        React.createElement(Collapsible,{title:'Puntos de Entrada Mapeados',icon:'🗺️'},
          React.createElement('div',{style:{display:'flex',gap:8,flexWrap:'wrap'}},
            [1,2,3,4,5,6].map(n=>{
              const mapped=reg.puntos_entrada_mapeados.includes(n);
              return React.createElement('button',{key:n,onClick:()=>{
                const arr=mapped?reg.puntos_entrada_mapeados.filter(x=>x!==n):[...reg.puntos_entrada_mapeados,n];
                updateField('puntos_entrada_mapeados',arr);},
                style:{width:44,height:44,borderRadius:8,border:mapped?'2px solid #22c55e':'1px solid #374151',
                  background:mapped?'#22c55e22':'#0f172a',color:mapped?'#22c55e':'#6b7280',fontSize:18,fontWeight:700,cursor:'pointer'}},n);}))),
        React.createElement(Collapsible,{title:'Misión Actual',icon:'📍'},
          React.createElement('div',{style:{display:'flex',flexWrap:'wrap',gap:6}},
            ['Intro','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'].map(mi=>
              React.createElement('button',{key:mi,onClick:()=>setCampaign({...campaign,currentMission:mi}),
                style:{minWidth:40,height:36,borderRadius:6,fontSize:13,fontWeight:700,cursor:'pointer',
                  border:campaign.currentMission===mi?'2px solid #b91c1c':'1px solid #374151',
                  background:campaign.currentMission===mi?'#b91c1c33':'#0f172a',
                  color:campaign.currentMission===mi?'#fca5a5':'#6b7280'}},mi))))),
      BottomNav);
  }

  return React.createElement('div',{style:S.wrap},
    React.createElement('div',{style:{padding:40,textAlign:'center',color:'#6b7280'}},'Selecciona una opción'),BottomNav);
}

// Register SW and render
if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{});}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
  </script>
</body>
</html>
