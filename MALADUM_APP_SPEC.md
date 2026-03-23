# Maladum Companion PWA — Especificación Técnica Completa para Opus

## INSTRUCCIONES PARA OPUS

Eres el programador principal de esta app. **Tienes prohibido inventar reglas del juego.** Antes de programar cualquier mecánica de juego, lee los documentos oficiales en el Google Drive indicado. Toda la lógica de juego debe derivarse de esos documentos.

**Google Drive con los manuales:**
https://drive.google.com/drive/folders/1qgv4bN9KmqbXFPjCxOvh7X_a692gSfcl

Documentos disponibles:
- `Deluxe Maladum Rulebook - WEB` — Reglas completas (160 páginas)
- `Maladum Reference Section` — Habilidades, hechizos, items de referencia
- `ES_Maladum FAQ 1.1` — FAQ oficial en español con erratas

El Libro de Campaña (20 misiones completas) está documentado en esta especificación — no necesita Drive porque está transcrito aquí íntegramente.

Base de datos de items online (para consulta):
https://xinix.github.io/maladum/

---

## 1. QUÉ ES LA APP

Una **Progressive Web App (PWA)** companion para el juego de mesa Maladum: Dungeons of Enveron, optimizada para iPhone. Funciona instalada desde Safari en la pantalla de inicio como si fuera una app nativa.

Referencia de experiencia de usuario: la app de **Viajes por la Tierra Media (Journey to Middle-Earth)** de FFG, que guía al jugador por las fases del juego, muestra setup de misiones, gestiona contadores y facilita el juego sin tener que leer el manual constantemente.

**Objetivo principal:** eliminar el 90% de las consultas al manual durante la partida.

---

## 2. STACK TÉCNICO

- **React 18** + **Vite**
- **Tailwind CSS** (solo clases base, sin compilador personalizado)
- **IndexedDB** via `idb` library — para persistencia de datos entre sesiones
- **Service Worker** — para funcionamiento offline completo
- **PWA manifest** — para instalación en iPhone desde Safari
- Sin backend. Todo local en el dispositivo.
- Hospedaje: **GitHub Pages** o **Vercel** (gratuito)

### Paleta visual
Temática dark fantasy medieval. Fondos oscuros (slate-900/stone-950), texto en amber-100/stone-200, acentos en red-700 y amber-500. Iconografía con emojis unicode o SVG inline simples. NO usar colores claros ni diseño "clean moderno" — debe sentirse como un grimorio digital.

---

## 3. ARQUITECTURA DE DATOS (IndexedDB)

### Store: `campaign`
Estado global persistente de la campaña activa.

```json
{
  "id": "campaign_1",
  "name": "Campaña de los Aventureros",
  "createdAt": "2026-03-21T...",
  "currentMission": "A",
  "demora": 0,
  "registro": {
    "malagauntDerrotado": 0,
    "troll_derrotado": false,
    "aprendiz_estado": null,
    "aprendiz_nombre": null,
    "cadaveres_examinados": 0,
    "sepulturas_registradas": 0,
    "invasores_escapados": 0,
    "disminuir_horda": 0,
    "salas_santificadas": 0,
    "puntos_entrada_mapeados": [],
    "logros": {
      "deuda_de_favor": false,
      "rastro_esqueletico": false,
      "parafernalia_oculta": false,
      "aprendiz_derrotado": false,
      "aprendiz_liberado": false,
      "troll_derrotado_logro": false,
      "investigacion_en_curso": false,
      "escudo_de_almas": false
    },
    "recompensas": {
      "perspectiva_tactica": 0,
      "resistencia_al_veneno": false,
      "debilidad_del_objetivo": false,
      "experiencia_de_combate": false,
      "saqueo_de_sepulturas": false,
      "signos_reveladores": false,
      "ritual_de_consagracion": false,
      "oferta_de_ayuda": false,
      "contactos_en_gremio": false,
      "sabiduria_de_mazmorra": 0
    }
  }
}
```

### Store: `adventurers`
Un registro por aventurero, persistente entre misiones.

```json
{
  "id": "adv_1",
  "campaign_id": "campaign_1",
  "nombre": "Sera",
  "clase": "Warrior",
  "rango": 1,
  "experiencia": 0,
  "salud_max": 5,
  "salud_actual": 5,
  "magia_max": 0,
  "magia_actual": 0,
  "habilidad_max": 3,
  "habilidad_actual": 3,
  "status_effects": [],
  "inventario": [],
  "habilidades": [],
  "renombre": 0,
  "vivo": true,
  "misiones_jugadas": []
}
```

### Store: `mission_state`
Estado de la misión en curso (se resetea al terminar cada misión).

```json
{
  "id": "mission_current",
  "campaign_id": "campaign_1",
  "mision_id": "A",
  "ronda": 1,
  "amenaza_nivel": 0,
  "amenaza_clavijas_cara": "A",
  "fase_actual": "dread",
  "magia_usada_esta_ronda": false,
  "objetivos_completados": [],
  "objetivos_secundarios_completados": [],
  "personajes_en_juego": [],
  "tokens_activos": [],
  "notas": ""
}
```

---

## 4. PANTALLAS DE LA APP

### 4.1 Pantalla de Inicio / Hub
- Crear nueva campaña o continuar existente
- Mostrar estado actual: misión actual, Demora, aventureros del grupo
- Botón "Comenzar Misión" → lleva al Setup
- Botón "Gestionar Grupo" → fichas de aventureros
- Botón "Registro de Campaña" → vista completa de logros/recompensas

### 4.2 Setup de Misión
Guía paso a paso el setup EXACTO de cada misión según el Libro de Campaña.

Para cada misión muestra:
1. **Narrativa** (texto de introducción)
2. **Condición de entrada** (ej: "Esta misión se juega si recuperaste 5+ reliquias en A")
3. **Objetivo Primario** (texto completo)
4. **Objetivo Secundario** (texto completo)
5. **Reglas Especiales** activas en esta misión (lista con descripción)
6. **Setup físico:**
   - Cara del Registro de Amenaza y número de clavijas iniciales
   - Composición exacta del mazo de Eventos (ej: "8x Lamentor, 8x Mapa, 2x Hellfront, 2x Malagaunt + Novato/Veterano según dificultad")
   - Asignación de Búsqueda (qué tokens van en qué piezas de terreno)
   - Objetos Clave (qué fichas de objetivo colocar y dónde)
   - Spawn points activos (numerados 1-6 con su tipo de miniatura)
7. **Efectos de Demora activos** para esta misión (según valor actual de Demora de la campaña)
8. Botón "Comenzar Partida" → va al Tablero Principal

### 4.3 Tablero Principal (pantalla durante la partida)
La pantalla más importante. Diseño vertical para iPhone con secciones colapsables.

**Sección superior — Estado global:**
- Ronda actual (número grande)
- Nivel de Amenaza actual con indicador visual de los 6 niveles (Disquiet → Doom) y colores progresivos (verde → rojo)
- Botón "+" para incrementar Amenaza
- Indicador si la magia fue usada esta ronda (para el +1 automático de Amenaza)

**Sección Fases del Turno — checklist interactivo:**
Cada fase es un acordeón expandible con su checklist:

```
☐ FASE DE AMENAZA
  ☐ Avanzar Amenaza +1
  ☐ Si magia fue usada → +1 adicional
  ☐ Si clavija entra en espacio rojo → lanzar Dado Mágico y resolver efecto
  ☐ Robar Carta de Evento (desde ronda 2)
  ☐ Resolver efecto según nivel de Amenaza actual

☐ FASE DE AVENTUREROS  
  ☐ [Jugador 1] activa un Aventurero → hasta 2 acciones
  ☐ [Jugador 2] activa un Aventurero → hasta 2 acciones
  ☐ [continúa alternando...]
  ☐ Todos los Aventureros activados

☐ FASE DE ADVERSARIOS
  ☐ Nuevas llegadas según banda de Amenaza
  ☐ Activar Adversarios por Rank (mayor primero)
  ☐ Resolver IA de cada uno

☐ FASE DE PNJs
  ☐ Activar Wandering Beasts
  ☐ Activar Denizens

☐ FASE DE EVALUACIÓN
  ☐ Resolver efectos de estado (Burning, Poisoned, etc.)
  ☐ Retirar contadores según reglas
  ☐ Avanzar al siguiente round
```

**Sección Aventureros activos:**
Cards compactas por aventurero con:
- Nombre + clase
- Barras de Salud / Magia / Habilidad (pegs tapables)
- Indicadores de Status Effects activos (iconos tapables para añadir/quitar)
- Botón "Combate" → abre el Combat Resolver

**Botones de acción rápida:**
- 🎲 Combat Resolver
- 📦 Items DB (abre xinix.github.io en webview o enlace)
- 📋 Reglas Especiales de esta misión
- ✅ Fin de Misión

### 4.4 Combat Resolver
El asistente de combate. Pantalla modal.

**Flujo:**
1. Seleccionar atacante (aventurero o tipo de enemigo)
2. Seleccionar tipo de ataque (Melee / Ranged)
3. Si es Ranged: seleccionar distancia (Corta / Media / Larga)
4. ¿Cobertura parcial? (Sí/No) → -1 al resultado
5. La app muestra: **"Tira X dados rojos + 1 dado azul"**
6. El jugador introduce los resultados (taps en iconos de dado)
7. La app calcula: hits, critical hits, blunders
8. Mostrar daño final después de aplicar armadura del objetivo

Para enemigos, mostrar sus stats de armadura desde los datos del manual.

### 4.5 Fichas de Aventurero
Vista completa editable por personaje:
- Todos los stats con +/- para modificar pegs
- Lista de habilidades activas (consultables con descripción)
- Inventario (añadir/quitar items, con enlace a la DB de xinix para ver stats)
- Historial de misiones jugadas
- Experiencia y condiciones para subir de Rango

### 4.6 Registro de Campaña
Vista de todos los valores persistentes de la campaña:
- Demora actual (0-12) con descripción del efecto
- Todos los Logros (checkboxes)
- Todas las Recompensas desbloqueadas con descripción de su efecto
- Contador de Malagaunt derrotado
- Todos los valores numéricos (Cadáveres, Sepulturas, Invasores, etc.)
- Árbol visual de misiones con la ruta jugada y las bifurcaciones

