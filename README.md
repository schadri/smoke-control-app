# Controla los Puchos 

Una Aplicación Web Progresiva (PWA) construida con **Next.js**, **Supabase** y **Tailwind CSS**, diseñada para ayudar a los usuarios a reducir progresiva y ordenadamente su consumo de tabaco mediante la distribución inteligente de intervalos de tiempo.

## Características Principales

- **Gestión Inteligente de Tiempo**: Calcula automáticamente el tiempo óptimo entre cada cigarrillo basado en una "meta diaria" y un "rango de horas establecido".
- **Botón de Emergencia (Panic Button)**: Si el usuario experimenta un pico de ansiedad y fuma antes de tiempo, la aplicación recalcula la distribución del resto del día para asegurar que no se supere la meta total.
- **Reducción Automática Progresiva**: Opción configurable para restar un (1) cigarrillo a la meta diaria automáticamente cada 7 días.
- **Dashboard Analítico**: Gráficas de barras (impulsadas por Recharts) que muestran las horas del día con mayor índice de urgencias/emergencias en los últimos 7 días.
- **Modo Oscuro Nativo**: Interfaz fluida y con soporte nativo para *Dark Mode* vía Tailwind, pensada con una arquitectura *Mobile-First*.
- **PWA Instalable**: Soporte offline y capacidad de instalarse en la pantalla de inicio del móvil gracias a `next-pwa`.

## Stack Tecnológico

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + React 19
- **Base de Datos & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Estado Global**: [Zustand](https://github.com/pmndrs/zustand)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Gestión de Tiempos**: [date-fns](https://date-fns.org/)
- **Gráficas**: [Recharts](https://recharts.org/en-US/)
- **Iconografía**: [Lucide React](https://lucide.dev/)

## Estructura de Base de Datos (Supabase)

El proyecto asume la existencia de las siguientes tablas (encuentra el script SQL completo en `supabase/schema.sql`):

1. **`profiles`**: Extiende la tabla de usuarios autenticados. Contiene un JSONB `config` que guarda: `{meta_diaria, hora_inicio, hora_fin, modo_reduccion_activa, precio_paquete}`.
2. **`logs`**: Historial inmutable de cada cigarrillo consumido. Incluye un booleano `es_emergencia` y el `intervalo_recalculado` en ese preciso momento.

## Instalación y Desarrollo Local

1. **Clonar el repositorio y entrar al directorio:**
   ```bash
   git clone <tu-repo>
   cd smoke
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno:**
   Crea un archivo `.env.local` en la raíz del proyecto y añade tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
   ```

4. **Instalar Base de Datos:**
   Ve a la consola SQL de tu proyecto en Supabase, copia el contenido de `supabase/schema.sql` y ejecútalo para crear las tablas, políticas de seguridad (RLS) y los triggers automáticos.

5. **Levantar Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador local o en el móvil (usando la IP de red local) para ver el resultado.

## PWA y Compilación a Producción

Para compilar y testear la PWA localmente simulando producción:
```bash
npm run build
npm run start
```
*(Nota: El Service Worker en modo desarrollo usualmente se desactiva por comodidad, `npm run build` genera los manifests e iconografías necesarias).*
