const prisma = require('../src/utils/prisma');
const admin = require('firebase-admin');

/**
 * Middleware to authenticate requests using Firebase token
 * Use this for web app endpoints
 */
async function authenticateFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authorization token is required',
        message: 'Please provide a valid Firebase token in the Authorization header'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find user by firebaseUid
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        fullName: true,
      },
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        message: 'User account not found in database'
      });
    }

    // Attach user info to request
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Firebase token authentication error:', error);
    res.status(401).json({ 
      error: 'Invalid token',
      message: 'The provided token is invalid or expired'
    });
  }
}

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

module.exports = { authenticateApiKey, authenticateFirebaseToken };