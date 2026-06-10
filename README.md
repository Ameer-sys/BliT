# BliT

BliT is a patient-centered health timeline and medication tracking prototype.
Providers create patient profiles, add medications and records, and patients
use a familiar digital blister pack to follow today's care plan.

## What is included

- React + Vite app structure
- Firebase Auth and Firestore setup points through environment variables
- Welcome, login, signup, patient dashboard, provider dashboard, timeline, medications, records, and profile pages
- Patient home screen with a 2x2 digital blister pack
- Dose detail modal with "mark taken" interaction
- Banking-inspired healthcare visual style with a BliT logo and calm teal identity

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and add Firebase project values when you are ready
to connect real authentication and Firestore data.
Do not commit `.env`; local Firebase values should stay private.

## Deploy on Vercel

BliT is a Vite app, so use these Vercel project settings:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

Add these environment variables in Vercel Project Settings before deploying:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

After the first deploy, add the Vercel domain to Firebase Authentication:

1. Open Firebase Console.
2. Go to Authentication > Settings > Authorized domains.
3. Add the generated Vercel domain, and any custom production domain.

The repository includes `vercel.json` with the same build settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

## Firestore rules

`firestore.rules` contains prototype/demo-only rules that allow authenticated
users to read and write. Do not use those rules with real patient data.

## MVP direction

Recommended build order:

1. Provider creates patient
2. Provider adds medication
3. Patient sees medication schedule
4. Patient marks dose as taken
5. Provider adds medical record
6. Patient views timeline

## Firebase backend model

BliT currently uses Firebase Auth plus Firestore as the backend.

- `users/{uid}`: account profile with `name`, `email`, and `role`
- `patients/{patientId}`: patient profile with `linkedUserId` and `createdByProviderId`
- `dosePockets/{pocketId}`: dose schedule pocket with `patientId`, label, time, frequency, and active status
- `medications/{medicationId}`: medication plan with `patientId`, `assignedPocketIds`, dosage, and instructions
- `records/{recordId}`: health record with `patientId`, type, title, date, and notes
- `doseLogs/{logId}`: dose event with `patientId`, `medicationId`, `pocketId`, date, status, and `takenAt`

For the MVP, anyone can create a patient or doctor account. A doctor adds a
patient by email, then medications and records created by that doctor appear on
the linked patient's side.
