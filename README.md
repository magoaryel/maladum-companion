# ⚔️ Maladum Companion App

PWA companion para el juego de mesa **Maladum: Dungeons of Enveron**.

## Funcionalidades (Fase 1)

- ✅ PWA instalable en iPhone desde Safari
- ✅ Funciona offline con Service Worker
- ✅ Crear y cargar campañas (datos guardados en IndexedDB)
- ✅ Fichas de aventurero editables (Salud/Magia/Habilidad + estados)
- ✅ 15 personajes del juego base + expansión Ale & Adventure
- ✅ 21 clases disponibles
- ✅ Tablero principal con tracker de Amenaza (caras A y B)
- ✅ Checklist interactivo de las 5 fases del turno
- ✅ Setup de misión para Intro, A, B, C, D
- ✅ Registro de campaña completo (logros, recompensas, contadores)
- ✅ Diseño dark fantasy optimizado para iPhone (390px)

---

## 🚀 Cómo desplegar en Vercel (paso a paso)

### Paso 1: Crear cuenta en GitHub

1. Ve a **https://github.com** en tu navegador
2. Haz clic en **Sign up** (Registrarse)
3. Pon tu email, crea una contraseña, elige un nombre de usuario
4. Confirma tu email cuando te llegue el correo

### Paso 2: Crear un repositorio nuevo

1. Una vez dentro de GitHub, haz clic en el botón verde **"New"** (o ve a https://github.com/new)
2. En **Repository name** escribe: `maladum-companion`
3. Deja marcado **Public**
4. Marca la casilla **"Add a README file"**
5. Haz clic en **"Create repository"**

### Paso 3: Subir los archivos del proyecto

1. En tu repositorio recién creado, haz clic en **"Add file"** → **"Upload files"**
2. Arrastra TODOS estos archivos y carpetas desde tu ordenador:
   - `vercel.json`
   - `package.json`
   - La carpeta `public/` completa (contiene `index.html`, `manifest.json`, `sw.js`)
3. Abajo donde dice "Commit changes", escribe "Primera versión" y haz clic en **"Commit changes"**

**⚠️ IMPORTANTE:** Asegúrate de que la estructura queda así en GitHub:
```
maladum-companion/
├── vercel.json
├── package.json
├── README.md
└── public/
    ├── index.html
    ├── manifest.json
    └── sw.js
```

Si GitHub no te deja subir carpetas, sube los archivos uno a uno:
1. Primero sube `vercel.json` y `package.json` a la raíz
2. Luego haz clic en **"Add file"** → **"Create new file"**
3. En el nombre escribe `public/index.html` (al poner la `/` GitHub creará la carpeta automáticamente)
4. Pega el contenido del archivo `index.html`
5. Repite para `public/manifest.json` y `public/sw.js`

### Paso 4: Crear cuenta en Vercel

1. Ve a **https://vercel.com**
2. Haz clic en **"Sign Up"**
3. Elige **"Continue with GitHub"** — esto conecta tu cuenta de GitHub automáticamente
4. Autoriza el acceso cuando te lo pida

### Paso 5: Desplegar el proyecto

1. Una vez dentro de Vercel, haz clic en **"Add New..."** → **"Project"**
2. Verás una lista de tus repositorios de GitHub. Busca **maladum-companion** y haz clic en **"Import"**
3. En la pantalla de configuración:
   - **Framework Preset:** déjalo en "Other"
   - **Root Directory:** déjalo vacío (es la raíz)
   - No toques nada más
4. Haz clic en **"Deploy"**
5. Espera 30-60 segundos. Cuando termine, Vercel te dará una URL tipo:
   **`https://maladum-companion-XXXXX.vercel.app`**

### Paso 6: Instalar en tu iPhone

1. Abre **Safari** en tu iPhone (TIENE que ser Safari, no Chrome)
2. Ve a la URL que te dio Vercel (ej: `https://maladum-companion-xxxxx.vercel.app`)
3. Toca el botón de **compartir** (el cuadradito con la flecha hacia arriba ⬆️)
4. Desplázate hacia abajo y toca **"Añadir a pantalla de inicio"**
5. Ponle el nombre "Maladum" y toca **"Añadir"**
6. ¡Listo! Ahora tienes la app en tu pantalla de inicio como si fuera una app nativa

---

## 📱 Cómo usar la app

1. **Crear campaña:** Toca "+ Nueva Campaña" y ponle un nombre
2. **Añadir aventureros:** Ve a "Gestionar Grupo" → "+ Añadir Aventurero"
3. **Elegir clase:** Toca un aventurero → selecciona su clase en el desplegable
4. **Comenzar misión:** Toca "Comenzar Misión" → lee el setup → "Comenzar Partida"
5. **Durante la partida:** Usa el tracker de amenaza, marca las fases del turno, ajusta los pegs de tus aventureros
6. **Registro:** Marca logros y recompensas conforme avanzas en la campaña

Todos los datos se guardan automáticamente en tu dispositivo. No necesitas internet para jugar.

---

## Pendiente acordado

Replantear la fase post mision como asistente por pasos:

- Fase de Huida
- Experiencia
- Posada o Bosque
- Reparar
- Vender
- Comprar / Craftear
- Resumen final

---

## Licencia

Maladum: Dungeons of Enveron es propiedad de Hayland Terrain. Esta app es una herramienta no oficial creada por fans.
