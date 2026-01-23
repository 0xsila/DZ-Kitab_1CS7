# Express.js + MySQL Backend

A professional Express.js backend with MySQL database, featuring authentication, user management, and complete CRUD operations.

## 🚀 Features

- **Authentication System**
  - User registration with validation
  - Login with JWT tokens
  - Password reset via email
  - Secure password hashing with bcrypt

- **User Management**
  - Get user profile
  - Update profile information
  - Change password
  - Delete account

- **Security**
  - JWT-based authentication
  - Password hashing with bcrypt
  - Input validation with express-validator
  - Helmet for security headers
  - CORS enabled

- **DevOps Ready**
  - Docker & Docker Compose configuration
  - Environment-based configuration
  - MySQL database with initialization script

## 📁 Project Structure

```
project-root/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection pool
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── userController.js    # User CRUD operations
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   └── userRoutes.js        # User endpoints
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── errorHandler.js      # Global error handler
│   ├── utils/
│   │   ├── emailService.js      # Email functionality
│   │   └── tokenService.js      # JWT token generation
│   ├── validators/
│   │   ├── authValidator.js     # Auth input validation
│   │   └── userValidator.js     # User input validation
│   └── server.js                # App entry point
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── docker-compose.yml           # Docker Compose config
├── Dockerfile                   # Docker image config
├── init.sql                     # Database initialization
├── package.json                 # Dependencies
└── README.md                    # This file
```

## 🛠️ Installation

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd project-root
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup MySQL database**
   - Create a MySQL database
   - Run the `init.sql` script to create tables
   ```bash
   mysql -u root -p myapp_db < init.sql
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

### Option 2: Docker

1. **Setup environment**
   ```bash
   cp .env.example .env
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Check logs**
   ```bash
   docker-compose logs -f app
   ```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |
| GET | `/api/auth/me` | Get current user info | Yes |

### User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |
| PUT | `/api/users/change-password` | Change password | Yes |
| DELETE | `/api/users/account` | Delete account | Yes |
| GET | `/api/users` | Get all users (admin) | Yes |
| GET | `/api/users/:id` | Get user by ID (admin) | Yes |

## 📝 API Usage Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

### Get Profile (with JWT token)
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "phone": "+1234567890"
  }'
```

## 🔒 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=myapp_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🧪 Testing

Test the API using tools like:
- **Postman**: Import the endpoints
- **cURL**: Use command line examples above
- **Thunder Client**: VS Code extension

## 🔧 Development

```bash
# Install dependencies
npm install

# Run in development mode (with auto-reload)
npm run dev

# Run in production mode
npm start
```

## 📦 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Email**: Nodemailer
- **Security**: Helmet, CORS
- **DevOps**: Docker, Docker Compose

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📧 Email Configuration

For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an "App Password"
3. Use the app password in `EMAIL_PASSWORD`

## 🚨 Important Notes

- Change `JWT_SECRET` in production
- Use strong passwords for database
- Enable SSL/TLS for production
- Implement rate limiting for production
- Add role-based access control for admin routes
- Set up proper CORS origins for production

## 🎯 Next Steps

Consider adding:
- [ ] Role-based access control (RBAC)
- [ ] Email verification
- [ ] Refresh tokens
- [ ] Rate limiting
- [ ] File upload for avatars
- [ ] API documentation (Swagger)
- [ ] Unit and integration tests
- [ ] Logging system (Winston)
- [ ] Redis for caching

---

Made with ❤️ using Express.js and MySQL
