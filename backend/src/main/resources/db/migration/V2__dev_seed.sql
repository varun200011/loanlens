-- Dev seed data (only loaded in dev profile via Spring conditional)
-- In prod, Flyway skips this via spring.flyway.locations override

INSERT IGNORE INTO users (id, name, email, password_hash, monthly_income, monthly_expenses,
    monthly_sip_commitment, emergency_buffer_target, dependents)
VALUES (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Demo User',
    'demo@loanlens.app',
    -- BCrypt of 'Demo@1234'
    '$2a$12$LMh9yFB8RFHrqr.XUJkpleqQ2XJvQN5UHQxQEG7dKRXJvPR2QKFBS',
    80000.00, 25000.00, 5000.00, 300000.00, 2
);

INSERT IGNORE INTO loans (id, user_id, loan_type, principal, interest_rate, tenure_months, start_date, active, lender_name)
VALUES
    ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
     'HOME', 4000000.00, 8.50, 240, '2022-04-01', 1, 'HDFC Bank'),
    ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001',
     'CAR', 700000.00, 9.00, 60, '2023-01-01', 1, 'ICICI Bank'),
    ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001',
     'PERSONAL', 200000.00, 14.00, 36, '2024-06-01', 1, 'Bajaj Finance');
