#!/bin/bash

# Configurar la base de datos de producción
echo "Iniciando configuración de la base de datos de PRODUCCIÓN..."

# Cargar variables de entorno de producción
export $(grep -v '^#' .env.production | xargs)
export NODE_ENV=production

# Usar el DATABASE_URL directamente en lugar de extraer los componentes
# ya que Neon DB usa formatos especiales de conexión

echo "Usando URL de conexión a la base de datos (detalles ocultos por seguridad)"

# Crear esquema de producción
psql $DATABASE_URL << EOF
-- Crear esquema si no existe
CREATE SCHEMA IF NOT EXISTS production;

-- Crear tablas
-- Tabla users
CREATE TABLE IF NOT EXISTS production.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'free',
  google_id VARCHAR(255) UNIQUE,
  apple_id VARCHAR(255) UNIQUE,
  verified BOOLEAN DEFAULT false,
  profilePicture VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla sessions
CREATE TABLE IF NOT EXISTS production.sessions (
  sid VARCHAR(255) NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

-- Tabla oauth_tokens
CREATE TABLE IF NOT EXISTS production.oauth_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla categories
CREATE TABLE IF NOT EXISTS production.categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(20),
  description TEXT
);

-- Tabla channels
CREATE TABLE IF NOT EXISTS production.channels (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnailUrl VARCHAR(500),
  bannerUrl VARCHAR(500),
  externalId VARCHAR(100) NOT NULL UNIQUE,
  platform VARCHAR(50) NOT NULL,
  subscriberCount INTEGER DEFAULT 0,
  videoCount INTEGER DEFAULT 0,
  url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla videos
CREATE TABLE IF NOT EXISTS production.videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  summary TEXT,
  language VARCHAR(10),
  thumbnailUrl VARCHAR(500),
  videoUrl VARCHAR(500) NOT NULL,
  embedUrl VARCHAR(500) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  channelId VARCHAR(100) NOT NULL,
  channelTitle VARCHAR(255) NOT NULL,
  externalId VARCHAR(100) NOT NULL UNIQUE,
  publishedAt TIMESTAMP,
  duration INTEGER,
  viewCount INTEGER DEFAULT 0,
  likeCount INTEGER DEFAULT 0,
  commentCount INTEGER DEFAULT 0,
  categoryId INTEGER REFERENCES production.categories(id),
  relevance REAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  featuredOrder INTEGER
);

-- Tabla channel_subscriptions
CREATE TABLE IF NOT EXISTS production.channel_subscriptions (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
  channelId INTEGER NOT NULL REFERENCES production.channels(id) ON DELETE CASCADE,
  notificationsEnabled BOOLEAN DEFAULT true,
  subscribedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (userId, channelId)
);

-- Tabla favorites
CREATE TABLE IF NOT EXISTS production.favorites (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
  videoId INTEGER NOT NULL REFERENCES production.videos(id) ON DELETE CASCADE,
  addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (userId, videoId)
);

-- Tabla notifications
CREATE TABLE IF NOT EXISTS production.notifications (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
  channelId INTEGER REFERENCES production.channels(id) ON DELETE SET NULL,
  videoId INTEGER REFERENCES production.videos(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla view_history
CREATE TABLE IF NOT EXISTS production.view_history (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
  videoId INTEGER NOT NULL REFERENCES production.videos(id) ON DELETE CASCADE,
  watchedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  watchDuration INTEGER DEFAULT 0,
  completionPercentage REAL DEFAULT 0
);

-- Tabla premium_channels
CREATE TABLE IF NOT EXISTS production.premium_channels (
  id SERIAL PRIMARY KEY,
  channelId INTEGER NOT NULL REFERENCES production.channels(id) ON DELETE CASCADE,
  premiumSince TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastSyncedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  syncFrequency INTEGER DEFAULT 24,
  isActive BOOLEAN DEFAULT TRUE
);

-- Tabla comments
CREATE TABLE IF NOT EXISTS production.comments (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES production.users(id) ON DELETE CASCADE,
  videoId INTEGER NOT NULL REFERENCES production.videos(id) ON DELETE CASCADE,
  parentId INTEGER REFERENCES production.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isEdited BOOLEAN DEFAULT FALSE
);

-- Insertar categorías predeterminadas
INSERT INTO production.categories (id, name, type, icon, color, description) VALUES
  (1, 'Partidos', 'matches', 'futbol', '#1E3A8A', 'Partidos completos, resúmenes y mejores momentos.'),
  (2, 'Entrenamientos', 'training', 'dribbble', '#047857', 'Sesiones de entrenamiento y preparación física.'),
  (3, 'Entrevistas', 'interviews', 'mic', '#7E22CE', 'Entrevistas con jugadores, entrenadores y personal del club.'),
  (4, 'Análisis', 'analysis', 'chart-line', '#B91C1C', 'Análisis tácticos y estadísticos de partidos y jugadores.'),
  (5, 'Noticias', 'news', 'newspaper', '#0284C7', 'Últimas noticias y actualizaciones del club.'),
  (6, 'Historia', 'history', 'book', '#C2410C', 'Documentales y contenido histórico sobre el Real Madrid.'),
  (7, 'Fichajes', 'transfers', 'exchange-alt', '#6D28D9', 'Rumores, especulaciones y confirmaciones de fichajes.'),
  (8, 'Cantera', 'academy', 'graduation-cap', '#065F46', 'Videos sobre las categorías inferiores y canteranos.'),
  (9, 'Afición', 'fans', 'users', '#CA8A04', 'Contenido relacionado con la afición madridista.'),
  (10, 'Highlights', 'highlights', 'star', '#EA580C', 'Mejores momentos de jugadores y partidos.')
ON CONFLICT (id) DO NOTHING;

-- Crear usuario administrador
INSERT INTO production.users (username, email, password, name, role, verified, profilePicture, created_at, updated_at)
VALUES ('admin', 'contacto@hubmadridista.com', '\$2a\$10\$Ea7TKZQhgaMVDnQnfsMcE.0ZHvbsNZRG76e/PDrTm1F2cUQpQ7gJa', 'Administrador', 'admin', true, '/hubmadridista.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;

SELECT 'Configuración de la base de datos de producción completada' as mensaje;
EOF

echo "Credenciales del administrador:"
echo "  Usuario: admin"
echo "  Email: contacto@hubmadridista.com"
echo "  Contraseña: Oldbury2022@"

echo "Configuración de la base de datos de producción completada."