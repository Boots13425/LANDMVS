import bcrypt from 'bcryptjs'
import { UserRepository } from '../repositories/UserRepository.js'
import { generateToken } from '../utils/jwt.js'

const userRepo = new UserRepository()

export class AuthService {
  async register(userData) {
    const { firstName, lastName, email, password, role, phone, organization } = userData

    // Check if user exists
    const existingUser = await userRepo.findByEmail(email)
    if (existingUser) {
      throw { status: 400, message: 'Email already registered' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await userRepo.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      organization,
      role: role || 'landowner'
    })

    // Generate token
    const token = generateToken(user.id, user.role)

    return {
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organization: user.organization
      },
      token
    }
  }

  async login(email, password) {
    // Find user
    const user = await userRepo.findByEmail(email)
    if (!user) {
      throw { status: 401, message: 'Invalid email or password' }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw { status: 401, message: 'Invalid email or password' }
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw { status: 403, message: 'Account is inactive or suspended' }
    }

    // Generate token
    const token = generateToken(user.id, user.role)

    return {
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organization: user.organization
      },
      token
    }
  }

  async getProfile(userId) {
    const user = await userRepo.findById(userId)
    if (!user) {
      throw { status: 404, message: 'User not found' }
    }

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      organization: user.organization,
      status: user.status,
      createdAt: user.created_at
    }
  }

  async updateProfile(userId, updates) {
    const user = await userRepo.findById(userId)
    if (!user) {
      throw { status: 404, message: 'User not found' }
    }

    const updateData = {}

    if (updates.firstName) updateData.firstName = updates.firstName
    if (updates.lastName) updateData.lastName = updates.lastName
    if (updates.phone) updateData.phone = updates.phone
    if (updates.organization) updateData.organization = updates.organization

    if (Object.keys(updateData).length === 0) {
      throw { status: 400, message: 'No valid fields to update' }
    }

    const updated = await userRepo.update(userId, updateData)

    return {
      id: updated.id,
      firstName: updated.first_name,
      lastName: updated.last_name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      organization: updated.organization
    }
  }
}
