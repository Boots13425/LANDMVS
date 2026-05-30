import axios from '../api/axios'
import { extractData, extractList } from '../utils/apiHelpers'

const API_BASE = '/officer'

export class OfficerService {
  static async getApplications(filters = {}) {
    const response = await axios.get(`${API_BASE}/applications`, { params: filters })
    return extractList(response)
  }

  static async getApplicationDetail(applicationId) {
    const response = await axios.get(`${API_BASE}/applications/${applicationId}`)
    return extractData(response)
  }

  static async reviewApplication(applicationId, status, comments = '') {
    const response = await axios.patch(`${API_BASE}/applications/${applicationId}/review`, { status, comments })
    return extractData(response)
  }

  static async getVerificationStats() {
    const response = await axios.get(`${API_BASE}/stats`)
    return extractData(response)
  }
}

export default OfficerService
