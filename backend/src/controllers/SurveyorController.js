import { LandParcelRepository } from '../repositories/LandParcelRepository.js'
import { query } from '../config/database.js'
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js'
import { geoJsonToLatLngRing } from '../utils/geometry.js'
import { ensureVerificationApplication } from '../utils/applicationHelpers.js'

const landParcelRepo = new LandParcelRepository()

export class SurveyorController {
  // Upload/Create parcel data
  async uploadParcelData(req, res) {
    try {
      const { name, location, area, description, geometry, ownerId } = req.body

      if (!name || !location || !area || !geometry) {
        return sendError(res, 'Missing required fields', 400)
      }

      if (!ownerId && req.user.role === 'surveyor') {
        return sendError(res, 'Land owner (ownerId) is required', 400)
      }

      const userId = ownerId ? parseInt(ownerId, 10) : req.user.userId

      const parcel = await landParcelRepo.create({
        ownerId: userId,
        name,
        location,
        area: parseFloat(area),
        description,
        geometry
      })

      await ensureVerificationApplication(
        parcel.id,
        userId,
        description || `Surveyor-uploaded parcel: ${name}`
      )

      await this.logAuditEvent(req.user.userId, 'UPLOAD_PARCEL', 'land_parcels', parcel.id, {
        name,
        location,
        area
      })

      sendSuccess(res, this.formatParcel(parcel), 'Parcel uploaded successfully', 201)
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  // Draw/Update boundaries
  async updateParcelBoundary(req, res) {
    try {
      const { parcelId } = req.params
      const { geometry } = req.body

      if (!geometry || geometry.length < 3) {
        return sendError(res, 'Invalid geometry', 400)
      }

      const parcel = await landParcelRepo.findById(parseInt(parcelId))
      if (!parcel) {
        return sendError(res, 'Parcel not found', 404)
      }

      const updated = await landParcelRepo.update(parseInt(parcelId), {
        geometry
      })

      // Log audit event
      await this.logAuditEvent(req.user.userId, 'UPDATE_BOUNDARY', 'land_parcels', parcelId, {
        previousGeometry: parcel.geometry,
        newGeometry: geometry
      })

      sendSuccess(res, this.formatParcel(updated), 'Boundary updated successfully')
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  // Get surveyor's parcels
  async getSurveyorParcels(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50
      const offset = parseInt(req.query.offset) || 0
      const status = req.query.status || null

      let sql = `
        SELECT 
          id,
          owner_id,
          name,
          location,
          area,
          description,
          status,
          ST_AsGeoJSON(geometry) as geometry,
          created_at,
          updated_at
        FROM land_parcels
      `
      const params = []
      let paramCount = 1
      const conditions = []

      if (status) {
        conditions.push(`status = $${paramCount++}`)
        params.push(status)
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ')
      }

      sql += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`
      params.push(limit, offset)

      const result = await query(sql, params)
      const countResult = await query('SELECT COUNT(*) as count FROM land_parcels')
      const total = parseInt(countResult.rows[0]?.count || 0)

      const formatted = result.rows.map(p => this.formatParcel(p))
      sendPaginated(res, formatted, total, Math.floor(offset / limit) + 1, limit)
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  // Get parcel detail with ownership and application info
  async getParcelDetail(req, res) {
    try {
      const { parcelId } = req.params

      const result = await query(`
        SELECT 
          lp.id,
          lp.owner_id,
          lp.name,
          lp.location,
          lp.area,
          lp.description,
          lp.status,
          ST_AsGeoJSON(lp.geometry) as geometry,
          lp.created_at,
          lp.updated_at,
          u.first_name,
          u.last_name,
          u.email,
          json_agg(
            json_build_object(
              'id', a.id,
              'type', a.application_type,
              'status', a.status,
              'submittedDate', a.submitted_date,
              'description', a.description
            )
          ) FILTER (WHERE a.id IS NOT NULL) as applications
        FROM land_parcels lp
        LEFT JOIN users u ON lp.owner_id = u.id
        LEFT JOIN applications a ON lp.id = a.parcel_id
        WHERE lp.id = $1
        GROUP BY lp.id, u.id
      `, [parseInt(parcelId)])

      if (result.rows.length === 0) {
        return sendError(res, 'Parcel not found', 404)
      }

      const parcel = result.rows[0]
      const formatted = {
        id: parcel.id,
        ownerId: parcel.owner_id,
        ownerName: `${parcel.first_name} ${parcel.last_name}`,
        ownerEmail: parcel.email,
        name: parcel.name,
        location: parcel.location,
        area: parcel.area,
        description: parcel.description,
        status: parcel.status,
        geometry: geoJsonToLatLngRing(parcel.geometry),
        createdAt: parcel.created_at,
        updatedAt: parcel.updated_at,
        applications: parcel.applications || []
      }

      sendSuccess(res, formatted)
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  // Update parcel status (verified, approved, rejected)
  async updateParcelStatus(req, res) {
    try {
      const { parcelId } = req.params
      const { status } = req.body

      if (!['pending', 'verified', 'approved', 'rejected'].includes(status)) {
        return sendError(res, 'Invalid status', 400)
      }

      const parcel = await landParcelRepo.findById(parseInt(parcelId))
      if (!parcel) {
        return sendError(res, 'Parcel not found', 404)
      }

      const updated = await landParcelRepo.update(parseInt(parcelId), {
        status
      })

      // Log audit event
      await this.logAuditEvent(req.user.userId, `UPDATE_PARCEL_STATUS_${status.toUpperCase()}`, 'land_parcels', parcelId, {
        status
      })

      sendSuccess(res, this.formatParcel(updated), `Parcel status updated to ${status}`)
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  async getLandowners(req, res) {
    try {
      const result = await query(
        `SELECT id, first_name, last_name, email FROM users WHERE role = 'landowner' ORDER BY first_name`
      )
      const formatted = result.rows.map((u) => ({
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        email: u.email
      }))
      sendSuccess(res, formatted)
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  // Get surveyor statistics
  async getSurveyorStats(req, res) {
    try {
      const todayResult = await query(`
        SELECT COUNT(*) as count 
        FROM land_parcels 
        WHERE DATE(created_at) = CURRENT_DATE
      `)
      
      const totalResult = await query("SELECT COUNT(*) as count FROM land_parcels")
      
      const verifiedResult = await query("SELECT COUNT(*) as count FROM land_parcels WHERE status = 'verified'")
      
      const pendingResult = await query("SELECT COUNT(*) as count FROM land_parcels WHERE status IN ('pending', 'approved')")

      sendSuccess(res, {
        uploadedToday: parseInt(todayResult.rows[0]?.count || 0),
        totalParcels: parseInt(totalResult.rows[0]?.count || 0),
        verifiedParcels: parseInt(verifiedResult.rows[0]?.count || 0),
        pendingVerification: parseInt(pendingResult.rows[0]?.count || 0)
      })
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  // Helper methods
  formatParcel(parcel) {
    return {
      id: parcel.id,
      ownerId: parcel.owner_id,
      name: parcel.name,
      location: parcel.location,
      area: parcel.area,
      description: parcel.description,
      status: parcel.status,
      geometry: geoJsonToLatLngRing(parcel.geometry),
      createdAt: parcel.created_at,
      updatedAt: parcel.updated_at
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