### 4.7 Fin de Misión
Guía las fases post-partida:
1. **Fase de Huida** — ¿hay Aventureros que rescatar?
2. **Consecuencias de la misión** — según el Libro de Campaña exacto, muestra qué misión viene después y por qué (basado en resultados)
3. **Actualizar Registro de Campaña** — formulario para marcar logros conseguidos en esta misión
4. **Calcular Demora** — aplica los modificadores correspondientes
5. **Fase de Avance** — Experiencia ganada, subida de Rango si aplica
6. **Fase de Mercado** — recordatorio de acciones disponibles
7. **Fase de Descanso** — opciones de recuperación
8. **Siguiente misión** — botón que lleva al Setup de la misión correspondiente

---

## 5. DATOS DE LAS 20 MISIONES DE CAMPAÑA

### MISIÓN INTRODUCTORIA — DE MONEDA Y GLORIA (p.4)
**Condición:** Misión independiente rejugable. Puede jugarse antes de la campaña o entre misiones (cuesta 1 espacio de Demora si se juega dentro de la campaña).
**Objetivo Primario:** Recolectar armas, armaduras y recursos. Ganar experiencia de combate.
**Objetivo Secundario:** Recuperar Objetivos 7 y 8 de la bolsa de fichas. Cada uno vale 1 Renombre en Mercado.
**Reglas Especiales — Mecanismos Antiguos:** 4 palancas activas. Al interactuar con cada una, girar la ficha y resolver: 1=roto sin efecto, 2=abre tragaluz/retira contador Oscuridad, 3=cierra tragaluz/añade contador Oscuridad, 4=cierra puerta al azar, 5=desbloquea puerta al azar, 6=retira pared amarilla → acceso a Cámara del Arcanista.
**Registro Amenaza:** Cara A - 0 clavijas.
**Mazo Eventos:** 8x Lamentor, 2x Hellfront, 8x Mapa, 2x Malagaunt + dificultad.
**Consecuencias:** Ninguna (misión independiente). Si se juega en campaña: +1 Demora.

---

### MISIÓN A — SECRETOS EN LA OSCURIDAD (p.6)
**Condición:** Primera misión de la campaña.
**Objetivo Primario:** Recuperar Reliquias de Objetivos 1-8 (una por cada caja, cofre y tumba). Cada reliquia vale 6₲ en Mercado. Anotar número de reliquias recuperadas en Registro de Campaña.
**Objetivo Secundario:** Recuperar Objetivo 9 del Escritorio del Arcanista. Representa mapas y diarios. Si se recupera: descartarlo en Descanso y marcar Logro **Parafernalia Oculta**.
**Consecuencias:**
- Si recuperaste Objetivo 1 → puedes elegir jugar **Misión B** antes de continuar.
- Si 5+ reliquias → **Misión C** (p.10).
- Si 4 o menos reliquias → **Misión D** (p.12).
**Registro Amenaza:** Cara A - 0 clavijas.
**Mazo Eventos:** 8x Lamentor, 8x Mapa, 2x Hellfront, 2x Malagaunt + dificultad.
**Asignación Búsqueda:** Dejar 2 negras aparte. 6x fichas+1x mapa en terreno buscable.

---

### MISIÓN B — LA RELIQUIA (p.8) [OPCIONAL]
**Condición:** Opcional. Se juega después de A si recuperaste Objetivo 1.
**Objetivo Primario:** Encontrar al familiar del aldeano atrinchado en la parte profunda. Habitante aleatorio ya en juego desde inicio. Si se rescata por Punto de Reagrupamiento: familia paga 10₲ + 2 Renombre + marcar Logro **Deuda de Favor**.
**Objetivo Secundario:** Saquear todo lo posible.
**Reglas Especiales — OSCURIDAD:** Toda el área sigue reglas de Oscuridad. El Habitante no se activa hasta que un Aventurero entre en contacto corto o sea atacado → aumenta Amenaza en 3. IA del Habitante: se mueve hacia terreno buscable más cercano con luz, busca, intercambia items de baja rareza. No se enfrenta a enemigos. Se para a 1 casilla si no hay ruta. Empuja si empieza enfrentado.
**Consecuencias:** +1 Demora. Luego igual que A: 5+ reliquias → C, 4- → D.
**Registro Amenaza:** Cara A - 2 clavijas.
**Mazo Eventos:** 8x Lamentor, 8x Mapa, 3x Hellfront, 1x Malagaunt + dificultad.

---

### MISIÓN C — UN NUEVO PODER EN ASCENSO (p.10)
**Condición:** Recuperaste 5+ reliquias en Misión A.
**Objetivo Primario:** Recuperar partes de criaturas derrotadas como Objetivos:
- Primer Lamentor derrotado tras cada nivel Amenaza ≥ Distress → Objetivos 1-3.
- Primera Myria derrotada tras cada nivel ≥ Distress → Objetivos 4-5.
- Primer Hellfront derrotado → Objetivo 6.
- Rot Troll derrotado → Objetivo 9.
Las fichas no se venden. Se llevan a Kelthion.
**Objetivo Secundario:** Recuperar Objetivos 7 y 8. Si se encuentran ambos: marcar Logro **Rastro Esquelético**.
**Reglas Especiales — SOMBRAS CAMBIANTES:** Oscuridad activa. Al inicio lanzar Dado Mágico 3 veces (relanzar repetidos) → colocar contadores de Luz en salas con esos números. Cada vez que primera clavija entra en nueva banda desde Distress: elegir sala sin contador, mover luz al siguiente número más alto que no tenga contador. Aventureros pueden Interactuar con Palancas para mover luz al siguiente número más alto disponible.
**Consecuencias:** 
- Si encontraste Objetivo 7 u 8 → puedes elegir qué misión a continuación.
- Si viajas por carretera → **Misión E** (p.14).
- Si viajas por túneles → **Misión F** (p.16).
- Si no encontraste Objetivos 7 u 8 → **Misión E** (p.14).
**Registro Amenaza:** Cara A - 2 clavijas.
**Mazo Eventos:** 8x Lamentor, 8x Mapa, 2x Hellfront, 2x Malagaunt + dificultad.

---

### MISIÓN D — RESURRECTIONISTAS (p.12)
**Condición:** Recuperaste 4 o menos reliquias en Misión A.
**Objetivo Primario:** Acumular botín. Al inicio anotar valor total de equipo + florines. Al final calcular diferencia = botín. 1 Renombre por cada 20₲ de aumento en Mercado.
**Objetivo Secundario — MAPEO DE TÚNELES:** 6 pasillos en puntos de entrada alrededor del área. Aventureros pueden Interactuar con puntos de entrada para mapearlos → marcar en Registro de Campaña.
**Objetivo Secundario — ROBO DE TUMBAS:** La acción Búsqueda normal aplica a Espacios de Sepultura (no salas). Cada uno se puede Buscar una vez. Marcar con contador. Las que han sido registradas se vuelven activas. Anotar número de Espacios de Sepultura buscados en Registro.
**Reglas Especiales — SPAWN:** Si Revenants llegan y no hay ninguno activo → colocarlos en punto de entrada más cercano.
**Consecuencias:** Siguiente misión es **Misión F** (p.16).
**Registro Amenaza:** Cara A - 1 clavija.
**Mazo Eventos:** 7x Lamentor, 2x Malagaunt, 6x Mapa, 2x Hellfront, 3x Malagaunt, 1x Omega + dificultad.

---

### MISIÓN E — ECLIPSE DE LOS ERUDITOS (p.14)
**Condición:** Elegiste viajar por carretera desde C, O no lograste encontrar el pasaje secreto en C.
**Objetivo Primario:** Sellar 4 compuertas de alcantarilla (puntos 3-6). Cada una tiene una palanca → Interactuar para cerrarla. Una vez cerrada, girar el punto de entrada → inactivo. Si se lanza dado de llegada ahora: +1 Amenaza en lugar de colocar personaje. Si Amenaza llega a nueva banda con personajes pendientes: usar llegadas de banda anterior. Una vez las 4 cerradas: escapar. Ganar 4 Renombre.
**Objetivo Secundario:** Carta de Habitante "Viajero Perdido" en juego desde inicio. 3 Habitantes reciben un objeto de bolsa de fichas. Ganar 1 Renombre por cada Habitante persuadido a salir por tu Punto de Reagrupamiento.
**Reglas Especiales — LA ÚNICA SALIDA ES ARRIBA:** Si Punto de Reagrupamiento se intercambia con Punto de Entrada aleatorio, solo Entradas 1 y 2 son elegibles.
**Reglas Especiales — ANEGADO:** Cada casilla es fuente de agua. Interactuar en cualquier casilla para eliminar un contador de Quemado.
**Consecuencias:**
- Si sellaste las 4 compuertas → antes de **Misión G** (p.18) resolver el **Interludio** (p.18).
- Si no → perder 2 espacios de Demora por cada puerta abierta. Luego **Misión H** (p.20).
**Registro Amenaza:** Cara B - 0 clavijas.
**Mazo Eventos:** 8x Lamentor, 9x Mapa, 3x Hellfront + dificultad.

---

### MISIÓN F — LA OSCURIDAD DEBAJO (p.16)
**Condición:** Viajaste por túneles desde C o D.
**Objetivo Primario:** Bloquear 6 puntos de entrada de Revenants. Puntos 1,3,4,6 tienen palancas → Interactuar para cerrar. Puntos 2 y 5 se bloquean moviendo o creando barricada/objeto de tamaño similar en contacto. Los adversarios consideran piezas de terreno en contacto con punto de entrada como enemigos e intentarán destruirlas. Una vez cerrada/bloqueada → girar como inactivo. 1 Renombre por cada Punto de Entrada desactivado.
**Objetivo Secundario:** Fichas de trampa no vuelven a la bolsa cuando se resuelven → dejarlas a un lado. Al final: contar fichas de Trampa reservadas + cartas de Mazmorra en pila de descartes = total para Recompensa **Sabiduría de la Mazmorra** en Registro.
**Reglas Especiales — ENTRADAS ALTERNATIVAS:** Si se mapearon puntos de entrada en D → usarlos como ruta alternativa. El grupo puede entrar por hasta 2 puntos de entrada coincidentes con números en Registro. Por cada espacio mapeado no usado: reducir Amenaza inicial en 1.
**Reglas Especiales — INVASIÓN DE LA CIUDAD:** Todo Revenant no dentro de LdV de un enemigo cuando se active → no sigue IA normal. Mueve hacia Punto de Reagrupamiento y abandona área. Al final anotar suma de rangos de personajes que abandonaron = **Invasores Escapados** en Registro.
**Consecuencias:** Siguiente misión es **Misión G** (p.18). Antes: resolver **Interludio** (p.18).
**Registro Amenaza:** Cara A - 3 clavijas.

