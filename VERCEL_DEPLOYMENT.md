# Deploying to Vercel

This guide outlines the steps to deploy your Next.js application to Vercel. Since your local development uses SQLite (which isn't supported for serverless persistence on Vercel), you will need to set up a PostgreSQL database.

## Prerequisites

1.  **Vercel Account**: [Sign up here](https://vercel.com/signup).
2.  **GitHub Repository**: Push your code to a GitHub repository.
3.  **PostgreSQL Database**: You need a hosted Postgres database. Recommended options:
    *   **Vercel Postgres**: Integrated directly into Vercel.
    *   **Neon**: Serverless Postgres (what Vercel uses under the hood).
    *   **Supabase**: Excellent open-source alternative.

---

## Step 1: Set up a Postgres Database

### Option A: Using Vercel Postgres (Recommended)
1.  Go to your Vercel Dashboard.
2.  Navigate to **Storage** tab.
3.  Click **Create Database** -> Select **Postgres**.
4.  Give it a name (e.g., `se-project-db`) and region.
5.  Once created, go to the **.env.local** tab in the database view.
6.  Copy the connection string (usually `POSTGRES_URL` or `DATABASE_URL`). It will look like `postgres://...`.

### Option B: Using Other Providers (Neon/Supabase)
1.  Create a project on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2.  Get the connection string (Transaction/Pooled connection recommended for serverless).

---

## Step 2: Configure Project for Deployment

### 1. Update `package.json` (Already Done)
We added `"postinstall": "prisma generate"` to your scripts. This ensures Prisma Client is generated during Vercel's build.

### 2. Update `prisma/schema.prisma`
You need to switch the provider from `sqlite` to `postgresql` before deploying.

> [!WARNING]
> **Do not commit this change if you still want to develop locally with SQLite.**
> Alternatively, you can use environment variables to switch, but simply changing it before deployment is easier for a one-off.

Modify `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql" // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 3. Commit Changes
Push your changes (including the updated `package.json`) to GitHub.

---

## Step 3: Deploy on Vercel

1.  **Import Project**:
    *   Go to Vercel Dashboard -> **Add New...** -> **Project**.
    *   Import your GitHub repository.

2.  **Configure Environment Variables**:
    *   Expand the **Environment Variables** section.
    *   Add the following variables:
        *   `DATABASE_URL`: Your Postgres connection string (starts with `postgres://` or `postgresql://`).
        *   `NEXTAUTH_SECRET`: A random string for auth encryption (generate one with `openssl rand -base64 32`).
        *   `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`). *Note: Vercel automatically sets `VERCEL_URL`, but NextAuth often requires `NEXTAUTH_URL` explicitly.*
        *   `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Your Google Auth credentials.

3.  **Deploy**:
    *   Click **Deploy**.
    *   Vercel will build your app. Watch the logs. It should run `prisma generate` automatically.

---

## Step 4: Database Migration (Post-Deployment)

Once the app is deployed, the database is empty. You need to push your schema to the new Postgres database.

You can do this from your **local machine** if you have the Postgres connection string:

1.  Temporarily update your local `.env`:
    ```env
    DATABASE_URL="your-production-postgres-url"
    ```
2.  Update `prisma/schema.prisma` to `provider = "postgresql"`.
3.  Run the push command:
    ```bash
    npx prisma db push
    ```
    *This creates the tables in your production database.*

4.  (Optional) Seed the database:
    ```bash
    npx prisma db seed
    ```

5.  **Revert local changes** (schema and .env) to go back to SQLite development if desired.

---

## Troubleshooting

-   **Build Failures**: Check Vercel logs. Common issues are missing env vars or type errors.
-   **Database Connection**: Ensure your database allows connections from external IPs (usually "Allow all" or 0.0.0.0/0 for Vercel).
-   **NextAuth Errors**: Verify `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set correctly in Vercel settings.
