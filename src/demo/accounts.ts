// Public demo accounts, one per role. Every account shares the same password:
// the data is fictional and the whole database is rebuilt every night.
export const DEMO_PASSWORD = "demo2026";

export const DEMO_ACCOUNTS = [
  { role: "admin", label: "Administratrice", email: "admin@sportlink.example" },
  { role: "coach", label: "Coach", email: "coach@sportlink.example" },
  { role: "medic", label: "Médecin du sport", email: "medecin@sportlink.example" },
  { role: "sportsman", label: "Sportive", email: "sportive@sportlink.example" },
  { role: "partner", label: "Partenaire", email: "partenaire@sportlink.example" },
  { role: "free", label: "Compte découverte", email: "decouverte@sportlink.example" },
] as const;
