-- Clean initial schema for a brand-new MySQL 8 database (including phpMyAdmin).
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE schema_migrations (
  name VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_expiry (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE albums (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE photos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  storage_key VARCHAR(500) NOT NULL UNIQUE,
  original_filename VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  width INT UNSIGNED NULL,
  height INT UNSIGNED NULL,
  display_date DATETIME NULL,
  caption TEXT NULL,
  note TEXT NULL,
  place VARCHAR(255) NULL,
  album_id BIGINT UNSIGNED NULL,
  alt_text VARCHAR(500) NULL,
  visibility ENUM('public','private') NOT NULL DEFAULT 'private',
  sort_order INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_photos_visibility_date (visibility, display_date DESC),
  INDEX idx_photos_album (album_id),
  CONSTRAINT fk_photos_album FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE log_entries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_date DATETIME NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NULL,
  related_url VARCHAR(1000) NULL,
  photo_id BIGINT UNSIGNED NULL,
  visibility ENUM('public','private') NOT NULL DEFAULT 'private',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_log_visibility_date (visibility, event_date DESC),
  CONSTRAINT fk_log_photo FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE now_content (
  id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  working_on TEXT NOT NULL,
  learning TEXT NOT NULL,
  lately TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE about_content (
  id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  intro TEXT NOT NULL,
  extended_text TEXT NULL,
  portrait_photo_id BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_about_portrait FOREIGN KEY (portrait_photo_id) REFERENCES photos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE about_links (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  url VARCHAR(1000) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE site_settings (
  id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  hero_photo_id BIGINT UNSIGNED NULL,
  hero_headline TEXT NOT NULL,
  hero_copy TEXT NOT NULL,
  footer_text VARCHAR(500) NOT NULL,
  footer_contact VARCHAR(500) NULL,
  photo_hero_id BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_settings_hero FOREIGN KEY (hero_photo_id) REFERENCES photos(id) ON DELETE SET NULL,
  CONSTRAINT fk_settings_photo_hero FOREIGN KEY (photo_hero_id) REFERENCES photos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO now_content (id, working_on, learning, lately) VALUES (1, '', '', '');
INSERT INTO about_content (id, intro, extended_text) VALUES (1, '', '');
INSERT INTO site_settings (id, hero_headline, hero_copy, footer_text) VALUES
  (1, 'A place for the things I make, do, and want to remember.', 'This is my personal site for current projects, photos, notes, and life updates.', 'Thanks for stopping by.');
INSERT INTO schema_migrations (name) VALUES ('001_initial.sql');
INSERT INTO about_links (label,url,sort_order) VALUES
  ('Instagram','https://www.instagram.com/',1),
  ('X','https://x.com/home',2),
  ('LinkedIn','https://www.linkedin.com/in/westin-perry-2a9750285/',3);
INSERT INTO schema_migrations (name) VALUES ('002_social_links.sql');

SET FOREIGN_KEY_CHECKS = 1;
