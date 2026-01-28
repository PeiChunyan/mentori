-- Add OAuth and verification fields to users table (if not already present)
DO $$
BEGIN
    -- Add provider column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='provider'
    ) THEN
        ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'local';
    END IF;

    -- Add provider_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='provider_id'
    ) THEN
        ALTER TABLE users ADD COLUMN provider_id VARCHAR(255);
    END IF;

    -- Add is_verified column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='is_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create index for OAuth lookups (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_users_provider_user ON users(provider, provider_id);

-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for verification lookups (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires ON email_verifications(expires_at);
