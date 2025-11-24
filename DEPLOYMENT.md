# Deployment Guide - AWS EC2

This guide describes how to deploy the Brake Dashboard application to an AWS EC2 instance using Docker and Docker Compose.

## Prerequisites

1.  **AWS Account**: You need an active AWS account.
2.  **Domain Name (Optional)**: If you want to access the app via a domain (e.g., `dashboard.example.com`).

## Step 1: Launch an EC2 Instance

1.  Log in to the AWS Console and navigate to **EC2**.
2.  Click **Launch Instance**.
3.  **Name**: `Brake-Dashboard-Server`
4.  **OS Image**: Ubuntu Server 24.04 LTS (HVM).
5.  **Instance Type**: `t2.small` or `t2.medium` (recommended for build performance).
6.  **Key Pair**: Create a new key pair (e.g., `brake-key`) and download the `.pem` file.
7.  **Network Settings**:
    *   Allow SSH traffic from your IP.
    *   Allow HTTP traffic from the internet.
    *   Allow HTTPS traffic from the internet.
8.  Click **Launch Instance**.

## Step 2: Connect to the Instance

Open your terminal (or Git Bash on Windows) and run:

```bash
chmod 400 path/to/brake-key.pem
ssh -i "path/to/brake-key.pem" ubuntu@<EC2-PUBLIC-IP>
```

## Step 3: Install Docker & Docker Compose

Run the following commands on the EC2 instance:

```bash
# Update packages
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group (to run without sudo)
sudo usermod -aG docker $USER
newgrp docker
```

## Step 4: Deploy the Application

1.  **Clone the Repository** (or copy files manually):

    ```bash
    git clone <YOUR_REPO_URL> app
    cd app
    ```

    *If you don't have a git repo, you can use SCP to copy the files:*
    ```bash
    # Run this from your local machine
    scp -i "path/to/brake-key.pem" -r ./src ./public ./prisma ./package.json ./next.config.ts ./tsconfig.json ./Dockerfile ./docker-compose.yml ubuntu@<EC2-PUBLIC-IP>:~/app
    ```

2.  **Start the Application**:

    ```bash
    docker compose up -d --build
    ```

3.  **Verify**:
    *   Run `docker compose ps` to see running containers.
    *   Open your browser and visit `http://<EC2-PUBLIC-IP>:3000`.

## Step 5: Database Management

The database is now running in a Docker container (`brake-dashboard-db`). The data is persisted in a Docker volume.

To run Prisma commands (e.g., migrations) inside the container:

```bash
docker compose exec app npx prisma migrate deploy
```

## Troubleshooting

*   **Build Fails**: If the instance runs out of memory during build, try adding swap space or upgrading to `t2.medium`.
*   **Cannot Access**: Check EC2 Security Group rules to ensure port 3000 (or 80) is open.
