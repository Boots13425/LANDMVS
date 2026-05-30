import { verifyToken, extractToken } from '../utils/jwt.js'
import { sendError } from '../utils/response.js'

export const authenticateToken = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization)

    if (!token) {
      return sendError(res, 'No token provided', 401)
    }

    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    sendError(res, 'Invalid or expired token', 401)
  }
}

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401)
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Insufficient permissions', 403)
    }

    next()
  }
}

export const optionalAuth = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization)
    if (token) {
      const decoded = verifyToken(token)
      req.user = decoded
    }
  } catch (error) {
    console.log('Optional auth failed:', error.message)
  }
  next()
}
