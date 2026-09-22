export type NotificationTone = "gentle" | "encouraging" | "reset" | "billing" | "profile";

export type NotificationTemplate = {
  id: string;
  tone: NotificationTone;
  title: string;
  body: string;
};

export const notificationTemplates: NotificationTemplate[] = [
  {
    body: "Ai 30 secunde pentru un check-in? Putem nota doar masa principala si continuam de acolo.",
    id: "day-1-check-in",
    title: "Zi aglomerata?",
    tone: "gentle",
  },
  {
    body: "Nu trebuie sa recuperezi tot. Alege o masa buna azi si intram inapoi in ritm.",
    id: "day-2-encourage",
    title: "Un pas mic e suficient",
    tone: "encouraging",
  },
  {
    body: "Facem un restart bland? Iti pregatesc un plan simplu pentru azi.",
    id: "day-3-reset",
    title: "Hai sa resetam fara presiune",
    tone: "reset",
  },
  {
    body: "Premium se reinnoieste curand. Accesul se pastreaza doar daca plata este confirmata de Stripe.",
    id: "subscription-renewal",
    title: "Reminder abonament",
    tone: "billing",
  },
  {
    body: "A trecut aproape o luna. Verifica greutatea, obiectivul si zilele disponibile ca planul sa ramana realist.",
    id: "monthly-profile-update",
    title: "Update rapid de profil",
    tone: "profile",
  },
];
