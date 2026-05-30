import axios from '../api/axios'
import { extractData, extractList } from '../utils/apiHelpers'

const API_BASE = '/surveyor'

export class SurveyorService {
  static async uploadParcel(parcelData) {
    const response = await axios.post(`${API_BASE}/parcels/upload`, parcelData)
    return extractData(response)
  }

  static async getParcels(filters = {}) {
    const response = await axios.get(`${API_BASE}/parcels`, { params: filters })
    return extractList(response)
  }

  static async getParcelDetail(parcelId) {
    const response = await axios.get(`${API_BASE}/parcels/${parcelId}`)
    return extractData(response)
  }

  static async updateBoundary(parcelId, geometry) {
    const response = await axios.patch(`${API_BASE}/parcels/${parcelId}/boundary`, { geometry })
    return extractData(response)
  }

  static async updateParcelStatus(parcelId, status) {
    const response = await axios.patch(`${API_BASE}/parcels/${parcelId}/status`, { status })
    return extractData(response)
  }

  static async getSurveyorStats() {
    const response = await axios.get(`${API_BASE}/stats`)
    return extractData(response)
  }

  static async getLandowners() {
    const response = await axios.get(`${API_BASE}/landowners`)
    return extractList(response)
  }
}

export default SurveyorService
