const jwt = require('jsonwebtoken');

const verifyToken = (token) => {
  try {
    if (!token) return null;
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified:', { decoded });
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    console.error('JWT_SECRET:', process.env.JWT_SECRET);
    return null;
  }
};

const requireAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

const optionalAuth = (req, res, next) => {
  try {
    console.log('Optional auth middleware');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token:', token ? 'present' : 'not present');
    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);
    if (decoded) {
      req.user = decoded;
    }
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth
};