# Project Report: Manufacturing Dashboard Application

## 1. Introduction to the Project

### Overall Problem/Objective
The objective of this project was to develop a comprehensive **Manufacturing Dashboard Web Application** to digitize and streamline the tracking of production, inventory, dispatch, and scrap data. Traditional manual record-keeping in manufacturing plants is prone to errors, inefficient, and lacks real-time visibility. This project aims to solve these issues by providing a centralized, digital platform for data entry, visualization, and management.

### Major Functionalities
- **User Authentication**: Secure login and registration system using NextAuth, including Google Sign-In and role-based access control (Admin vs. User).
- **Interactive Dashboard**: Real-time visualization of key performance indicators (KPIs) using charts and graphs (Recharts).
- **Inventory Management**: Tracking stock levels, safety stock, and reorder levels with visual alerts.
- **Production Tracking**: Recording daily production targets vs. actuals, efficiency calculation, and line-wise performance.
- **Dispatch & Order Management**: Managing customer orders and tracking dispatch status.
- **Scrap Monitoring**: Detailed logging of defects and scrap reasons to identify quality issues.
- **Change Request System**: A workflow for users to request data modifications which require admin approval, ensuring data integrity.

### Technologies Used
- **Frontend & Backend Framework**: Next.js 16 (React 19)
- **Database ORM**: Prisma
- **Styling**: Tailwind CSS, GSAP, Framer Motion
- **Authentication**: NextAuth.js
- **Visualization**: Recharts, React Three Fiber
- **Hosting**: AWS EC2, Nginx, PM2

### Importance & Solution
This project is crucial for modernizing manufacturing operations. By moving from paper-based or scattered spreadsheet systems to a cloud-hosted web application, stakeholders gain instant access to critical data. This leads to faster decision-making, reduced waste (scrap analysis), optimized inventory levels, and improved overall operational efficiency.

---

## 2. Cloud Computing Integration

### 2.1 Where Cloud Computing is Used (Component)
- **Compute & Hosting**: The entire full-stack Next.js application is hosted on an **AWS EC2 (Elastic Compute Cloud)** instance.
- **Database Hosting**: The database (managed via Prisma) is hosted within the same cloud environment, ensuring low-latency access for the application.
- **Networking**: Cloud networking features like **Elastic IP** and **Security Groups** are used to manage access and ensure the application is reachable.
- **Security**: SSL/TLS certificates are deployed on the cloud instance to secure data in transit.

### 2.2 What Cloud Concepts and Services Are Used
The project applies several core cloud computing concepts from CS 3132:

- **IaaS (Infrastructure as a Service)**: AWS EC2 is used as the fundamental infrastructure block, providing virtualized computing resources (CPU, RAM, Storage) that we manage directly.
- **Virtualization**: The application runs on a Virtual Machine (VM) - specifically an Ubuntu Linux instance - which abstracts the underlying physical hardware.
- **Cloud Networking**:
    - **Elastic IP**: A static public IPv4 address was allocated to the instance to ensure the application's endpoint remains constant even if the instance is stopped and started.
    - **VPC & Security Groups**: A virtual firewall was configured to control inbound and outbound traffic, allowing only necessary ports (SSH-22, HTTP-80, HTTPS-443).
