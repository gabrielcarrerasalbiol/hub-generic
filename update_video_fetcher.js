const fs = require('fs');
const path = require('path');

// Lee el archivo
const filePath = path.join(process.cwd(), 'server', 'api', 'videoFetcher.ts');
const fileContent = fs.readFileSync(filePath, 'utf8');

// Reemplaza la primera ocurrencia
const firstOccurrencePattern = `        // Crear el video en la base de datos con las categorías asignadas
        const newVideo: InsertVideo = {
          ...videoData,
          categoryIds: categories.map(id => id.toString()),
          featured: false
        };`;

const firstReplacement = `        // Generar un resumen del video con Gemini
        let summary = "";
        try {
          console.log("Generando resumen para el video:", videoData.title);
          summary = await generateVideoSummary(videoData.title, videoData.description || "");
          console.log("Resumen generado:", summary);
        } catch (summaryError) {
          console.error("Error generando resumen con Gemini:", summaryError);
          summary = \`Contenido sobre Real Madrid: \${videoData.title}\`;
        }

        // Crear el video en la base de datos con las categorías asignadas y el resumen
        const newVideo: InsertVideo = {
          ...videoData,
          categoryIds: categories.map(id => id.toString()),
          summary,
          featured: false
        };`;

// Encuentra la primera y segunda ocurrencia
const parts = fileContent.split(firstOccurrencePattern);
if (parts.length < 2) {
  console.error('No se encontró el patrón a reemplazar');
  process.exit(1);
}

// Reemplaza solo la primera ocurrencia
const modifiedContent = parts[0] + firstReplacement + parts.slice(1).join(firstOccurrencePattern);

// Busca la segunda ocurrencia ahora en el contenido modificado
const secondOccurrencePattern = `        // Crear el video en la base de datos con las categorías asignadas
        const newVideo: InsertVideo = {
          ...videoData,
          categoryIds: categories.map(id => id.toString()),
          featured: false
        };`;

const secondReplacement = `        // Generar un resumen del video con Gemini
        let videoSummary = "";
        try {
          console.log("Generando resumen para el video:", videoData.title);
          videoSummary = await generateVideoSummary(videoData.title, videoData.description || "");
          console.log("Resumen generado:", videoSummary);
        } catch (summaryError) {
          console.error("Error generando resumen con Gemini:", summaryError);
          videoSummary = \`Contenido sobre Real Madrid: \${videoData.title}\`;
        }

        // Crear el video en la base de datos con las categorías asignadas y el resumen
        const newVideo: InsertVideo = {
          ...videoData,
          categoryIds: categories.map(id => id.toString()),
          summary: videoSummary,
          featured: false
        };`;

// Divide por la segunda ocurrencia
const secondParts = modifiedContent.split(secondOccurrencePattern);
if (secondParts.length < 2) {
  console.log('No se encontró una segunda ocurrencia, guardando los cambios de la primera ocurrencia');
  fs.writeFileSync(filePath, modifiedContent, 'utf8');
  process.exit(0);
}

// Reemplaza la segunda ocurrencia
const finalContent = secondParts[0] + secondReplacement + secondParts.slice(1).join(secondOccurrencePattern);

fs.writeFileSync(filePath, finalContent, 'utf8');
console.log('Archivo actualizado correctamente');
