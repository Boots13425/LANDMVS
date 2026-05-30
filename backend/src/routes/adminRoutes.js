import express from 'express'
import { AdminController } from '../controllers/AdminController.js'
import { authenticateToken, authorizeRole } from '../middleware/auth.js'

const router = express.Router()
const adminController = new AdminController()

// All admin routes require authentication and admin role
router.use(authenticateToken)
router.use(authorizeRole('admin'))

// User management
router.get('/users', (req, res) => adminController.getAllUsers(req, res))
router.get('/users/:userId', (req, res) => adminController.getUserById(req, res))
router.patch('/users/:userId/status', (req, res) => adminController.updateUserStatus(req, res))
router.delete('/users/:userId', (req, res) => adminController.deleteUser(req, res))

// Analytics
router.get('/analytics', (req, res) => adminController.getAnalytics(req, res))

// Audit logs
router.get('/audit-logs', (req, res) => adminController.getAuditLogs(req, res))

export default router
