# Deployment Guides

Budget Tracker can be deployed to multiple platforms. This guide covers setup for common options.

## Table of Contents

1. [Local Development](#local-development)
2. [Home Server (CasaOS/Docker)](#home-server-casaosdocker)
3. [Render](#render)
4. [Railway](#railway)
5. [Coolify](#coolify)
6. [Self-Hosted VPS](#self-hosted-vps)
7. [Cloudflare Tunnel (Demo Endpoint)](#cloudflare-tunnel-demo-endpoint)

## Local Development

See [README.md Quick Start](./README.md#quick-start-local) for local development setup.

## Home Server (CasaOS/Docker)

### Prerequisites

- Home server with Docker installed (CasaOS includes Docker)
- PostgreSQL 16 or Docker
- Home network access

### Setup

1. **Clone the repository:**
   ```bash
   cd /home/your-user
   git clone https://github.com/YOUR-USERNAME/budget-tracker-fullstack.git
   cd budget-tracker-fullstack
   ```

2. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

3. **Verify `.env.docker` exists:**
   ```bash
   ls -la .env.docker
   ```

4. **Deploy with Docker Compose:**
   ```bash
   docker compose down    # Stop any running containers
   docker compose up -d --build
   ```

5. **Verify running:**
   ```bash
   docker compose ps
   ```

6. **Access the app:**
   - Open browser to `http://<your-server-ip>:3000`
   - Replace `<your-server-ip>` with your home server's IP address (e.g., `192.168.0.231`)

7. **View logs:**
   ```bash
   docker compose logs -f api
   ```

### Via CasaOS UI

If using CasaOS directly (instead of command line):

1. Go to CasaOS dashboard
2. Apps → Add Custom App
3. Paste `docker-compose.yml` contents
4. Click Deploy
5. Wait for startup, then access at http://your-server-ip:3000

### Data Persistence

PostgreSQL data is stored in a Docker volume. To backup:

```bash
docker exec budget-tracker-fullstack-postgres-1 pg_dump -U budget budget_tracker > backup.sql
```

To restore:

```bash
docker exec -i budget-tracker-fullstack-postgres-1 psql -U budget budget_tracker < backup.sql
```

## Render

Render is a cloud platform with free tier availability. Not suitable for production without additional setup, but great for learning.

### Prerequisites

- Render account (render.com)
- GitHub account with repository pushed
- 5-10 minutes

### Steps

1. **Push code to GitHub:**
   ```bash
   git push origin main
   ```

2. **Create Web Service on Render:**
   - Go to dashboard.render.com
   - New → Web Service
   - Connect GitHub repository
   - Select main branch
   - Runtime: Node
   - Build command: `npm install --workspaces --include-workspace-root && npm run build --workspaces`
   - Start command: `cd packages/api && node dist/index.js`
   - Instances: Free
   - Create

3. **Add PostgreSQL:**
   - New → PostgreSQL
   - Name: `budget-tracker-db`
   - Database: `budget_tracker`
   - User: `budget`
   - Create

4. **Add Environment Variables:**
   In Web Service settings, Environment tab:
   ```
   NODE_ENV=production
   VITE_API_URL=/
   DATABASE_URL=<copy from PostgreSQL service>
   CORS_ORIGIN=https://your-render-app.onrender.com
   ```

5. **Deploy:**
   - Click Deploy
   - Wait for build and startup
   - Service URL is your app: `https://your-app-name.onrender.com`

### Notes

- Free tier spins down after 15 minutes of inactivity (slow startup)
- PostgreSQL free tier is limited (100MB)
- No credit card needed for free tier

## Railway

Railway is developer-friendly with pay-as-you-go pricing. Good for small personal projects.

### Prerequisites

- Railway account (railway.app)
- GitHub connected
- 10-15 minutes

### Steps

1. **Push code to GitHub:**
   ```bash
   git push origin main
   ```

2. **Create Project on Railway:**
   - Go to railway.app dashboard
   - New Project
   - Deploy from GitHub repo
   - Select your budget-tracker-fullstack repo
   - Approve

3. **Add PostgreSQL:**
   - In project, Add Service
   - PostgreSQL
   - Railway creates database automatically

4. **Configure Web Service:**
   - Select Node.js service
   - Variables:
     ```
     NODE_ENV=production
     VITE_API_URL=/
     CORS_ORIGIN=https://your-app-domain.up.railway.app
     ```
   - Connect DATABASE_URL from PostgreSQL plugin
   - Build: `npm install --workspaces && npm run build --workspaces`
   - Start: `cd packages/api && node dist/index.js`

5. **Generate domain:**
   - In Web Service, Settings
   - Generate domain (e.g., budget-tracker.up.railway.app)
   - Access your app at that domain

### Pricing

- PostgreSQL: Free for limited use, then pay-as-you-go
- Web Service: Pay-as-you-go (typically $5-10/month for small apps)
- Includes 500 free railway credits

## Coolify

Coolify is a self-hosted PaaS. Perfect if you want cloud-like management on your own infrastructure.

### Prerequisites

- Coolify running on your home server or VPS
- GitHub repository pushed
- Docker on your server

### Steps

1. **Access Coolify dashboard:**
   - http://your-coolify-server:3000

2. **Create New Project:**
   - Projects → New Project
   - Name: Budget Tracker

3. **Add Application:**
   - GitHub repository
   - Select budget-tracker-fullstack
   - Main branch

4. **Configure:**
   - Build Pack: Node.js
   - Port: 3000
   - Build command: `npm install --workspaces && npm run build --workspaces`
   - Start command: `cd packages/api && node dist/index.js`

5. **Add Database:**
   - Services → PostgreSQL
   - Connect to application

6. **Environment Variables:**
   ```
   NODE_ENV=production
   VITE_API_URL=/
   CORS_ORIGIN=http://your-server:3000
   DATABASE_URL=<from PostgreSQL service>
   ```

7. **Deploy:**
   - Coolify handles build and deployment
   - Access at configured domain/port

## Self-Hosted VPS

For more control, deploy on any VPS (Linode, DigitalOcean, Hetzner, etc.).

### Prerequisites

- VPS with Ubuntu/Debian
- SSH access
- Domain name (optional but recommended)

### Steps

1. **SSH into server:**
   ```bash
   ssh root@your-server-ip
   ```

2. **Install Docker and Docker Compose:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo apt-get install docker-compose
   ```

3. **Create app directory:**
   ```bash
   mkdir -p /opt/budget-tracker
   cd /opt/budget-tracker
   ```

4. **Clone repository:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/budget-tracker-fullstack.git .
   ```

5. **Create `.env.docker`:**
   ```bash
   cp .env.docker.example .env.docker
   # Edit .env.docker with your settings
   nano .env.docker
   ```

6. **Start with Docker Compose:**
   ```bash
   sudo docker compose up -d --build
   ```

7. **Setup Nginx (reverse proxy):**
   ```bash
   sudo apt-get install nginx
   ```

   Create `/etc/nginx/sites-available/budget-tracker`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/budget-tracker /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup HTTPS (Let's Encrypt):**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

9. **Access your app:**
   - https://your-domain.com

## Cloudflare Tunnel (Demo Endpoint)

Expose your home server to the internet safely without port forwarding.

### Prerequisites

- Cloudflare account (free)
- Cloudflare Tunnel installed on home server
- Home server running Budget Tracker

### Steps

1. **Install Cloudflare Tunnel on home server:**
   ```bash
   wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared-linux-amd64.deb
   ```

2. **Authenticate Cloudflare:**
   ```bash
   cloudflared tunnel login
   # Opens browser to authorize
   ```

3. **Create tunnel:**
   ```bash
   cloudflared tunnel create budget-tracker
   ```

4. **Create config file** at `~/.cloudflared/config.yml`:
   ```yaml
   tunnel: budget-tracker
   credentials-file: /home/your-user/.cloudflared/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.json

   ingress:
     - hostname: budget-demo.yourdomain.com
       service: http://localhost:3000
     - service: http_status:404
   ```

5. **Start tunnel:**
   ```bash
   cloudflared tunnel run budget-tracker
   ```

6. **Create DNS record** (Cloudflare dashboard):
   - DNS → Add record
   - Type: CNAME
   - Name: budget-demo
   - Target: budget-tracker.cfargotunnel.com
   - Proxy status: Proxied

7. **Access your app:**
   - https://budget-demo.yourdomain.com (via Cloudflare Tunnel)

### Keep Tunnel Running

For persistent tunnel, use systemd:

```bash
sudo cloudflared install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

## Troubleshooting Common Issues

### App won't start
- Check logs: `docker compose logs api`
- Verify DATABASE_URL format
- Ensure PostgreSQL is running

### API calls fail
- Check VITE_API_URL is set correctly
- Verify CORS_ORIGIN matches your domain
- Check browser console for errors

### Database connection fails
- Verify DATABASE_URL environment variable
- Check PostgreSQL is running: `docker compose ps`
- Verify password in `.env.docker`

### Port already in use
- Change port in docker-compose.yml (e.g., 3001:3000)
- Or kill existing process: `lsof -ti:3000 | xargs kill -9`

## Monitoring & Maintenance

After deployment:

1. **Check logs regularly:**
   ```bash
   docker compose logs -f api
   ```

2. **Update dependencies:**
   ```bash
   npm update
   git commit && git push
   ```

3. **Backup database:**
   - Home server: manual dump recommended weekly
   - Cloud: platform handles backups (verify!)

4. **Monitor server health:**
   - CPU/memory usage
   - Disk space
   - Container restarts

## Security Notes

- Always use HTTPS in production
- Use strong DATABASE_URL passwords
- Never commit secrets to GitHub
- Keep Docker and packages updated
- Restrict network access (firewall rules)

For more security details, see [SECURITY.md](./SECURITY.md).

---

**Questions?** Open a GitHub Discussion or issue.
