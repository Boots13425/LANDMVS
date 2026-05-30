import express from 'express'
import { DocumentController } from '../controllers/DocumentController.js'
import { authenticateToken, authorizeRole } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()
const documentController = new DocumentController()

// All document routes require authentication
router.use(authenticateToken)

// Document statistics (admin only) - before /:documentId routes
router.get('/stats', authorizeRole('admin'), (req, res) => documentController.getDocumentStats(req, res))

// Upload documents (multipart)
router.post('/upload', upload.single('file'), (req, res) => documentController.uploadDocument(req, res))

// Get user documents
router.get('/my-documents', (req, res) => documentController.getUserDocuments(req, res))

// Get application documents
router.get('/applications/:applicationId', (req, res) => documentController.getApplicationDocuments(req, res))

// Get parcel documents
router.get('/parcels/:parcelId', (req, res) => documentController.getParcelDocuments(req, res))

// Delete document (owner or admin only)
router.delete('/:documentId', (req, res) => documentController.deleteDocument(req, res))

// Verify document (officer or admin only)
router.patch('/:documentId/verify', authorizeRole('officer', 'admin'), (req, res) => documentController.verifyDocument(req, res))

export default router
