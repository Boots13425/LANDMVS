import { query } from '../config/database.js'
import { normalizeGeometryRing, ringToWKT } from '../utils/geometry.js'

export class LandParcelRepository {
  async findById(id) {
    const result = await query(
      `SELECT id, owner_id, name, location, area, description, status, 
              ST_AsGeoJSON(geometry) as geometry, created_at, updated_at
       FROM land_parcels WHERE id = $1`,
      [id]
    )
    return result.rows[0]
  }

  async findByOwnerId(ownerId, limit = 100, offset = 0) {
    const result = await query(
      `SELECT id, owner_id, name, location, area, description, status,
              ST_AsGeoJSON(geometry) as geometry, created_at, updated_at
       FROM land_parcels WHERE owner_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [ownerId, limit, offset]
    )
    return result.rows
  }

  async findAll(limit = 100, offset = 0, status = null) {
    let sql = `SELECT id, owner_id, name, location, area, description, status,
                      ST_AsGeoJSON(geometry) as geometry, created_at, updated_at
               FROM land_parcels`
    const params = []

    if (status) {
      sql += ' WHERE status = $1'
      params.push(status)
      sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(limit, offset)
    } else {
      sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(limit, offset)
    }

    const result = await query(sql, params)
    return result.rows
  }

  async create(parcelData) {
    const { ownerId, name, location, area, description, geometry } = parcelData

    const ring = normalizeGeometryRing(geometry)
    const geometryWKT = ringToWKT(ring)

    const result = await query(
      `INSERT INTO land_parcels (owner_id, name, location, area, description, geometry)
       VALUES ($1, $2, $3, $4, $5, ST_GeomFromText($6, 4326))
       RETURNING id, owner_id, name, location, area, description, status,
                 ST_AsGeoJSON(geometry) as geometry, created_at, updated_at`,
      [ownerId, name, location, area, description || null, geometryWKT]
    )

    return result.rows[0]
  }

  async update(id, parcelData) {
    const fields = []
    const values = []
    let paramCount = 1

    Object.keys(parcelData).forEach(key => {
      if (key !== 'geometry') {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
        fields.push(`${dbKey} = $${paramCount}`)
        values.push(parcelData[key])
        paramCount++
      }
    })

    if (parcelData.geometry) {
      const ring = normalizeGeometryRing(parcelData.geometry)
      const geometryWKT = ringToWKT(ring)
      fields.push(`geometry = ST_GeomFromText($${paramCount}, 4326)`)
      values.push(geometryWKT)
      paramCount++
    }

    values.push(id)

    const sql = `UPDATE land_parcels SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $${paramCount}
                 RETURNING id, owner_id, name, location, area, description, status,
                           ST_AsGeoJSON(geometry) as geometry, created_at, updated_at`

    const result = await query(sql, values)
    return result.rows[0]
  }

  async delete(id) {
    const result = await query('DELETE FROM land_parcels WHERE id = $1 RETURNING id', [id])
    return result.rows[0]
  }

  async findInBounds(bounds) {
    const { north, south, east, west } = bounds
    const polygon = `POLYGON((${west} ${south}, ${east} ${south}, ${east} ${north}, ${west} ${north}, ${west} ${south}))`

    const result = await query(
      `SELECT id, owner_id, name, location, area, description, status,
              ST_AsGeoJSON(geometry) as geometry, created_at, updated_at
       FROM land_parcels
       WHERE ST_Intersects(geometry, ST_GeomFromText($1, 4326))`,
      [polygon]
    )

    return result.rows
  }

  async count(ownerId = null, status = null) {
    let sql = 'SELECT COUNT(*) as count FROM land_parcels'
    const params = []

    if (ownerId) {
      sql += ' WHERE owner_id = $1'
      params.push(ownerId)

      if (status) {
        sql += ' AND status = $2'
        params.push(status)
      }
    } else if (status) {
      sql += ' WHERE status = $1'
      params.push(status)
    }

    const result = await query(sql, params)
    return parseInt(result.rows[0].count)
  }
}
