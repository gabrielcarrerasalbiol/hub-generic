# 🤝 Contribuir a Hub Madridista

¡Gracias por tu interés en contribuir a Hub Madridista! Este documento proporciona directrices para colaborar en el proyecto de manera efectiva.

## 📋 Índice

- [Código de conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Proceso de desarrollo](#proceso-de-desarrollo)
- [Estilo de código](#estilo-de-código)
- [Commits y mensajes](#commits-y-mensajes)
- [Pull requests](#pull-requests)
- [Reportar errores](#reportar-errores)
- [Solicitar funcionalidades](#solicitar-funcionalidades)
- [Preguntas frecuentes](#preguntas-frecuentes)

## 📜 Código de conducta

Este proyecto se adhiere a un Código de Conducta que esperamos que todos los participantes respeten. Por favor, lee el archivo [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) para entender qué comportamientos serán y no serán tolerados.

## 🙋‍♂️ ¿Cómo puedo contribuir?

Hay muchas formas de contribuir al proyecto Hub Madridista:

### 1. Reportar errores

- Utiliza el sistema de issues de GitHub
- Verifica primero si el error ya ha sido reportado
- Utiliza la plantilla proporcionada para reportes de errores
- Incluye pasos detallados para reproducir el problema
- Adjunta capturas de pantalla si es posible

### 2. Sugerir mejoras o nuevas funcionalidades

- Utiliza el sistema de issues de GitHub
- Verifica primero si la sugerencia ya existe
- Utiliza la plantilla para solicitudes de funcionalidades
- Describe claramente el problema que resuelve la funcionalidad
- Proporciona ejemplos de cómo debería funcionar

### 3. Contribuir con código

- Busca issues etiquetados con "good first issue" para comenzar
- Comenta en el issue que vas a trabajar en él
- Sigue el proceso de desarrollo descrito abajo
- Asegúrate de que tu código cumple con el estilo y pasa las pruebas
- Envía un pull request con tus cambios

### 4. Mejorar la documentación

- Corregir errores tipográficos o gramaticales
- Aclarar secciones confusas
- Agregar ejemplos o tutoriales
- Traducir la documentación a otros idiomas

### 5. Revisar pull requests

- Revisar cambios propuestos por otros
- Probar funcionalidades nuevas o corregidas
- Proporcionar feedback constructivo

## 🔄 Proceso de desarrollo

### Configuración de entorno

1. Haz un fork del repositorio
2. Clona tu fork: `git clone https://github.com/TU_USUARIO/hubmadridista.git`
3. Instala las dependencias: `npm install`
4. Configura la base de datos según [DEVELOPMENT.md](DEVELOPMENT.md)
5. Crea una rama para tu trabajo: `git checkout -b feature/tu-funcionalidad`

### Flujo de trabajo

1. **Ramas**:
   - `main`: Código estable de producción
   - `develop`: Rama de desarrollo integrado
   - `feature/*`: Para nuevas funcionalidades
   - `fix/*`: Para corrección de errores
   - `docs/*`: Para cambios en documentación

2. **Ciclo de desarrollo**:
   - Actualiza tu fork regularmente: `git fetch upstream`
   - Crea una rama basada en `develop`
   - Haz tus cambios en commits lógicos
   - Ejecuta `npm run lint` y `npm run test` antes de enviar
   - Envía un PR a la rama `develop` del repositorio principal

3. **Después del PR**:
   - Responde a los comentarios de revisión
   - Haz los cambios solicitados
   - Rebasa tu rama si es necesario

## 🎨 Estilo de código

### TypeScript/JavaScript

- Utilizamos ESLint con la configuración del proyecto
- Dos espacios para indentación
- Punto y coma al final de cada sentencia
- Sin trailing commas
- Comillas simples para strings
- Nombres descriptivos en camelCase para variables y funciones
- Nombres en PascalCase para clases y componentes

### React

- Preferir componentes funcionales con hooks
- Un componente por archivo
- Nombrar archivos de componentes con PascalCase
- Destructurar props al inicio de la función
- Prop-types o TypeScript para tipos de props
- Evitar componentes con demasiadas responsabilidades

### CSS/Tailwind

- Seguir la convención de clases de Tailwind
- Evitar estilos inline a menos que sea necesario
- Mantener coherencia en espaciados y tamaños
- Diseño mobile-first
- Variables CSS para colores y tamaños principales

## 💬 Commits y mensajes

Usamos convenciones de commit semánticas para mensajes claros y útiles:

- `feat:` Nueva funcionalidad
- `fix:` Corrección de un error
- `docs:` Cambios en documentación
- `style:` Cambios de formato (sin cambios en código)
- `refactor:` Refactorización de código
- `test:` Añadir o modificar pruebas
- `chore:` Cambios en el proceso de build, configuración, etc.

Ejemplo:
```
feat: añadir sistema de filtrado por jugadores en videos

- Implementar selector de jugadores
- Añadir endpoint de backend para filtrado
- Actualizar documentación
```

## 🔀 Pull requests

Al crear un pull request:

1. **Título**: Usa un título descriptivo que resuma el cambio
2. **Descripción**: Incluye:
   - Qué cambios has hecho
   - Por qué los has hecho
   - Cómo probar los cambios
   - Referencias a issues relacionados
3. **Tamaño**: Mantén los PRs pequeños y enfocados en un solo cambio
4. **Checks**: Asegúrate de que pasan todas las verificaciones
5. **Reviewers**: Solicita revisión de los mantenedores
6. **Screenshots**: Incluye capturas de pantalla para cambios visuales

Ejemplo de una buena descripción de PR:
```
## Descripción
Añade funcionalidad de filtrado por jugadores en la página de videos.

## Motivación
Issue #123: Los usuarios necesitan poder encontrar videos de jugadores específicos.

## Cambios
- Añade componente `PlayerFilter` con autocompletado
- Implementa endpoint `GET /api/videos/player/:id`
- Actualiza la interfaz de usuario para incluir el filtro
- Añade tests para el nuevo endpoint

## Cómo probar
1. Ir a la página de videos
2. Seleccionar un jugador del filtro
3. Verificar que solo se muestran videos relacionados con ese jugador

## Screenshots
![Filtro de jugadores](url-a-la-imagen)
```

## 🐛 Reportar errores

Al reportar un error, incluye:

1. **Título descriptivo**: Resumen claro del problema
2. **Pasos para reproducir**: Secuencia detallada de acciones
3. **Comportamiento esperado**: Lo que debería suceder
4. **Comportamiento actual**: Lo que sucede en realidad
5. **Contexto**: Navegador, sistema operativo, etc.
6. **Información adicional**: Logs, capturas de pantalla, etc.

## 🚀 Solicitar funcionalidades

Al solicitar una nueva funcionalidad, incluye:

1. **Descripción clara**: Qué quieres que se implemente
2. **Caso de uso**: Problema que resuelve esta funcionalidad
3. **Sugerencia de implementación** (opcional): Cómo podría implementarse
4. **Ejemplos**: En otras plataformas o mockups, si los tienes

## ❓ Preguntas frecuentes

### ¿Cómo empiezo a contribuir si nunca he colaborado en un proyecto de código abierto?

Busca issues etiquetados con "good first issue" o "beginner friendly". Estos están diseñados para ser más accesibles para nuevos contribuyentes.

### ¿Qué hago si mi pull request tiene conflictos?

Rebasa tu rama con la última versión de `develop`:
```bash
git checkout develop
git pull upstream develop
git checkout tu-rama
git rebase develop
# Resuelve conflictos si los hay
git push -f origin tu-rama
```

### ¿Puedo contribuir si no sé programar?

¡Absolutamente! Puedes contribuir con mejoras a la documentación, reportes detallados de errores, traducción a otros idiomas, o diseño gráfico.

### ¿Cómo puedo configurar la base de datos para desarrollo?

Consulta la guía detallada en [DEVELOPMENT.md](DEVELOPMENT.md) para obtener instrucciones sobre cómo configurar la base de datos PostgreSQL para desarrollo.

---

¡Gracias por contribuir a Hub Madridista! Tu ayuda es fundamental para crear una mejor experiencia para los aficionados del Real Madrid.