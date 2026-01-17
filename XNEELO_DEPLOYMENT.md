# Xneelo Cloud Deployment Guide

This guide explains how to deploy Eduthrift to your Xneelo server at `154.65.107.50`.

## Prerequisites

1. ✅ Xneelo server with Docker installed
2. ✅ SSH access to the server
3. ✅ Security groups configured (ports 8080, 3000, 3001 open)
4. ✅ MySQL database set up on Xneelo

## Setup Steps

### 1. Configure GitHub Secrets

Add these secrets to your GitHub repository (`Settings` → `Secrets and variables` → `Actions`):

- **XNEELO_HOST**: `154.65.107.50`
- **XNEELO_USER**: Your SSH username for Xneelo
- **XNEELO_SSH_KEY**: Your SSH private key (the full content)

### 2. Set up Xneelo Server

SSH into your Xneelo server:

```bash
ssh your-user@154.65.107.50
```

#### Install Docker (if not installed):

```bash
# Update system
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

#### Create deployment directory:

```bash
mkdir -p ~/eduthrift
cd ~/eduthrift
```

#### Copy deployment files to server:

```bash
# From your local machine
scp docker-compose.xneelo.yml your-user@154.65.107.50:~/eduthrift/
scp .env.xneelo.template your-user@154.65.107.50:~/eduthrift/.env.xneelo
```

#### Configure environment variables on server:

```bash
# On Xneelo server
cd ~/eduthrift
nano .env.xneelo
```

Fill in your production values (database credentials, PayFast keys, etc.)

### 3. Set up MySQL Database (if needed)

```bash
# Install MySQL
sudo apt-get install mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql
```

In MySQL console:

```sql
CREATE DATABASE eduthrift;
CREATE USER 'eduthrift_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON eduthrift.* TO 'eduthrift_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Import your database schema:

```bash
mysql -u eduthrift_user -p eduthrift < /path/to/your/schema.sql
```

### 4. Make GitHub Container Registry Public

Your GitHub packages need to be public OR you need to authenticate:

**Option A: Make packages public** (Recommended for now)
1. Go to https://github.com/antonswarts15?tab=packages
2. Click on each package (eduthrift-backend, eduthrift-frontend, eduthrift-admin)
3. Click `Package settings`
4. Scroll down and click `Change visibility`
5. Select `Public`

**Option B: Authenticate on Xneelo** (More secure)
```bash
# On Xneelo server
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u antonswarts15 --password-stdin
```

### 5. Deploy

Now the deployment will happen automatically when you push to main!

## Manual Deployment (if needed)

If you need to deploy manually:

```bash
# SSH to Xneelo
ssh your-user@154.65.107.50

# Navigate to deployment directory
cd ~/eduthrift

# Pull latest images
docker pull ghcr.io/antonswarts15/eduthrift-backend:latest
docker pull ghcr.io/antonswarts15/eduthrift-frontend:latest
docker pull ghcr.io/antonswarts15/eduthrift-admin:latest

# Deploy
docker-compose -f docker-compose.xneelo.yml --env-file .env.xneelo up -d
```

## Verify Deployment

Check if services are running:

```bash
docker ps
```

Test endpoints:
- Backend: http://154.65.107.50:8080/health
- Frontend: http://154.65.107.50:3000
- Admin: http://154.65.107.50:3001

## Troubleshooting

### Check container logs:

```bash
docker logs eduthrift-backend
docker logs eduthrift-frontend
docker logs eduthrift-admin
```

### Restart a service:

```bash
docker-compose -f docker-compose.xneelo.yml restart backend
```

### Full rebuild:

```bash
docker-compose -f docker-compose.xneelo.yml down
docker-compose -f docker-compose.xneelo.yml up -d
```

## How It Works

1. **Build Phase**: GitHub Actions builds Docker images when you push to main
2. **Push Phase**: Images are pushed to GitHub Container Registry (ghcr.io)
3. **Deploy Phase**: GitHub Actions SSHes to Xneelo and pulls/runs the latest images

## Next Steps

1. Set up SSL/HTTPS with nginx reverse proxy
2. Configure domain names instead of IP addresses
3. Set up monitoring and logging
4. Configure automated backups
