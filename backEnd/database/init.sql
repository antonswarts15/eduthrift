CREATE DATABASE IF NOT EXISTS eduthrift;
USE eduthrift;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    user_type ENUM('SELLER', 'BUYER', 'BOTH', 'ADMIN') DEFAULT 'BOTH',
    school_name VARCHAR(255),
    town VARCHAR(100),
    suburb VARCHAR(100),
    province VARCHAR(100),
    google_id VARCHAR(255),
    facebook_id VARCHAR(255),
    status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    id_document_url VARCHAR(500),
    proof_of_address_url VARCHAR(500),
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_branch_code VARCHAR(20),
    bank_account_type ENUM('savings', 'current') DEFAULT 'savings',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_google_id (google_id),
    INDEX idx_facebook_id (facebook_id),
    INDEX idx_status (status),
    INDEX idx_verification_status (verification_status)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_category_slug (category_id, slug)
);

-- Sports table
CREATE TABLE IF NOT EXISTS sports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Item types table
CREATE TABLE IF NOT EXISTS item_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    subcategory_id INT,
    sport_id INT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_subcategory (subcategory_id),
    INDEX idx_sport (sport_id)
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_type_id INT NOT NULL,
    school_name VARCHAR(255),
    club_name VARCHAR(255),
    team VARCHAR(100),
    size VARCHAR(50),
    gender ENUM('boy', 'girl', 'unisex'),
    condition_grade TINYINT CHECK (condition_grade BETWEEN 1 AND 4),
    price DECIMAL(10,2) NOT NULL,
    front_photo TEXT,
    back_photo TEXT,
    description TEXT,
    status ENUM('available', 'sold', 'reserved') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_type_id) REFERENCES item_types(id) ON DELETE CASCADE,
    INDEX idx_item_type (item_type_id),
    INDEX idx_school (school_name),
    INDEX idx_status (status)
);

-- Textbook specific fields
CREATE TABLE IF NOT EXISTS textbook_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    subject VARCHAR(255),
    grade_level VARCHAR(50),
    phase ENUM('ecd', 'foundation', 'intermediate', 'senior', 'fet'),
    publisher VARCHAR(255),
    isbn VARCHAR(20),
    language ENUM('english', 'afrikaans'),
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    item_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0,
    seller_amount DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_method ENUM('paystack', 'eft') DEFAULT 'paystack',
    payment_reference VARCHAR(255),
    shipping_address TEXT,
    pickup_point_id VARCHAR(50),
    pickup_point_name VARCHAR(255),
    shipping_method ENUM('pickup', 'address') DEFAULT 'pickup',
    tracking_reference VARCHAR(100),
    service_level_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_method (payment_method)
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_item (user_id, item_id)
);

-- Schools reference table
CREATE TABLE IF NOT EXISTS schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    province VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample schools
INSERT IGNORE INTO schools (name, province, city) VALUES
('Hoërskool Waterkloof', 'Gauteng', 'Pretoria'),
('Pretoria Boys High School', 'Gauteng', 'Pretoria'),
('Pretoria High School for Girls', 'Gauteng', 'Pretoria'),
('Affies', 'Gauteng', 'Pretoria'),
('Menlopark High School', 'Gauteng', 'Pretoria');

-- Insert categories
INSERT IGNORE INTO categories (name, slug, icon) VALUES
('School & sport uniform', 'school-sport-uniform', 'school'),
('Club clothing', 'club-clothing', 'shirt'),
('Training wear', 'training-wear', 'fitness'),
('Belts, bags & shoes', 'belts-bags-shoes', 'bag'),
('Sports equipment', 'sports-equipment', 'basketball'),
('Textbooks', 'textbooks', 'library'),
('Stationary', 'stationery', 'pencil'),
('Matric dance clothing', 'matric-dance', 'rose');

-- Insert subcategories
INSERT IGNORE INTO subcategories (category_id, name, slug) VALUES
(1, 'School Uniform', 'school-uniform'),
(1, 'Sports Uniform', 'sports-uniform');

-- Insert sports
INSERT IGNORE INTO sports (name, slug, icon) VALUES
('Rugby', 'rugby', 'football'),
('Netball', 'netball', 'basketball'),
('Hockey', 'hockey', 'construct'),
('Football', 'football', 'football'),
('Athletics', 'athletics', 'fitness'),
('Basketball', 'basketball', 'basketball'),
('Cricket', 'cricket', 'construct'),
('Swimming', 'swimming', 'water'),
('Tennis', 'tennis', 'tennisball'),
('Golf', 'golf', 'golf');

