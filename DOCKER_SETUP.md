# 🐳 Docker Setup Guide for NoteFlow

Complete guide for running NoteFlow with Docker and Docker Compose.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Setup](#environment-setup)
4. [Docker Compose Configuration](#docker-compose-configuration)
5. [Building and Running](#building-and-running)
6. [Accessing Services](#accessing-services)
7. [Common Commands](#common-commands)
8. [Troubleshooting](#troubleshooting)
9. [Production Deployment](#production-deployment)

---

## Prerequisites

### Required Software
- **Docker Desktop**: [Download here](https://www.docker.com/products/docker-desktop)
  - Windows: Docker Desktop for Windows
  - macOS: Docker Desktop for Mac
  - Linux: Docker Engine + Docker Compose

### External Services
- **Convex Account**: [Sign up at convex.dev](https://convex.dev)
- **Clerk Account**: [Sign up at clerk.com](https://clerk.com)

### Verify Installation
```bash
# Check Docker version
docker --version
# Should show: Docker version 20.10.0 or higher

# Check Docker Compose version
docker-compose --version
# Should show: Docker Compose version 2.0.0 or higher

# Check Docker is running
docker ps
# Should show empty list or running containers
```

---

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/kmugalkhod/noteflow.git
cd noteflow
```

### 2. Set Up Environment Variables
```bash
# Copy example environment file
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Convex (from https://dashboard.convex.dev)
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk (from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs (pre-configured)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/workspace
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/workspace
```

### 3. Start Services
```bash
docker-compose up -d
```

### 4. Access Application
- **App**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

---

## Environment Setup

### Getting Convex Credentials

1. **Sign up/Login to Convex**
   - Go to [dashboard.convex.dev](https://dashboard.convex.dev)
   - Create a new project or select existing one

2. **Create Deployment**
   - Click "Create Deployment"
   - Choose "Development" environment
   - Copy the deployment URL

3. **Get Credentials**
   ```
   CONVEX_DEPLOYMENT=dev:amazing-animal-123
   NEXT_PUBLIC_CONVEX_URL=https://amazing-animal-123.convex.cloud
   ```

### Getting Clerk Credentials

1. **Sign up/Login to Clerk**
   - Go to [dashboard.clerk.com](https://dashboard.clerk.com)
   - Create a new application

2. **Get API Keys**
   - Go to "API Keys" section
   - Copy "Publishable Key" and "Secret Key"
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

3. **Configure Settings**
   - Navigate to "User & Authentication" → "Email, Phone, Username"
   - **Disable email verification** for development:
     - Email → Email verification → Toggle OFF
   - Set custom paths:
     - Paths → Sign-in URL: `/login`
     - Paths → Sign-up URL: `/register`

---

## Docker Compose Configuration

### Services Overview

The `docker-compose.yml` defines two services:

#### 1. **noteflow-app** - Next.js Application
- **Image**: Built from Dockerfile
- **Port**: 3000 (mapped to host:3000)
- **Volumes**: Hot reload enabled with source code mounting
- **Dependencies**: Waits for convex-dev service

#### 2. **convex-dev** - Convex Development Server
- **Image**: node:20-alpine
- **Purpose**: Runs Convex backend locally
- **Volumes**: Shares source code with main app

### Network
- **noteflow-network**: Bridge network connecting services

### Volumes
- **node_modules**: Persistent npm dependencies
- **next_cache**: Next.js build cache

---

## Building and Running

### Development Mode

**Start all services:**
```bash
docker-compose up -d
```

**Start with live logs:**
```bash
docker-compose up
```

**Rebuild and start:**
```bash
docker-compose up -d --build
```

**Start specific service:**
```bash
docker-compose up -d noteflow-app
```

### View Logs

**All services:**
```bash
docker-compose logs -f
```

**Specific service:**
```bash
# Next.js app
docker-compose logs -f noteflow-app

# Convex backend
docker-compose logs -f convex-dev
```

**Last 100 lines:**
```bash
docker-compose logs --tail=100 noteflow-app
```

### Stop Services

**Stop all:**
```bash
docker-compose down
```

**Stop and remove volumes:**
```bash
docker-compose down -v
```

**Stop specific service:**
```bash
docker-compose stop noteflow-app
```

### Restart Services

**Restart all:**
```bash
docker-compose restart
```

**Restart specific:**
```bash
docker-compose restart noteflow-app
```

---

## Accessing Services

### Check Service Status
```bash
docker-compose ps
```

Expected output:
```
NAME                  COMMAND                  SERVICE         STATUS          PORTS
noteflow-app          "npm run dev"            noteflow-app    Up 2 minutes    0.0.0.0:3000->3000/tcp
noteflow-convex       "npx convex dev"         convex-dev      Up 2 minutes
```

### Health Checks

**Application health:**
```bash
curl http://localhost:3000/api/health
```

**Container health:**
```bash
docker-compose exec noteflow-app sh -c "curl -f http://localhost:3000/api/health || exit 1"
```

### Execute Commands in Container

**Open shell:**
```bash
docker-compose exec noteflow-app sh
```

**Run npm commands:**
```bash
# Install new package
docker-compose exec noteflow-app npm install <package-name>

# Run linter
docker-compose exec noteflow-app npm run lint

# Build production
docker-compose exec noteflow-app npm run build
```

---

## Common Commands

### Container Management

```bash
# List running containers
docker-compose ps

# View resource usage
docker stats

# Inspect container
docker inspect noteflow-app

# View container processes
docker-compose top
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect noteflow_node_modules

# Remove unused volumes
docker volume prune
```

### Network Management

```bash
# List networks
docker network ls

# Inspect network
docker network inspect noteflow_noteflow-network

# Remove unused networks
docker network prune
```

### Clean Up

```bash
# Remove stopped containers
docker-compose rm

# Remove all (containers, networks, volumes)
docker-compose down -v

# Remove all Docker resources
docker system prune -a
```

---

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker-compose logs noteflow-app
```

**Common issues:**
1. **Port already in use:**
   ```bash
   # Edit docker-compose.yml
   ports:
     - "3001:3000"  # Change host port
   ```

2. **Environment variables missing:**
   ```bash
   # Verify .env.local exists and is complete
   cat .env.local
   ```

3. **Docker daemon not running:**
   ```bash
   # Start Docker Desktop
   # Or restart Docker service (Linux)
   sudo systemctl restart docker
   ```

### Build Errors

**Clear build cache:**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

**Rebuild specific service:**
```bash
docker-compose build noteflow-app
```

### Permission Issues (Linux)

**Fix file permissions:**
```bash
# Set ownership to current user
sudo chown -R $USER:$USER .

# Or run Docker commands with sudo
sudo docker-compose up -d
```

### Hot Reload Not Working

**Ensure volumes are mounted correctly:**
```bash
# Check docker-compose.yml volumes section
volumes:
  - .:/app
  - /app/node_modules
  - /app/.next
```

**Restart services:**
```bash
docker-compose restart noteflow-app
```

### Database/Convex Connection Issues

**Check Convex service logs:**
```bash
docker-compose logs convex-dev
```

**Verify Convex credentials:**
```bash
# Should match .env.local
docker-compose exec noteflow-app env | grep CONVEX
```

**Restart Convex service:**
```bash
docker-compose restart convex-dev
```

### Performance Issues

**Increase Docker resources:**
- Docker Desktop → Settings → Resources
- Increase CPUs: 4+
- Increase Memory: 4GB+
- Increase Swap: 1GB+

**Use native file system (Mac):**
- Enable "Use the new Virtualization framework"
- Enable "VirtioFS" for file sharing

---

## Production Deployment

### Build Production Image

```bash
docker build -t noteflow:production --target production .
```

### Run Production Container

**Using docker run:**
```bash
docker run -d \
  --name noteflow-prod \
  -p 3000:3000 \
  --env-file .env.local \
  noteflow:production
```

**Using Docker Compose:**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  noteflow-app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: noteflow-prod
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    environment:
      - NODE_ENV=production
```

Run:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Production Environment Variables

**Update .env.local for production:**
```env
# Use production Convex deployment
CONVEX_DEPLOYMENT=prod:your-production-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-production.convex.cloud

# Use production Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Production URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/workspace
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/workspace
```

### Health Monitoring

**Check application health:**
```bash
curl http://localhost:3000/api/health
```

**Set up health check:**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## Advanced Configuration

### Custom Port

**Edit docker-compose.yml:**
```yaml
services:
  noteflow-app:
    ports:
      - "8080:3000"  # Access at http://localhost:8080
```

### Multiple Environments

**Create environment-specific files:**
```bash
# Development
docker-compose -f docker-compose.yml up -d

# Staging
docker-compose -f docker-compose.staging.yml up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### Resource Limits

**Add to docker-compose.yml:**
```yaml
services:
  noteflow-app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

## Best Practices

### Security
- ✅ Never commit `.env.local` to version control
- ✅ Use `.env.local.example` as template
- ✅ Use Docker secrets for production
- ✅ Run containers as non-root user
- ✅ Keep base images updated

### Performance
- ✅ Use multi-stage builds
- ✅ Leverage build cache
- ✅ Minimize image layers
- ✅ Use .dockerignore
- ✅ Mount node_modules as volume

### Development
- ✅ Use docker-compose for local dev
- ✅ Enable hot reload with volumes
- ✅ Use health checks
- ✅ Monitor logs regularly
- ✅ Clean up unused resources

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Documentation](https://docs.docker.com/compose)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)

---

## Support

**Need help?**
- 📖 Check main [README.md](README.md)
- 🐛 Report issues on [GitHub](https://github.com/kmugalkhod/noteflow/issues)
- 💬 Ask questions in [Discussions](https://github.com/kmugalkhod/noteflow/discussions)

---

**Happy Containerizing! 🐳✨**