---

### INTERLUDIO — CONOCIMIENTO NECRÓTICO (p.18)
**No es una misión.** Es una fase de resolución entre misiones E/F y G.
Para cada Logro/Objetivo marcado en Registro o fichas que llevas, marcar la Recompensa de **Conocimiento Necrótico** correspondiente:
- Objetivo 1-2 → Perspectiva Táctica
- Objetivo 3 → Resistencia al Veneno
- Objetivo 4-6 → Debilidad del Objetivo
- Objetivo 9 → Experiencia de Combate
- 3+ Sepulturas Registradas → Saqueo de Sepulturas
- 7+ Sepulturas Registradas → Signos Reveladores
- 10+ Sepulturas Registradas → Ritual de Consagración
Luego descartar todas las fichas de Objetivo.

---

### MISIÓN G — CAVERNAS DE LOS ABANDONADOS (p.18-19)
**Condición:** Cerraste con éxito las 4 compuertas en E, O desviaste la horda en F.
**Objetivo Primario:** Los 4 Aventureros son elegidos al azar. El primero en Zona de Reagrupamiento normal. Los otros 3 en casillas marcadas, boca abajo, Aturdidos y con Salud reducida en 1. Encontrar a tus compañeros y escapar.
**Objetivo Secundario:** Los 3 PNJs empiezan inconscientes en posiciones del mapa. Por cada uno arrastrado fuera por tu Punto de Reagrupamiento: 1 Renombre + 1 objeto aleatorio de bolsa de fichas.
**Reglas Especiales — CENTINELAS:** Sigue las reglas de Centinelas del Reglamento.
**Consecuencias:** Siguiente misión es **Misión I** (p.22).
**Registro Amenaza:** Cara A - 5 clavijas.
**Mazo Eventos:** 5x Lamentor, 2x Malagaunt, 6x Mapa, 4x Hellfront, 3x Hellfront + dificultad.

---

### MISIÓN H — EL EXILIO (p.20)
**Condición:** No lograste cerrar las 4 compuertas en E.
**Objetivo Primario:** Recuperar el objeto del Escritorio del Arcanista (marcado en azul en el mapa). Salir de la zona con este raro objeto. Recompensa: información vital sobre los Regresados. Resolver Interludio (p.18) al completar.
**Objetivo Secundario:** Si al final todas las puertas marcadas en azul están bloqueadas y no hay personajes dentro del área azul (si se destruye alguna: bloquear con barricada): marcar Recompensa **Investigación en Curso** → se aplica a todas las misiones futuras.
**Reglas Especiales — MECANISMO DE CIERRE:** Cada Palanca y Pilar está marcado con un símbolo. Al interactuar: todas las puertas con ese símbolo se cierran y bloquean. Todas las puertas con símbolo que tenga un lado más que el símbolo interactuado se desbloquean. El Pilar central desbloquea puertas marcadas con círculo. Las Llaves solo bloquean/desbloquean puertas marcadas con círculo fuera de zona azul.
**Reglas Especiales — ¡NO ROBES!:** Para recibir recompensas debes entregar todos los objetos raros encontrados durante la partida. Si los conservas: no recibes recompensas de ningún objetivo.
**Reglas Especiales — MUERTOS EN EL AGUA:** Punto de Entrada dentro del Pozo. Si el Pozo es atacado y dañado (armadura 3), girar → inactivo. Si dado de llegada se lanza: +1 Amenaza en lugar de colocar personaje.
**Reglas Especiales — TIERRA DE LOS VIVOS:** Revenants no pueden desbloquear puertas (sí destruirlas). Espacios de Sepultura sin ruta abierta a Punto de Entrada → inactivos.
**Reglas Especiales — PUERTAS DE HIERRO:** Todas las puertas tienen armadura física 3.
**Consecuencias:** +1 Demora. Siguiente misión: **Misión I** (p.22).
**Registro Amenaza:** Cara B - 0 clavijas.

---

### MISIÓN I — LOS SECRETOS DEL CABO FEERE (p.22)
**Condición:** Después de reunirse con los eruditos en G o H.
**Objetivo Primario:** Encontrar la reliquia en la cripta. Agrupar fichas de Objetivo por grupos: 1-3 en Tumbas, 4-6 en Tumbas, 7-8 en Escritorio del Arcanista. Tomar uno de cada grupo al azar. Tabla de pistas:
- Obj 1: Objeto Común / Obj 2: Objeto Poco Común / Obj 3: Objeto Raro o Exclusivo
- Obj 4: Arma (ficha azul) / Obj 5: Equipo (ficha roja) / Obj 6: Objeto No de Combate (ficha morada)
- Obj 7: Artículo Pequeño / Obj 8: Artículo Normal (requiere 2 criterios)
Al final elegir un objeto del inventario que crea que es la reliquia y lanzar Dado Mágico.
- Si Parafernalia Oculta marcado: -1 a tirada.
- Si Rastro Esquelético marcado: -1 a tirada.
Si tirada final ≤ número de criterios coincidentes → encontraste la reliquia. El Malagaunt y criaturas huyen. Todos escapan. Marcar reliquia con X. Marcar Recompensa **Escudo de Almas**. Siguiente misión: **Misión J** (p.24).
Si tirada mayor → fallaste. Malagaunt se ríe. Paredes se resquebrajan. Siguiente misión: **Misión L** (p.28). Solo Fase de Avance (no Huida, Mercado, ni Descanso). Todos los aventureros se consideran sobrevividos.
**Reglas Especiales — NO HAY SALIDA:** El grupo no puede volver a su Punto de Reagrupamiento. La partida termina cuando: todos los Aventureros son derrotados, Amenaza alcanza Desperation, o Malagaunt tiene LdV de un Aventurero.
**Registro Amenaza:** Cara A - 4 clavijas.

---

### MISIÓN J — BAJO LA MANSIÓN (p.24)
**Condición:** Escapaste con éxito de la Cripta en I o L.
**Objetivo Primario:** Buscar todos los secretos de la mansión en las catacumbas por pistas.
**FUENTE DE ALMAS:** Siempre que un Lamentor sea derrotado, colocar contador Recordatorio en el lugar donde cayó. Interactuar con él para examinar el cadáver → dejar ficha a un lado. En cada Fase de Evaluación los contadores no examinados se retiran. Al final anotar número de **Cadáveres Examinados** en Registro. Por cada 5 Cadáveres Examinados: marcar primera Recompensa de Conocimiento Necrótico no marcada.
**EL APRENDIZ:** Asegurarse de que Objetivo 7 esté incluido al rellenar las piezas de terreno. Si escapas con esa ficha: descartarla y marcar Logro **Aprendiz Involuntario**.
**DEBER SAGRADO:** Colocar clavija morada en Registro de Amenaza al inicio de la banda de Dismay. Cuando se reemplaza: llega el sacerdote. Habitante aleatorio (no requiere Carta de Evento). Gana 2 clavijas de Salud adicional + 2 objetos aleatorios de bolsa. IA: se mueve hacia habitación no santificada sin enemigos más cercana. Debe realizar 2 acciones consecutivas en la misma ronda para colocar contador de Luz adyacente. Debes mantener al sacerdote a salvo. Si abandona por Punto de Reagrupamiento → puedes ayudarlo en siguiente misión.
**EL TROLL SOLITARIO:** Si Rot Troll es derrotado → marcar Logro **Troll Derrotado** en Registro.
**Consecuencias (múltiples opciones):**
- Si Cadáveres Examinados ≥ 9 → **Misión M** (p.30).
- Si Aprendiz Involuntario marcado → **Misión N** (p.32).
- Si nada → **Misión O** (p.34).
- Si sacerdote escapó → también puedes jugar **Misión K** (p.26) opcionalmente.
**Registro Amenaza:** Cara A - 6 clavijas.

---

### MISIÓN K — MALDICIONES DESHECHAS (p.26) [OPCIONAL]
**Condición:** Opcional, después de J si el sacerdote escapó.
**Objetivo Primario:** El sacerdote empieza en Área de Reagrupamiento con 2 clavijas de Salud y su armamento. IA: se mueve al centro de la habitación no santificada más cercana sin enemigos. 2 acciones consecutivas en la misma ronda para colocar contador de Luz adyacente. Sin enemigos → se mueve hacia Aventurero más cercano. Al final: anotar número de Salas Santificadas en Registro.
**Objetivo Secundario:** Si Troll Derrotado marcado → el Rot Troll podría no aparecer. Si sí aparece y es derrotado: marcar Logro Troll Derrotado.
**PURGAR A LOS IMPÍOS:** Contadores de Luz representan hechizos que resisten magias de Malagaunt. Cada sala con uno es Sala Santificada. El área de juego ya está iluminada por lo que oscuridad no afecta. Contadores de Luz impiden poderes de Malagaunt. Puntos de sepultura y puntos de entrada en sala santificada no pueden usarse para llegada de Revenants. Hay 2 salas ya marcadas con Oscuridad: en estas no se pueden colocar contadores de Luz.
**¡DETENER LA PURGA!:** Revenants sienten que su poder se agota. Cuando un Revenant se activa y no tiene LdV a un enemigo: su objetivo es el sacerdote en ese turno, incluso si otros enemigos están más cerca. Si Malagaunt entra en Sala Santificada: descarta inmediatamente una clavija mágica (si es posible) para eliminar el Contador de Luz.
**Consecuencias:** +1 Demora. Próxima misión depende de resultados de J (misma lógica).
**Registro Amenaza:** Cara A - 2 clavijas.

---

