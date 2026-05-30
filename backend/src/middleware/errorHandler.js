import { sendError } from '../utils/response.js'

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  // Validation errors
  if (err.isJoi) {
    return sendError(res, err.details[0].message, 400)
  }

  // Database errors
  if (err.code === '23505') {
    return sendError(res, 'Duplicate entry', 409)
  }

  if (err.code === '23503') {
    return sendError(res, 'Foreign key constraint violation', 400)
  }

  // Default error
  sendError(res, message, status)
}

export const notFoundHandler = (req, res) => {
  sendError(res, `Route ${req.originalUrl} not found`, 404)
}
