import api from '../api/axios'
import { extractData, extractList } from '../utils/apiHelpers'

const landService = {
  createParcel: async (parcelData) => {
    const payload = {
      ...parcelData,
      geometry: parcelData.geometry?.coordinates ?? parcelData.geometry
    }
    const response = await api.post('/land/parcels', payload)
    return extractData(response)
  },

  getParcels: async (filters = {}) => {
    const response = await api.get('/land/parcels', { params: filters })
    return extractList(response)
  },

  getParcelById: async (parcelId) => {
    const response = await api.get(`/land/parcels/${parcelId}`)
    return extractData(response)
  },

  updateParcel: async (parcelId, parcelData) => {
    const response = await api.put(`/land/parcels/${parcelId}`, parcelData)
    return extractData(response)
  },

  deleteParcel: async (parcelId) => {
    const response = await api.delete(`/land/parcels/${parcelId}`)
    return extractData(response)
  },

  getParcelsInBounds: async (bounds) => {
    const response = await api.post('/land/parcels/spatial-query', { bounds })
    return extractList(response)
  },

  createApplication: async (applicationData) => {
    const response = await api.post('/land/applications', applicationData)
    return extractData(response)
  },

  getApplications: async (filters = {}) => {
    const response = await api.get('/land/applications', { params: filters })
    return extractList(response)
  },

  getApplicationById: async (appId) => {
    const response = await api.get(`/land/applications/${appId}`)
    return extractData(response)
  },

  updateApplicationStatus: async (appId, status, comments) => {
    const response = await api.patch(`/land/applications/${appId}/status`, { status, comments })
    return extractData(response)
  }
}

export default landService
