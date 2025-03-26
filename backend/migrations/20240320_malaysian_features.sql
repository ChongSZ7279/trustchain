-- User Verifications Table
CREATE TABLE user_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    ic_number VARCHAR(14) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    id_image_path VARCHAR(255) NOT NULL,
    selfie_image_path VARCHAR(255) NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    verification_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add MyKad related fields to users table
ALTER TABLE users
ADD COLUMN ic_number VARCHAR(14),
ADD COLUMN is_mykad_verified BOOLEAN DEFAULT FALSE;

-- Charity Verifications Table
CREATE TABLE charity_verifications (
    id SERIAL PRIMARY KEY,
    charity_id INTEGER REFERENCES charities(id),
    ssm_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    ssm_registration_number VARCHAR(50),
    ssm_verification_date TIMESTAMP,
    ssm_expiry_date TIMESTAMP,
    ros_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    ros_registration_number VARCHAR(50),
    ros_verification_date TIMESTAMP,
    ros_expiry_date TIMESTAMP,
    lhdn_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    lhdn_registration_number VARCHAR(50),
    lhdn_verification_date TIMESTAMP,
    lhdn_expiry_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Charity Documents Table
CREATE TABLE charity_documents (
    id SERIAL PRIMARY KEY,
    charity_id INTEGER REFERENCES charities(id),
    document_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add Malaysian-specific fields to charities table
ALTER TABLE charities
ADD COLUMN tax_exemption_ref VARCHAR(50),
ADD COLUMN sdg_goals INTEGER[],
ADD COLUMN region_data JSONB,
ADD COLUMN beneficiaries_count INTEGER DEFAULT 0;

-- Add Malaysian-specific fields to tasks table
ALTER TABLE tasks
ADD COLUMN region VARCHAR(50),
ADD COLUMN verification_document VARCHAR(255),
ADD COLUMN verification_notes TEXT,
ADD COLUMN estimated_completion_date TIMESTAMP; 