### MISIÓN L — HUIDA DE LA NECRÓPOLIS (p.28)
**Condición:** Fallaste en localizar la reliquia en Misión I.
**Objetivo Primario:** Escapar. El grupo comienza entre los escombros de la cripta en ruinas. Debe abandonar por Punto de Reagrupamiento.
**CONTINUACIÓN:** Usar los mismos personajes que en I en el mismo estado. Antes de comenzar: resolver una acción de Descanso por cada Aventurero. El grupo comienza en posiciones mostradas en el mapa.
**CENTINELAS:** Sigue reglas de Centinelas del Reglamento.
**OSCURIDAD:** Toda el área sigue reglas de Oscuridad a menos que un área se derrumbe.
**DERRUMBES:** Carta ¡Colapso! puede robarse varias veces. Después de resolverla: colocar contador de Luz en el punto determinado por sus reglas y volver a barajarla en el mazo.
**Consecuencias:** +1 Demora.
- Puedes investigar rumores de una mansión cercana → +1 Demora adicional → **Misión J** (p.24).
- O dejar la investigación y entrenar → **Misión O** (p.34).
**Registro Amenaza:** Cara A - 4 clavijas.

---

### MISIÓN M — SALVAD NUESTRAS ALMAS (p.30)
**Condición:** Examinaste 10+ cadáveres en Misión J.
**Objetivo Primario:** El crisol del Malagaunt está absorbiendo fuerza vital. Apartar Objetivos 1-6. Nueva opción de Interacción con el Crisol de la Resurrección: gastar 1 clavija Mágica → si tiene éxito, coger 1 objetivo aleatorio. Cada objetivo es un alma que debe ser devuelta a su tumba. El Aventurero que lleve el objetivo debe Interactuar con el Punto de Entrada que coincida con su número → colocar ficha sobre marcador. 2 Renombre por cada Punto de Entrada marcado.
**Objetivo Secundario:** Cada vez que un Revenant es derrotado: reemplazar la clavija negra más baja del Registro de Amenaza por una clavija púrpura, si es posible. Al final: determinar el número de la banda que contenga la clavija morada más alta (Dismay=3, Desperation=4, etc.) → anotar como **Disminuir la Horda** en Registro.
**ESPECTÁCULO ESPELUZNANTE:** Cada Punto de Entrada tiene regla Terrorífico: si personaje no Revenant termina su turno dentro de corta distancia de un Punto de Entrada, lanzar Dado Mágico. Con 1 ese personaje se vuelve Aterrorizado, considerando el Punto de Entrada un enemigo a efectos de huida.
**EL TROLL SOLITARIO:** Si Troll Derrotado marcado → no aparece. Si se derrota al Rot Troll → marcar Logro Troll Derrotado.
**Consecuencias:**
- Si Demora ≥ 6 → **Interludio** (p.36).
- Si Aprendiz Involuntario marcado → puedes elegir **Misión N** (p.32) con +2 Demora.
- Si no → **Interludio** (p.36).
**Registro Amenaza:** Cara B - 4 clavijas.

---

### MISIÓN N — EL APRENDIZ INDISPUESTO (p.32)
**Condición:** Descubriste detalles de un Maladaar corruptible en J.
**Objetivo Primario:** Uno de los Lamentors es el Aprendiz disfrazado. Reservar Objetivos 1-3 boca abajo.
**ESCRUTINIO (nueva acción):** Cuando no estés enfrentado, elige un Lamentor en corto alcance dentro de LdV → lanzar Dado de Magia. Con 6: roba al azar uno de los objetivos apartados. Objetivo 3 = este Lamentor es el Aprendiz (colocar el objetivo con el personaje). Objetivos 1-2 = este Lamentor es un habitante (colocar con el personaje para objetivo secundario).
Si se derrota a Lamentor sin marcar: lanzar Dado Mágico como Escrutinio. Si se roba Objetivo 3 después de derrotar a Lamentor sin marcar: el Aprendiz fue superado por el poder oscuro → reemplazar con Habitante aleatorio con stats mejorados e introducir al Aprendiz Maladaar (Adversario para el resto de la partida). Si el Aprendiz es derrotado: marcar Logro **Aprendiz Derrotado**. Si se arrastra fuera: marcar Logro **Aprendiz Liberado** + cada Aventurero gana 1 EXP.
**Objetivo Secundario:** Objetivos 1 y 2 son funcionarios bajo hechizo. Si se descubren y arrastran a lugar seguro: marcar Recompensas **Oferta de Ayuda** (Obj 1) y/o **Contactos en el Gremio** (Obj 2).
**PILARES DE PODER:** Los 2 pilares canalizan poder de Malagaunt a la cámara central. Aventureros en casillas marcadas en amarillo pueden lanzar un dado de combate → obtienen tantas clavijas Mágicas como impactos. Si pifia: se Fatigan.
**EL TROLL SOLITARIO:** Igual que en misiones anteriores.
**Consecuencias:**
- Si Demora ≥ 6 → **Interludio** (p.36).
- Si Cadáveres Examinados ≥ 9 → puedes elegir **Misión M** (p.30) con +2 Demora.
- Si no → **Interludio** (p.36).
**Registro Amenaza:** Cara B - 0 clavijas.

---

### MISIÓN O — UN NUEVO DESPERTAR (p.34)
**Condición:** No encontraste nada de interés en J o elegiste no continuar con tus descubrimientos.
**Objetivo Primario:** Derrotar a todos los Revenants posibles. Cada vez que un Revenant es derrotado: reemplazar la clavija negra más baja por una clavija púrpura. Al final: determinar número de banda con clavija morada más alta → anotar como **Disminuir la Horda**. Además: cada Aventurero gana EXP adicional = número de banda menos su rango.
**Objetivo Secundario — CRISOL:** Tomar Objetivos 1-6, robar 3 al azar, dejarlos a un lado boca abajo, devolver el resto. Nueva opción de Interacción con Crisol de la Resurrección: gastar 1 clavija Mágica → si tiene éxito, elegir 1 objetivo apartado al azar. Cada objetivo es un alma que debe ser devuelta a su tumba (igual que en Misión M).
**EL TROLL SOLITARIO:** Igual que siempre.
**Consecuencias:** Continúa con **Interludio** (p.36).
**Registro Amenaza:** Cara A - 0 clavijas.

---

### INTERLUDIO — ANTORCHAS Y HORCAS (p.36)
**No es una misión.** Evento narrativo obligatorio.
Hacer tirada de Persuadir con un Aventurero. Valor para Persuadir a la Turba = 10. Necesitas al menos 11 impactos en total (desbloqueados).
Modificadores:
- +3 si Logro **Favor Debido** marcado.
- +1 por cada Recompensa **Oferta de Ayuda** o **Contactos en el Gremio** marcada.
- +1 por cada Renombre gastado (se puede decidir después de lanzar los dados).
- Las Habilidades relacionadas con Persuasión se pueden usar normalmente.
Si tiene éxito → **Misión R** (p.41).
Si falla → **Misión P** (p.37).

---

### MISIÓN P — LA CÁRCEL DEL CREPÚSCULO (p.37)
**Condición:** No lograste convencer a la turba en Interludio.
**Objetivo Primario:** El grupo comienza sin Punto de Reagrupamiento. Cuando la Amenaza llegue a "Disaster" se abrirá la ruta de escape. Objetivos 7 y 8 son llaves rúnicas que deben insertarse en los Pilares. Interactuar con pilar para colocar el objetivo. Una vez ambas llaves: se desbloquea la ruta de escape. Para determinar su ubicación y abrirla: interactuar con palancas 3 y 4 en la misma Fase de Aventureros. Cuando esto suceda: lanzar Dado Mágico → Punto de Reagrupamiento donde coincide el número. Mover Punto de Entrada al Pozo del centro.
**MECANISMOS MISTERIOSOS:** Palancas 1 y 2 → hacen girar la sala con el número correspondiente. Palancas 3 y 4 → no tienen efecto individual, pero una vez las llaves rúnicas están: pueden abrir la Ruta de Escape.
**SALAS GIRATORIAS:** Las 2 salas marcadas en azul se construyen como piezas independientes (clips en L en todas las esquinas, no conectar a paredes contiguas). Cuando se baja Palanca 1 o 2: colocar contador Recordatorio en sala. En siguiente Fase de Evaluación: rotar sala 90° en sentido agujas del reloj y volver a colocarla. Cada sala solo rota una vez por ronda. Ambas salas siempre rotan en la Fase de Evaluación de cualquier ronda en que la Amenaza haya entrado en nueva banda.
**Consecuencias:**
- Si ningún Aventurero escapó → **Misión Q** (p.39). Solo Fase de Avance entre partidas.
- Si algún Aventurero escapó → **Misión R** (p.41). Los derrotados dados por Muertos.
**Registro Amenaza:** Cara A - 4 clavijas.

---

### MISIÓN Q — LA PENUMBRA QUE NOS UNE (p.39)
**Condición:** No lograste escapar de las hondonadas en Misión P.
**Objetivo Primario:** Uno de los Puntos de Entrada es la salida. Barajar marcadores de Puntos de Patrulla y colocar 4 en posiciones marcadas. Barajar Objetivos 1-6 y colocar 3 boca abajo en inventarios de 3 Habitantes. Los Puntos de Patrulla son huellas/marcas en el suelo. Los Objetivos son información de otros Aventureros perdidos. La salida es el Punto de Entrada que coincide con el número tanto de un Punto de Patrulla como de un Objetivo. Interactuar con Puntos de Patrulla para girarlos y revelar el número.
Aventureros pueden persuadir a Habitantes para revelar su información (1 impacto no bloqueado para girar el contador que llevan). Esta información no es objeto físico y se pierde si el Habitante es derrotado.
Una vez descubierta toda la info posible: reunir los marcadores apartados que podrían indicar la salida. Si Rastro Esquelético marcado: descartar uno al azar. Puedes reducir valor de Recompensa Sabiduría de las Mazmorras (si la tienes) en 2 para descartar un contador. Habilidad de Rastreo 2+ puede gastar una clavija de Habilidad para descartar un contador. Si varias salidas posibles: Interactuar con un Punto de Entrada coincidente y gastar clavija de Habilidad para investigarlo → lanzar Dado Mágico. Si solo 2 posibles: 4+. Si 3 posibles: 5+.
**LOS QUE DEAMBULAN:** Carta Habitante "Viajero Perdido". Los 3 ya deben haber recibido un objeto de la bolsa de fichas. Sin Punto de Reagrupamiento disponible → deben marcharse por la salida correcta.
**OSCURIDAD:** Todo el área sigue reglas de Oscuridad.
**Consecuencias:** +1 Demora. → **Misión R** (p.41).
**Registro Amenaza:** Cara A - 0 clavijas.

---

