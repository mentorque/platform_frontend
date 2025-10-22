const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../utils/firebaseAdmin');
const apiKeysController = require('../controllers/apiKeys');

// Protected routes (require Firebase auth)
router.get('/keys', verifyFirebaseToken, apiKeysController.getApiKeys);
router.post('/keys', verifyFirebaseToken, apiKeysController.createApiKey);
router.delete('/keys/:keyId', verifyFirebaseToken, apiKeysController.deleteApiKey);

// Public route (for Chrome Extension)
router.post('/keys/validate', apiKeysController.validateApiKey);

module.exports = router;  // ⭐ THIS LINE IS CRITICAL