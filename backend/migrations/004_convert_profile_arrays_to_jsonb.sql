-- Convert profile expertise and interests columns from text[] to JSONB
-- This migration converts array columns to JSON for better compatibility
-- Only runs if columns are still arrays

DO $$
DECLARE
    expertise_type text;
    interests_type text;
BEGIN
    -- Get the current type of expertise column
    SELECT data_type INTO expertise_type 
    FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='expertise';
    
    -- Get the current type of interests column
    SELECT data_type INTO interests_type 
    FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='interests';
    
    -- Only convert if they're still arrays (ARRAY type in PostgreSQL)
    IF expertise_type = 'ARRAY' THEN
        ALTER TABLE profiles 
            ALTER COLUMN expertise TYPE text USING array_to_string(expertise, ','),
            ALTER COLUMN expertise TYPE jsonb USING CASE 
                WHEN expertise = '' OR expertise IS NULL THEN '[]'::jsonb
                ELSE to_jsonb(string_to_array(regexp_replace(expertise, '^\{|\}$', '', 'g'), ','))
            END;
    END IF;
    
    IF interests_type = 'ARRAY' THEN
        ALTER TABLE profiles 
            ALTER COLUMN interests TYPE text USING array_to_string(interests, ','),
            ALTER COLUMN interests TYPE jsonb USING CASE 
                WHEN interests = '' OR interests IS NULL THEN '[]'::jsonb
                ELSE to_jsonb(string_to_array(regexp_replace(interests, '^\{|\}$', '', 'g'), ','))
            END;
    END IF;
END $$;