### MISIÓN R — LA PUERTA DE LOS NO MUERTOS (p.41)
**Condición:** Superaste el Interludio de Antorchas y Horcas (p.36), o llegaste desde P o Q.
**ADVERTENCIA:** A partir de esta misión no hay Fases de Mercado ni visitas a Posada hasta completar la campaña.
**Objetivo Primario:** Entrar en el santuario de Malagaunt a través de la Puerta. La Puerta está protegida por 6 Ejes Mágicos. Los Ejes no se pueden destruir, mover ni buscar.
**LOS EJES:**
- Cada Tumba = Eje de Magia. Interactuar y gastar X clavijas de Magia → X clavijas de Magia se colocan dentro o sobre la Tumba. En resultado de Sobrecarga Mental: agrega 1 clavija negra.
- Cada Pilar = Eje de Fuerza. Atacarlo. Armadura física 2. Ataques contundentes obtienen 1 dado adicional. Por cada "daño" causado: colocar 1 clavija de Salud en el Pilar. Si se lanza alguna pifia: agregar 1 clavija negra además de las de Salud agregadas.
- Cada Palanca = Eje de Habilidad. Interactuar y elegir serie de clavijas de Habilidad a gastar (mínimo 1). Lanzar esa cantidad de dados. Añadir 1 dado por cada Habilidad de Astucia (marrón) a la que el personaje haya asignado al menos 1 EXP. Por cada impacto: 1 clavija de Habilidad al lado de la Palanca. Si se lanza alguna pifia: 1 clavija negra además de las de Habilidad agregadas.
- Si un personaje lleva la Recompensa Escudo de Almas: añade clavijas de Magia, Salud o Habilidad a un Eje y agrega 1 clavija adicional.
La Puerta se desbloquea cuando cada Eje tiene al menos tantas clavijas (sin contar negras) como la Banda de Amenaza actual. Si Amenaza en Distress (banda 2): cada Eje necesita al menos 2.
**ABRIR EL PORTÓN:** Al abrirse la Puerta: explosión de poder. Dejar aparte todas las clavijas colocadas en los Ejes. Comenzando con el personaje más cercano a la Puerta, robar 1 clavija al azar. Si negra: el personaje sufre 1 daño. Si no: el personaje gana esa clavija. Repetir para cada personaje más allá de la Puerta hasta que se agoten todas las clavijas o no queden personajes en juego. Todas las clavijas negras se devuelven al suministro. Las demás se vuelven a colocar en los Ejes lo más uniformemente posible.
Si la Puerta está abierta y la Amenaza entra en nueva banda superior: la Puerta se cerrará y bloqueará si ya no hay suficientes clavijas. Será necesario volver a sobrecargar los Ejes.
**SE ACABÓ EL TIEMPO:** Si Amenaza llega a Doom antes de que los Aventureros hayan atravesado la Puerta: la partida termina inmediatamente. Si al menos 1 Aventurero salió: continúa la partida hasta que todos abandonen o sean derrotados.
**Consecuencias:**
- Si algún Aventurero escapó → **Misión T** (p.46). Borrar 1 espacio de Demora por cada Aventurero que salió. Cara A del Registro de Amenaza.
- Si ninguno → repetir Misión R con cara B del Registro.
**Registro Amenaza:** Cara A - 0 clavijas. (O Cara * de la Misión previa si aplica.)

**MISIÓN R TIENE TAMBIÉN LAS REGLAS:**
- **EL APRENDIZ:** Si Aprendiz Derrotado o Aprendiz Liberado NO marcados → el Aprendiz de Malagaunt entra en batalla desde la Puerta en la primera ronda. Si Nombre del Aprendiz marcado → usar ese personaje. Si no → Habitante aleatorio con stats mejorados. Objetivo 7 incluido en su ficha.
- **CAMPAÑA DE RECLUTAMIENTO:** Robar 2 tableros de Habitante al azar. Puedes gastar Renombre ≥ su valor de Persuasión (mínimo 1 cada uno) para contratarlos. Cada PNJ contratado gana 1 clavija de Salud adicional + 1 elemento aleatorio de bolsa de fichas. Se controlan como Aventureros pero usan lados PNJ de sus tableros.
- **NIEBLA ANTINATURAL:** Si Demora ≥ 8 al inicio: toda el área sigue reglas de Oscuridad.
- **LA HORDA DISMINUIDA:** Si hay valor de Disminuir la Horda en Registro: lanzar Dado Mágico al inicio de la primera ronda → contar esa cantidad de espacios vacíos desde la parte inferior del Registro de Amenaza e insertar 1 clavija morada. Repetir desde la clavija morada anterior hasta insertar una cantidad de clavijas igual a tu valor de Disminuir la Horda. En cualquier ronda en que una clavija morada sea reemplazada por un aumento de Amenaza: ningún personaje llegará en la Fase de Adversario.
- **AVATAR MORTAL:** Si llega durante esta misión: llevará el Objetivo 8.
- **PERSEGUIDORES:** Al inicio añadir 1 carta de Veterano al mazo de Eventos por cada 2 rangos del total de Invasores Escapados en Registro (redondeando hacia abajo). Si Troll Derrotado no está marcado: lanzar para ver si llega un Rot Troll al inicio.
- **REFUERZOS DESDE ABAJO:** Primera vez que el Registro de Amenaza llegue a Distress, Desperation o Disaster: lanzar Dado Mágico. El Punto de Entrada con ese número se mueve desde su posición actual a la Puerta. Los Puntos de Entrada que ya se han movido deben volver a lanzarse.
- **RETIRO REACIO:** Objetivo es salir por la Puerta, pero también se puede salir por el Punto de Reagrupamiento. Una vez que un Aventurero salió por el Punto de Reagrupamiento, el objetivo ya no podrá completarse. Si algún Aventurero ya salió por la Puerta, será abandonado y dado por Muerto.

---

### MISIÓN S — PUERTA DE LOS NO MUERTOS PARTE II (p.44)
**Condición:** Continuación inmediata de R si ningún Aventurero escapó.
**Objetivo Primario:** Igual que Misión R. Todos los personajes comienzan en las mismas posiciones en el mismo estado que después de la sección "Consecuencias" de R.
**CONTINUACIÓN:** Sigue aplicándose la regla de "Retirada Reacia".
**EJES DESACTIVADOS:** Al inicio: resolver el poder explosión como se detalla debajo de Apertura de la Puerta en R. Descartar todas las clavijas. Cerrar y bloquear la Puerta.
**LUGARTENIENTE — EL APRENDIZ:** Si Aprendiz Derrotado o Aprendiz Liberado no están marcados → el Aprendiz de Malagaunt entra en batalla. (Mismas reglas que en Misión R.) Si el Aprendiz es derrotado: marcar Logro Aprendiz Derrotado.
**LUGARTENIENTE — AVATAR MORTAL:** Si el Deathly Avatar no llegó en R → llega desde la Puerta en la primera ronda con el Objetivo 8.
**LUGARTENIENTE — TROLL PODRIDO:** Incluso si un Rot Troll entró en R, puede llegar otro durante esta partida.
**Consecuencias:**
- Si algún Aventurero escapó → **Misión T** (p.46). Borrar 1 espacio de Demora por cada Aventurero que salió por la Puerta. Cara A del Registro de Amenaza.
- Si ninguno → misión continúa directamente a Misión S usando el mismo mapa. No hay Fases de Huida o Mercado. Se considera que todos los Aventureros han escapado (pero tomar nota de su estado actual). Comenzarás la siguiente misión usando la Cara B del Registro de Amenaza.

---

### MISIÓN T — EL CORAZÓN DE LAS TINIEBLAS (p.46) [MISIÓN FINAL]
**Condición:** Algún Aventurero escapó por la Puerta en R o S.
**Objetivo Primario:** Derrotar al Malagaunt. Una vez derrotado, todos los Revenants se retiran. La partida termina. No es necesario escapar. Por completar: el grupo gana 8 Renombre y puede coger cualquier objeto que tuviera el Malagaunt cuando fue derrotado. Todos los Aventureros de la misión reciben +3 EXP, incluso si fueron derrotados.
**Objetivo Secundario:** Al inicio, coger uno de los objetos Malagaunt al azar y añadirlo a su inventario. Durante el paso 6 de la preparación: asegurarse de que todos los objetos restantes Malagaunt se incluyen al rellenar las piezas de terreno. La Arcane Crutch se coloca en el Escritorio del Arcanista si está disponible. Cada objeto Malagaunt en posesión al final de esta misión puede ser llevado a Kelthion para su scrutinio → 10₲ por cada uno, y puedes quedártelos.
**EL SANTUARIO INTERIOR:** El Malagaunt comienza la partida en juego junto con un séquito de otros Revenants. Después de resolver una carta de Lamentor o Mapa: volver a barajarla dentro del mazo.
**CUANDO ES ATACADO:** El Malagaunt roba la fuerza vital de sus secuaces. Si recibe daño y le quedan clavijas mágicas: el daño se aplica al Revenant más cercano a una distancia media. Debe descartar 1 clavija de Magia por cada daño redirigido.
**DISTRACCIÓN:** Tus esfuerzos anteriores pueden haber distraído a Malagaunt. Al inicio: contar el número de espacios vacíos en el Registro de Amenaza igual al valor de las Salas Santificadas de tu Registro de Campaña, si las hay, y colocar 1 clavija morada. Hasta que esa clavija morada sea reemplazada: la Regla de Regeneración del Malagaunt no se aplica.
**LLAVES MAESTRAS:** Si los Aventureros llevan los Objetivos 7 y/o 8: la regla de la Llave se aplica en esta misión. Un personaje que lleve uno puede cerrar o abrir cualquier puerta o pieza de terreno como acción sin esfuerzo.
**EL APRENDIZ:** Si Aprendiz Derrotado o Aprendiz Liberado NO están marcados → el Aprendiz de Malagaunt entra en batalla desde Punto de Entrada aleatorio en primera ronda.
**EL FINAL DEL CAMINO:** Si fallas en derrotar al Malagaunt: él se traslada a otro lugar. No podrás volver a jugar esta misión; tendrás que sacar el mejor de tus experiencias y continuar un nuevo viaje.
**CONTINUACIÓN:** Usar el mismo grupo que en la partida anterior. Cualquier PNJ contratado que haya sobrevivido permanecerá.
**Registro Amenaza:** Cara * (ver misión previa) - 0 clavijas.
**Mazo Eventos:** 8x Lamentor, 2x Malagaunt, 2x Mapa, 7x Hellfront, 1x Hellfront, 1x Hellfront + dificultad.

