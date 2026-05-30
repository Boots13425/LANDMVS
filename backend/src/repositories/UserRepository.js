import { query } from '../config/database.js'

export class UserRepository {
  async findById(id) {
    const result = await query(
      'SELECT id, first_name, last_name, email, phone, organization, role, status, created_at FROM users WHERE id = $1',
      [id]
    )
    return result.rows[0]
  }

  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )
    return result.rows[0]
  }

  async findAll(role = null, limit = 100, offset = 0) {
    let sql = 'SELECT id, first_name, last_name, email, phone, organization, role, status, created_at FROM users'
    const params = []

    if (role) {
      sql += ' WHERE role = $1'
      params.push(role)
      sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(limit, offset)
    } else {
      sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(limit, offset)
    }

    const result = await query(sql, params)
    return result.rows
  }

  async create(userData) {
    const { firstName, lastName, email, password, phone, organization, role } = userData

    const result = await query(
      `INSERT INTO users (first_name, last_name, email, password, phone, organization, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, first_name, last_name, email, phone, organization, role, status, created_at`,
      [firstName, lastName, email, password, phone || null, organization || null, role]
    )

    return result.rows[0]
  }

  async update(id, userData) {
    const fields = []
    const values = []
    let paramCount = 1

    Object.keys(userData).forEach(key => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      fields.push(`${dbKey} = $${paramCount}`)
      values.push(userData[key])
      paramCount++
    })

    values.push(id)

    const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $${paramCount}
                 RETURNING id, first_name, last_name, email, phone, organization, role, status, created_at`

    const result = await query(sql, values)
    return result.rows[0]
  }

  async delete(id) {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id])
    return result.rows[0]
  }

  async count(role = null) {
    let sql = 'SELECT COUNT(*) as count FROM users'
    const params = []

    if (role) {
      sql += ' WHERE role = $1'
      params.push(role)
    }

    const result = await query(sql, params)
    return parseInt(result.rows[0].count)
  }
}