-- Insert item types for school uniforms
INSERT IGNORE INTO item_types (category_id, subcategory_id, name, slug) VALUES
(1, 1, 'Shirt short sleeve', 'shirt-short-sleeve'),
(1, 1, 'Shirt long sleeve', 'shirt-long-sleeve'),
(1, 1, 'Short pants', 'short-pants'),
(1, 1, 'Long pants', 'long-pants'),
(1, 1, 'Tie', 'tie'),
(1, 1, 'Skirt', 'skirt'),
(1, 1, 'Dress', 'dress'),
(1, 1, 'Jersey', 'jersey'),
(1, 1, 'Blazer', 'blazer'),
(1, 1, 'School shoes', 'school-shoes'),
(1, 1, 'Backpack', 'backpack');

-- Insert item types for sports uniforms
INSERT IGNORE INTO item_types (category_id, subcategory_id, sport_id, name, slug) VALUES
-- Rugby uniforms
(1, 2, 1, 'Rugby Jersey', 'rugby-jersey'),
(1, 2, 1, 'Rugby Shorts', 'rugby-shorts'),
(1, 2, 1, 'Rugby Socks', 'rugby-socks'),
(1, 2, 1, 'Match Jersey Home', 'match-jersey-home-rugby'),
(1, 2, 1, 'Match Jersey Away', 'match-jersey-away-rugby'),
(1, 2, 1, 'Training Polo', 'training-polo-rugby'),
(1, 2, 1, 'Tracksuit Top', 'tracksuit-top-rugby'),
(1, 2, 1, 'Tracksuit Pants', 'tracksuit-pants-rugby'),
(1, 2, 1, 'Team Hoodie', 'team-hoodie-rugby'),
(1, 2, 1, 'Team Blazer', 'team-blazer-rugby'),
-- Netball uniforms
(1, 2, 2, 'Netball Dress', 'netball-dress'),
(1, 2, 2, 'Netball Skirt', 'netball-skirt'),
(1, 2, 2, 'Match Dress Home', 'match-dress-home-netball'),
(1, 2, 2, 'Match Dress Away', 'match-dress-away-netball'),
(1, 2, 2, 'Training Polo', 'training-polo-netball'),
(1, 2, 2, 'Tracksuit Top', 'tracksuit-top-netball'),
(1, 2, 2, 'Team Hoodie', 'team-hoodie-netball'),
-- Hockey uniforms
(1, 2, 3, 'Hockey Jersey', 'hockey-jersey'),
(1, 2, 3, 'Hockey Shorts', 'hockey-shorts'),
(1, 2, 3, 'Hockey Skirt', 'hockey-skirt'),
(1, 2, 3, 'Match Jersey Home', 'match-jersey-home-hockey'),
(1, 2, 3, 'Match Jersey Away', 'match-jersey-away-hockey'),
(1, 2, 3, 'Training Polo', 'training-polo-hockey'),
(1, 2, 3, 'Team Blazer', 'team-blazer-hockey');

-- Insert item types for sports equipment (Rugby example)
INSERT IGNORE INTO item_types (category_id, sport_id, name, slug) VALUES
(5, 1, 'Rugby Ball', 'rugby-ball'),
(5, 1, 'Rugby Boots', 'rugby-boots'),
(5, 1, 'Scrum Cap', 'scrum-cap'),
(5, 1, 'Shoulder Pads', 'shoulder-pads');

-- Insert item types for textbooks
INSERT IGNORE INTO item_types (category_id, name, slug) VALUES
(6, 'Mathematics Textbook', 'mathematics-textbook'),
(6, 'Physical Sciences Textbook', 'physical-sciences-textbook'),
(6, 'English Textbook', 'english-textbook'),
(6, 'Life Sciences Textbook', 'life-sciences-textbook');

-- Insert item types for stationery
INSERT IGNORE INTO item_types (category_id, name, slug) VALUES
(7, 'Pencils', 'pencils'),
(7, 'Pens', 'pens'),
(7, 'Notebooks', 'notebooks'),
(7, 'Calculators', 'calculators');

