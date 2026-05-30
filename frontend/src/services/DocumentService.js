import axios from '../api/axios'
import { extractData, extractList } from '../utils/apiHelpers'

const API_BASE = '/documents'

export class DocumentService {
  static async uploadDocument({ file, parcelId, applicationId, documentType }) {
    const formData = new FormData()
    formData.append('file', file)
    if (parcelId) formData.append('parcelId', parcelId)
    if (applicationId) formData.append('applicationId', applicationId)
    if (documentType) formData.append('documentType', documentType)

    const response = await axios.post(`${API_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return extractData(response)
  }

  static async getUserDocuments(filters = {}) {
    const response = await axios.get(`${API_BASE}/my-documents`, { params: filters })
    return extractList(response)
  }

  static async getApplicationDocuments(applicationId) {
    const response = await axios.get(`${API_BASE}/applications/${applicationId}`)
    return extractList(response)
  }

  static async getParcelDocuments(parcelId) {
    const response = await axios.get(`${API_BASE}/parcels/${parcelId}`)
    return extractList(response)
  }

  static async verifyDocument(documentId, status, remarks = '') {
    const response = await axios.patch(`${API_BASE}/${documentId}/verify`, { status, remarks })
    return extractData(response)
  }

  static async deleteDocument(documentId) {
    await axios.delete(`${API_BASE}/${documentId}`)
    return { success: true }
  }

  static async getDocumentStats() {
    const response = await axios.get(`${API_BASE}/stats`)
    return extractData(response)
  }
}

export default DocumentService
