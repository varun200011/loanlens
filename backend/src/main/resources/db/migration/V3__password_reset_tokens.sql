CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id CHAR(36) NOT NULL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    INDEX idx_token (token),
    INDEX idx_email (email)
);
