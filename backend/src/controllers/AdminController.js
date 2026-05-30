import { UserRepository } from '../repositories/UserRepository.js'
import { query } from '../config/database.js'
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js'

const userRepo = new UserRepository()

export class AdminController {
  // User Management
  async getAllUsers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50
      const offset = parseInt(req.query.offset) || 0
      const role = req.query.role || null
      const status = req.query.status || null

      let sql = 'SELECT id, first_name, last_name, email, phone, organization, role, status, created_at FROM users'
      const params = []
      let paramCount = 1

      if (role) {
        sql += ` WHERE role = $${paramCount++}`
        params.push(role)
      }

      if (status) {
        sql += role ? ` AND status = $${paramCount++}` : ` WHERE status = $${paramCount++}`
        params.push(status)
      }

      sql += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`
      params.push(limit, offset)

      const result = await query(sql, params)
      const countResult = await query('SELECT COUNT(*) as count FROM users')
      const total = parseInt(countResult.rows[0].count)

      sendPaginated(res, result.rows, total, Math.floor(offset / limit) + 1, limit)
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  async getUserById(req, res) {
    try {
      const { userId } = req.params
      const user = await userRepo.findById(parseInt(userId))

      if (!user) {
        return sendError(res, 'User not found', 404)
      }

      sendSuccess(res, user)
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  async updateUserStatus(req, res) {
    try {
      const { userId } = req.params
      const { status } = req.body

      if (!['active', 'inactive', 'suspended'].includes(status)) {
        return sendError(res, 'Invalid status', 400)
      }

      const updated = await userRepo.update(parseInt(userId), { status })

      if (!updated) {
        return sendError(res, 'User not found', 404)
      }

      // Log audit event
      await this.logAuditEvent(req.user.userId, 'UPDATE_USER_STATUS', 'users', userId, { status })

      sendSuccess(res, updated, 'User status updated')
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  async deleteUser(req, res) {
    try {
      const { userId } = req.params

      if (parseInt(userId) === req.user.userId) {
        return sendError(res, 'Cannot delete your own account', 400)
      }

      const user = await userRepo.findById(parseInt(userId))
      if (!user) {
        return sendError(res, 'User not found', 404)
      }

      await userRepo.delete(parseInt(userId))

      // Log audit event
      await this.logAuditEvent(req.user.userId, 'DELETE_USER', 'users', userId, {})

      sendSuccess(res, null, 'User deleted')
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  // Analytics
  async getAnalytics(req, res) {
    try {
      // Get statistics
      const parcelCount = await query('SELECT COUNT(*) as count FROM land_parcels')
      const applicationCount = await query('SELECT COUNT(*) as count FROM applications')
      const verifiedCount = await query("SELECT COUNT(*) as count FROM land_parcels WHERE status = 'verified'")
      const certificateCount = await query("SELECT COUNT(*) as count FROM applications WHERE status = 'approved'")
      const userCount = await query('SELECT COUNT(*) as count FROM users')

      // Get approval rate
      const approvalRate = await query(`
        SELECT 
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
          COUNT(*) as total
        FROM applications
      `)

      const approvalRow = approvalRate.rows[0]
      const rate = approvalRow?.total > 0
        ? Math.round((approvalRow.approved / approvalRow.total) * 100)
        : 0

      // Get monthly stats
      const monthlyStats = await query(`
        SELECT 
          DATE_TRUNC('month', created_at)::date as month,
          COUNT(*) as count
        FROM applications
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
        LIMIT 12
      `)

      // Get user distribution by role
      const usersByRole = await query(`
        SELECT role, COUNT(*) as count
        FROM users
        GROUP BY role
      `)

      // Get application status breakdown
      const applicationStatus = await query(`
        SELECT status, COUNT(*) as count
        FROM applications
        GROUP BY status
      `)

      sendSuccess(res, {
        totalParcels: parseInt(parcelCount.rows[0]?.count || 0),
        totalApplications: parseInt(applicationCount.rows[0]?.count || 0),
        verifiedParcels: parseInt(verifiedCount.rows[0]?.count || 0),
        approvedCertificates: parseInt(certificateCount.rows[0]?.count || 0),
        totalUsers: parseInt(userCount.rows[0]?.count || 0),
        approvalRate: rate,
        monthlyStats: monthlyStats.rows,
        usersByRole: usersByRole.rows,
        applicationStatus: applicationStatus.rows
      })
    } catch (error) {
      sendError(res, error.message, 500)
    }
  }

  // Audit Logs
  async getAuditLogs(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50
      const offset = parseInt(req.query.offset) || 0
      const user = req.query.user || null
      const action = req.query.action || null

      let sql = `
        SELECT 
          al.id, 
          al.user_id, 
          al.action, 
          al.entity_type, 
          al.entity_id,
          al.created_at,
          u.first_name,
          u.last_name,
          u.email
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
      `
      const params = []
      let paramCount = 1
      const conditions = []

      if (user) {
        conditions.push(`u.email ILIKE $${paramCount++} OR u.first_name ILIKE $${paramCount-1} OR u.last_name ILIKE $${paramCount-1}`)
        params.push(`%${user}%`)
      }

      if (action) {
        conditions.push(`al.action = $${paramCount++}`)
        params.push(action)
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ')
      }

      sql += ` ORDER BY al.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`
      params.push(limit, offset)

      const result = await query(sql, params)
      const countResult = await query('SELECT COUNT(*) as count FROM audit_logs')
      const total = parseInt(countResult.rows[0].count)

      const formattedLogs = result.rows.map(log => ({
        id: log.id,
        timestamp: log.created_at,
        user: `${log.first_name} ${log.last_name}`,
        action: log.action,
        resource: `${log.entity_type} #${log.entity_id}`,
        status: 'success'
      }))

      sendPaginated(res, formattedLogs, total, Math.floor(offset / limit) + 1, limit)
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
