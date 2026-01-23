# Project CI/CD Pipeline

This project uses GitHub Actions for Continuous Integration and Continuous Deployment (CI/CD).

## Workflows

The pipeline is defined in `.github/workflows/ci.yml` and consists of the following jobs:

### 1. Frontend Build (`frontend-build`)
-   **Triggers**: Push to `main`/`master` or Pull Request.
-   **Steps**:
    -   Checks out the code.
    -   Sets up Node.js (v20).
    -   Installs frontend dependencies (`npm install`).
    -   Builds the frontend application (`npm run build`).

### 2. Backend Check (`backend-check`)
-   **Triggers**: Push to `main`/`master` or Pull Request.
-   **Steps**:
    -   Checks out the code.
    -   Sets up Node.js (v20).
    -   Installs backend dependencies (`npm install`).
    -   (Optional) Can be extended to run tests (`npm test`) if configured.

### 3. Backend Docker Build (`backend-docker-build`)
-   **Triggers**: After `backend-check` succeeds.
-   **Steps**:
    -   Builds the Docker image for the backend to ensure the `Dockerfile` is valid.

### 4. Deployment (`deploy`)
-   **Triggers**: Push to `main` branch ONLY, and after all build jobs succeed.
-   **Status**: **Placeholder**. You need to configure this job in `.github/workflows/ci.yml` with your specific deployment steps (e.g., SSH to server, Vercel, AWS, etc.).

## How to Configure Deployment

Open `.github/workflows/ci.yml` and locate the `deploy` job at the bottom. Uncomment and add your deployment commands.

Example for SSH deployment:
```yaml
- name: Deploy via SSH
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.HOST }}
    username: ${{ secrets.USERNAME }}
    key: ${{ secrets.SSH_KEY }}
    script: |
      cd /path/to/project
      git pull
      docker-compose up -d --build
```
