import api from '../api/axios'

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const { data: responseData } = response.data

    if (responseData.token) {
      localStorage.setItem('token', responseData.token)
      localStorage.setItem('user', JSON.stringify(responseData.user))
    }
    
    // Return in the format the frontend expects
    return responseData
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data.data
  },

  updateProfile: async (userId, data) => {
    const response = await api.put(`/auth/users/${userId}`, data)
    return response.data.data
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data.data
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword })
    return response.data.data
  }
}

export default authService
