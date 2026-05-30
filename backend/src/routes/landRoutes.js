import express from 'express'
import { LandController } from '../controllers/LandController.js'
import { authenticateToken, authorizeRole } from '../middleware/auth.js'

const router = express.Router()
const landController = new LandController()

// Protected routes - all require authentication
router.use(authenticateToken)

// Parcel routes
router.post('/parcels', (req, res) => landController.createParcel(req, res))
router.get('/parcels', (req, res) => landController.getParcels(req, res))
router.get('/parcels/:parcelId', (req, res) => landController.getParcel(req, res))
router.put('/parcels/:parcelId', (req, res) => landController.updateParcel(req, res))
router.delete('/parcels/:parcelId', (req, res) => landController.deleteParcel(req, res))
router.post('/parcels/spatial-query', (req, res) => landController.spatialQuery(req, res))

// Application routes
router.post('/applications', (req, res) => landController.createApplication(req, res))
router.get('/applications', (req, res) => landController.getApplications(req, res))
router.get('/applications/:applicationId', (req, res) => landController.getApplication(req, res))
router.patch('/applications/:applicationId/status', authorizeRole('officer', 'admin'), (req, res) => landController.updateApplicationStatus(req, res))

export default router
