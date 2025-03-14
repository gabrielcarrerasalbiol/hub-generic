# 🚀 Guía de Despliegue para Hub Madridista

Este documento detalla los pasos necesarios para desplegar la aplicación Hub Madridista en un entorno de producción.

## Tabla de contenidos

1. [Requisitos previos](#requisitos-previos)
2. [Preparación del entorno](#preparación-del-entorno)
3. [Configuración de la base de datos](#configuración-de-la-base-de-datos)
4. [Instalación y configuración](#instalación-y-configuración)
5. [Compilación y despliegue](#compilación-y-despliegue)
6. [Configuración del servidor web](#configuración-del-servidor-web)
7. [Configuración de HTTPS](#configuración-de-https)
8. [Monitorización y mantenimiento](#monitorización-y-mantenimiento)
9. [Solución de problemas comunes](#solución-de-problemas-comunes)

## Requisitos previos

Para desplegar Hub Madridista, necesitarás:

- Un servidor con al menos:
  - 2 GB de RAM
  - 1 CPU o vCPU
  - 20 GB de almacenamiento
- Sistema operativo recomendado: Ubuntu 20.04 LTS o superior
- Node.js 20.x o superior
- PostgreSQL 14 o superior
- Nginx (o alternativa como Apache)
- Certificado SSL (Let's Encrypt recomendado)
- Dominio configurado para apuntar al servidor

## Preparación del entorno

### 1. Actualizar el sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Instalar dependencias

```bash
# Instalar Node.js y npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node -v
npm -v

# Instalar herramientas adicionales
sudo apt-get install -y git nginx certbot python3-certbot-nginx
```

### 3. Instalar PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib

# Iniciar y habilitar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Configuración de la base de datos

### 1. Crear usuario y base de datos

```bash
# Acceder a PostgreSQL como usuario postgres
sudo -u postgres psql

# Dentro de PostgreSQL, crear usuario y base de datos
CREATE USER hubmadridista WITH PASSWORD 'tu_contraseña_segura';
CREATE DATABASE hubmadridista_db OWNER hubmadridista;
GRANT ALL PRIVILEGES ON DATABASE hubmadridista_db TO hubmadridista;

# Salir de PostgreSQL
\q
```

### 2. Configurar acceso remoto (opcional, sólo si la base de datos está en otro servidor)

Edita el archivo `postgresql.conf`:

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Modifica:
```
listen_addresses = '*'
```

Edita el archivo `pg_hba.conf`:

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Añade:
```
host    hubmadridista_db     hubmadridista     0.0.0.0/0               md5
```

Reinicia PostgreSQL:

```bash
sudo systemctl restart postgresql
```

## Instalación y configuración

### 1. Clonar el repositorio

```bash
# Crear directorio para la aplicación
sudo mkdir -p /var/www/hubmadridista
sudo chown $USER:$USER /var/www/hubmadridista

# Clonar el repositorio
git clone https://github.com/tu-usuario/hubmadridista.git /var/www/hubmadridista
cd /var/www/hubmadridista
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
nano .env
```

Añade el siguiente contenido (ajusta los valores según tu configuración):

```env
# Base de datos
DATABASE_URL=postgresql://hubmadridista:tu_contraseña_segura@localhost:5432/hubmadridista_db

# Servidor
PORT=5000
NODE_ENV=production

# Autenticación
JWT_SECRET=genera_un_token_seguro_aleatorio
SESSION_SECRET=genera_otro_token_seguro_aleatorio

# APIs (opcionales pero recomendadas)
OPENAI_API_KEY=tu_clave_api_openai
ANTHROPIC_API_KEY=tu_clave_api_anthropic
GOOGLE_AI_API_KEY=tu_clave_api_gemini

# OAuth (opcional)
GOOGLE_CLIENT_ID=tu_id_cliente_google
GOOGLE_CLIENT_SECRET=tu_secreto_cliente_google

# URL de la aplicación
APP_URL=https://tu-dominio.com
```

Para generar tokens seguros, puedes usar:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Compilación y despliegue

### 1. Compilar la aplicación

```bash
# Compilar el frontend y backend
npm run build
```

### 2. Configurar PM2 para gestionar el proceso

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar la aplicación con PM2
pm2 start npm --name "hubmadridista" -- start

# Configurar inicio automático
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
pm2 save
```

## Configuración del servidor web

### 1. Configurar Nginx como proxy inverso

Crea un archivo de configuración para Nginx:

```bash
sudo nano /etc/nginx/sites-available/hubmadridista
```

Añade el siguiente contenido (ajusta la ruta y dominio según tu configuración):

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Configuración para archivos estáticos (opcional, si deseas servir algunos archivos directamente)
    location /assets/ {
        alias /var/www/hubmadridista/dist/assets/;
        expires 30d;
    }

    # Aumentar el tamaño máximo de carga (si es necesario)
    client_max_body_size 10M;
}
```

Habilita la configuración y verifica la sintaxis:

```bash
sudo ln -s /etc/nginx/sites-available/hubmadridista /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Configuración de HTTPS

### 1. Obtener certificado SSL con Let's Encrypt

```bash
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### 2. Configurar renovación automática

La renovación automática debería estar configurada por defecto, pero puedes verificarla:

```bash
sudo certbot renew --dry-run
```

## Monitorización y mantenimiento

### 1. Monitorizar la aplicación con PM2

```bash
# Ver estado y logs
pm2 status
pm2 logs hubmadridista

# Monitorización en tiempo real
pm2 monit
```

### 2. Configurar respaldos de la base de datos

Crea un script para realizar respaldos diarios:

```bash
sudo nano /usr/local/bin/backup-hubmadridista-db.sh
```

Contenido:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="/var/backups/hubmadridista"
BACKUP_FILE="$BACKUP_DIR/hubmadridista_db_$TIMESTAMP.sql"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Realizar respaldo
sudo -u postgres pg_dump hubmadridista_db > $BACKUP_FILE

# Comprimir
gzip $BACKUP_FILE

# Eliminar respaldos antiguos (mantener los últimos 7 días)
find $BACKUP_DIR -name "hubmadridista_db_*.sql.gz" -type f -mtime +7 -delete
```

Hacer ejecutable y programar:

```bash
sudo chmod +x /usr/local/bin/backup-hubmadridista-db.sh

# Añadir a crontab para ejecución diaria
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-hubmadridista-db.sh") | crontab -
```

### 3. Actualizar la aplicación

Para actualizar a una nueva versión:

```bash
cd /var/www/hubmadridista
git pull
npm install
npm run build
pm2 restart hubmadridista
```

## Solución de problemas comunes

### La aplicación no arranca

Verifica los logs de PM2:

```bash
pm2 logs hubmadridista
```

Comprueba la conexión a la base de datos:

```bash
psql -U hubmadridista -h localhost -d hubmadridista_db
```

### Problemas con la base de datos

Si hay problemas con migraciones o esquemas:

```bash
# Verifica que la base de datos existe
sudo -u postgres psql -c "\l"

# Ejecuta manualmente la migración
cd /var/www/hubmadridista
npm run db:push
```

### Problemas con Nginx

Revisa los logs de Nginx:

```bash
sudo tail -f /var/log/nginx/error.log
```

### Problemas de permisos

Asegúrate de que los permisos sean correctos:

```bash
sudo chown -R $USER:$USER /var/www/hubmadridista
```

### Problemas con el certificado SSL

Renueva manualmente el certificado:

```bash
sudo certbot renew
```

---

## Consideraciones de seguridad adicionales

1. **Firewall**: Configura un firewall para restringir el acceso:

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

2. **Fail2Ban**: Instala y configura Fail2Ban para proteger contra ataques de fuerza bruta:

```bash
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

3. **Actualizaciones automáticas**: Configura actualizaciones automáticas de seguridad:

```bash
sudo apt-get install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

Esta guía proporciona los pasos básicos para desplegar Hub Madridista en un entorno de producción. Dependiendo de tus necesidades específicas y de la infraestructura, es posible que debas realizar ajustes adicionales.