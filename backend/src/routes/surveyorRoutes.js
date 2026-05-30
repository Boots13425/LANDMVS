import express from 'express'
import { SurveyorController } from '../controllers/SurveyorController.js'
import { authenticateToken, authorizeRole } from '../middleware/auth.js'

const router = express.Router()
const surveyorController = new SurveyorController()

// All surveyor routes require authentication and surveyor role
router.use(authenticateToken)
router.use(authorizeRole('surveyor', 'admin'))

// Parcel upload and management
router.post('/parcels/upload', (req, res) => surveyorController.uploadParcelData(req, res))
router.get('/parcels', (req, res) => surveyorController.getSurveyorParcels(req, res))
router.get('/parcels/:parcelId', (req, res) => surveyorController.getParcelDetail(req, res))
router.patch('/parcels/:parcelId/boundary', (req, res) => surveyorController.updateParcelBoundary(req, res))
router.patch('/parcels/:parcelId/status', (req, res) => surveyorController.updateParcelStatus(req, res))

// Statistics
router.get('/stats', (req, res) => surveyorController.getSurveyorStats(req, res))

// Landowners list (for assigning parcels)
router.get('/landowners', (req, res) => surveyorController.getLandowners(req, res))

export default router
