# 🏆 Hub Madridista

Una plataforma digital de vanguardia para aficionados del Real Madrid, que ofrece una experiencia multimedia inmersiva e inteligente mediante tecnologías avanzadas de IA y atractivas interacciones con los usuarios.

![Logo Hub Madridista](generated-icon.png)

## 📋 Descripción

Hub Madridista es una aplicación web full-stack que recopila, organiza y presenta contenido multimedia relacionado con el Real Madrid desde diversas plataformas (YouTube, Twitter, TikTok, Instagram). La aplicación utiliza inteligencia artificial para categorizar automáticamente el contenido, verificar su relevancia y mejorar la experiencia de búsqueda.

## ✨ Características principales

- **Autenticación completa**: Sistema de registro, inicio de sesión y recuperación de contraseña.
- **Roles de usuario**: Free, Premium y Admin con diferentes niveles de acceso y funcionalidades.
- **Categorización inteligente**: Clasificación automática de videos mediante IA (OpenAI, Anthropic Claude, Google Gemini).
- **Múltiples fuentes**: Integración con YouTube, Twitter, TikTok e Instagram.
- **Interfaz atractiva**: Diseño moderno y responsivo con los colores oficiales del Real Madrid.
- **Sistema de favoritos**: Permite a los usuarios guardar sus videos preferidos.
- **Suscripciones a canales**: Seguimiento de canales favoritos con notificaciones.
- **Panel de administración**: Gestión de usuarios, videos y contenido.
- **Base de datos PostgreSQL**: Almacenamiento persistente y relacional de datos.

## 🛠️ Tecnologías utilizadas

### Frontend
- React con TypeScript
- Vite como bundler
- Tailwind CSS para estilos
- Shadcn UI para componentes
- Wouter para enrutamiento
- TanStack Query para gestión de estado y peticiones
- Zod para validación de formularios
- Recharts para visualizaciones

### Backend
- Node.js con Express
- TypeScript
- PostgreSQL (mediante Drizzle ORM)
- Passport.js para autenticación
- JWT para tokens de sesión
- APIs de IA (OpenAI, Anthropic Claude, Google Gemini)

## 📊 Modelos de datos

- **Usuarios**: Información de cuentas, autenticación y perfiles.
- **Videos**: Contenido multimedia de diferentes plataformas.
- **Canales**: Fuentes de contenido (canales de YouTube, cuentas de Twitter, etc.).
- **Categorías**: Clasificación temática del contenido.
- **Favoritos**: Relación entre usuarios y videos favoritos.
- **Suscripciones**: Relación entre usuarios y canales suscritos.
- **Notificaciones**: Alertas para usuarios sobre nuevo contenido.

## 🚀 Cómo empezar

1. Clona este repositorio
2. Instala las dependencias con `npm install`
3. Configura las variables de entorno (ver sección de configuración)
4. Inicia la aplicación en modo desarrollo con `npm run dev`

## ⚙️ Configuración

### Entornos de desarrollo y producción

La aplicación soporta dos entornos distintos:

- **Desarrollo**: Utiliza el archivo `.env` para desarrollo local
- **Producción**: Utiliza el archivo `.env.production` para despliegue

Para más detalles sobre la configuración de entornos, consulta [ENVIRONMENTS.md](ENVIRONMENTS.md).

### Variables de entorno necesarias

```env
# Base de datos
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_db
PROD_DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_db_produccion

# Autenticación
JWT_SECRET=tu_clave_secreta_jwt
SESSION_SECRET=tu_clave_secreta_sesion

# APIs (opcionales pero recomendadas)
OPENAI_API_KEY=tu_clave_api_openai
ANTHROPIC_API_KEY=tu_clave_api_anthropic
GOOGLE_AI_API_KEY=tu_clave_api_gemini

# Mailchimp (para newsletter)
MAILCHIMP_API_KEY=tu_clave_api_mailchimp
MAILCHIMP_SERVER_PREFIX=prefijo_servidor
MAILCHIMP_AUDIENCE_ID=id_audiencia

# OAuth (opcional)
GOOGLE_CLIENT_ID=tu_id_cliente_google
GOOGLE_CLIENT_SECRET=tu_secreto_cliente_google
```

## 📝 Comandos disponibles

- `npm run dev`: Inicia la aplicación en modo desarrollo
- `npm run build`: Compila la aplicación para producción
- `npm start`: Inicia la aplicación en modo producción
- `npm run db:push`: Actualiza la estructura de la base de datos según el esquema

### Scripts adicionales

- `./setup-production.sh`: Configura el entorno de producción
- `./migrate-export.sh`: Exporta datos del entorno de desarrollo
- `./migrate-import.sh`: Importa datos al entorno de producción

Para más detalles sobre la migración de datos, consulta [MIGRATION.md](MIGRATION.md).

## 💾 Base de datos

El proyecto utiliza PostgreSQL con Drizzle ORM. Los modelos y relaciones están definidos en `shared/schema.ts`. Para realizar migraciones, utiliza el comando `npm run db:push`.

## 📱 Capturas de pantalla

- Página de inicio con contenido destacado
- Vídeos en tendencia categorizados por IA
- Panel de administración para gestión de contenido
- Perfil de usuario con favoritos y suscripciones

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, lee las directrices de contribución antes de enviar un pull request.

## ✉️ Contacto

Para preguntas o sugerencias, contacta con el equipo de desarrollo:

- **Teléfono**: +34 667976076
- **Twitter**: [@HubMadridistax](https://x.com/HubMadridistax)
- **Facebook**: [HubMadridista](https://www.facebook.com/hubmadridista)
- **Email**: hubmadridista@gmail.com