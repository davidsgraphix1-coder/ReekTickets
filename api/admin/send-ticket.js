import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function formatPhone(phone) {
  let cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '233' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('233')) {
    cleanPhone = '233' + cleanPhone;
  }
  return cleanPhone;
}

async function sendTicketSms(phone, ticketId, smsCode) {
  try {
    const cleanPhone = formatPhone(phone);
    const ticketLink = `${process.env.FRONTEND_URL || 'https://reektickets.vercel.app'}/ticket/${ticketId}?code=${smsCode}`;
    const message = `Your ReekTickets ticket is ready. Code: ${smsCode}. View at: ${ticketLink}`;
    const pythonBackendUrl = process.env.PYTHON_SMS_BACKEND;

    if (!pythonBackendUrl) {
      throw new Error('PYTHON_SMS_BACKEND must be set in environment variables');
    }

    console.log('[SMS] Sending ticket via Python Zenoph backend:', pythonBackendUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const response = await fetch(`${pythonBackendUrl}/api/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, message }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const responseText = await response.text();
    let responseBody;
    try {
      responseBody = JSON.parse(responseText);
    } catch (_err) {
      responseBody = responseText;
    }

    console.log('[SMS] Python backend response status:', response.status, 'body:', responseBody);

    if (response.status === 200 && responseBody.success) {
      return {
        success: true,
        status: 200,
        message: 'Ticket SMS queued for delivery via Python Zenoph'
      };
    }

    return {
      success: false,
      status: response.status,
      message: responseBody.message || 'Python backend returned an error',
      backendBody: responseBody
    };
  } catch (error) {
    console.error('[SMS] Error:', error.message);
    return {
      success: false,
      status: 500,
      message: error.message.includes('PYTHON_SMS_BACKEND') ? 'SMS backend configuration missing' : error.message
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { ticketId } = req.body;
    if (!ticketId) {
      return res.status(400).json({ message: 'Ticket ID required' });
    }

    // Get ticket with user
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*, users(*)')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const user = ticket.users;
    if (!user || !user.phone) {
      return res.status(400).json({ message: 'User phone not found' });
    }

    // Send ticket SMS
    const smsResult = await sendTicketSms(user.phone, ticket.id, ticket.smsCode);
    if (!smsResult.success) {
      return res.status(500).json({ message: 'Failed to send ticket SMS' });
    }

    return res.status(200).json({ message: 'Ticket SMS sent successfully' });
  } catch (error) {
    console.error('Send ticket SMS error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}