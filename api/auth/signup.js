import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fullName, email, phone, password, role } = req.body;
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    if (existing && existing.isVerified) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Generate OTP
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const hashed = await bcrypt.hash(password, 10);

    let user;
    if (existing && !existing.isVerified) {
      // Update existing unverified user
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({
          fullName,
          phone,
          password: hashed,
          role: role || 'attendee',
          otpCode,
          otpExpiry,
          isVerified: false
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (updateError) throw updateError;
      user = updated;
    } else {
      // Create new user
      const { data: created, error: createError } = await supabase
        .from('users')
        .insert([
          {
            fullName,
            email: email.toLowerCase(),
            phone,
            password: hashed,
            role: role || 'attendee',
            otpCode,
            otpExpiry,
            isVerified: false
          }
        ])
        .select()
        .single();
      if (createError) throw createError;
      user = created;
    }



    // No SMS handler call at all. Log OTP for debugging only.
    console.log(`OTP for ${email}: ${otpCode}`);

    res.status(200).json({
      message: 'Signup complete. Verification code sent via SMS.',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      verificationCode: otpCode
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}