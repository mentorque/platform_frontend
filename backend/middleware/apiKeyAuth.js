const prisma = require('../utils/prisma');

/**
 * Middleware to authenticate requests using API key
 * Use this for Chrome Extension endpoints
 */
async function authenticateApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key is required',
        message: 'Please provide an API key in the x-api-key header or Authorization header'
      });
    }

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

    if (!key || !key.isActive) {
      return res.status(401).json({ 
        error: 'Invalid or inactive API key',
        message: 'The provided API key is not valid or has been deactivated'
      });
    }

    // Update last used timestamp (non-blocking)
    prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    }).catch(err => console.error('Error updating lastUsedAt:', err));

    // Attach user info to request
    req.user = key.user;
    req.apiKeyId = key.id;
    
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: 'An error occurred while validating your API key'
    });
  }
}

module.exports = { authenticateApiKey };