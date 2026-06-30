# SchoolCRM — Production Deployment Guide

> Stack: Node.js 24 + Express + React + PostgreSQL + Nginx + PM2
> OS: Ubuntu 24.04 LTS on AWS EC2

---

## Prerequisites

- Fresh AWS EC2 instance (Ubuntu 24.04)
- Security Group: Port 22 (SSH), Port 80 (HTTP) open
- SSH access via `.pem` key

---

## Step 1 — Connect to EC2

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

---

## Step 2 — Update the Server

```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
# Wait 30 seconds then reconnect
```

---

## Step 3 — Install Node.js 24

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

---

## Step 4 — Install PM2

```bash
sudo npm install -g pm2
pm2 -v
```

---

## Step 5 — Install Nginx

```bash
sudo apt install nginx -y
nginx -v
sudo systemctl status nginx
```

---

## Step 6 — Install PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y
psql --version
sudo systemctl status postgresql
```

---

## Step 7 — Setup Database and User

```bash
sudo -u postgres psql
```

Inside the postgres shell:

```sql
CREATE DATABASE marks_tracker;
CREATE USER marks_user WITH PASSWORD 'marks_pass_2024';
GRANT ALL PRIVILEGES ON DATABASE marks_tracker TO marks_user;
\q
```

Fix schema permissions:

```bash
sudo -u postgres psql -d marks_tracker
```

```sql
GRANT ALL ON SCHEMA public TO marks_user;
ALTER DATABASE marks_tracker OWNER TO marks_user;
\q
```

---

## Step 8 — Clone the Repository

```bash
cd ~
git clone https://github.com/rajkumargdev/schoolcrm_nodejsproject.git
cd schoolcrm_nodejsproject
```

---

## Step 9 — Run Database Migrations

```bash
psql -U marks_user -d marks_tracker -h localhost -f ~/schoolcrm_nodejsproject/db/migrations/001_create_tables.sql
psql -U marks_user -d marks_tracker -h localhost -f ~/schoolcrm_nodejsproject/db/migrations/002_create_indexes.sql
psql -U marks_user -d marks_tracker -h localhost -f ~/schoolcrm_nodejsproject/db/migrations/003_seed_data.sql
```

---

## Step 10 — Create Backend .env File

```bash
cat > ~/schoolcrm_nodejsproject/backend-node/.env << 'EOF'
PORT=8080
DATABASE_URL=postgresql://marks_user:marks_pass_2024@localhost:5432/marks_tracker
JWT_SECRET=schoolcrm_secret_key_2024
EOF
```

Verify:

```bash
cat ~/schoolcrm_nodejsproject/backend-node/.env
```

---

## Step 11 — Install Backend Dependencies and Start with PM2

```bash
cd ~/schoolcrm_nodejsproject/backend-node
npm install
pm2 start src/index.js --name schoolcrm
pm2 status
```

Verify backend is connected to DB:

```bash
pm2 logs schoolcrm --lines 10
```

Expected output:
```
✅ Connected to PostgreSQL
🚀 Server running on http://0.0.0.0:8080
```

---

## Step 12 — Build React Frontend

Update API base URL:

```bash
sed -i "s|baseURL: '.*'|baseURL: '/api'|" ~/schoolcrm_nodejsproject/frontend/src/api.js
```

Install dependencies and build:

```bash
cd ~/schoolcrm_nodejsproject/frontend
npm install
npm run build
```

Fix folder permissions for Nginx:

```bash
chmod 755 /home/ubuntu
chmod -R 755 ~/schoolcrm_nodejsproject/frontend/build
```

---

## Step 13 — Configure Nginx

```bash
sudo vi /etc/nginx/sites-available/schoolcrm
```

Paste this config:

```nginx
server {
    listen 80;
    server_name YOUR_EC2_IP;

    # Serve React frontend
    root /home/ubuntu/schoolcrm_nodejsproject/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to Express backend
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the config:

```bash
sudo ln -s /etc/nginx/sites-available/schoolcrm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx
```

---

## Step 14 — PM2 Auto-Start on Reboot

```bash
pm2 startup
# Copy and run the command it outputs, example:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
```

---

## Step 15 — Access the App

Open in browser:

```
http://YOUR_EC2_IP
```

---

## Useful Commands

| Command | Purpose |
|--------|---------|
| `pm2 status` | Check if app is running |
| `pm2 logs schoolcrm` | View app logs |
| `pm2 restart schoolcrm` | Restart the app |
| `pm2 stop schoolcrm` | Stop the app |
| `sudo systemctl restart nginx` | Restart Nginx |
| `sudo nginx -t` | Test Nginx config |
| `sudo tail -20 /var/log/nginx/error.log` | View Nginx errors |

---

## Architecture

```
Browser
  │
  ▼
Nginx (port 80)
  ├── /*      → React frontend (build/)
  └── /api/*  → Express backend (port 8080)
                      │
                      ▼
               PostgreSQL (port 5432)
               database: marks_tracker
```
