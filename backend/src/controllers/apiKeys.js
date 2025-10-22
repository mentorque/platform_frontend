const prisma = require('../utils/prisma');
const crypto = require('crypto');

/**
 * Generate a secure API key with mq_ prefix
 * Format: mq_[64 character hex string]
 */
function generateApiKey() {
  const randomBytes = crypto.randomBytes(32);
  const hexString = randomBytes.toString('hex');
  return `mq_${hexString}`;
}

/**
 * Get or create user in PostgreSQL database
 * Syncs with Firebase user
 */
async function getOrCreateUser(firebaseUid, email, fullName = null) {
  try {
    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      // Create new user
      console.log(`Creating new user for Firebase UID: ${firebaseUid}`);
      user = await prisma.user.create({
        data: {
          firebaseUid,
          email,
          fullName,
        },
      });
      console.log(`✅ User created: ${user.email}`);
    }

    return user;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw error;
  }
}

/**
 * GET /api/keys
 * Get all API keys for authenticated user
 * Requires: Firebase token
 */
exports.getApiKeys = async (req, res) => {
  try {
    const { uid, email } = req.user;
    
    console.log(`📋 Fetching API keys for user: ${email}`);
    
    // Get or create user in database
    const user = await getOrCreateUser(uid, email);

    // Fetch all active API keys for this user
    const apiKeys = await prisma.apiKey.findMany({
      where: { 
        userId: user.id,
        isActive: true 
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`✅ Found ${apiKeys.length} API keys`);

    // Format response
    const formattedKeys = apiKeys.map(key => ({
      id: key.id,
      key: key.key,
      name: key.name,
      createdAt: key.createdAt.toISOString(),
      lastUsed: key.lastUsedAt ? key.lastUsedAt.toISOString() : null,
    }));

    res.json({ keys: formattedKeys });
  } catch (error) {
    console.error('❌ Error fetching API keys:', error);
    res.status(500).json({ 
      error: 'Failed to fetch API keys',
      message: error.message 
    });
  }
};

/**
 * POST /api/keys
 * Create a new API key for authenticated user
 * Requires: Firebase token, { name: string } in body
 */
exports.createApiKey = async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { name } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Key name is required',
        message: 'Please provide a name for your API key'
      });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({ 
        error: 'Key name too long',
        message: 'Key name must be 50 characters or less'
      });
    }

    console.log(`🔑 Creating API key for user: ${email}, name: ${name}`);

    // Get or create user in database
    const user = await getOrCreateUser(uid, email);

    // Check if user already has 5 keys (optional limit)
    const existingKeys = await prisma.apiKey.count({
      where: { 
        userId: user.id,
        isActive: true 
      },
    });

    if (existingKeys >= 5) {
      console.log(`⚠️  User ${email} has reached API key limit`);
      return res.status(400).json({ 
        error: 'Maximum number of API keys reached',
        message: 'You can have a maximum of 5 active API keys. Please delete an existing key first.'
      });
    }

    // Generate new secure API key
    const apiKey = generateApiKey();
    console.log(`Generated API key: ${apiKey.substring(0, 12)}...`);

    // Create in database
    const newKey = await prisma.apiKey.create({
      data: {
        key: apiKey,
        name: name.trim(),
        userId: user.id,
      },
    });

    console.log(`✅ API key created successfully: ${newKey.id}`);

    // Return the full key (only time it's visible)
    res.status(201).json({
      key: {
        id: newKey.id,
        key: newKey.key,
        name: newKey.name,
        createdAt: newKey.createdAt.toISOString(),
        lastUsed: null,
      },
    });
  } catch (error) {
    console.error('❌ Error creating API key:', error);
    res.status(500).json({ 
      error: 'Failed to create API key',
      message: error.message 
    });
  }
};

/**
 * DELETE /api/keys/:keyId
 * Delete (soft delete) an API key
 * Requires: Firebase token
 */
exports.deleteApiKey = async (req, res) => {
  try {
    const { uid } = req.user;
    const { keyId } = req.params;

    console.log(`🗑️  Deleting API key: ${keyId}`);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'Your user account was not found in the database'
      });
    }

    // Verify the key belongs to this user
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: user.id,
      },
    });

    if (!apiKey) {
      return res.status(404).json({ 
        error: 'API key not found',
        message: 'The specified API key was not found or does not belong to you'
      });
    }

    // Soft delete - mark as inactive instead of deleting
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    });

    console.log(`✅ API key deleted: ${keyId}`);

    res.json({ 
      message: 'API key deleted successfully',
      keyId: keyId
    });
  } catch (error) {
    console.error('❌ Error deleting API key:', error);
    res.status(500).json({ 
      error: 'Failed to delete API key',
      message: error.message 
    });
  }
};

/**
 * POST /api/keys/validate
 * Validate an API key (for Chrome Extension)
 * Public endpoint - no Firebase token required
 * Requires: { apiKey: string } in body
 */
exports.validateApiKey = async (req, res) => {
  try {
    const { apiKey } = req.body;

    // Validate input
    if (!apiKey) {
      return res.status(400).json({ 
        valid: false, 
        error: 'API key is required',
        message: 'Please provide an API key to validate'
      });
    }

    console.log(`🔍 Validating API key: ${apiKey.substring(0, 12)}...`);

    // Find the API key in database
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: {
        user: {
          select: {
            id: true,
            firebaseUid: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    // Check if key exists and is active
    if (!key || !key.isActive) {
      console.log(`❌ Invalid or inactive API key`);
      return res.status(401).json({ 
        valid: false, 
        error: 'Invalid or inactive API key',
        message: 'The provided API key is not valid or has been deactivated'
      });
    }

    // Update last used timestamp (non-blocking)
    prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    }).catch(err => console.error('Error updating lastUsedAt:', err));

    console.log(`✅ API key validated for user: ${key.user.email}`);

    // Return success with user info
    res.json({
      valid: true,
      user: {
        id: key.user.id,
        email: key.user.email,
        fullName: key.user.fullName,
      },
    });
  } catch (error) {
    console.error('❌ Error validating API key:', error);
    res.status(500).json({ 
      valid: false, 
      error: 'Failed to validate API key',
      message: 'An error occurred while validating your API key'
    });
  }
};