-- Create additional MySQL user
CREATE USER IF NOT EXISTS 'antons'@'%' IDENTIFIED BY '@Nt0n101!';
GRANT ALL PRIVILEGES ON *.* TO 'antons'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Insert sample users (password hash for '@Nt0n101!')
INSERT IGNORE INTO users (email, password_hash, first_name, last_name, phone, user_type, school_name, status, verification_status) VALUES
('antons@eduthrift.co.za', '$2a$10$N94Wn2xngRGr9dY10vNr0OqFxVggK7mYQC0iR78FC6EkxGP3pj9I2', 'Antons', 'Swarts', '0123456789', 'ADMIN', 'Hoërskool Waterkloof', 'active', 'verified'),
('seller@example.com', '$2a$10$N94Wn2xngRGr9dY10vNr0OqFxVggK7mYQC0iR78FC6EkxGP3pj9I2', 'John', 'Seller', '0123456789', 'SELLER', 'Hoërskool Waterkloof', 'active', 'pending'),
('buyer@example.com', '$2a$10$N94Wn2xngRGr9dY10vNr0OqFxVggK7mYQC0iR78FC6EkxGP3pj9I2', 'Jane', 'Buyer', '0987654321', 'BUYER', 'Pretoria Boys High School', 'active', 'verified');

-- Insert sample items
INSERT IGNORE INTO items (user_id, item_type_id, school_name, size, gender, condition_grade, price, description, status) VALUES
-- School uniform items
(1, 1, 'Hoërskool Waterkloof', 'M', 'boy', 2, 85.00, 'White short sleeve school shirt in excellent condition', 'available'),
(1, 2, 'Hoërskool Waterkloof', 'L', 'boy', 1, 95.00, 'Brand new long sleeve school shirt', 'available'),
(1, 5, 'Hoërskool Waterkloof', 'One Size', 'unisex', 3, 45.00, 'Navy blue school tie, slightly used', 'available'),
-- Rugby sporting uniforms
(1, 12, 'Hoërskool Waterkloof', 'M', 'boy', 2, 120.00, 'Rugby jersey in excellent condition', 'available'),
(1, 13, 'Hoërskool Waterkloof', 'M', 'boy', 1, 85.00, 'Brand new rugby shorts', 'available'),
(1, 16, 'Hoërskool Waterkloof', 'L', 'boy', 2, 95.00, 'Home match jersey', 'available'),
(1, 17, 'Hoërskool Waterkloof', 'M', 'boy', 3, 90.00, 'Away match jersey', 'available'),
(1, 18, 'Hoërskool Waterkloof', 'L', 'boy', 1, 75.00, 'Training polo shirt', 'available'),
(1, 19, 'Hoërskool Waterkloof', 'M', 'boy', 2, 140.00, 'Tracksuit top', 'available'),
(1, 21, 'Hoërskool Waterkloof', 'L', 'boy', 1, 180.00, 'Team hoodie', 'available'),
-- Netball sporting uniforms
(1, 23, 'Pretoria High School for Girls', 'M', 'girl', 2, 110.00, 'Netball dress in good condition', 'available'),
(1, 25, 'Pretoria High School for Girls', 'S', 'girl', 1, 105.00, 'Home match dress', 'available'),
(1, 27, 'Pretoria High School for Girls', 'M', 'girl', 2, 80.00, 'Training polo', 'available'),
(1, 28, 'Pretoria High School for Girls', 'L', 'girl', 1, 130.00, 'Tracksuit top', 'available'),
-- Hockey sporting uniforms
(1, 30, 'Menlopark High School', 'M', 'unisex', 2, 100.00, 'Hockey jersey', 'available'),
(1, 33, 'Menlopark High School', 'L', 'boy', 1, 95.00, 'Home match jersey', 'available'),
(1, 35, 'Menlopark High School', 'M', 'girl', 2, 75.00, 'Training polo', 'available');

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    subcategory VARCHAR(255),
    sport VARCHAR(255),
    school_name VARCHAR(255),
    size VARCHAR(50),
    gender ENUM('boy', 'girl', 'unisex'),
    max_price DECIMAL(10,2),
    notify_when_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_school (school_name)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('wishlist_match', 'order_update', 'general') DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read)
);

-- Escrow transactions table
CREATE TABLE IF NOT EXISTS escrow_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    seller_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'funded', 'released', 'refunded', 'disputed') DEFAULT 'pending',
    payment_reference VARCHAR(255),
    expected_delivery_date DATE,
    auto_refund_date DATE,
    released_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_order_id (order_id),
    INDEX idx_auto_refund_date (auto_refund_date)
);

-- Disputes table
CREATE TABLE IF NOT EXISTS disputes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    dispute_type ENUM('non_delivery', 'item_not_as_described', 'damaged_item', 'other') NOT NULL,
    description TEXT,
    status ENUM('open', 'investigating', 'resolved', 'closed') DEFAULT 'open',
    resolution ENUM('refund_buyer', 'release_to_seller', 'partial_refund', 'no_action'),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_order_id (order_id)
);

-- Update database schema version
CREATE TABLE IF NOT EXISTS schema_version (
    version INT PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO schema_version (version) VALUES (2);