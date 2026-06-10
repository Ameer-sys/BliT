export const patient = {
  name: "Sarah Johnson",
  age: 64,
  id: "BLT-2048",
  dob: "Jan 14, 1962",
  phone: "+1 (555) 204-8820",
  emergencyContact: "Maya Johnson",
  provider: "Dr. Ahmed Clinic",
  pharmacy: "Greenline Pharmacy",
};

export const doseSlots = [
  {
    id: "breakfast",
    label: "Breakfast",
    time: "8:00 AM",
    meds: ["Metformin 500mg", "Vitamin D 1000 IU"],
    instructions: "Take with food.",
    taken: true,
    takenAt: "8:12 AM",
  },
  {
    id: "lunch",
    label: "Lunch",
    time: "12:30 PM",
    meds: ["Aspirin 81mg"],
    instructions: "Take after meal.",
    taken: true,
    takenAt: "12:43 PM",
  },
  {
    id: "dinner",
    label: "Dinner",
    time: "6:00 PM",
    meds: ["Metformin 500mg"],
    instructions: "Take with food.",
    taken: false,
    takenAt: "",
  },
  {
    id: "bedtime",
    label: "Bedtime",
    time: "9:30 PM",
    meds: ["Atorvastatin 20mg"],
    instructions: "Take before sleep.",
    taken: false,
    takenAt: "",
  },
];

export const timeline = [
  {
    type: "Lab",
    title: "Blood test results",
    date: "June 8, 2026",
    detail: "Cholesterol slightly elevated. Provider recommended evening statin.",
  },
  {
    type: "Visit",
    title: "Annual checkup",
    date: "May 22, 2026",
    detail: "Blood pressure improving. Continue medication plan and daily walks.",
  },
  {
    type: "Prescription",
    title: "Metformin renewed",
    date: "May 1, 2026",
    detail: "500mg prescribed for Breakfast and Dinner through August 1.",
  },
  {
    type: "Pharmacy",
    title: "Monthly blister pack prepared",
    date: "April 28, 2026",
    detail: "Dose pack organized by Breakfast, Lunch, Dinner, and Bedtime.",
  },
];

export const medications = [
  {
    name: "Metformin",
    dosage: "500mg",
    instructions: "Take with food.",
    timing: ["Breakfast", "Dinner"],
    ends: "Aug 1, 2026",
  },
  {
    name: "Vitamin D",
    dosage: "1000 IU",
    instructions: "Take after meal.",
    timing: ["Breakfast"],
    ends: "Jul 9, 2026",
  },
  {
    name: "Atorvastatin",
    dosage: "20mg",
    instructions: "Take before sleep.",
    timing: ["Bedtime"],
    ends: "Ongoing",
  },
];
