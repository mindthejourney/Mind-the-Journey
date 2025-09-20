-- database/init.sql - Schema iniziale per Mind the Journey
-- Questo file va in: mind-the-journey/database/init.sql

USE mindthejourney_db;

-- Abilita il supporto per JSON e funzioni geografiche
SET sql_mode = '';

-- Tabella utenti
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('user', 'contributor', 'moderator', 'admin') DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    avatar_url VARCHAR(500),
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(500),
    social_links JSON,
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
);

-- Tabella temi principali
CREATE TABLE themes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    long_description LONGTEXT,
    color VARCHAR(7) NOT NULL,
    icon_url VARCHAR(255),
    banner_image VARCHAR(500),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabella paesi
CREATE TABLE countries (
    id VARCHAR(3) PRIMARY KEY, -- ISO 3166-1 alpha-3
    name VARCHAR(100) NOT NULL,
    name_local VARCHAR(100),
    iso_code_2 VARCHAR(2) NOT NULL, -- IT, FR, etc.
    continent VARCHAR(50),
    subregion VARCHAR(100),
    capital VARCHAR(100),
    currency VARCHAR(10),
    languages JSON,
    population BIGINT,
    area_km2 DECIMAL(15,2),
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    bounds JSON, -- geographical bounds
    timezone VARCHAR(50),
    flag_emoji VARCHAR(10),
    flag_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_continent (continent),
    INDEX idx_name (name)
);

-- Tabella regioni/stati/province
CREATE TABLE regions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    country_id VARCHAR(3) NOT NULL,
    parent_region_id INT NULL, -- Per gerarchie (province -> regioni)
    name VARCHAR(100) NOT NULL,
    name_local VARCHAR(100),
    type ENUM('state', 'region', 'province', 'territory', 'municipality', 'other') DEFAULT 'region',
    code VARCHAR(10), -- Codice amministrativo
    population INT,
    area_km2 DECIMAL(10,2),
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    bounds JSON, -- geographical bounds
    level INT DEFAULT 1, -- 1=regione, 2=provincia, 3=comune
    is_capital BOOLEAN DEFAULT FALSE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (country_id) REFERENCES countries(id),
    FOREIGN KEY (parent_region_id) REFERENCES regions(id),
    INDEX idx_country (country_id),
    INDEX idx_parent (parent_region_id),
    INDEX idx_type_level (type, level)
);

-- Tabella punti di interesse
CREATE TABLE points_of_interest (
    id INT PRIMARY KEY AUTO_INCREMENT,
    theme_id VARCHAR(50) NOT NULL,
    country_id VARCHAR(3),
    region_id INT,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL, -- URL-friendly name
    description TEXT,
    long_description LONGTEXT,
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    elevation_m INT,
    type VARCHAR(50), -- capitale, parco_naturale, sito_unesco, etc.
    category VARCHAR(50), -- subcategory
    significance TEXT,
    historical_period VARCHAR(100),
    population INT,
    area_km2 DECIMAL(10,2),
    established_date DATE,
    website_url VARCHAR(500),
    wikipedia_url VARCHAR(500),
    official_website VARCHAR(500),
    contact_info JSON, -- phone, email, address
    opening_hours JSON,
    entry_fee JSON, -- pricing info
    accessibility_info JSON,
    images JSON, -- Array di oggetti con url, caption, credits
    videos JSON, -- Array di video URLs
    audio_guides JSON, -- Array di guide audio
    tags JSON, -- Array di tag per ricerca
    languages JSON, -- Lingue disponibili
    rating_avg DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    favorite_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_unesco BOOLEAN DEFAULT FALSE,
    is_protected BOOLEAN DEFAULT FALSE,
    danger_level ENUM('safe', 'caution', 'dangerous') DEFAULT 'safe',
    best_visit_season JSON,
    climate_info JSON,
    status ENUM('draft', 'pending', 'published', 'hidden', 'archived') DEFAULT 'published',
    moderation_notes TEXT,
    seo_title VARCHAR(200),
    seo_description TEXT,
    seo_keywords JSON,
    created_by INT,
    updated_by INT,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (theme_id) REFERENCES themes(id),
    FOREIGN KEY (country_id) REFERENCES countries(id),
    FOREIGN KEY (region_id) REFERENCES regions(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    
    UNIQUE KEY unique_slug (slug),
    INDEX idx_theme_location (theme_id, lat, lng),
    INDEX idx_country_region (country_id, region_id),
    INDEX idx_coordinates (lat, lng),
    INDEX idx_status (status),
    INDEX idx_featured (is_featured),
    INDEX idx_rating (rating_avg),
    FULLTEXT idx_search (name, description, tags)
);

-- Tabella connessioni (archi tra punti)
CREATE TABLE connections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    theme_id VARCHAR(50) NOT NULL,
    start_point_id INT NOT NULL,
    end_point_id INT NOT NULL,
    name VARCHAR(200),
    description TEXT,
    type VARCHAR(50), -- trade_route, migration_path, cultural_link, border, etc.
    historical_period VARCHAR(100),
    color VARCHAR(7),
    animation_speed INT DEFAULT 1000,
    is_bidirectional BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (theme_id) REFERENCES themes(id),
    FOREIGN KEY (start_point_id) REFERENCES points_of_interest(id) ON DELETE CASCADE,
    FOREIGN KEY (end_point_id) REFERENCES points_of_interest(id) ON DELETE CASCADE,
    INDEX idx_theme (theme_id),
    INDEX idx_points (start_point_id, end_point_id)
);

