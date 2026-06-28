# SchoolCRM — EC2 Deployment Guide

## Step 1 — Clone the Repo
```bash
git clone https://github.com/rajkumargdev/schoolcrm_nodejsproject.git
```

---

## Step 2 — Update & Install PostgreSQL
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## Step 3 — Create DB User and Database
```bash
sudo -u postgres psql
```
Inside psql:
```sql
CREATE USER marks_user WITH PASSWORD 'marks_pass_2024';
CREATE DATABASE marks_tracker OWNER marks_user;
GRANT ALL PRIVILEGES ON DATABASE marks_tracker TO marks_user;
\q
```

---

## Step 4 — Run Migrations
```bash
cd schoolcrm_nodejsproject/db/migrations

psql -U marks_user -d marks_tracker -h localhost -f 001_create_tables.sql
# password: marks_pass_2024

psql -U marks_user -d marks_tracker -h localhost -f 002_create_indexes.sql
# password: marks_pass_2024

psql -U marks_user -d marks_tracker -h localhost -f 003_seed_data.sql
# password: marks_pass_2024
```

---

## Step 5 — Install Node.js 22
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v && npm -v
```

---

## Step 6 — Install Backend Dependencies
```bash
cd ~/schoolcrm_nodejsproject/backend-node/backend-node
npm install
```

---

## Step 7 — Create .env File
Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output, then create the `.env`:
```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql://marks_user:marks_pass_2024@localhost:5432/marks_tracker
JWT_SECRET=paste_your_generated_secret_here
PORT=8080
EOF
```
> ⚠️ Do NOT wrap the JWT_SECRET value in `< >` angle brackets — just paste the raw hex string.

---

## Step 8 — Test Backend (foreground first)
```bash
node src/index.js
```
Expected output:
```
✅ Connected to PostgreSQL
🚀 Server running on http://0.0.0.0:8080
```
Press `Ctrl+C` to stop after confirming it works.

---

## Step 9 — Update Frontend API URL
```bash
cd ~/schoolcrm_nodejsproject/frontend/src
vi api.js
# Find the hardcoded IP/localhost and replace with your EC2 public IP
# Example: http://<your-ec2-public-ip>:8080
```

---

## Step 10 — Build Frontend
```bash
cd ~/schoolcrm_nodejsproject/frontend
npm install
npm run build
```

---

## Step 11 — Serve Frontend
```bash
sudo npm install -g serve
serve -s build -l 3000
```
Frontend will be available at: `http://<your-ec2-public-ip>:3000`

---

## Step 12 — Run Backend in Background (persistent)
Open a second terminal:
```bash
cd ~/schoolcrm_nodejsproject/backend-node/backend-node
nohup node src/index.js > app.log 2>&1 &
echo $!          # note this PID to kill later if needed
tail -f app.log  # verify it started correctly
```

---

## Step 13 — Open EC2 Security Group Ports
In AWS Console → EC2 → Security Groups → Inbound Rules:

| Port | Purpose |
|------|---------|
| 22   | SSH |
| 8080 | Node.js Backend API |
| 3000 | React Frontend |

---

## Access the App
| What | URL |
|------|-----|
| Frontend | `http://<your-ec2-public-ip>:3000` |
| Backend API | `http://<your-ec2-public-ip>:8080` |

---

## Useful Commands

### Check backend is running
```bash
ps aux | grep node
tail -f ~/schoolcrm_nodejsproject/backend-node/backend-node/app.log
```

### Kill backend
```bash
kill <PID>
```

### Restart backend
```bash
cd ~/schoolcrm_nodejsproject/backend-node/backend-node
nohup node src/index.js > app.log 2>&1 &
```

### Check DB connection manually
```bash
psql -U marks_user -d marks_tracker -h localhost
# password: marks_pass_2024
\dt   # list tables
\q    # quit
```

---

## Common Mistakes to Avoid

| Mistake | Fix |
|---------|-----|
| JWT_SECRET wrapped in `< >` | Remove angle brackets, paste raw string |
| Forgot to update frontend API URL before build | Edit `src/api.js`, then re-run `npm run build` |
| Port not open in Security Group | Add inbound rule in AWS Console |
| Backend dies after terminal closes | Use `nohup` as shown in Step 12 |
| `npm install` run in wrong folder | Backend deps go in `backend-node/backend-node/`, frontend deps in `frontend/` |
