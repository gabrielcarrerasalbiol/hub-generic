-- Agregar tabla de login_logs para registro de accesos
CREATE TABLE IF NOT EXISTS "login_logs" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER REFERENCES "users" ("id") ON DELETE CASCADE,
  "username" TEXT NOT NULL,
  "ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "success" BOOLEAN DEFAULT true,
  "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "details" TEXT,
  "provider" TEXT DEFAULT 'local' NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Añadir índices para mejorar el rendimiento de las consultas
CREATE INDEX "login_logs_user_id_idx" ON "login_logs" ("user_id");
CREATE INDEX "login_logs_username_idx" ON "login_logs" ("username");
CREATE INDEX "login_logs_timestamp_idx" ON "login_logs" ("timestamp");
CREATE INDEX "login_logs_success_idx" ON "login_logs" ("success");
CREATE INDEX "login_logs_provider_idx" ON "login_logs" ("provider");