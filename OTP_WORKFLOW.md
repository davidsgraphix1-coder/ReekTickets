# ReekTickets OTP Verification Workflow

## Overview
The new OTP verification system allows admins to manually send SMS codes to pending users, then input those codes for users to verify their accounts.

## Workflow Steps

### Step 1: Admin Sends SMS Code
1. Open **Admin Dashboard** → **Pending Verifications** tab
2. You'll see a list of unverified users with their **phone numbers**
3. Copy the user's phone number (e.g., `+233123456789`)
4. Open your terminal and run:
   ```bash
   python send_sms_example.py
   ```
   - When prompted, paste the copied phone number
   - Enter the 6-digit OTP code you want to send (e.g., `123456`)
   - The SMS will be sent to that user's phone

### Step 2: Admin Inputs Code in Dashboard
1. After sending the SMS, return to the **Pending Verifications** tab in Admin Dashboard
2. Click the **"Enter Code"** button for the user you just sent the SMS to
3. A modal popup will appear with:
   - User's name, phone, and email
   - An input field for the 6-digit OTP code
4. Enter the **exact same 6-digit code** you sent in Step 1
5. Click **"Set OTP Code"** button
6. The system will store this code for 10 minutes

### Step 3: User Enters Code
1. The user receives the SMS with the 6-digit code
2. User goes to the **Verify OTP** page (or is redirected there after signup)
3. User enters all 6 digits of the code they received
4. User clicks **"Verify Code"**

### Step 4: System Confirms and Redirects
1. The backend (`api/auth/verify-otp.js`) compares the code admin set with the code user entered
2. If codes match: ✅ User is verified and redirected to their dashboard
   - If admin (email: ceoofreektickets@gmail.com) → `/dashboard/admin`
   - If organizer → `/dashboard/organizer`
   - If vendor → `/dashboard/vendor`
   - If agent → `/dashboard/agent`
   - Otherwise → `/dashboard/attendee`
3. If codes don't match: ❌ Error message "Invalid verification code"
4. If code expires (10 minute window): ❌ Error message "Verification code has expired"

## Error Scenarios

### "OTP code must be 6 digits"
- The code you entered in the modal or the user entered must be exactly 6 numeric digits
- Examples that work: `123456`, `000000`, `999999`
- Examples that don't work: `12345`, `1234567`, `12345a`

### "User not found"
- The phone number format may be incorrect
- Make sure phone is properly formatted as +233XXXXXXXXX

### "User already verified"
- This user has already been verified
- Only unverified users appear in the Pending Verifications tab

### "Invalid verification code"
- The code the user entered doesn't match the code admin set
- Ask the user to re-check the SMS and try again
- Or admin can send a new code using "Resend OTP" (coming soon)

## Key Files Modified

1. **`api/admin/set-user-otp.js`** (NEW)
   - Accepts userId and otpCode
   - Stores code in user record with 10-minute expiry
   - Validates code is 6 digits

2. **`api/auth/verify-otp.js`** (UPDATED)
   - Now accepts both phone and email parameters
   - Uses phone lookup by default (no email verification for OTP)
   - Returns token and user object for proper session setup

3. **`src/dashboards/AdminDashboard.jsx`** (UPDATED)
   - Added modal popup for entering OTP codes
   - Added state management for modal visibility and input
   - Improved pending-verifications UI with instructions

4. **`src/dashboards/AdminDashboard.css`** (UPDATED)
   - Added modal styling (overlay, content box, animations)
   - Added OTP input styling with monospace font and letter spacing

5. **`src/pages/VerifyOtp.js`** (NO CHANGES NEEDED)
   - Already configured for phone-based OTP verification
   - No email verification in OTP flow (email-only for forgot password)

## Tips

- **Keep codes random**: Don't use predictable codes like `111111` or `000000`
- **Copy phone carefully**: Make sure you copy the exact phone number from the table
- **Re-enter code carefully**: Admins must enter the same code they sent; users must enter what they received
- **10-minute window**: Users have 10 minutes to verify after admin sets the code
- **Multiple attempts**: If user enters wrong code, they can try again within the time window

## Testing

To test the full workflow:
1. Create a new user via signup without entering OTP (or create via admin panel)
2. That user will appear in Pending Verifications
3. Admin sends SMS using `send_sms_example.py`
4. Admin enters that code in the modal
5. Tell the test user to visit `/verify-otp` and enter the code they received
6. Confirm redirect to the appropriate dashboard

## Linked Features: ChatSupport Management

The **Full Control** tab in Admin Dashboard also contains comprehensive ChatSupport management:
- Enable/disable ChatSupport for all users
- Assign multiple admins to help handle customer chats
- Set automated responses when admins are unavailable
- Remove admin access anytime
- View all chat support admins and their access levels

For detailed ChatSupport instructions, see [CHATSUPPORT_GUIDE.md](CHATSUPPORT_GUIDE.md)

## Deployment

- Verify `/api/admin/set-user-otp.js` is included in deployment
- Ensure environment variables are set:
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
  - `JWT_SECRET` (or uses default)
- Deploy with: `vercel --prod`
