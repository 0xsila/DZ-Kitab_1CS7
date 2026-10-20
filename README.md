# 📚 DZ-Kitab — Second-Hand Book Marketplace

**DZ-Kitab** is a collaborative web application designed to make buying, selling, and exchanging second-hand books easier. It connects readers through an online marketplace where users can discover books, publish listings, and give pre-owned books a second life.

The project was developed by a team of students as a collaborative software engineering project.

## 🌐 Live Demo

- **Frontend:** [DZ-Kitab Web App](https://frontend-x7sg.onrender.com)
- **Backend API:** [DZ-Kitab API](https://backend-b1zf.onrender.com)

## ✨ Features

- 📖 **Book Marketplace** — Browse listings for second-hand books.
- 🛍️ **Buy & Sell Books** — Publish book listings and connect with other readers.
- 🔄 **Book Exchange** — Encourage sharing and exchanging books between users.
- 👤 **User Management** — Support user accounts and marketplace interactions.
- 📋 **Listing Management** — Manage book advertisements through the application.
- 🌱 **Sustainable Reading** — Promote book reuse and make reading more accessible.

*Features listed above describe the project's intended functionality; availability may depend on the current implementation.*

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | Render |

## 🏗️ Project Structure

```text
DZ-Kitab_1CS7/
├── backend/           # Express.js API and server-side logic
├── frontend/          # React application built with Vite
├── docker-compose.yml # Local multi-container setup
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/BillalBRAHAMI/DZ-Kitab_1CS7.git
cd DZ-Kitab_1CS7
```

### 2. Configure environment variables

Check the `backend/` and `frontend/` directories for their environment configuration requirements.

Create the necessary `.env` files using the variables documented in the project. Configure the database connection and any required API URLs before starting the application.

**Important:** Never commit credentials, database passwords, API keys, or other secrets.

### 3. Start the application

From the project root, run:

```bash
docker compose up --build
```

Docker Compose will build and start the services defined in `docker-compose.yml`.

### 4. Access the application

Check the port mappings in `docker-compose.yml` to find the local frontend and backend URLs.

To stop the application, run:

```bash
docker compose down
```

To stop the application and remove its database volume, if one is configured, use `docker compose down -v`. **This may permanently delete local database data.**

## ⚙️ CI/CD

The project uses GitHub Actions to automate parts of the development workflow.

[![CI/CD](https://github.com/BillalBRAHAMI/DZ-Kitab_1CS7/actions/workflows/ci.yml/badge.svg?branch=Billal)](https://github.com/BillalBRAHAMI/DZ-Kitab_1CS7/actions/workflows/ci.yml?query=branch%3ABillal)

The workflow is associated with the `Billal` branch. Refer to the [GitHub Actions workflow](https://github.com/BillalBRAHAMI/DZ-Kitab_1CS7/actions/workflows/ci.yml) for the actual build, testing, and deployment steps.

## 🔗 Repository

**GitHub:** [BillalBRAHAMI/DZ-Kitab_1CS7](https://github.com/BillalBRAHAMI/DZ-Kitab_1CS7)

## 🤝 Contributing

Contributions and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes and test them.
4. Submit a pull request describing your modifications.

## 🔒 Security

Please avoid committing sensitive information or production credentials. If you discover a security vulnerability, report it privately to the repository maintainers rather than publishing exploitable details.

## 🎓 About the Project

DZ-Kitab was developed as a student team project to apply practical skills in full-stack web development, database integration, API design, containerization, and collaborative software engineering.

The project's goal is simple: **make books easier to find, easier to share, and easier to reuse.**

---

<p align="center">
  <strong>DZ-Kitab</strong> · Give books a second life. 📚
</p>
