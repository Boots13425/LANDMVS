import { ApplicationRepository } from '../repositories/ApplicationRepository.js'
import { query } from '../config/database.js'
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js'
import { geoJsonToLatLngRing } from '../utils/geometry.js'
import { syncPendingApplicationsFromParcels } from '../utils/applicationHelpers.js'

const applicationRepo = new ApplicationRepository()

export class OfficerController {
  // Get applications for verification
  async getApplicationsForReview(req, res) {
    try {
      await syncPendingApplicationsFromParcels()

      const limit = parseInt(req.query.limit) || 50
      const offset = parseInt(req.query.offset) || 0
      const status = req.query.status || null

      let sql = `
        SELECT 
          a.id,
          a.parcel_id,
          a.user_id,
          a.application_type,
          a.status,
          a.description,
          a.submitted_date,
          a.reviewed_date,
          a.comments,
          u.first_name,
          u.last_name,
          u.email,
          lp.name as parcel_name,
          lp.location,
          lp.area,
          ST_AsGeoJSON(lp.geometry) as geometry
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN land_parcels lp ON a.parcel_id = lp.id
      `
      const params = []
      let paramCount = 1

      if (status) {
        sql += ` WHERE a.status = $${paramCount++}`
        params.push(status)
      }

      sql += ` ORDER BY a.submitted_date DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`
      params.push(limit, offset)

      const result = await query(sql, params)
      const countResult = await query('SELECT COUNT(*) as count FROM applications')
      const total = parseInt(countResult.rows[0]?.count || 0)

      const formatted = result.rows.map(app => ({
        id: app.id,
        parcelId: app.parcel_id,
        userId: app.user_id,
        applicantName: `${app.first_name} ${app.last_name}`,
        applicantEmail: app.email,
        applicationType: app.application_type,
        status: app.status,
        description: app.description,
        parcelName: app.parcel_name,
        location: app.location,
        area: app.area,
        submittedDate: app.submitted_date,
        reviewedDate: app.reviewed_date,
        comments: app.comments,
        geometry: geoJsonToLatLngRing(app.geometry)
      }))

      sendPaginated(res, formatted, total, Math.floor(offset / limit) + 1, limit)
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  async getApplicationDetail(req, res) {
    try {
      const { applicationId } = req.params

      const result = await query(`
        SELECT 
          a.id,
          a.parcel_id,
          a.user_id,
          a.application_type,
          a.status,
          a.description,
          a.submitted_date,
          a.reviewed_date,
          a.reviewed_by,
          a.comments,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          u.organization,
          lp.name as parcel_name,
          lp.location,
          lp.area,
          lp.description as parcel_description,
          lp.status as parcel_status,
          ST_AsGeoJSON(lp.geometry) as geometry,
          json_agg(
            json_build_object(
              'id', d.id,
              'fileName', d.file_name,
              'fileType', d.file_type,
              'documentType', d.document_type,
              'status', d.status,
              'createdAt', d.created_at
            )
          ) FILTER (WHERE d.id IS NOT NULL) as documents
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN land_parcels lp ON a.parcel_id = lp.id
        LEFT JOIN documents d ON a.id = d.application_id
        WHERE a.id = $1
        GROUP BY a.id, u.id, lp.id
      `, [parseInt(applicationId)])

      if (result.rows.length === 0) {
        return sendError(res, 'Application not found', 404)
      }

      const app = result.rows[0]
      const formatted = {
        id: app.id,
        parcelId: app.parcel_id,
        userId: app.user_id,
        applicantName: `${app.first_name} ${app.last_name}`,
        applicantEmail: app.email,
        applicantPhone: app.phone,
        applicantOrganization: app.organization,
        applicationType: app.application_type,
        status: app.status,
        description: app.description,
        parcelName: app.parcel_name,
        location: app.location,
        area: app.area,
        parcelDescription: app.parcel_description,
        parcelStatus: app.parcel_status,
        geometry: geoJsonToLatLngRing(app.geometry),
        submittedDate: app.submitted_date,
        reviewedDate: app.reviewed_date,
        reviewedBy: app.reviewed_by,
        comments: app.comments,
        documents: app.documents || []
      }

      sendSuccess(res, formatted)
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  async reviewApplication(req, res) {
    try {
      const { applicationId } = req.params
      const { status, comments } = req.body

      if (!['approved', 'rejected', 'under_review'].includes(status)) {
        return sendError(res, 'Invalid status', 400)
      }

      const result = await query(`
        UPDATE applications 
        SET 
          status = $1,
          comments = $2,
          reviewed_by = $3,
          reviewed_date = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `, [status, comments, req.user.userId, parseInt(applicationId)])

      if (result.rows.length === 0) {
        return sendError(res, 'Application not found', 404)
      }

      // Log audit event
      await this.logAuditEvent(req.user.userId, `REVIEW_APPLICATION_${status.toUpperCase()}`, 'applications', applicationId, { status, comments })

      // If approved, create verification log
      if (status === 'approved') {
        await query(`
          INSERT INTO verification_logs (application_id, officer_id, action, status, remarks)
          VALUES ($1, $2, $3, $4, $5)
        `, [applicationId, req.user.userId, 'APPROVED', 'completed', comments])
      }

      sendSuccess(res, result.rows[0], `Application ${status}`)
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  async getVerificationStats(req, res) {
    try {
      const pendingCount = await query("SELECT COUNT(*) as count FROM applications WHERE status = 'pending'")
      const underReviewCount = await query("SELECT COUNT(*) as count FROM applications WHERE status = 'under_review'")
      const approvedCount = await query("SELECT COUNT(*) as count FROM applications WHERE status = 'approved'")
      const rejectedCount = await query("SELECT COUNT(*) as count FROM applications WHERE status = 'rejected'")

      sendSuccess(res, {
        pending: parseInt(pendingCount.rows[0]?.count || 0),
        underReview: parseInt(underReviewCount.rows[0]?.count || 0),
        approved: parseInt(approvedCount.rows[0]?.count || 0),
        rejected: parseInt(rejectedCount.rows[0]?.count || 0),
        total: parseInt(pendingCount.rows[0]?.count || 0) + 
               parseInt(underReviewCount.rows[0]?.count || 0) + 
               parseInt(approvedCount.rows[0]?.count || 0) + 
               parseInt(rejectedCount.rows[0]?.count || 0)
      })
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  // Helper method to log audit events
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
