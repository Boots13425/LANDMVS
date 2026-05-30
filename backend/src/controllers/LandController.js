import { LandService } from '../services/LandService.js'
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js'

const landService = new LandService()

export class LandController {
  // Parcel endpoints
  async createParcel(req, res) {
    try {
      const { name, location, area, description, geometry } = req.body

      if (!name || !location || !area || !geometry) {
        return sendError(res, 'Missing required fields', 400)
      }

      const parcel = await landService.createParcel(req.user.userId, {
        name,
        location,
        area,
        description,
        geometry
      })

      sendSuccess(res, parcel, 'Parcel created successfully', 201)
    } catch (error) {
      sendError(res, error.message, error.status || 500)
    }
  }

  async getParcel(req, res) {
    try {
      const { parcelId } = req.params
      const parcel = await landService.getParcelById(parseInt(parcelId))
      sendSuccess(res, parcel, 'Parcel retrieved')
    } catch (error) {
      sendError(res, error.message, error.status || 500)
    }
  }

  async getParcels(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50
      const offset = parseInt(req.query.offset) || 0
      const status = req.query.status || null
      const userId = req.query.userId ? parseInt(req.query.userId) : null

      let parcels

      if (userId) {
        parcels = await landService.getUserParcels(userId, limit, offset)
      } else {
        parcels = await landService.getAllParcels(limit, offset, status)
      }

      const total = parcels.length
      sendPaginated(res, parcels, total, Math.floor(offset / limit) + 1, limit)
    } catch (error) {
      sendError(res, error.message, error.status || 500)
    }
  }

  async updateParcel(req, res) {
    try {
      const { parcelId } = req.params
      const updates = req.body

      const parcel = await landService.updateParcel(
        parseInt(parcelId),
        req.user.userId,
        updates
      )

      sendSuccess(res, parcel, 'Parcel updated')
    } catch (error) {
      sendError(res, error.message, error.status || 500)
    }
  }

  async deleteParcel(req, res) {
    try {
      const { parcelId } = req.params
      await landService.deleteParcel(parseInt(parcelId), req.user.userId)
      sendSuccess(res, null, 'Parcel deleted')
    } catch (error) {
      sendError(res, error.message, error.status || 500)
    }
  }

  async spatialQuery(req, res) {
    try {
      const { bounds } = req.body

      if (!bounds || !bounds.north || !bounds.south || !bounds.east || !bounds.west) {
        return sendError(res, 'Invalid bounds', 400)
      }

      const parcels = await landService.getParcelsInBounds(bounds)
      sendSuccess(res, parcels, 'Parcels retrieved')
    } catch (error) {
      sendError(res, error.message, error.status || 500)
    }
  }

  // Application endpoints
  async createApplication(req, res) {
    try {
      const { parcelId, applicationType, description } = req.body

      if (!parcelId || !applicationType) {
        return sendError(res, 'Missing required fields', 400)
      }

      const app = await landService.createApplication(req.user.userId, {
        parcelId,
        applicationType,
        description
      })

      sendSuccess(res, app, 'Application created successfully', 201)
    } catch (error) {
      sendError(res, error.message, error.status || 500)
    }
  }

  async getApplication(req, res) {
    try {
      const { applicationId } = req.params
      const app = await landService.getApplicationById(parseInt(applicationId))
      sendSuccess(res, app, 'Application retrieved')
    } catch (error) {
      sendError(res, error.message, error.status || 500)
    }
  }

  async getApplications(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50
      const offset = parseInt(req.query.offset) || 0
      const status = req.query.status || null
      const userId = req.query.userId ? parseInt(req.query.userId) : null

      let applications

      if (userId) {
        applications = await landService.getUserApplications(userId, limit, offset, status)
      } else {
        applications = await landService.getAllApplications(limit, offset, status)
      }

      const total = applications.length
      sendPaginated(res, applications, total, Math.floor(offset / limit) + 1, limit)
    } catch (error) {
      sendError(res, error.message, error.status || 500)
    }
  }

  async updateApplicationStatus(req, res) {
    try {
      const { applicationId } = req.params
      const { status, comments } = req.body

      if (!status) {
        return sendError(res, 'Status is required', 400)
      }

      // Only officers and admins can approve/reject
      if (!['officer', 'admin'].includes(req.user.role)) {
        return sendError(res, 'Unauthorized', 403)
      }

      const app = await landService.updateApplicationStatus(
        parseInt(applicationId),
        status,
        req.user.userId,
        comments
      )

      sendSuccess(res, app, 'Application status updated')
    } catch (error) {
      sendError(res, error.message, error.status || 500)
    }
  }
}
