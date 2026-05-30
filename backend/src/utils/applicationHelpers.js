import { query } from '../config/database.js'

/** Create a pending verification application for a parcel if none is active. */
export async function ensureVerificationApplication(parcelId, userId, description = null) {
  const existing = await query(
    `SELECT id FROM applications
     WHERE parcel_id = $1 AND status IN ('pending', 'under_review')
     LIMIT 1`,
    [parcelId]
  )

  if (existing.rows.length > 0) {
    return existing.rows[0].id
  }

  const result = await query(
    `INSERT INTO applications (parcel_id, user_id, application_type, description, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING id`,
    [
      parcelId,
      userId,
      'ownership_verification',
      description || 'Parcel submitted for ownership verification'
    ]
  )

  return result.rows[0].id
}

/** Backfill applications for parcels that have none pending (e.g. surveyor uploads). */
export async function syncPendingApplicationsFromParcels() {
  await query(`
    INSERT INTO applications (parcel_id, user_id, application_type, description, status)
    SELECT
      lp.id,
      lp.owner_id,
      'ownership_verification',
      COALESCE(lp.description, 'Parcel registration pending verification'),
      'pending'
    FROM land_parcels lp
    WHERE NOT EXISTS (
      SELECT 1 FROM applications a
      WHERE a.parcel_id = lp.id
        AND a.status IN ('pending', 'under_review')
    )
  `)
}
