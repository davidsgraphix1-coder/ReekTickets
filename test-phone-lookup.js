const { connectDB } = require('./server/config/db');

async function checkUser() {
  try {
    const supabase = await connectDB();
    
    // Normalize the phone number the same way the backend does
    const phone = '0273476701';
    let clean = phone.toString().trim();
    clean = clean.replace(/\s+/g, '').replace(/^\+/, '');
    if (clean.startsWith('0')) {
      clean = `233${clean.slice(1)}`;
    }
    if (!clean.startsWith('233')) {
      clean = `233${clean}`;
    }
    
    console.log('Original phone:', phone);
    console.log('Normalized phone:', clean);
    
    // Search for user with this phone
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', clean)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error);
    } else if (data) {
      console.log('\nFound user:', {
        id: data.id,
        email: data.email,
        phone: data.phone,
        otp_code: data.otp_code,
        otp_expiry: data.otp_expiry,
        is_verified: data.is_verified
      });
    } else {
      console.log('No user found with this phone');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

checkUser();