---

## 6. VARIABLES PERSISTENTES DEL REGISTRO DE CAMPAÑA

La app debe rastrear y mostrar todas estas variables en tiempo real:

| Variable | Tipo | Descripción |
|----------|------|-------------|
| Demora | Número 0-12 | Presión temporal. No puede ser inferior a 0 ni superior a 12. |
| Malagaunt derrotado (veces) | Número | Se marca en el registro cada vez que es derrotado. Reduce cartas en Eventos en futuras partidas. |
| Troll Derrotado | Booleano | Logro. Si marcado: el Rot Troll no aparece en misiones posteriores. |
| Aprendiz Involuntario | Booleano | Logro. Descubriste que el Malagaunt tiene un aprendiz. |
| Aprendiz Derrotado | Booleano | Logro. Derrotaste al aprendiz. |
| Aprendiz Liberado | Booleano | Logro. Liberaste al aprendiz. |
| Nombre del Aprendiz | Texto | Nombre del Habitante que está siendo usado como Aprendiz. |
| Aprendiz Maladaar estado | Texto | Si el Aprendiz se unió a tu grupo. |
| Cadáveres Examinados | Número | Acumulado de cadáveres examinados en Misión J. |
| Sepulturas Registradas | Número | Acumulado de Espacios de Sepultura buscados en Misión D. |
| Invasores Escapados | Número | Suma de rangos de Revenants que escaparon en Misión F. Afecta la dificultad de Misión R. |
| Disminuir la Horda | Número | Banda de Amenaza donde estaba la clavija morada más alta en M u O. |
| Salas Santificadas | Número | Número de salas santificadas al final de K. Afecta la Misión T. |
| Puntos de Entrada Mapeados | Array | Números de puntos de entrada mapeados en D. Afecta la Misión F. |
| Parafernalia Oculta | Booleano | Logro/Objetivo 9 recuperado en A. Resta 1 a tirada en Misión I. |
| Rastro Esquelético | Booleano | Logro. Ambos Objetivos 7 y 8 encontrados en C. Efectos en varias misiones. |
| Deuda de Favor | Booleano | Logro. Habitante rescatado en B. +3 impactos en Interludio de Antorchas y Horcas. |
| Investigación en Curso | Booleano | Recompensa de H. Se aplica a todas las misiones futuras. |
| Escudo de Almas | Booleano | Recompensa de I. Permite añadir clavija adicional a Ejes en Misión R. |
| Perspectiva Táctica | Número (0-2) | Recompensa del Interludio Necrótico. |
| Resistencia al Veneno | Booleano | Recompensa del Interludio Necrótico. |
| Debilidad del Objetivo | Booleano | Recompensa del Interludio Necrótico. |
| Experiencia de Combate | Booleano | Recompensa del Interludio Necrótico. |
| Saqueo de Sepulturas | Booleano | Recompensa del Interludio Necrótico. |
| Signos Reveladores | Booleano | Recompensa del Interludio Necrótico. |
| Ritual de Consagración | Booleano | Recompensa del Interludio Necrótico. |
| Oferta de Ayuda | Booleano | Recompensa de Misión N. +1 impacto en Interludio Antorchas. |
| Contactos en el Gremio | Booleano | Recompensa de Misión N. +1 impacto en Interludio Antorchas. |
| Sabiduría de la Mazmorra | Número | Recompensa de Misión F. Acumulable. |

---

## 7. MODIFICADORES DE DEMORA

Aplicar automáticamente cuando la app detecta las condiciones:

| Condición | Modificador Demora |
|-----------|-------------------|
| Amenaza en nivel Disaster o superior al final de una partida | +1 |
| Amenaza en nivel Distress o inferior al final de una partida | -1 |
| Jugar una Misión de Rescate | +1 |
| Jugar una partida independiente fuera de la campaña | +1 |
| Sufrir Bajas Masivas (repetir Fases de Mercado y Descanso) | +1 |
| Jugar Misión B (opcional) | +1 |
| Completar Misión R sin que ningún Aventurero escape | +1 |
| Elegir camino de túneles en C en lugar de carretera (Misión F en lugar de E) | — |
| Aventureros que escaparon por la Puerta en R/S | -1 por cada uno |

---

## 8. ÁRBOL DE DECISIÓN DE MISIONES

```
[Intro] DE MONEDA Y GLORIA (opcional/independiente)
         ↓
      [MISIÓN A]
         ↓
    ┌────┴────┐
 (Obj.1)  (sin Obj.1)
    ↓         ↓
 [MISIÓN B]  continuar
 (opcional)
    ↓
    ├── 5+ reliquias → [MISIÓN C]
    │                      ↓
    │               ┌──────┴──────┐
    │          (carretera)   (túneles)
    │               ↓             ↓
    └── 4- reliquias → [MISIÓN D]
                ↓         ↓
            [MISIÓN E] [MISIÓN F]
                ↓         ↓
                └────┬────┘
                     ↓
              [INTERLUDIO Necrótico]
                     ↓
              ┌──────┴──────┐
           (E éxito)    (E fracaso)
              ↓             ↓
           [MISIÓN G]   [MISIÓN H]
              ↓             ↓
              └──────┬──────┘
                     ↓
              [MISIÓN I - Los Secretos del Cabo Feere]
                     ↓
              ┌──────┴──────┐
           (reliquia OK)  (reliquia falla)
              ↓               ↓
           [MISIÓN J]      [MISIÓN L]
           (opcional K)       ↓
              ↓           ┌───┴───┐
         ┌────┼────┐      ↓       ↓
        (M) (N)  (O)  [MISIÓN J] [MISIÓN O]
         ↓    ↓    ↓
         └────┴────┘
              ↓
     [INTERLUDIO Antorchas y Horcas]
              ↓
       ┌──────┴──────┐
   (convences)   (no convences)
       ↓               ↓
  [MISIÓN R]       [MISIÓN P]
       ↓               ↓
  ┌────┴────┐      [MISIÓN Q]
(escapa) (no)          ↓
   ↓        ↓     [MISIÓN R]
[MISIÓN T] [MISIÓN S]
(FINAL)     ↓
        [MISIÓN T]
        (FINAL)
```

---

## 9. ICONOS DEL MAPA (referencia completa)

Según la Clave del Mapa del Libro de Campaña (p.48):
- Paredes/Muros, Puertas, Entradas (punteadas), Muros en Ruinas
- Antorcha, Oscuridad, Luz, Bloqueado, Destruido
- Punto de Entrada, Lamentor, Myria, Hellfront (x2 variantes)
- Reagrupamiento, Habitante, Aventurero, Malagaunt, Punto de Sepultura
- Pilar, Caja, Cofre, Silla, Palanca
- Tumba, Estante para Armas, Mesa, Escritorio del Arcanista
- Pozo, Crisol de la Resurrección, Foso, Barricada

---

## 10. PLAN DE DESARROLLO POR FASES

### FASE 1 — MVP (Primera entrega)
Programar en este orden exacto:

1. **Estructura base PWA** con Service Worker, manifest, y routing básico
2. **IndexedDB setup** con todos los stores definidos arriba
3. **Pantalla de inicio** + crear/cargar campaña
4. **Ficha de aventurero** editable (pegs de Salud/Magia/Habilidad + status effects)
5. **Tablero Principal** con tracker de Amenaza y checklist de fases
6. **Setup de Misión** para las primeras 5 misiones (Intro, A, B, C, D)
7. **Registro de Campaña** básico

### FASE 2 — Combat + Misiones completas
1. **Combat Resolver** completo
2. **Setup de todas las 20 misiones** con sus reglas especiales
3. **Motor de consecuencias** — la app determina qué misión viene después
4. **Fin de Misión** con flujo post-partida completo

### FASE 3 — Polish + Campaign Brain
1. **Árbol visual de misiones** con ruta jugada
2. **Inventario completo** con integración a xinix DB
3. **Habilidades por clase** desde la Reference Section
4. **Notificaciones** de efectos de Demora activos
5. **Exportar/importar** estado de campaña (JSON backup)

---

## 11. NOTAS IMPORTANTES PARA OPUS

1. **No inventar reglas.** Si algo no está en esta especificación o en los documentos del Drive, pregunta antes de asumir.

2. **Los datos de personajes y clases** están en el documento `Maladum Reference Section` del Drive. Léelo para obtener los stats base de cada clase (Warrior, Ranger, Rogue, Mage, etc.), sus habilidades y capacidad de magia.

3. **Los datos de items** no necesitan hardcodearse — la app puede hacer fetch de la API pública de xinix.github.io o simplemente enlazar a esa web para consultas.

4. **El Registro de Amenaza** tiene dos caras (A y B) y cada misión especifica qué cara usar y con cuántas clavijas iniciales. La Cara A tiene 6 bandas estándar. La Cara B tiene una distribución diferente para misiones de mayor nivel. Esto está en el Rulebook — léelo para el setup exacto.

5. **El Dado Mágico** es un dado de 6 caras especial con resultados: 1, 2, 3, 4, 5, 6 (donde ciertos números activan efectos especiales de hechizos o eventos). Los detalles exactos están en el Rulebook.

6. **Para el Combat Resolver**, los datos exactos de cada tipo de arma (cuántos dados rojos según distancia) están en la Reference Section del Drive.

7. **Persistencia**: todo debe guardarse automáticamente en IndexedDB después de cada cambio. No puede haber pérdida de datos si el usuario cierra la app o cambia de pestaña en Safari.

8. **iPhone first**: todos los touch targets deben ser mínimo 44x44px. No usar hover effects como funcionalidad principal. El diseño debe funcionar en pantalla de 390px de ancho (iPhone 14).

---

## 12. EXPANSIÓN: DE CERVEZA Y AVENTURA (Ale and Adventure)

### 12.1 ADVENTURERS — Stats completos verificados de fichas físicas

