CREATE TABLE users (
    id            CHAR(36)       NOT NULL PRIMARY KEY,
    name          VARCHAR(100)   NOT NULL,
    email         VARCHAR(150)   NOT NULL UNIQUE,
    password_hash VARCHAR(255)   NOT NULL,
    monthly_income       DECIMAL(15,2),
    monthly_expenses     DECIMAL(15,2),
    monthly_sip_commitment  DECIMAL(15,2),
    emergency_buffer_target DECIMAL(15,2),
    dependents    INT,
    created_at    DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_users_email (email)
);

CREATE TABLE loans (
    id            CHAR(36)       NOT NULL PRIMARY KEY,
    user_id       CHAR(36)       NOT NULL,
    loan_type     VARCHAR(20)    NOT NULL,
    principal     DECIMAL(15,2)  NOT NULL,
    interest_rate DECIMAL(5,2)   NOT NULL,
    tenure_months INT            NOT NULL,
    start_date    DATE           NOT NULL,
    active        TINYINT(1)     NOT NULL DEFAULT 1,
    lender_name   VARCHAR(100),
    notes         TEXT,
    created_at    DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_loans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_loans_user_active (user_id, active)
);

CREATE TABLE stress_scenarios (
    id              CHAR(36)      NOT NULL PRIMARY KEY,
    user_id         CHAR(36)      NOT NULL,
    scenario_type   VARCHAR(30)   NOT NULL,
    parameter_delta DECIMAL(10,2),
    result_json     TEXT,
    risk_band       VARCHAR(10),
    created_at      DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_stress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_stress_user (user_id)
);

CREATE TABLE reports (
    id            CHAR(36)       NOT NULL PRIMARY KEY,
    user_id       CHAR(36)       NOT NULL,
    s3_key        VARCHAR(255),
    signed_url    TEXT,
    health_grade  VARCHAR(5),
    dti_ratio     DECIMAL(5,2),
    generated_at  DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reports_user (user_id)
);
