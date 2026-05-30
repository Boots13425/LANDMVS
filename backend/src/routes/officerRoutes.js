import express from 'express'
import { OfficerController } from '../controllers/OfficerController.js'
import { authenticateToken, authorizeRole } from '../middleware/auth.js'

const router = express.Router()
const officerController = new OfficerController()

// All officer routes require authentication and officer role
router.use(authenticateToken)
router.use(authorizeRole('officer', 'admin'))

// Applications for review
router.get('/applications', (req, res) => officerController.getApplicationsForReview(req, res))
router.get('/applications/:applicationId', (req, res) => officerController.getApplicationDetail(req, res))
router.patch('/applications/:applicationId/review', (req, res) => officerController.reviewApplication(req, res))

// Statistics
router.get('/stats', (req, res) => officerController.getVerificationStats(req, res))

export default router
