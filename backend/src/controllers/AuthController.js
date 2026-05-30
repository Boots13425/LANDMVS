import { AuthService } from '../services/AuthService.js'
import { sendSuccess, sendError } from '../utils/response.js'

const authService = new AuthService()

export class AuthController {
  async register(req, res) {
    try {
      const { firstName, lastName, email, password, role, phone, organization } = req.body

      if (!firstName || !lastName || !email || !password) {
        return sendError(res, 'Missing required fields', 400)
      }

      const result = await authService.register({
        firstName,
        lastName,
        email,
        password,
        role,
        phone,
        organization
      })

      sendSuccess(res, result, 'User registered successfully', 201)
    } catch (error) {
      sendError(res, error.message, error.status || 500)
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return sendError(res, 'Email and password required', 400)
      }

      const result = await authService.login(email, password)
      sendSuccess(res, result, 'Login successful')
    } catch (error) {
      sendError(res, error.message, error.status || 500)
    }
  }

  async getProfile(req, res) {
    try {
      const user = await authService.getProfile(req.user.userId)
      sendSuccess(res, user, 'Profile retrieved')
    } catch (error) {
      sendError(res, error.message, error.status || 500)
    }
  }

  async updateProfile(req, res) {
    try {
      const { firstName, lastName, phone, organization } = req.body
      const user = await authService.updateProfile(req.user.userId, {
        firstName,
        lastName,
        phone,
        organization
      })
      sendSuccess(res, user, 'Profile updated')
    } catch (error) {
      sendError(res, error.message, error.status || 500)
    }
  }

  async updateUser(req, res) {
    try {
      const { userId } = req.params
      const updates = req.body

      // Only admin or the user themselves can update
      if (req.user.role !== 'admin' && req.user.userId !== parseInt(userId)) {
        return sendError(res, 'Unauthorized', 403)
      }

      const user = await authService.updateProfile(parseInt(userId), updates)
      sendSuccess(res, user, 'User updated')
    } catch (error) {
      sendError(res, error.message, error.status || 500)
    }
  }
}
