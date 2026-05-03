const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { createUser, updateUser, getUserByEmail } = require('../models/User');

// Middleware to check admin privileges
function requireAdminOnly(req, res, next) {
  const role = req.user?.role;
  const email = req.user?.email?.toLowerCase();
  const isSuperAdmin = email === 'ceoofreektickets@gmail.com';
  
  if (!isSuperAdmin && role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  
  next();
}

/**
 * POST /api/admin-management/create-admin
 * Create a new admin user with optional profile picture
 * 
 * Body:
 * {
 *   fullName: string (required)
 *   email: string (required)
 *   phone: string (required)
 *   password: string (required)
 *   profilePicture: string (optional, URL)
 * }
 */
router.post('/create-admin', auth, requireAdminOnly, async (req, res) => {
  try {
    const { fullName, email, phone, password, profilePicture } = req.body;

    // Validation
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields: fullName, email, phone, password' 
      });
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Normalize phone
    let normalizedPhone = String(phone).trim();
    normalizedPhone = normalizedPhone.replace(/\s+/g, '').replace(/^\+/, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = `233${normalizedPhone.slice(1)}`;
    }
    if (!normalizedPhone.startsWith('233')) {
      normalizedPhone = `233${normalizedPhone}`;
    }

    // Create new admin user
    const newAdmin = await createUser({
      full_name: fullName,
      email: email.toLowerCase(),
      phone: normalizedPhone,
      password_hash: hashedPassword,
      role: 'admin',
      profile_picture: profilePicture || null,
      is_verified: true, // Auto-verify admin accounts
      status: 'active',
      created_at: new Date().toISOString(),
      otp_code: null,
      otp_expiry: null
    });

    return res.status(201).json({
      message: 'Admin account created successfully',
      admin: {
        id: newAdmin.id || newAdmin._id,
        fullName: newAdmin.full_name,
        email: newAdmin.email,
        phone: newAdmin.phone,
        role: newAdmin.role,
        profilePicture: newAdmin.profile_picture,
        status: newAdmin.status,
        createdAt: newAdmin.created_at
      }
    });

  } catch (error) {
    console.error('[Admin Management] Error creating admin:', error);
    return res.status(500).json({ 
      message: 'Failed to create admin', 
      error: error.message 
    });
  }
});

/**
 * POST /api/admin-management/update-admin/:adminId
 * Update an admin's profile information (including profile picture)
 * 
 * Body:
 * {
 *   fullName?: string
 *   phone?: string
 *   profilePicture?: string (URL)
 *   status?: string ('active' | 'suspended' | 'inactive')
 * }
 */
router.post('/update-admin/:adminId', auth, requireAdminOnly, async (req, res) => {
  try {
    const { adminId } = req.params;
    const { fullName, phone, profilePicture, status } = req.body;

    const updates = {};
    
    if (fullName) updates.full_name = fullName;
    if (phone) {
      let normalizedPhone = String(phone).trim();
      normalizedPhone = normalizedPhone.replace(/\s+/g, '').replace(/^\+/, '');
      if (normalizedPhone.startsWith('0')) {
        normalizedPhone = `233${normalizedPhone.slice(1)}`;
      }
      if (!normalizedPhone.startsWith('233')) {
        normalizedPhone = `233${normalizedPhone}`;
      }
      updates.phone = normalizedPhone;
    }
    if (profilePicture !== undefined) updates.profile_picture = profilePicture;
    if (status && ['active', 'suspended', 'inactive'].includes(status)) updates.status = status;

    const updatedAdmin = await updateUser(adminId, updates);

    return res.json({
      message: 'Admin updated successfully',
      admin: {
        id: updatedAdmin.id || updatedAdmin._id,
        fullName: updatedAdmin.full_name,
        email: updatedAdmin.email,
        phone: updatedAdmin.phone,
        role: updatedAdmin.role,
        profilePicture: updatedAdmin.profile_picture,
        status: updatedAdmin.status
      }
    });

  } catch (error) {
    console.error('[Admin Management] Error updating admin:', error);
    return res.status(500).json({ 
      message: 'Failed to update admin', 
      error: error.message 
    });
  }
});

/**
 * GET /api/admin-management/admins
 * Get list of all admin users with their profile information
 */
router.get('/admins', auth, requireAdminOnly, async (req, res) => {
  try {
    const { connectDB } = require('../config/db');
    const supabase = await connectDB();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const admins = (data || []).map(admin => ({
      id: admin.id || admin._id,
      fullName: admin.full_name,
      email: admin.email,
      phone: admin.phone,
      profilePicture: admin.profile_picture,
      status: admin.status,
      createdAt: admin.created_at,
      role: admin.role
    }));

    return res.json({
      count: admins.length,
      admins
    });

  } catch (error) {
    console.error('[Admin Management] Error fetching admins:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch admins', 
      error: error.message 
    });
  }
});

/**
 * DELETE /api/admin-management/admin/:adminId
 * Suspend/deactivate an admin account
 */
router.delete('/admin/:adminId', auth, requireAdminOnly, async (req, res) => {
  try {
    const { adminId } = req.params;
    const requestingAdminEmail = req.user?.email?.toLowerCase();
    const isSuperAdmin = requestingAdminEmail === 'ceoofreektickets@gmail.com';

    // Prevent super admin from being deleted
    if (!isSuperAdmin && adminId === 'ceoofreektickets@gmail.com') {
      return res.status(403).json({ message: 'Cannot deactivate super admin' });
    }

    // Mark as inactive instead of deleting
    await updateUser(adminId, { status: 'inactive' });

    return res.json({ message: 'Admin account deactivated successfully' });

  } catch (error) {
    console.error('[Admin Management] Error deleting admin:', error);
    return res.status(500).json({ 
      message: 'Failed to deactivate admin', 
      error: error.message 
    });
  }
});

module.exports = router;