| Nombre | Especie | Salud | Habilidad | Magia | Acciones | Coste | Habilidades Innatas | Persuasión PNJ |
|--------|---------|-------|-----------|-------|----------|-------|---------------------|----------------|
| Nerinda | Human | 5 | 4 | 2 | 2 | 80₲ | Weapons Master 1 | 2 |
| Unger | Tregar | 4 | 3 | 1 | 2 | 73₲ | Persuasión, Detect | 2 |
| Kriga | Human | 4 | 3 | 1 | 2 | 73₲ | — | 2 |
| Beren | Human | 4 | 4 | 2 | 2 | 71₲ | Natural Remedies, Ready for Anything | 2 |
| Hendley | Dwella | 4 | 3 | 1 | 2 | 75₲ | Night Vision, Smithing | 2 |
| Galen | Eld | 3 | 3 | 1 | 2 | 75₲ | Ambush | 2 |
| Artain | Human | 3 | 3 | 3 | 2 | 61₲ | Entertainer | 2 |
| Ariah | Human | 3 | 4 | 1 | 2 | 73₲ | Tactical Gift, Ranged Expert | 2 |
| Brahm | Human | 4 | 4 | 3 | 2 | 90₲ | Weapons Master, Ranged Expert | 3 |
| Emmerik | Human | 3 | 3 | 4 | 2 | 60₲ | Loremaster | 1 |

### 12.2 CLASES COMPLETAS — 21 clases verificadas de fichas físicas

| Clase | Coste | Habilidades disponibles | Especial de clase |
|-------|-------|------------------------|-------------------|
| **Barbarian** | G7 | Frenzy, Reflexes, Brutal Assault, Onslaught, Impervious, Combat Arts, Intimidating | +1 Salud · Strength |
| **Rogue** | G5 | Light Fingers, Reflexes, Tricks of the Trade, Distraction, Persuasion, Camouflage, Duck for Cover, Tracking | Open Door |
| **Sellsword** | G10 | Reflexes, Frenzy, Weapons Master, Counter Shot, Bullseye, Training, Quick Recovery, Ambush | — |
| **Assassin** | G13 | Reflexes, Combat Arts, Acrobatics, Hard to Hit, Disarm, Trick Shot, Quick Recovery, Malacyte Mastery | 2/3 dados combate |
| **Scavenger** | G9 | Acrobatics, Fleet of Foot, Combat Arts, Tricks of the Trade, Light Fingers, Hard to Hit, Barter, Ready for Anything | Cápsula |
| **Swindler** | G11 | Bombast, Disarm, Light Fingers, Distraction, Reflexes, Bullseye, Trick Shot, Entertainer | Illusion · Poción |
| **Marksman** | G6 | Trick Shot, Ranged Expert, Counter Shot, Bullseye, Ambush, Duck for Cover, Fleet of Foot, Reflexes | — |
| **Guardian** | G7 | Onslaught, Quick Recovery, Steady, Impervious, Weapons Master, Frenzy, Brutal Assault, Ready for Anything | — |
| **Blacksmith** | G9 | Smithing, Weapons Master, Steady, Impervious, Ranged Expert, Barter, Tricks of the Trade, Duck for Cover | Weaken Armour |
| **Curator** | G9 | Loremaster, Herbalism, Unlikely Hero, Smithing, Duck for Cover, Tactical Gift, Barter, Tracking, Natural Remedies, Malacyte Mastery | Hierbas · Hojas |
| **Contender** | G12 | Acrobatics, Bombast, Steady, Tactical Gift, Weapons Master, Intimidating, Reflexes, Onslaught | Hyper Awareness |
| **Strategist** | G20 | Tactical Gift, Bombast, Training, Ready for Anything, Ranged Expert, Counter Shot, Distraction | Foresight · Remote Resistance |
| **Maestro** | G13 | Entertainer, Unlikely Hero, Inspiring, Barter, Hard to Hit, Persuasion, Quick Recovery, Malacyte Mastery | Reciclaje (flecha circular) |
| **Rook** | G16 | Power Manipulation, Malacyte Mastery, Distraction, Persuasion, Barter, Duck for Cover | Hechizos (libro de spells) |
| **Paladin** | G12 | Inspiring, Barter, Steady, Impervious, Weapons Master, Disarm, Persuasion | Hechizos (libro de spells) |
| **Prymorist** | G16 | Power Manipulation, Malacyte Mastery, Hard to Hit, Fortified Mind, Natural Remedies, Counter Shot | Hechizos (libro de spells) |
| **Eudaemon** | G16 | Malacyte Mastery, Impervious, Inspiring, Fortified Mind, Reflexes, Onslaught | Hechizos (libro de spells) |
| **Ranger** | G9 | Ambush, Camouflage, Tracking, Ranged Expert, Reflexes, Quick Recovery, One With Nature, Ready for Anything | Flecha circular |
| **Druid** | G13 | Tracking, Distraction, One With Nature, Reflexes, Fortified Mind, Natural Remedies, Ambush | Hechizos (libro de spells) |
| **Magus** | G14 | Quick Recovery, Power Manipulation, Reflexes, Intimidating, Fortified Mind, Ready for Anything, Frenzy | Hechizos (libro de spells) |
| **Rambler** | G11 | Herbalism, Tracking, Fleet of Foot, Quick Recovery, Tricks of the Trade, Hard to Hit, One With Nature | Recover · Detect |

**Clases con Spells (libro de hechizos):** Rook, Paladin, Prymorist, Eudaemon, Druid, Magus
**Clases con habilidades de crafteo integradas:** Blacksmith (Smithing), Curator (Herbalism + Smithing), Rambler (Herbalism)

### 12.3 NUEVOS ENEMIGOS — Troglodyte, Drakon, Cankers, Deathly Avatar

| Enemigo | Versión | Rank | Acciones | Ataque melee | Ataque ranged | Habilidades especiales |
|---------|---------|------|----------|--------------|---------------|----------------------|
| Troglodyte | Normal | 2 | 3 | 1 dado | — | Night Vision, Tracking |
| Troglodyte | Elite | 2 | 3 | 1 dado | — | Night Vision, Tracking |
| Drakon | Normal | 3 | 3 | 1 dado, Tamaño 3 | — | Tracking |
| Drakon | Elite | 3 | 3 | 1 dado, Tamaño 3 | — | Tracking |
| Cankers | Normal | 1 | 2 | 2 dados | — | Night Vision, ½ armadura, Tracking, Omega |
| Cankers | Elite | 1 | 2 | 2 dados | — | Night Vision, Tracking |
| Deathly Avatar | Normal | 4 | 2 | especial | — | Salud 4, Magia 3, reglas especiales en Misión R/S |

### 12.4 EL GREMIO DE ARTESANOS — Reglas de crafteo (verificadas del manual)

**Cuándo:** Durante la **Fase de Mercado** visitando el Gremio de Artesanos.

**Cómo craftear paso a paso:**
1. Elegir el objeto a fabricar y ver su receta (lista de iconos de recursos requeridos)
2. Descartar fichas de recursos propias que coincidan con al menos los iconos requeridos
3. Los iconos sobrantes en las fichas descartadas se pierden (se pierde el exceso)
4. Pagar al artesano una tarifa igual al **precio de venta del objeto**
5. Añadir el objeto fabricado al inventario

**Reglas importantes:**
- Los objetos fabricados tienen rareza **Exclusiva** — no se pueden comprar ni encontrar por otros medios
- Limitados al **suministro físico**: si se fabricaron todas las copias de un objeto, no se puede crear otra
- Se puede fabricar un objeto de cualquier valor independientemente del rango del personaje
- Para calcular el **valor del grupo** (dificultad): los objetos fabricados valen el **doble de su precio de venta**
- **Reliquias**: objetos fabricados que además requieren una ficha de recurso única y rara. Se pueden encontrar durante aventuras regulares o en misiones narrativas específicas

**Recursos de doble tipo (fichas morado/rojo):**
- Son tanto objetos no combativos (morado) como equipamiento (rojo)
- Se pueden usar durante la partida para un efecto menor
- O guardarse para craftear en el Gremio según las reglas descritas
- Los iconos en el lado amarillo del token solo se aplican cuando está en la ranura de armadura

### 12.5 LOS 15 RECURSOS DE CRAFTEO

| Símbolo | Recurso | Coste | Descripción |
|---------|---------|-------|-------------|
| W | Wood (Madera) | 4₲ | Tablones o mangos de armas reciclados |
| S | Steel (Acero) | 5₲ | De armas y armaduras descartadas |
| T | Textiles | 5₲ | Telas, cuero, materiales de sastrería |
| H | Herbs (Hierbas) | 5₲ | Plantas medicinales para pociones y remedios |
| F | Fungus (Hongos) | 5₲ | Hongos medicinales (y alucinógenos) de calabozos húmedos |
| M | Minerals (Minerales) | 7₲ | Del suelo, suplementos y pociones herbáceas |
| R | Riches (Riquezas) | 8₲ | Metales preciosos, gemas, pieles de animales raros |
| V | Serpent Venom (Veneno de Serpiente) | 9₲ | Toxinas de serpientes y criaturas mortales |
| K | Keltic Steel (Acero Kéltico) | 13₲ | Aleación gris-azulada para armas superiores |
| B | Powdered Drakon Bone (Hueso de Drakon) | 15₲ | Adrenalina en crudo o potenciador en tónicos |
| G | Graam Ore (Mineral de Graam) | 16₲ | Conductor del Maladum para objetos inanimados |
| I | Issen Oil (Aceite de Issen) | 21₲ | Sustancia inflamable del río Issen para explosivos |
| A | Alary Carapace (Caparazón de Alary) | 23₲ | Quitina iridiscente considerada de buena suerte |
| E | Extract of Maladite (Extracto de Maladita) | 25₲ | Roca rica en malacita para protección mágica |
| N | Necrotic Fluids (Fluidos Necróticos) | * | Coste especial — ver recetas individuales |

### 12.6 TODAS LAS RECETAS DE CRAFTEO (68 objetos verificados del XLSX)

Formato: Nombre | Expansión | Tipo | Tamaño | Ingredientes | Precio venta | Rareza

**XS — Muy pequeños:**
- Arrow - Entangle x2 | AaA | Ammunition | XS | W+T | 2₲ | Common
- Arrow - Viscous/Sharp x2 | AaA | Ammunition | XS | W+S | 3₲ | Common
- Arrow - Poison/Sharp x2 | AaA | Ammunition | XS | W+V | 2₲ | Uncommon
- Magic Potion x3 | AaA | Potion | XS | H+F+F | 4₲ | Common
- Health Potion x3 | AaA | Potion | XS | H+H+F | 5₲ | Common
- Arrow - Hawkeye/Sharp x2 | AaA | Ammunition | XS | W+G | 2₲ | Uncommon
- Skill Potion x2 | AaA | Potion | XS | H+F+M | 6₲ | Common
- Action Potion x3 | AaA | Potion | XS | H+M+B | 4₲ | Uncommon
- Hat* | AaA | Armour | XS | T+A | 2₲ | Rare
- Bullet - Burning x2 | AaA | Ammunition | XS | S+I | 3₲ | Uncommon

