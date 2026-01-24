# Deployment Guide

This guide will help you deploy your application to the internet so you can share a real link with your teacher.

## Prerequisites

1.  **GitHub Account**: You need to push this code to a GitHub repository.
2.  **Render Account**: Sign up at [render.com](https://render.com) (it's free).
3.  **Cloud Database**: Since Render doesn't offer free MySQL, you need an external one.

---

## Step 1: Get a Free MySQL Database

You have a few options for a free MySQL database:
-   **Aiven**: [https://aiven.io/free-mysql-database](https://aiven.io/free-mysql-database) (Easy, no credit card usually)
-   **TiDB Cloud**: [https://tidbcloud.com/](https://tidbcloud.com/) (MySQL compatible, generous free tier)
-   **PlanetScale**: (Has free hobby tier but sometimes changes)

**Recommended (Aiven):**
1.  Sign up.
2.  Create a **MySQL** service (select the Free Plan).
3.  Once running, copy the **Service URI** (it looks like `mysql://user:password@host:port/defaultdb...`).
4.  Write down the:
    -   Host
    -   Port
    -   User
    -   Password
    -   Database Name (usually `defaultdb` or you can create one).

---

## Step 2: Push Code to GitHub

1.  Initialize git if not done:
    ```bash
    git init
    git add .
    git commit -m "Ready for deploy"
    ```
2.  Create a new repository on GitHub.
3.  Push your code:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
    git push -u origin master
    ```

---

## Step 3: Deploy to Render (The "Magic" Way)

We have created a `render.yaml` file that automates this.

1.  Go to your **Render Dashboard**.
2.  Click **New +** -> **Blueprint**.
3.  Connect your GitHub repository.
4.  Give it a name (e.g., `my-school-project`).
5.  **This is critical**: Render will ask for Environment Variables defined in `render.yaml`.
    You typically need to provide them *after* creation or during the wizard if it prompts.
    
    If the wizard doesn't ask for them, let the deploy fail once, then go to the **backend** service -> **Environment** and add:
    -   `DB_HOST`: (from Step 1)
    -   `DB_PORT`: (from Step 1, e.g., 20935)
    -   `DB_USER`: (from Step 1)
    -   `DB_PASSWORD`: (from Step 1)
    -   `DB_NAME`: (from Step 1, e.g., `defaultdb`)
    -   `JWT_SECRET`: (Generate a random string, e.g., `mysecretkey123`)

6.  **Database Creation**:
    -   The app tries to create the database automatically. If your cloud provider gave you a specific database name (like `defaultdb`), make sure to set `DB_NAME` to that.
    -   The app will automatically run `init.sql` to create the tables.

---

## Step 4: Verify

1.  Wait for the **frontend** and **backend** to build.
2.  Render will give you a URL for the frontend (e.g., `https://frontend-xyz.onrender.com`).
3.  Open that link. It is the "Real Link" you can send to your teacher!

---

## Troubleshooting

-   **Database Error**: Check the logs in the Backend service. If it says "Access Denied", double-check your password and `DB_NAME`.
-   **CORS Error**: The backend allows all origins by default, so this shouldn't happen.
-   **"Network Error"**: Means frontend can't reach backend. Ensure `VITE_API_URL` was set correctly (The Blueprint should handle this automatically).

---

## Alternative: Deploy using a VPS (Advanced)

If you have a server (like DigitalOcean Droplet):
1.  SSH into server.
2.  Clone repo.
3.  Run `docker-compose up -d --build`.
4.  It just works (but you need a domain name if you want a pretty link, or use the IP).
