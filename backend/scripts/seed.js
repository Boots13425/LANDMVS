import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { query } from '../src/config/database.js'
import { ringToWKT } from '../src/utils/geometry.js'

dotenv.config()

const SAMPLE_BOUNDARY = [
  [3.8480, 11.5021],
  [3.8520, 11.5080],
  [3.8450, 11.5100],
  [3.8420, 11.5040]
]

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...')

    const users = [
      { firstName: 'Admin', lastName: 'User', email: 'admin@cameroon.gov.cm', password: 'admin123', role: 'admin' },
      { firstName: 'John', lastName: 'Smith', email: 'owner@cameroon.gov.cm', password: 'owner123', role: 'landowner' },
      { firstName: 'Marie', lastName: 'Dupont', email: 'surveyor@cameroon.gov.cm', password: 'surveyor123', role: 'surveyor' },
      { firstName: 'Paul', lastName: 'Cameroon', email: 'officer@cameroon.gov.cm', password: 'officer123', role: 'officer' }
    ]

    const userIds = {}

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10)
      const result = await query(
        `INSERT INTO users (first_name, last_name, email, password, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
         RETURNING id, email`,
        [user.firstName, user.lastName, user.email, hashedPassword, user.role]
      )
      userIds[user.role] = result.rows[0].id
      userIds[user.email] = result.rows[0].id
      console.log(`✓ User: ${user.email}`)
    }

    const ownerId = userIds.landowner
    const wkt = ringToWKT(SAMPLE_BOUNDARY)

    const existingParcel = await query(
      'SELECT id FROM land_parcels WHERE owner_id = $1 LIMIT 1',
      [ownerId]
    )

    let parcelId

    if (existingParcel.rows.length === 0) {
      const parcelResult = await query(
        `INSERT INTO land_parcels (owner_id, name, location, area, description, status, geometry)
         VALUES ($1, $2, $3, $4, $5, $6, ST_GeomFromText($7, 4326))
         RETURNING id`,
        [ownerId, 'Residential Plot A', 'Yaounde, Centre Region', 5000, 'Sample residential parcel for testing', 'pending', wkt]
      )
      parcelId = parcelResult.rows[0].id
      console.log(`✓ Sample parcel created (id: ${parcelId})`)
    } else {
      parcelId = existingParcel.rows[0].id
      console.log(`✓ Sample parcel already exists (id: ${parcelId})`)
    }

    const existingApp = await query(
      'SELECT id FROM applications WHERE parcel_id = $1 AND status = $2 LIMIT 1',
      [parcelId, 'pending']
    )

    if (existingApp.rows.length === 0) {
      await query(
        `INSERT INTO applications (parcel_id, user_id, application_type, description, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [parcelId, ownerId, 'ownership_verification', 'Initial ownership verification request for Residential Plot A', 'pending']
      )
      console.log('✓ Sample pending application created for officer review')
    } else {
      console.log('✓ Sample application already exists')
    }

    console.log('\n✓ Database seeding completed!')
    console.log('\nTest accounts:')
    users.forEach((u) => console.log(`  ${u.email} / ${u.password} (${u.role})`))
    process.exit(0)
  } catch (error) {
    console.error('✗ Seeding failed:', error)
    process.exit(1)
  }
}

seedDatabase()
