USE eduthrift;

SET @add_seller_verified = (
    SELECT IF(COUNT(*) = 0,
        'ALTER TABLE users ADD COLUMN seller_verified BOOLEAN DEFAULT FALSE',
        'SELECT 1')
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'seller_verified'
);
PREPARE s FROM @add_seller_verified;
EXECUTE s;
DEALLOCATE PREPARE s;

SET @add_bank_url = (
    SELECT IF(COUNT(*) = 0,
        'ALTER TABLE users ADD COLUMN bank_confirmation_url VARCHAR(500)',
        'SELECT 1')
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'bank_confirmation_url'
);
PREPARE s FROM @add_bank_url;
EXECUTE s;
DEALLOCATE PREPARE s;

UPDATE users SET verification_status = 'unverified'
WHERE verification_status IS NULL OR verification_status = '';

ALTER TABLE users
MODIFY COLUMN verification_status VARCHAR(20) NOT NULL DEFAULT 'unverified';

UPDATE users
SET verification_status = 'unverified'
WHERE verification_status = 'pending'
  AND id_document_url IS NULL
  AND proof_of_address_url IS NULL
  AND bank_confirmation_url IS NULL
  AND seller_verified = FALSE;

UPDATE users SET seller_verified = TRUE, verification_status = 'verified'
WHERE user_type = 'ADMIN' AND seller_verified = FALSE;
