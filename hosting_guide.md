# Hosting Guide for AWS EC2 (Free Tier)

This guide provides step-by-step instructions to host your Next.js application, Prisma database, and Google Auth on an AWS EC2 Free Tier instance.

## Prerequisites
- AWS Account
- Domain Name (optional but recommended for SSL/Google Auth)
- GitHub Repository for your project

## 1. Launch AWS EC2 Instance
1.  **Login to AWS Console** and navigate to **EC2 Dashboard**.
2.  Click the orange **Launch Instance** button.
3.  **Name and Tags**:
    -   Under "Name", enter `Brake-Analytics-Server`.
4.  **Application and OS Images (Amazon Machine Image)**:
    -   Select **Ubuntu**.
    -   Ensure the AMI is **Ubuntu Server 24.04 LTS (HVM), SSD Volume Type** (Look for "Free tier eligible").
    -   Architecture: **64-bit (x86)**.
5.  **Instance Type**:
    -   Select **t2.micro** or **t3.micro** (Look for "Free tier eligible").
6.  **Key Pair (Login)**:
    -   Click **Create new key pair**.
    -   Key pair name: `brake-analytics-key`.
    -   Key pair type: **RSA**.
    -   Private key file format: **.pem**.
    -   Click **Create key pair**.
    -   **IMPORTANT**: A file named `brake-analytics-key.pem` will download. **Save this file safely**. You cannot download it again.
7.  **Network Settings**:
    -   Click **Edit** (top right of this box).
    -   **Auto-assign Public IP**: Enable.
    -   **Firewall (security groups)**: Select "Create security group".
    -   Security group name: `brake-analytics-sg`.
    -   Description: `Allow Web and SSH`.
    -   **Inbound Security Group Rules**:
        -   Rule 1: Type **SSH** | Source **Anywhere** (0.0.0.0/0).
        -   Rule 2: Click **Add security group rule**. Type **HTTP** | Source **Anywhere** (0.0.0.0/0).
        -   Rule 3: Click **Add security group rule**. Type **HTTPS** | Source **Anywhere** (0.0.0.0/0).
8.  **Configure Storage**:
    -   Change `8 GiB` to `30 GiB` (Free tier allows up to 30GB).
    -   Root volume type: `gp3`.
9.  **Summary** (Right panel):
    -   Click **Launch instance** (Orange button).

## 2. Connect to Instance
1.  Open your **Command Prompt (cmd)**.
2.  **CRITICAL STEP**: Fix the key permissions. Run these commands one by one to strip all extra access:
    ```cmd
    icacls "D:\Software Engineering.pem" /inheritance:r
    icacls "D:\Software Engineering.pem" /grant:r "%username%":R
    icacls "D:\Software Engineering.pem" /remove "Authenticated Users"
    icacls "D:\Software Engineering.pem" /remove "Users"
    ```
3.  Now connect to your instance (replace `<your-ec2-public-ip>` with your actual IP):
    ```cmd
    ssh -i "D:\Software Engineering.pem" ubuntu@<your-ec2-public-ip>
    ```

## 3. Environment Setup
Update packages and install dependencies:
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx
sudo npm install -g pm2
```

## 4. Database Setup (PostgreSQL)
For free tier, you can install PostgreSQL directly on the EC2 instance.

1.  Install PostgreSQL:
    ```bash
    sudo apt install postgresql postgresql-contrib -y
    ```
2.  Start and enable the service:
    ```bash
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    ```
3.  Log in to Postgres:
    ```bash
    sudo -u postgres psql
    ```
4.  Create database and user:
    ```sql
    CREATE DATABASE se_project_db;
    CREATE USER se_user WITH ENCRYPTED PASSWORD 'your_secure_password';
    GRANT ALL PRIVILEGES ON DATABASE se_project_db TO se_user;
    \q
    ```
5.  **Important**: Update your `.env` file later with this connection string:
    `DATABASE_URL="postgresql://se_user:your_secure_password@localhost:5432/se_project_db"`

## 5. Deploy Application
1.  Clone your repository:
    ```bash
    git clone https://github.com/your-username/your-repo.git
    cd your-repo
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create `.env` file:
    ```bash
    nano .env
    ```
    Paste your environment variables:
    ```env
    DATABASE_URL="postgresql://se_user:your_secure_password@localhost:5432/se_project_db"
    NEXTAUTH_URL="http://<your-ec2-public-ip>" # Change to https://your-domain.com later
    NEXTAUTH_SECRET="generate-a-random-secret"
    GOOGLE_CLIENT_ID="your-google-client-id"
    GOOGLE_CLIENT_SECRET="your-google-client-secret"
    ```
4.  Generate Prisma Client and Push Schema:
    ```bash
    npx prisma generate
    npx prisma db push
    ```
5.  Build the application:
    ```bash
    npm run build
    ```
6.  Start with PM2:
    ```bash
    pm2 start npm --name "se-project" -- start
    pm2 save
    pm2 startup
    ```

## 6. Configure Nginx (Reverse Proxy)
1.  Edit Nginx config:
    ```bash
    sudo nano /etc/nginx/sites-available/default
    ```
2.  Replace content with:
    ```nginx
    server {
        listen 80;
        server_name <your-ec2-public-ip-or-domain>;

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
3.  Restart Nginx:
    ```bash
    sudo systemctl restart nginx
    ```

## 7. Google Auth Configuration
1.  Go to **Google Cloud Console**.
2.  Navigate to **APIs & Services > Credentials**.
3.  Edit your OAuth 2.0 Client ID.
4.  Add your EC2 IP/Domain to **Authorized JavaScript origins**:
    - `http://<your-ec2-public-ip>` (or `https://your-domain.com`)
5.  Add callback URL to **Authorized redirect URIs**:
    - `http://<your-ec2-public-ip>/api/auth/callback/google` (or `https://your-domain.com/...`)

## 8. SSL Setup (Optional but Recommended)
If you have a domain name pointing to your EC2 IP:
1.  Install Certbot:
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    ```
2.  Obtain SSL certificate:
    ```bash
    sudo certbot --nginx -d your-domain.com
    ```
3.  Update `.env` `NEXTAUTH_URL` to `https://your-domain.com`.
4.  Update Google Console origins/redirects to `https`.
