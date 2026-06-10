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

## MVP direction

Recommended build order:

1. Provider creates patient
2. Provider adds medication
3. Patient sees medication schedule
4. Patient marks dose as taken
5. Provider adds medical record
6. Patient views timeline
