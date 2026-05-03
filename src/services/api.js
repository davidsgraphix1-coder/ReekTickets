import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Please add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

const normalizeError = (error, fallback = 'Unable to complete the request.') => ({
  success: false,
  message: error?.message || fallback,
});

const getCurrentUser = async () => {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user || null;
};

export const getAuthHeader = () => ({
  // Supabase manages auth internally in the client. Keep this for compatibility.
});

export async function signup(data) {
  const { email, phone, password, role, fullName, ...metadata } = data || {};
  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' };
  }

  const { data: result, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/verify-email`,
      data: {
        role,
        fullName,
        phone,
        ...metadata,
      },
    },
  });

  if (error) return normalizeError(error);
  return {
    success: true,
    message: 'Signup successful. Check your email or phone for verification.',
    user: result?.user || null,
    token: result?.session?.access_token,
  };
}

export async function verifyOtp(data) {
  const { phone, email, otpCode } = data || {};
  if (!otpCode) {
    return { success: false, message: 'OTP code is required.' };
  }

  const type = phone ? 'sms' : 'email';
  const authPayload = phone ? { phone } : { email };

  const { data: result, error } = await supabase.auth.verifyOtp({
    ...authPayload,
    token: otpCode,
    type,
  });

  if (error) return normalizeError(error);
  return {
    success: true,
    message: 'Verification successful.',
    user: result?.user || null,
    token: result?.session?.access_token,
  };
}

export async function resendOtp(data) {
  const { phone, email } = data || {};
  const authPayload = phone ? { phone } : email ? { email } : null;
  if (!authPayload) {
    return { success: false, message: 'Email or phone is required to resend OTP.' };
  }

  const { error } = await supabase.auth.signInWithOtp({
    ...authPayload,
    options: {
      emailRedirectTo: `${window.location.origin}/verify-email`,
    },
  });

  if (error) return normalizeError(error);
  return { success: true, message: 'OTP resent successfully.' };
}

export async function login(data) {
  const { email, phone, password } = data || {};
  if (!password) {
    return { success: false, message: 'Password is required.' };
  }

  const authPayload = email ? { email } : phone ? { phone } : null;
  if (!authPayload) {
    return { success: false, message: 'Email or phone is required to login.' };
  }

  const { data: result, error } = await supabase.auth.signInWithPassword({
    ...authPayload,
    password,
  });

  if (error) return normalizeError(error);
  return {
    success: true,
    message: 'Login successful.',
    user: result?.user || null,
    token: result?.session?.access_token,
  };
}

export async function forgotPassword() {
  return { success: false, message: 'Password reset is not available in Supabase-only mode.' };
}

export async function verifyResetCode() {
  return { success: false, message: 'Password reset is not available in Supabase-only mode.' };
}

export async function resetPassword() {
  return { success: false, message: 'Password reset is not available in Supabase-only mode.' };
}

export async function fetchEvents() {
  const { data, error } = await supabase.from('events').select('*');
  if (error) return [];
  return data || [];
}

export async function fetchEvent(id) {
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
  if (error) throw new Error(error.message || 'Event not found');
  return data || null;
}

export async function fetchTicket(id, code) {
  const query = supabase.from('tickets').select('*').eq('id', id).maybeSingle();
  const { data, error } = await query;
  if (error || !data) {
    throw new Error('Ticket not found');
  }
  if (code && data.code !== code && data.smsCode !== code) {
    throw new Error('Ticket not found');
  }
  return data;
}

export async function fetchMyTickets() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];
    const { data, error } = await supabase.from('tickets').select('*').eq('user_id', user.id);
    if (error) return [];
    return data || [];
  } catch {
    return { message: 'Network error: could not fetch tickets' };
  }
}

export async function createEvent(payload) {
  try {
    const user = await getCurrentUser();
    const insertPayload = {
      ...payload,
      organizer_id: user?.id,
    };
    const { data, error } = await supabase.from('events').insert(insertPayload).select().single();
    if (error) return normalizeError(error);
    return { success: true, data };
  } catch {
    return { message: 'Network error: cannot create event' };
  }
}

export async function initPaystack() {
  return { success: false, message: 'Paystack integration is not available in Supabase-only mode.' };
}

export async function withdrawFunds() {
  return { success: false, message: 'Withdrawals are not available in Supabase-only mode.' };
}

export async function requestOrganizerPayout() {
  return { success: false, message: 'Payout requests are not available in Supabase-only mode.' };
}

export async function getAdminPendingPayouts() {
  return { success: false, message: 'Admin payout data is not available in Supabase-only mode.' };
}

export async function processAdminPayout() {
  return { success: false, message: 'Admin payout processing is not available in Supabase-only mode.' };
}

export async function getOrganizerPayouts() {
  return { success: false, message: 'Organizer payout history is not available in Supabase-only mode.' };
}

export async function getPaymentSummary() {
  return { success: false, message: 'Payment summary is not available in Supabase-only mode.' };
}

export async function verifyPayment() {
  return { success: false, message: 'Payment verification is not available in Supabase-only mode.' };
}

export async function sendNaloSms() {
  return { success: false, message: 'SMS sending is not available in Supabase-only mode.' };
}

export async function verifyTicketCode(ticketId, code) {
  if (!ticketId || !code) {
    throw new Error('Ticket ID and access code are required.');
  }
  return fetchTicket(ticketId, code);
}

export async function getAdminRevenueSummary() {
  return { success: false, message: 'Admin revenue data is not available in Supabase-only mode.' };
}

export async function requestAdminWithdrawal() {
  return { success: false, message: 'Admin withdrawal requests are not available in Supabase-only mode.' };
}

export async function getAdminWithdrawals() {
  return { success: false, message: 'Admin withdrawals are not available in Supabase-only mode.' };
}

export async function processAdminWithdrawal() {
  return { success: false, message: 'Admin withdrawal processing is not available in Supabase-only mode.' };
}

export async function validateCoupon() {
  return { success: false, message: 'Coupon validation is not available in Supabase-only mode.' };
}

export async function markAttendance(ticketReference, smsCode) {
  if (!ticketReference) {
    return { success: false, message: 'Ticket reference is required.' };
  }

  const { data, error } = await supabase
    .from('tickets')
    .update({ attendance: true, verified_at: new Date().toISOString() })
    .match({ reference: ticketReference });

  if (error) return normalizeError(error);
  return { success: true, data };
}