-- Resto delle tabelle nella prossima parte...

-- Inserimento dati iniziali
INSERT INTO themes (id, name, description, color, icon_url, sort_order) VALUES
('borderscapes', 'BorderScapes', 'Esplora confini amministrativi e divisioni territoriali che definiscono nazioni, regioni e comunità', '#D9CAB3', '/icons/BS-icon.png', 1),
('wildrealms', 'Wild Realms', 'Scopri aree naturali protette, parchi nazionali e la biodiversità del nostro pianeta', '#76A989', '/icons/WR-icon.png', 2),
('livingtraditions', 'Living Traditions', 'Immergiti nelle culture viventi, tradizioni locali e patrimonio immateriale', '#C29B7F', '/icons/LT-icon.png', 3),
('mindscapes', 'Mindscapes', 'Esplora stranezze geografiche, luoghi unici e fenomeni naturali straordinari', '#AC97BC', '/icons/MS-icon.png', 4);

-- Inserimento Italia
INSERT INTO countries (id, name, name_local, iso_code_2, continent, capital, population, area_km2, lat, lng, timezone, flag_emoji) VALUES
('ITA', 'Italy', 'Italia', 'IT', 'Europe', 'Rome', 59554023, 301340, 41.8719, 12.5674, 'Europe/Rome', '🇮🇹');

-- Inserimento regioni italiane (esempi)
INSERT INTO regions (country_id, name, name_local, type, code, lat, lng, level) VALUES
('ITA', 'Lombardy', 'Lombardia', 'region', 'LOM', 45.4642, 9.1900, 1),
('ITA', 'Lazio', 'Lazio', 'region', 'LAZ', 41.9028, 12.4964, 1),
('ITA', 'Tuscany', 'Toscana', 'region', 'TOS', 43.7711, 11.2486, 1),
('ITA', 'Veneto', 'Veneto', 'region', 'VEN', 45.4299, 12.3319, 1);

-- Trigger per aggiornare le statistiche
DELIMITER //
CREATE TRIGGER update_point_stats 
AFTER INSERT ON reviews 
FOR EACH ROW
BEGIN
    UPDATE points_of_interest 
    SET rating_count = rating_count + 1,
        rating_avg = (
            SELECT AVG(rating) 
            FROM reviews 
            WHERE reviewable_type = 'point' AND reviewable_id = NEW.reviewable_id
        )
    WHERE id = NEW.reviewable_id AND NEW.reviewable_type = 'point';
END//
DELIMITER ;