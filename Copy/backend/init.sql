-- =============================================
-- Database Initialization Script
-- This creates all necessary tables for the application
-- =============================================

-- Ensure we're using the correct collation globally
ALTER DATABASE myapp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- =============================================
-- Users Table
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    wilaya VARCHAR(100),
    avatar VARCHAR(255),
    bio TEXT,
    
    -- OTP verification columns
    otp VARCHAR(6),                      -- Stores the 6-digit OTP
    otp_expires DATETIME,                -- Stores OTP expiration timestamp
    is_verified BOOLEAN DEFAULT FALSE,   -- 0 = not verified, 1 = verified
    role ENUM('user', 'admin') DEFAULT 'user',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better query performance
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Password Reset Tokens Table
-- =============================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key relationship
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Books table (catalog)
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publication_date DATE,
    cover_url TEXT
);

-- Listings table (user's book copies)
CREATE TABLE IF NOT EXISTS listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    book_condition ENUM('new','good','used') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    accept_exchange BOOLEAN DEFAULT FALSE,
    status ENUM('active','sold','deleted') DEFAULT 'active',
    photos JSON,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wish (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','paid','failed') DEFAULT 'pending',
  chargily_invoice_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  listing_id INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,

  UNIQUE (order_id, listing_id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (listing_id) REFERENCES listings(id)
);

-- =============================================
-- Cursus Table (Study Programs)
-- =============================================
CREATE TABLE IF NOT EXISTS cursus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(20),
    name VARCHAR(255),
    university VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Recommended Books Table
-- =============================================
CREATE TABLE IF NOT EXISTS recommended_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    isbn VARCHAR(20),
    cursus_id INT,
    FOREIGN KEY (cursus_id) REFERENCES cursus(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Notifications Table
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'wishlist_available', 'message', etc.
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_id INT, -- ID of the related entity (e.g., listing_id)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Ratings Table
-- =============================================
CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rater_id INT NOT NULL,
    rated_user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rated_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_rating (rater_id, rated_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Insertion des Données de Recommandation
-- =============================================

-- Insérer les Cursus (Médecine, Informatique, Architecture)
INSERT IGNORE INTO cursus (id, title, name, university) VALUES 
(1, '1ere Annee Medecine', 'Médecine L1', 'Faculté de Médecine'),
(2, '1ere Annee Informatique', 'Informatique L1', 'USTHB'),
(3, '1ere Annee Architecture', 'Architecture L1', 'EPAU');

-- Insérer les livres recommandés avec ISBN
INSERT IGNORE INTO recommended_books (title, author, isbn, cursus_id) VALUES 
('Gray''s Anatomy for Students', 'Richard Drake', '978-0323393041', 1),
('Netter''s Atlas of Human Anatomy', 'Frank H. Netter', '978-0323393225', 1),
('L''IA en Médecine : Édition 2026', 'Dr. Testeur', '978-0000000001', 1),
('Computer Science: An Overview', 'Glenn Brookshear', '978-1292061160', 2),
('Clean Code', 'Robert C. Martin', '978-0132350884', 2),
('Architecture: Form, Space, and Order', 'Francis D.K. Ching', '978-1118745083', 3),
('101 Things I Learned in Architecture School', 'Matthew Frederick', '978-0262062664', 3);

-- =============================================
-- Insert Admin User
-- =============================================
INSERT INTO users (email, password, first_name, last_name, role, is_verified) 
VALUES ('bilalbrahami026@gmail.com', '$2a$10$fn8zVu5.RAURKAUvLsNb2uHIx3a.rDh4XL3PykFKnRDKusCLac/ZK', 'Bilal', 'Admin', 'admin', 1);

-- =============================================
-- Display created tables
-- =============================================
SHOW TABLES;