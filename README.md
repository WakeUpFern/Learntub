# LearnTube 🎓

LearnTube es una plataforma de aprendizaje personal que convierte cualquier video de YouTube en un curso estructurado mediante la extracción automática de capítulos y el seguimiento de progreso.

## ✨ Características

-   **🔒 Autenticación Segura**: Login con Google mediante Supabase Auth.
-   **📑 Extracción de Capítulos**: Detección automática de timestamps en la descripción de videos de YouTube.
-   **💾 Persistencia Híbrida**: Sincronización en la nube con Supabase y modo offline con `localStorage`.
-   **📊 Seguimiento de Progreso**: Visualiza cuánto has aprendido con barras de progreso y estadísticas.
-   **🎨 Interfaz Premium**: Diseño moderno con animaciones, modo oscuro y experiencia de usuario fluida.

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio y dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto con el siguiente formato:

```env
# Supabase (Auth & DB)
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase

# YouTube Data API v3
YOUTUBE_API_KEY=tu_api_key_de_google_cloud
```

### 3. Configurar Supabase

1.  **Base de Datos**: Ve al SQL Editor de tu proyecto en Supabase y ejecuta el contenido del archivo `supabase/schema.sql` para crear las tablas y políticas de seguridad (RLS).
2.  **Google Auth**:
    -   Ve a **Authentication > Providers** y habilita **Google**.
    -   Sigue las instrucciones de Supabase para obtener el `Client ID` y `Client Secret` desde la [Consola de Google Cloud](https://console.cloud.google.com/).
    -   Añade la **Redirect URL** que te proporciona Supabase en tu configuración de Google Cloud.
    -   En la aplicación, la URL de retorno está configurada como `http://localhost:3000/auth/callback`.

### 4. Configurar YouTube API

1.  Ve a [Google Cloud Console](https://console.cloud.google.com/).
2.  Crea un proyecto y habilita la **YouTube Data API v3**.
3.  Crea una **API Key** y pégala en tu archivo `.env.local`.

## 🛠️ Desarrollo

Para ejecutar el servidor de desarrollo localmente:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## 🚀 Despliegue en GitHub

Sigue estos pasos para subir tu proyecto a GitHub:

1.  Crea un nuevo repositorio en [GitHub](https://github.com/new).
2.  Ejecuta los siguientes comandos en tu terminal:

```bash
# Inicializar git (si no está inicializado)
git init

# Añadir todos los archivos
git add .

# Primer commit
git commit -m "Initial commit: LearnTube con Supabase Auth y YouTube API"

# Conectar con tu repositorio remoto (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# Subir el código
git branch -M main
git push -u origin main
```

---
Creado con ❤️ para mejorar el aprendizaje autodidacta.
