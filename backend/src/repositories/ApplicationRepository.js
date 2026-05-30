import { query } from '../config/database.js'

export class ApplicationRepository {
  async findById(id) {
    const result = await query(
      `SELECT a.id, a.parcel_id, a.user_id, a.application_type, a.status, a.description,
              a.submitted_date, a.reviewed_date, a.reviewed_by, a.comments, a.created_at, a.updated_at,
              u.first_name, u.last_name, lp.name as parcel_name
       FROM applications a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN land_parcels lp ON a.parcel_id = lp.id
       WHERE a.id = $1`,
      [id]
    )
    return result.rows[0]
  }

  async findByUserId(userId, limit = 100, offset = 0) {
    const result = await query(
      `SELECT a.id, a.parcel_id, a.user_id, a.application_type, a.status, a.description,
              a.submitted_date, a.reviewed_date, a.reviewed_by, a.comments, a.created_at, a.updated_at,
              lp.name as parcel_name
       FROM applications a
       LEFT JOIN land_parcels lp ON a.parcel_id = lp.id
       WHERE a.user_id = $1
       ORDER BY a.submitted_date DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    )
    return result.rows
  }

  async findAll(limit = 100, offset = 0, status = null, userId = null) {
    let sql = `SELECT a.id, a.parcel_id, a.user_id, a.application_type, a.status, a.description,
                      a.submitted_date, a.reviewed_date, a.reviewed_by, a.comments, a.created_at, a.updated_at,
                      u.first_name, u.last_name, lp.name as parcel_name
               FROM applications a
               LEFT JOIN users u ON a.user_id = u.id
               LEFT JOIN land_parcels lp ON a.parcel_id = lp.id`

    const params = []
    const conditions = []

    if (status) {
      conditions.push(`a.status = $${params.length + 1}`)
      params.push(status)
    }

    if (userId) {
      conditions.push(`a.user_id = $${params.length + 1}`)
      params.push(userId)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += ` ORDER BY a.submitted_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await query(sql, params)
    return result.rows
  }

  async create(appData) {
    const { parcelId, userId, applicationType, description } = appData

    const result = await query(
      `INSERT INTO applications (parcel_id, user_id, application_type, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, parcel_id, user_id, application_type, status, description,
                 submitted_date, reviewed_date, reviewed_by, comments, created_at, updated_at`,
      [parcelId, userId, applicationType, description || null]
    )

    return result.rows[0]
  }

  async updateStatus(id, status, reviewedBy = null, comments = null) {
    const result = await query(
      `UPDATE applications 
       SET status = $1, reviewed_by = $2, reviewed_date = CURRENT_TIMESTAMP, comments = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, parcel_id, user_id, application_type, status, description,
                 submitted_date, reviewed_date, reviewed_by, comments, created_at, updated_at`,
      [status, reviewedBy || null, comments || null, id]
    )

    return result.rows[0]
  }

  async update(id, appData) {
    const fields = []
    const values = []
    let paramCount = 1

    Object.keys(appData).forEach(key => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      fields.push(`${dbKey} = $${paramCount}`)
      values.push(appData[key])
      paramCount++
    })

    values.push(id)

    const sql = `UPDATE applications SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $${paramCount}
                 RETURNING id, parcel_id, user_id, application_type, status, description,
                           submitted_date, reviewed_date, reviewed_by, comments, created_at, updated_at`

    const result = await query(sql, values)
    return result.rows[0]
  }

  async delete(id) {
    const result = await query('DELETE FROM applications WHERE id = $1 RETURNING id', [id])
    return result.rows[0]
  }

  async count(status = null, userId = null) {
    let sql = 'SELECT COUNT(*) as count FROM applications'
    const params = []
    const conditions = []

    if (status) {
      conditions.push(`status = $${params.length + 1}`)
      params.push(status)
    }

    if (userId) {
      conditions.push(`user_id = $${params.length + 1}`)
      params.push(userId)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    const result = await query(sql, params)
    return parseInt(result.rows[0].count)
  }
}