- **SaaS (Software as a Service)**: While we built the app, we leveraged SaaS tools like GitHub for version control and potentially cloud-based CI/CD workflows.
- **Cloud Security**: Implementation of **SSL/TLS** (via Certbot/Let's Encrypt) ensures encrypted communication between the client and the cloud server.
- **Process Management**: **PM2** is used as a process manager to keep the Node.js application alive forever, handling automatic restarts and log management, mimicking cloud auto-recovery behaviors at a process level.

### 2.3 How Those Concepts Were Implemented (Step-by-Step)

**1. Instance Creation & Configuration**
- Launched an **Ubuntu 22.04 LTS** EC2 instance (t2.micro/t3.micro) on AWS.
- Configured **Security Groups** to allow Inbound traffic on ports 22 (SSH), 80 (HTTP), and 443 (HTTPS).
- Generated and downloaded the `.pem` key pair for secure SSH access.

**2. Environment Setup**
- Connected to the instance via SSH: `ssh -i "key.pem" ubuntu@<public-ip>`.
- Updated the package lists and installed dependencies: `Node.js`, `npm`, `git`, and `nginx`.
- Cloned the project repository from GitHub to the cloud instance.

**3. Application Deployment**
- Installed project dependencies: `npm install`.
- Generated Prisma client: `npx prisma generate`.
- Built the Next.js application for production: `npm run build`.
- Started the application using **PM2** to ensure high availability:
  ```bash
  pm2 start npm --name "nextjs-app" -- start
  pm2 save
  pm2 startup
  ```

**4. Networking & Reverse Proxy Configuration**
- Configured **Nginx** as a reverse proxy to forward traffic from port 80 to the Next.js app running on port 3000.
- This allows users to access the site via a standard URL without specifying a port.
- **Elastic IP** was allocated and associated with the instance to provide a permanent public IP address.

**5. Security Implementation**
- Installed **Certbot** for SSL management.
- Ran Certbot to automatically configure Nginx with a free Let's Encrypt SSL certificate, enabling HTTPS.
- This ensures all user login credentials and data are transmitted securely.

*(Placeholders for Screenshots: AWS Console showing EC2 instance running, Security Group rules, Terminal showing PM2 status, Nginx config file)*

---

## 3. Results & Outputs

**Cloud Implementation Results:**
- **Accessibility**: The dashboard is now accessible from anywhere via a public URL/IP, enabling remote monitoring for plant managers.
- **Reliability**: With PM2 and AWS infrastructure, the application maintains high uptime. If the application crashes, PM2 automatically restarts it.
- **Performance**: Hosting on a cloud server provides consistent performance compared to a local development machine.
- **Security**: The site is served over HTTPS, ensuring compliance with modern web security standards.

*(Placeholders for Screenshots: Final Dashboard UI running in browser with HTTPS lock icon, Terminal logs showing successful build and deployment)*

---

## 4. Conclusion

**Summary of Cloud Contribution**
Integrating cloud computing transformed the project from a local prototype into a deployable, production-ready application. Using AWS EC2 provided a flexible and scalable environment to host the full-stack application.

**What We Learned**
- Practical experience with **IaaS** (AWS EC2) and Linux server administration.
- Understanding of **Web Server Configuration** (Nginx) and **Reverse Proxying**.
- Importance of **Process Management** (PM2) for production applications.
- Implementing **Cloud Security** best practices (Security Groups, SSL).

**Future Improvements**
- **Auto-scaling**: Implementing AWS Auto Scaling Groups to handle increased traffic.
- **Managed Database**: Migrating from a local database on EC2 to **AWS RDS** for better backup and scalability.
- **CI/CD**: Setting up a pipeline (e.g., GitHub Actions) to automatically deploy changes to the EC2 instance.

---

## 5. References
- Next.js Documentation: https://nextjs.org/docs
- AWS EC2 Documentation: https://docs.aws.amazon.com/ec2/
- Nginx Documentation: https://nginx.org/en/docs/
- PM2 Documentation: https://pm2.keymetrics.io/
- Prisma Documentation: https://www.prisma.io/docs

---

## 6. Individual Contributions (Tech Lead)

As the **Tech Lead** of the team, my primary contribution was the end-to-end development and cloud deployment of the Manufacturing Dashboard Web Application. I architected and built the full-stack application using the **Next.js** framework for a responsive user interface and **Prisma ORM** for efficient database management. My most significant contribution was the cloud integration; I provisioned an **AWS EC2 instance** (Ubuntu OS) and orchestrated the deployment of the application. I configured **Nginx** as a reverse proxy to handle HTTP/HTTPS traffic and implemented **SSL/TLS certification** to ensure secure data transmission. To guarantee high availability, I utilized **PM2** for process management, ensuring the application runs permanently and restarts automatically. Additionally, I enhanced network stability by allocating an **Elastic IP** and secured the infrastructure by configuring **AWS Security Groups** to restrict unauthorized access.
