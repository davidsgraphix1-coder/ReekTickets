const { connectDB } = require('./server/config/db');

async function debugOtp() {
  try {
    const supabase = await connectDB();
    
    // Normalize the phone number
    const phone = '0273476701';
    let clean = phone.toString().trim();
    clean = clean.replace(/\s+/g, '').replace(/^\+/, '');
    if (clean.startsWith('0')) {
      clean = `233${clean.slice(1)}`;
    }
    if (!clean.startsWith('233')) {
      clean = `233${clean}`;
    }
    
    console.log('\n=== PHONE LOOKUP ===');
    console.log('Original phone:', phone);
    console.log('Normalized phone:', clean);
    
    // Get all users with this phone
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('id, email, phone, otp_code, otp_expiry, is_verified, created_at')
      .eq('phone', clean);
    
    if (allError) {
      console.error('Database error:', allError);
      process.exit(1);
    }
    
    if (!allUsers || allUsers.length === 0) {
      console.log('No users found with phone:', clean);
      process.exit(0);
    }
    
    console.log(`\nFound ${allUsers.length} user(s):\n`);
    
    allUsers.forEach((user, idx) => {
      console.log(`User ${idx + 1}:`);
      console.log('  ID:', user.id);
      console.log('  Email:', user.email);
      console.log('  Phone:', user.phone);
      console.log('  Is Verified:', user.is_verified);
      console.log('  Created:', user.created_at);
      console.log('  OTP Code:', user.otp_code);
      console.log('  OTP Code Type:', typeof user.otp_code);
      console.log('  OTP Code Length:', user.otp_code ? String(user.otp_code).length : 'null');
      if (user.otp_code) {
        console.log('  OTP Code Chars:', Array.from(String(user.otp_code)).map((c, i) => `[${i}]='${c}'(${c.charCodeAt(0)})`).join(' '));
      }
      console.log('  OTP Expiry:', user.otp_expiry);
      const now = new Date();
      const expiry = new Date(user.otp_expiry);
      console.log('  Expired?', expiry < now ? `YES (${Math.floor((now - expiry) / 1000)}s ago)` : `NO (expires in ${Math.floor((expiry - now) / 1000)}s)`);
      console.log('');
    });
    
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err);
  }
  process.exit(0);
}

debugOtp();
