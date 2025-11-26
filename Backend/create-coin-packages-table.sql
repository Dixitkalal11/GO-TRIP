-- Create coin_packages table
CREATE TABLE IF NOT EXISTS coin_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  type ENUM('starter', 'standard', 'premium', 'vip', 'special') NOT NULL DEFAULT 'starter',
  discount DECIMAL(5,2) DEFAULT 0,
  description TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  isPopular BOOLEAN DEFAULT FALSE,
  sales INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample coin packages
INSERT INTO coin_packages (name, amount, price, type, discount, description, isActive, isPopular, sales) VALUES
('Starter Pack', 100, 99.00, 'starter', 0, 'Perfect for trying out our services', TRUE, TRUE, 1250),
('Standard Bundle', 500, 399.00, 'standard', 10, 'Great value for regular users', TRUE, TRUE, 890),
('Premium Package', 1000, 699.00, 'premium', 15, 'Best value for frequent travelers', TRUE, FALSE, 456),
('VIP Elite', 2500, 1499.00, 'vip', 20, 'Exclusive package for VIP members', TRUE, FALSE, 234),
('Special Offer', 2000, 999.00, 'special', 25, 'Limited time special offer', TRUE, TRUE, 678),
('Mini Pack', 50, 49.00, 'starter', 0, 'Small pack for light users', FALSE, FALSE, 123);
