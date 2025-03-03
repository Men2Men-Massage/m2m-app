# M2M Payment Calculator - TypeScript Version

This is a TypeScript implementation of the M2M Payment Calculator, a Progressive Web App (PWA) designed to help therapists at M2M manage payments, gift cards, and payment history.

## Features

- **Authentication System**: Secure access with a passcode
- **User Profiles**: Create and manage user profiles
- **Payment Calculator**: Calculate payments with proper fee distribution (40% to center, 60% to therapist)
- **Gift Card Management**: Track and request gift card payments
- **Payment History**: View payment history with a calendar-based interface
- **Quick Calculator**: Built-in calculator utility
- **PWA Support**: Works offline and can be installed on devices

## Project Structure

```
m2m-payment-calculator/
├── public/
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   ├── index.html
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── api/
│   │   └── send-giftcard-request.ts
│   ├── components/
│   │   ├── auth.ts
│   │   ├── payment-calculator.ts
│   │   ├── payment-history.ts
│   │   ├── user-profile.ts
│   │   └── utility-calculator.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── storage-service.ts
│   ├── app.ts
│   └── style.css
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Build for production:
   ```
   npm run build
   ```

## Environment Variables

Create a `.env.local` file with the following variables:
```
BREVO_SMTP_KEY=your_brevo_smtp_key
```

## Deployment

The application can be deployed on Vercel, Netlify, or any other static site hosting service. Make sure to set up the environment variables in your hosting dashboard.

## Authentication

The default access code is set to `1228`. This can be changed in the `storage-service.ts` file.

## PWA Features

The application works as a Progressive Web App and can be installed on mobile devices:
- On iOS, users can add it to their home screen from Safari
- On Android, the app will prompt users to install it

## API Endpoints

- `/api/send-giftcard-request` - Sends gift card payment requests to the center via email

## License

This project is proprietary and confidential to M2M.
