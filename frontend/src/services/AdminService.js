import axios from '../api/axios'

const API_BASE = '/admin'

export class AdminService {
  // User Management
  static async getAllUsers(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.role) params.append('role', filters.role)
      if (filters.status) params.append('status', filters.status)
      if (filters.limit) params.append('limit', filters.limit)
      if (filters.offset) params.append('offset', filters.offset)

      const response = await axios.get(`${API_BASE}/users?${params}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  static async getUserById(userId) {
    try {
      const response = await axios.get(`${API_BASE}/users/${userId}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  }

  static async updateUserStatus(userId, status) {
    try {
      const response = await axios.patch(`${API_BASE}/users/${userId}/status`, { status })
      return response.data.data
    } catch (error) {
      console.error('Error updating user status:', error)
      throw error
    }
  }

  static async deleteUser(userId) {
    try {
      await axios.delete(`${API_BASE}/users/${userId}`)
      return { success: true }
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  // Analytics
  static async getAnalytics() {
    try {
      const response = await axios.get(`${API_BASE}/analytics`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching analytics:', error)
      throw error
    }
  }

  // Audit Logs
  static async getAuditLogs(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.user) params.append('user', filters.user)
      if (filters.action) params.append('action', filters.action)
      if (filters.limit) params.append('limit', filters.limit || 50)
      if (filters.offset) params.append('offset', filters.offset || 0)

      const response = await axios.get(`${API_BASE}/audit-logs?${params}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      throw error
    }
  }
}

export default AdminService
