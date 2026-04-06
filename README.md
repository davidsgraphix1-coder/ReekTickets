# ReekTickets

ReekTickets is a ticketing web app with a React frontend and Node.js backend.

This repository includes:
- React application and frontend
- Node/Express server
- SMS gateway integration for OTP and ticket notifications

## Local setup

```bash
npm install
npm start
```

The app runs locally at `http://localhost:3000`.

## SMS Gateway

- The SMS gateway listens on port `8001`
- Gateway entry point: `server/sms-gateway.js`
- Backend SMS service: `server/services/smsService.js`

## Environment variables

Add these values in Vercel or your deployment host:

- `SMS_GATEWAY_URL`
- `USE_SMS_GATEWAY=true`
- `SMS_API_KEY`
- `SMS_SENDER_ID=ReekTickets`
- `SMS_HOST=api.smsonlinegh.com`

## Deployment

- Frontend/backend: Vercel
- SMS gateway: Railway, Render, or another public host

## License

MIT
