import { query } from '../config/database.js'
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js'

export class DocumentController {
  // Upload document
  async uploadDocument(req, res) {
    try {
      const { applicationId, parcelId, documentType } = req.body
      const userId = req.user.userId
      const file = req.file

      if (!file) {
        return sendError(res, 'File is required', 400)
      }

      const fileName = file.originalname
      const fileType = file.mimetype
      const filePath = `/uploads/${file.filename}`
      const fileSize = file.size

      const result = await query(`
        INSERT INTO documents (
          application_id,
          parcel_id,
          user_id,
          file_name,
          file_path,
          file_type,
          file_size,
          document_type,
          status,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        RETURNING *
      `, [
        applicationId ? parseInt(applicationId) : null,
        parcelId ? parseInt(parcelId) : null,
        userId,
        fileName,
        filePath,
        fileType,
        fileSize,
        documentType || 'general',
        'pending'
      ])

      // Log audit event
      await this.logAuditEvent(userId, 'UPLOAD_DOCUMENT', 'documents', result.rows[0].id, {
        fileName,
        fileType,
        documentType
      })

      sendSuccess(res, this.formatDocument(result.rows[0]), 'Document uploaded successfully', 201)
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  // Get documents for application
  async getApplicationDocuments(req, res) {
    try {
      const { applicationId } = req.params
      const limit = parseInt(req.query.limit) || 50
      const offset = parseInt(req.query.offset) || 0

      const result = await query(`
        SELECT * FROM documents
        WHERE application_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `, [parseInt(applicationId), limit, offset])

      const countResult = await query(
        'SELECT COUNT(*) as count FROM documents WHERE application_id = $1',
        [parseInt(applicationId)]
      )

      const total = parseInt(countResult.rows[0]?.count || 0)
      const formatted = result.rows.map(d => this.formatDocument(d))

      sendPaginated(res, formatted, total, Math.floor(offset / limit) + 1, limit)
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  // Get documents for parcel
  async getParcelDocuments(req, res) {
    try {
      const { parcelId } = req.params
      const limit = parseInt(req.query.limit) || 50
      const offset = parseInt(req.query.offset) || 0

      const result = await query(`
        SELECT * FROM documents
        WHERE parcel_id = $1 AND application_id IS NULL
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `, [parseInt(parcelId), limit, offset])

      const countResult = await query(
        'SELECT COUNT(*) as count FROM documents WHERE parcel_id = $1 AND application_id IS NULL',
        [parseInt(parcelId)]
      )

      const total = parseInt(countResult.rows[0]?.count || 0)
      const formatted = result.rows.map(d => this.formatDocument(d))

      sendPaginated(res, formatted, total, Math.floor(offset / limit) + 1, limit)
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  // Get user's documents
  async getUserDocuments(req, res) {
    try {
      const userId = req.user.userId
      const limit = parseInt(req.query.limit) || 50
      const offset = parseInt(req.query.offset) || 0
      const status = req.query.status || null

      let sql = `
        SELECT * FROM documents
        WHERE user_id = $1
      `
      const params = [userId]
      let paramCount = 2

      if (status) {
        sql += ` AND status = $${paramCount++}`
        params.push(status)
      }

      sql += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`
      params.push(limit, offset)

      const result = await query(sql, params)

      let countSql = 'SELECT COUNT(*) as count FROM documents WHERE user_id = $1'
      const countParams = [userId]
      if (status) {
        countSql += ` AND status = $2`
        countParams.push(status)
      }
      const countResult = await query(countSql, countParams)

      const total = parseInt(countResult.rows[0]?.count || 0)
      const formatted = result.rows.map(d => this.formatDocument(d))

      sendPaginated(res, formatted, total, Math.floor(offset / limit) + 1, limit)
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  // Verify document
  async verifyDocument(req, res) {
    try {
      const { documentId } = req.params
      const { status, remarks } = req.body

      if (!['verified', 'rejected', 'pending'].includes(status)) {
        return sendError(res, 'Invalid status', 400)
      }

      // Only officers and admins can verify
      if (!['officer', 'admin'].includes(req.user.role)) {
        return sendError(res, 'Unauthorized', 403)
      }

      const result = await query(`
        UPDATE documents
        SET 
          status = $1,
          verified_by = $2,
          verified_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `, [status, req.user.userId, parseInt(documentId)])

      if (result.rows.length === 0) {
        return sendError(res, 'Document not found', 404)
      }

      // Log audit event
      await this.logAuditEvent(req.user.userId, `VERIFY_DOCUMENT_${status.toUpperCase()}`, 'documents', documentId, {
        status,
        remarks
      })

      sendSuccess(res, this.formatDocument(result.rows[0]), `Document ${status}`)
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  // Delete document
  async deleteDocument(req, res) {
    try {
      const { documentId } = req.params

      // Verify ownership
      const docResult = await query('SELECT user_id FROM documents WHERE id = $1', [parseInt(documentId)])
      if (docResult.rows.length === 0) {
        return sendError(res, 'Document not found', 404)
      }

      if (docResult.rows[0].user_id !== req.user.userId && req.user.role !== 'admin') {
        return sendError(res, 'Unauthorized', 403)
      }

      await query('DELETE FROM documents WHERE id = $1', [parseInt(documentId)])

      // Log audit event
      await this.logAuditEvent(req.user.userId, 'DELETE_DOCUMENT', 'documents', documentId, {})

      sendSuccess(res, null, 'Document deleted')
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  // Get document statistics
  async getDocumentStats(req, res) {
    try {
      const pendingResult = await query("SELECT COUNT(*) as count FROM documents WHERE status = 'pending'")
      const verifiedResult = await query("SELECT COUNT(*) as count FROM documents WHERE status = 'verified'")
      const rejectedResult = await query("SELECT COUNT(*) as count FROM documents WHERE status = 'rejected'")
      const totalResult = await query("SELECT COUNT(*) as count FROM documents")

      sendSuccess(res, {
        pending: parseInt(pendingResult.rows[0]?.count || 0),
        verified: parseInt(verifiedResult.rows[0]?.count || 0),
        rejected: parseInt(rejectedResult.rows[0]?.count || 0),
        total: parseInt(totalResult.rows[0]?.count || 0)
      })
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  // Helper methods
  formatDocument(doc) {
    return {
      id: doc.id,
      applicationId: doc.application_id,
      parcelId: doc.parcel_id,
      userId: doc.user_id,
      fileName: doc.file_name,
      filePath: doc.file_path,
      fileType: doc.file_type,
      fileSize: doc.file_size,
      documentType: doc.document_type,
      status: doc.status,
      verifiedBy: doc.verified_by,
      verifiedAt: doc.verified_at,
      createdAt: doc.created_at
    }
  }

  async logAuditEvent(userId, action, entityType, entityId, newValues) {
    try {
      await query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [userId, action, entityType, entityId, JSON.stringify(newValues)]
      )
    } catch (error) {
      console.error('Error logging audit event:', error)
    }
  }
}
