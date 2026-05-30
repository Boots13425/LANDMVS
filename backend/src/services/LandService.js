import { LandParcelRepository } from '../repositories/LandParcelRepository.js'
import { ApplicationRepository } from '../repositories/ApplicationRepository.js'
import { normalizeGeometryRing, geoJsonToLatLngRing } from '../utils/geometry.js'
import { ensureVerificationApplication } from '../utils/applicationHelpers.js'

const landParcelRepo = new LandParcelRepository()
const applicationRepo = new ApplicationRepository()

export class LandService {
  // Parcel management
  async createParcel(ownerId, parcelData) {
    const { name, location, area, description, geometry } = parcelData

    const ring = normalizeGeometryRing(geometry)

    const parcel = await landParcelRepo.create({
      ownerId,
      name,
      location,
      area: parseFloat(area),
      description,
      geometry: ring
    })

    await ensureVerificationApplication(
      parcel.id,
      ownerId,
      description || `Land registration: ${name}`
    )

    return this.formatParcel(parcel)
  }

  async getParcelById(parcelId) {
    const parcel = await landParcelRepo.findById(parcelId)
    if (!parcel) {
      throw { status: 404, message: 'Parcel not found' }
    }

    return this.formatParcel(parcel)
  }

  async getUserParcels(userId, limit = 50, offset = 0) {
    const parcels = await landParcelRepo.findByOwnerId(userId, limit, offset)
    return parcels.map(p => this.formatParcel(p))
  }

  async getAllParcels(limit = 50, offset = 0, status = null) {
    const parcels = await landParcelRepo.findAll(limit, offset, status)
    return parcels.map(p => this.formatParcel(p))
  }

  async updateParcel(parcelId, ownerId, updates) {
    const parcel = await landParcelRepo.findById(parcelId)
    if (!parcel) {
      throw { status: 404, message: 'Parcel not found' }
    }

    if (parcel.owner_id !== ownerId) {
      throw { status: 403, message: 'Unauthorized' }
    }

    const updated = await landParcelRepo.update(parcelId, updates)
    return this.formatParcel(updated)
  }

  async deleteParcel(parcelId, ownerId) {
    const parcel = await landParcelRepo.findById(parcelId)
    if (!parcel) {
      throw { status: 404, message: 'Parcel not found' }
    }

    if (parcel.owner_id !== ownerId) {
      throw { status: 403, message: 'Unauthorized' }
    }

    await landParcelRepo.delete(parcelId)
    return { id: parcelId }
  }

  async getParcelsInBounds(bounds) {
    const parcels = await landParcelRepo.findInBounds(bounds)
    return parcels.map(p => this.formatParcel(p))
  }

  // Application management
  async createApplication(userId, appData) {
    const { parcelId, applicationType, description } = appData

    // Verify parcel exists and belongs to user
    const parcel = await landParcelRepo.findById(parcelId)
    if (!parcel) {
      throw { status: 404, message: 'Parcel not found' }
    }

    if (parcel.owner_id !== userId) {
      throw { status: 403, message: 'Can only create applications for your own parcels' }
    }

    const application = await applicationRepo.create({
      parcelId,
      userId,
      applicationType,
      description
    })

    return this.formatApplication(application)
  }

  async getApplicationById(appId) {
    const app = await applicationRepo.findById(appId)
    if (!app) {
      throw { status: 404, message: 'Application not found' }
    }

    return this.formatApplication(app)
  }

  async getUserApplications(userId, limit = 50, offset = 0, status = null) {
    const apps = status
      ? await applicationRepo.findAll(limit, offset, status, userId)
      : await applicationRepo.findByUserId(userId, limit, offset)
    return apps.map(a => this.formatApplication(a))
  }

  async getAllApplications(limit = 50, offset = 0, status = null) {
    const apps = await applicationRepo.findAll(limit, offset, status)
    return apps.map(a => this.formatApplication(a))
  }

  async updateApplicationStatus(appId, status, reviewedBy, comments) {
    const app = await applicationRepo.findById(appId)
    if (!app) {
      throw { status: 404, message: 'Application not found' }
    }

    const updated = await applicationRepo.updateStatus(appId, status, reviewedBy, comments)
    return this.formatApplication(updated)
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

  formatApplication(app) {
    return {
      id: app.id,
      parcelId: app.parcel_id,
      parcelName: app.parcel_name,
      userId: app.user_id,
      applicantName: `${app.first_name} ${app.last_name}`,
      applicationType: app.application_type,
      status: app.status,
      description: app.description,
      submittedDate: app.submitted_date,
      reviewedDate: app.reviewed_date,
      reviewedBy: app.reviewed_by,
      comments: app.comments,
      createdAt: app.created_at,
      updatedAt: app.updated_at
    }
  }
}
