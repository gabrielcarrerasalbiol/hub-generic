import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import * as schema from './shared/schema.ts';

async function main() {
  console.log('Iniciando configuración del usuario administrador...');
  
  try {
    // Conectar a la base de datos usando la variable de entorno DATABASE_URL
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('Variable de entorno DATABASE_URL no encontrada');
    }
    
    console.log('Conectando a la base de datos...');
    const queryClient = postgres(connectionString);
    const db = drizzle(queryClient, { schema });
    
    const adminUsername = 'admin';
    const adminPassword = 'Oldbury2022@';
    const adminEmail = 'contacto@hubmadridista.com';
    const adminName = 'Administrador';
    
    // Revisar si ya existe un usuario con nombre de usuario 'admin'
    const existingAdminUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, adminUsername)
    });
    
    // Revisar si ya existe un usuario con el email de administrador
    const existingUserWithEmail = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, adminEmail)
    });
    
    // Generar hash de la contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    if (existingAdminUser) {
      console.log(`Usuario ${adminUsername} ya existe, actualizando contraseña...`);
      
      // Actualizar la contraseña del usuario existente
      await db.update(schema.users)
        .set({ 
          password: hashedPassword,
          role: 'admin' 
        })
        .where(users => schema.users.username === adminUsername);
      
      console.log(`Contraseña actualizada para el usuario ${adminUsername}`);
    } else if (existingUserWithEmail) {
      console.log(`Ya existe un usuario con el email ${adminEmail}, actualizando credenciales...`);
      
      // Actualizar el usuario existente con el email para que tenga las credenciales de admin
      await db.update(schema.users)
        .set({ 
          username: adminUsername,
          password: hashedPassword,
          name: adminName,
          role: 'admin' 
        })
        .where(users => schema.users.email === adminEmail);
      
      console.log(`Usuario actualizado a ${adminUsername} con rol de administrador`);
    } else {
      console.log(`Creando nuevo usuario administrador ${adminUsername}...`);
      
      // Crear nuevo usuario administrador
      await db.insert(schema.users).values({
        username: adminUsername,
        password: hashedPassword,
        email: adminEmail,
        name: adminName,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`Usuario administrador ${adminUsername} creado exitosamente`);
    }
    
    // Verificar que el usuario existe con rol de administrador
    const checkAdmin = await db.query.users.findFirst({
      where: (users, { eq, and }) => and(
        eq(users.username, adminUsername),
        eq(users.role, 'admin')
      )
    });
    
    if (checkAdmin) {
      console.log(`Verificación: Usuario ${adminUsername} existe con rol de administrador`);
    } else {
      console.log(`Error: No se pudo verificar el usuario ${adminUsername} con rol de administrador`);
    }
    
    console.log('Configuración del usuario administrador completada con éxito');
    queryClient.end();
    process.exit(0);
  } catch (error) {
    console.error('Error al configurar el usuario administrador:', error);
    process.exit(1);
  }
}

main();