**S — Pequeños:**
- Mighty Brew x2 | AaA | Potion | S | H+M+V | 5₲ | Uncommon
- Cordial of Cognisance | AaA | Potion | S | M+M+R | 7₲ | Common
- Honed Leather Armour | AaA | Armour | S | T+T+R | 12₲ | Common
- Potion of Finesse x2 | AaA | Potion | S | H+R+G | 6₲ | Uncommon
- Wardweaver's Nip | AaA | Potion | S | F+F+E | 5₲ | Rare
- Destiny's Tincture | AaA | Potion | S | F+M+A | 8₲ | Rare
- Adamantine Elixir | AaA | Potion | S | M+V+B+I | 9₲ | Uncommon
- Warrior Totem | AaA | Maladar/Misc | S | W+M+R+I | 8₲ | Uncommon
- Protection Orb | AaA | Maladar/Misc | S | R+B+G+E | 12₲ | Rare

**M — Medianos:**
- Shillelagh | AaA | Weapon | M | W+W+M | 11₲ | Common
- Spiked Armour | AaA | Armour | M | S+S+S+T | 14₲ | Common
- Eld Short Bow | AaA | Weapon | M | W+S+G | 9₲ | Uncommon
- Herbalist's Cloak | AaA | Armour | M | T+T+H+F+V | 7₲ | Uncommon
- Curative Cuirass | AaA | Armour | M | S+T+H+H | 18₲ | Common
- Keltic Falchion | AaA | Weapon | M | S+S+R+K | 13₲ | Uncommon
- Blitz-Hammer | AaA | Weapon | M | W+S+S+R+B | 8₲ | Uncommon
- Makeshift Wings | AaA | Armour | M | W+T+T+A | 8₲ | Rare
- Sentient Scimitar | AaA | Weapon | M | S+S+R+G | 14₲ | Uncommon
- Reaper's Riposte | AaA | Weapon | M | S+S+R+A | 12₲ | Rare
- Bladed Shield | AaA | Weapon | M | W+S+S+K+B | 13₲ | Uncommon
- Keltmail Armour | AaA | Armour | M | T+R+K+K | 10₲ | Uncommon
- Sacrificium | OM | Maladar/Misc | M | H+H+R+E+N | 5₲ | Unique
- Grail of the Gods | AaA | Maladar/Misc | M | M+R+G+I+E | 28₲ | Rare
- Robes of Invulnerability | AaA | Armour | M | T+T+M+B+A | 15₲ | Rare
- Cloak of Cloning | OM | Armour | M | T+T+F+I+E | 9₲ | Rare
- Refined Robes | AaA | Armour | M | T+F+R+E+E | 24₲ | Rare
- Daemon Mantle | AaA | Armour | M* | T+F+V+B+B | 28₲ (Relic) | Uncommon

**L — Grandes:**
- Honed Long Sword x2 | AaA | Weapon | L | S+R+K | 8₲ | Uncommon
- Starstrike Flail | AaA | Weapon | L | W+S+S+R | 14₲ | Common
- Mastercrafted Box | AaA | Weapon | L | W+W+T+R | 17₲ | Common
- Mastercrafted Bow | AaA | Weapon | L | W+W+T+R | 17₲ | Common
- Viperfang | AaA | Weapon | L | S+R+V+V | 11₲ | Uncommon
- Disarming Staff | AaA | Weapon | L | W+W+K+B | 6₲ | Uncommon
- Arcane Steel | AaA | Weapon | L | S+S+K+G | 10₲ | Uncommon
- Bewitched Blade | AaA | Weapon | L | S+S+R+G | 16₲ | Uncommon
- Spelleater | AaA | Weapon | L | R+R+K+G | 10₲ | Uncommon
- Necrotic Censor | OM | Weapon | L | W+M+R+V+G | 11₲ | Uncommon
- Liberator of Souls | OM | Weapon | L | W+G+A+N+N | 13₲ | Unique
- Mechanical Musket | AaA | Weapon | L | W+S+M+R+G | 18₲ | Uncommon
- Blade of Momentum | AaA | Weapon | L | S+R+B+G | 15₲ | Uncommon
- Hellfire Blade | AaA | Weapon | L | S+R+K+I+I | 12₲ | Uncommon
- Soul Siphon | AaA | Weapon | L | W+R+V+G+I | 28₲ (Relic) | Uncommon
- Sceptre of Dominion | AaA | Maladar/Misc | L | R+R+R+G+A | 28₲ (Relic) | Rare
- Ethereal Edge | OM | Weapon | L | S+R+N+N | 10₲ | Unique

**XL — Muy grandes:**
- Crafted Great Axe | AaA | Weapon | XL | W+S+S+T+R | 14₲ | Common
- Crafted Great Sword | AaA | Weapon | XL | S+S+S+S+R | 13₲ | Common
- Calamitous Caber | AaA | Weapon | XL | W+W+W+M+A | 10₲ | Rare
- Sword of Tephysus | AaA | Weapon | XL | S+R+K+K+B | 28₲ (Relic) | Uncommon
- Nature's Fury | AaA | Weapon | XL | M+M+V+B+A | 28₲ (Relic) | Rare
- Astral Arbiter | OM | Weapon | XL | W+W+M+K+G+E | 19₲ | Rare
- Vampiric Blade | OM | Weapon | XL | S+S+V+B+G+N | 15₲ | Unique
- Uncanny Oculus | OM | Weapon | XL | V+G+I+E+N | 28₲ | Unique
- Ascendant Blades | TFC | Weapon | XL | S+M+K+I+E | 28₲ (Relic) | Rare

**Expansiones:**
- AaA = Of Ale and Adventure
- OM = Oblivion's Maw
- TFC = The Forbidden Creed

**Objetos Raros (Relics) — requieren recurso único además de ingredientes normales:**
- Anyssal Trophy | OM | Maladar/Misc | M | F+B+A+N | 28₲ | Unique (Relic 7)
- Light in the Darkness | TFC | Maladar/Misc | L | R+G+A+E+N | 28₲ | Unique (Relic 9)

### 12.6 MISIONES SECUNDARIAS (nuevas en AaA)

- Son objetivos extra en cartas que se mantienen en la caja durante el juego
- Se ofrecen en la posada entre partidas o por PNJs durante el juego
- Solo el jugador que recibe la carta puede completarla
- Recompensas: generalmente Renombre o Florines — todos los resultados son acumulativos
- Las cartas permanecen en juego hasta que se indique descartarlas
- **Actualización Fase de Descanso:** Si sacas "Fraternizar con los Locales" → el lanzamiento subsiguiente es: 1=Ganar objeto, 2=Comprar objetos, 3=Obtén información, 4-6=Saca carta de Misión Secundaria

### 12.7 UBICACIONES OCULTAS (nuevas en AaA)

- Partes del área de juego no evidentes a primera vista (pasadizos secretos, cámaras misteriosas)
- Representadas por un mazo de cartas y fichas grises (funcionan como trampas)
- Se resuelven inmediatamente al ser obtenidas durante Búsqueda
- Solo se puede añadir UNA habitación al área de juego por misión
- Las fichas comunes van a la bolsa; poco comunes y exclusivas se guardan por rareza

### 12.8 NUEVAS PIEZAS DE TERRENO (AaA)

Nuevos elementos con reglas:
- **Cofre del Tesoro**: Arrastrarlo a Área de Reagrupamiento → tirar 4 dados de combate, 10₲ por impacto + fichas Tarnished Trinkets + objeto raro
- **Estanterías**: Buscables → sacar ficha Exclusiva de Libro del suministro. Intercambia por: Estantes de Armas
- **Tapices**: Aventurero se marca con contador de Recordatorio → oculto. Solo 1 aventurero por tapiz. Intercambia: sacar ficha de Textiles
- **Braseros**: Encender/apagar interactuando con llama adjunta. Encendido = antorchero
- **Altar y Arcas**: Terreno Buscable. Altar intercambia por Escritorio del Arcanista; Arcas por Pilares
- **Trampillas**: Acceso a habitaciones ocultas. Punto de acceso en casilla más cercana a pieza Buscada

### 12.9 MÓDULO DE CRAFTEO EN LA APP

La app debe incluir una pantalla de **Taller de Crafteo** accesible desde la Fase de Mercado con:

1. **Inventario de recursos actual** — cada aventurero puede tener recursos guardados; la app suma el total del grupo
2. **Lista filtrable de recetas** — filtros por: tipo (Weapon/Armour/Potion/Ammunition/Misc), tamaño, rareza, expansión, "fabricables ahora" (solo muestra las que tienes recursos suficientes)
3. **Vista de receta** — muestra ingredientes necesarios, ingredientes que tienes, ingredientes que faltan (con coste para comprarlos), precio final de fabricación
4. **Botón Craftear** — al confirmar: descuenta los recursos del inventario del jugador y añade el objeto fabricado
5. **Calculadora de valor** — muestra el valor del grupo incluyendo objetos fabricados (×2 precio de venta)


---

## 13. PERSONAJES DEL JUEGO BASE — Stats verificados de fichas físicas

Estos 5 personajes son del starter set original de Maladum (no de la expansión AaA):

| Nombre | Especie | Salud | Habilidad | Magia | Acciones | Coste | Habilidades Innatas |
|--------|---------|-------|-----------|-------|----------|-------|---------------------|
| Grogmar | Ormen | 7 | 3 | 2 | 2 | 73₲ | Quick Recovery |
| Moranna | Human | 5 | 5 | 4 | 2 | 80₲ | Impervious, Malacyte Mastery |
| Greet | Grobbler | 5 | 5 | 3 | 3 | 75₲ | Barter, Tricks of the Trade |
| Syrio | Eld | 6 | 4 | 3 | 2 | 64₲ | Reflexes |
| Callan | Human | 5 | 4 | 3 | 2 | 54₲ | Frenzy |

Nota: Los personajes del juego base tienen más en el starter set. Estos son los 5 confirmados de fichas físicas. Los stats de otros personajes base (Sera, Thaddeus, etc.) están en la Reference Section del Drive.
