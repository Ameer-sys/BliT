# BliT / Pryln Prototype

Pryln is a patient-centered health timeline and medication tracking prototype.
Providers create patient profiles, add medications and records, and patients
use a familiar digital blister pack to follow today's care plan.

## What is included

- Patient home screen with a 2x2 digital blister pack
- Dose detail modal with "mark taken" interaction
- Patient timeline, medications, and profile views
- Provider dashboard with quick actions for medication, records, timeline, and access
- Banking-inspired healthcare visual style: calm teal, white cards, clear hierarchy

## Run locally

Open `index.html` in a browser, or serve the folder with any static server.

```bash
npx serve .
```

## MVP direction

The prototype is intentionally dependency-light so the product direction can be
validated quickly before wiring Firebase or a full app framework.

Recommended build order:

1. Provider creates patient
2. Provider adds medication
3. Patient sees medication schedule
4. Patient marks dose as taken
5. Provider adds medical record
6. Patient views timeline
