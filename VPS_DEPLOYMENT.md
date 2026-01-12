# VPS Deployment Documentation - Hub Madridista

## Server Information

| Property | Value |
|----------|-------|
| **IP Address** | 82.165.196.49 |
| **URL** | http://82.165.196.49 |
| **OS** | Ubuntu 24.04 LTS |
| **SSH User** | root |
| **SSH Port** | 22 |
| **App Port** | 5000 (internal), 80 (external via Apache) |

## Architecture

```
Internet (Port 80)
    ↓
Apache2 (Reverse Proxy)
    ↓
Node.js App (Port 5000)
    ↓
Neon PostgreSQL Database (External)
```

## Database Connection

- **Type**: PostgreSQL (Neon)
- **Connection String**: Set via `DATABASE_URL` environment variable
- **Schema**: public
- **Format**: `postgresql://user:password@host:port/database?sslmode=require&channel_binding=require`

## Server Management Commands

### SSH Access
```bash
ssh root@82.165.196.49
```

### PM2 Commands
```bash
# Check app status
pm2 status

# View logs
pm2 logs hub-generic

# Restart app
pm2 restart hub-generic

# Stop app
pm2 stop hub-generic

# Start app
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save

# Monitor app
pm2 monit
```

### Apache Commands
```bash
# Check Apache status
systemctl status apache2

# Restart Apache
systemctl restart apache2

# View Apache error logs
tail -f /var/log/apache2/hub-generic-error.log

# View Apache access logs
tail -f /var/log/apache2/hub-generic-access.log
```

### System Commands
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check system services
systemctl list-units --type=service

# View PM2 logs
tail -f /root/.pm2/logs/hub-generic-out.log
tail -f /root/.pm2/logs/hub-generic-error.log
```

## File Locations

| File/Directory | Path |
|----------------|------|
| **App Directory** | `/root/hub-generic/` |
| **Built Files** | `/root/hub-generic/dist/` |
| **PM2 Config** | `/root/hub-generic/ecosystem.config.cjs` |
| **Apache Config** | `/etc/apache2/sites-available/hub-generic.conf` |
| **PM2 Logs** | `/root/.pm2/logs/` |
| **Apache Logs** | `/var/log/apache2/` |

## Deployment Process

### 1. Initial Setup
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2
```

### 2. Clone and Build
```bash
cd /root
git clone https://github.com/gabrielcarrerasalbiol/hub-generic.git
cd hub-generic
npm install
npm run build
```

### 3. Database Setup
```bash
# Create tables (migration SQL already generated)
# The tables are in the 'public' schema
```

### 4. Environment Configuration
The environment variables are set in `/root/hub-generic/ecosystem.config.cjs`:
- DATABASE_URL
- FRONTEND_URL
- CALLBACK_URL
- API keys (DeepSeek, YouTube, etc.)
- JWT/Session secrets

### 5. Start Application
```bash
pm2 start ecosystem.config.cjs
pm2 save
```

### 6. Apache Reverse Proxy
```bash
# Install Apache
apt install -y apache2

# Enable proxy modules
a2enmod proxy proxy_http rewrite

# Configure virtual host at /etc/apache2/sites-available/hub-generic.conf
a2ensite hub-generic.conf
systemctl restart apache2
```

## Troubleshooting

### App not starting
```bash
# Check PM2 logs
pm2 logs hub-generic --lines 100

# Check if port 5000 is in use
ss -tlnp | grep 5000

# Restart PM2
pm2 restart hub-generic
```

### Database connection issues
```bash
# Test database connection (requires psql client)
# Use the connection string from your environment or deployment
psql '$DATABASE_URL'
```

### Website not accessible externally
```bash
# Check Apache is running
systemctl status apache2

# Check Apache config
apachectl configtest

# Check if Apache is listening on port 80
ss -tlnp | grep :80

# Test locally
curl http://localhost
```

### API returning HTML instead of JSON
This is expected for some routes. The catch-all route serves index.html for client-side routing.

### Blank screen / JS not loading
1. Check browser console for errors
2. Verify assets are being served: `curl -I http://82.165.196.49/assets/index-*.js`
3. Check API responses: `curl http://82.165.196.49/api/videos`
4. Check site config: `curl http://82.165.196.49/api/site-config/public`

## Important Notes

1. **PM2 Auto-start**: PM2 is configured to start on system boot
2. **Apache**: Runs on port 80 and proxies to Node.js on port 5000
3. **Database**: Uses Neon (external PostgreSQL) - no local database
4. **Redis**: Not used - app uses memorystore for sessions
5. **Environment**: Production mode is enabled
6. **Search Path**: Tables are in the `public` schema

## Security Considerations

1. **Firewall**: UFW is inactive (hosting provider manages firewall)
2. **SSL/HTTPS**: Not configured - currently HTTP only
3. **API Keys**: Stored in ecosystem.config.cjs (consider using secrets manager)
4. **Database**: Connection uses SSL (sslmode=require)

## Future Improvements

1. **Set up SSL** with Let's Encrypt for HTTPS
2. **Add domain name** and configure DNS
3. **Set up monitoring** (PM2 Plus, Uptime monitoring)
4. **Configure backups** for database
5. **Add CI/CD** pipeline for deployments
6. **Rate limiting** is configured but may need tuning
7. **Consider using secrets manager** for API keys

## Quick Reference

### Update the application
```bash
cd /root/hub-generic
git pull
npm install
npm run build
pm2 restart hub-generic
```

### View real-time logs
```bash
pm2 logs hub-generic
```

### Check system resources
```bash
df -h          # Disk space
free -h        # Memory
top            # CPU
```

---

**Last Updated**: 2025-01-12
**Deployed By**: Claude Code
