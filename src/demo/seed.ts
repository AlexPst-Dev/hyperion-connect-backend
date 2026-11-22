import bcrypt from "bcryptjs";
import { DataSource } from "typeorm";
import { Billings } from "../models/billings-model";
import { Categories, CategoryType } from "../models/categories-model";
import { Client } from "../models/client-model";
import { Companies } from "../models/companies-model";
import { Contact } from "../models/contact-model";
import {
  CoachingEvent,
  EventCategory,
  Events,
  HyperionEvent,
  HyperlinkEvent,
  MedicalEvent,
  SportingActivityEvent,
} from "../models/events-model";
import { Exercises } from "../models/exercices-model";
import { FileCategory, Files } from "../models/files-model";
import { Graphs } from "../models/graphs-model";
import { LinkedSessions } from "../models/linked-sessions-model";
import { NotificationCategory, Notifications } from "../models/notifications-model";
import { Objectives } from "../models/objectives-model";
import { DiscountOffer, OfferCategory, Offers, SponsorshipOffer } from "../models/offers-model";
import { Sessions } from "../models/sessions-model";
import { MonthlyMonitoringEnum, Subscriptions } from "../models/subscription-model";
import {
  Admin,
  Coach,
  Free,
  Medic,
  Partner,
  ProfileCategory,
  Sportsman,
  User,
} from "../models/users-model";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "./accounts";

// Fictional data for the public demo. Every person, company and figure below
// is invented. Dates are computed from today, so the planning always shows
// upcoming events whatever the day of the reset.

const day = (offset: number): Date => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
};
const ids = (...values: number[]) => values.join(";");

// "List of ids" fields are stored as "1;2;3" strings by the API.
// Monthly graph values are "month:value" pairs, medic notes "{title, text}".

// Smallest valid PDF, used as the attached subscription contract.
const DEMO_PDF = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n"
);

export async function seedDemo(ds: DataSource): Promise<void> {
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  const email = (role: (typeof DEMO_ACCOUNTS)[number]["role"]) =>
    DEMO_ACCOUNTS.find((account) => account.role === role)!.email;

  // ---- Categories ----
  const categoryRepo = ds.getRepository(Categories);
  const category = (label: string, categoryType: CategoryType, backgroundColor: string, textColor = "#FFFFFF") =>
    categoryRepo.save(categoryRepo.create({ label, categoryType, backgroundColor, textColor }));
  const running = await category("Course à pied", CategoryType.SPORT, "#2563EB");
  const trail = await category("Trail", CategoryType.SPORT, "#1F7722");
  const cycling = await category("Cyclisme", CategoryType.SPORT, "#F97316");
  await category("Natation", CategoryType.SPORT, "#0E7490");
  const sportsMedicine = await category("Médecine du sport", CategoryType.MEDICAL, "#771F1F");
  const physio = await category("Kinésithérapie", CategoryType.MEDICAL, "#C61010");
  await category("Nutrition", CategoryType.MEDICAL, "#CAAB4F", "#1F2937");
  const quads = await category("Quadriceps", CategoryType.MUSCLE_GROUP, "#E0E7FF", "#1E3A8A");
  const hamstrings = await category("Ischio-jambiers", CategoryType.MUSCLE_GROUP, "#E0E7FF", "#1E3A8A");
  const calves = await category("Mollets", CategoryType.MUSCLE_GROUP, "#E0E7FF", "#1E3A8A");
  const core = await category("Gainage", CategoryType.MUSCLE_GROUP, "#E0E7FF", "#1E3A8A");

  // ---- Users (one profile row per role) ----
  const userRepo = ds.getRepository(User);
  const user = (data: Partial<User>) =>
    userRepo.save(
      userRepo.create({ password, city: "Rennes", postalCode: "35000", isActive: true, ...data })
    );

  const admin = await user({
    firstName: "Camille", lastName: "Laurent", email: email("admin"),
    phone: "06 00 00 00 01", profileCategory: ProfileCategory.ADMIN,
    description: "Coordinatrice de la plateforme.",
  });
  await ds.getRepository(Admin).save({ user: admin });

  const coach = await user({
    firstName: "Julien", lastName: "Moreau", email: email("coach"),
    phone: "06 00 00 00 02", profileCategory: ProfileCategory.COACH,
    description: "Coach course à pied et trail, spécialiste de la préparation aux semi-marathons.",
    isInHyperlinkNetwork: true,
  });
  await ds.getRepository(Coach).save({ user: coach, sportCategories: [running, trail], canImportSessions: true });

  const medic = await user({
    firstName: "Sarah", lastName: "Lefèvre", email: email("medic"),
    phone: "06 00 00 00 03", profileCategory: ProfileCategory.MEDIC,
    description: "Médecin du sport : bilans, prévention des blessures, reprise après blessure.",
  });
  await ds.getRepository(Medic).save({ user: medic, sportCategories: [sportsMedicine, physio], canImportSessions: false });

  const partner = await user({
    firstName: "Marc", lastName: "Petit", email: email("partner"),
    phone: "06 00 00 00 04", profileCategory: ProfileCategory.PARTNER,
    description: "Gérant d'un atelier vélo partenaire.",
  });

  const free = await user({
    firstName: "Nina", lastName: "Roux", email: email("free"),
    phone: "06 00 00 00 05", profileCategory: ProfileCategory.FREE,
    description: "Découvre la plateforme avant de choisir un accompagnement.",
  });
  await ds.getRepository(Free).save({ user: free });

  // ---- Companies and partner ----
  const companyRepo = ds.getRepository(Companies);
  const bikeShop = await companyRepo.save(
    companyRepo.create({
      name: "Atelier Roue Libre", responsibleId: partner.id,
      description: "Atelier de réparation et d'entretien vélo. Remises pour les membres de la plateforme.",
      city: "Rennes", postalCode: "35000", street: "12 rue de l'Exemple",
      dateEndMembership: day(300), isActive: true,
    })
  );
  const nutrition = await companyRepo.save(
    companyRepo.create({
      name: "Fraîcheur Sport Nutrition",
      description: "Épicerie de nutrition sportive : boissons d'effort, barres et conseils de récupération.",
      city: "Cesson-Sévigné", postalCode: "35510", street: "4 avenue de la Démo",
      dateEndMembership: day(200), isActive: true,
    })
  );
  await ds.getRepository(Partner).save({ user: partner, company: bikeShop, companyId: bikeShop.id });

  // ---- Athletes: subscription, progress graph, medical notes ----
  const fileRepo = ds.getRepository(Files);
  const subscriptionRepo = ds.getRepository(Subscriptions);
  const graphRepo = ds.getRepository(Graphs);

  const athlete = async (
    data: Partial<User>,
    sport: Categories,
    profile: Partial<Sportsman>,
    graphValues: string,
    graphTitle: string,
    unit: string
  ) => {
    const athleteUser = await user({ ...data, profileCategory: ProfileCategory.SPORTSMAN });
    const contract = await fileRepo.save(
      fileRepo.create({
        label: `Contrat ${athleteUser.firstName} ${athleteUser.lastName}.pdf`,
        mimeType: "application/pdf", data: DEMO_PDF, fileCategory: FileCategory.SUBSCRIPTION,
      })
    );
    const subscription = await subscriptionRepo.save(
      subscriptionRepo.create({
        isBilanComplete: true, monthlyMonitoringCategory: MonthlyMonitoringEnum.COMPLETE,
        startDate: day(-150), endDate: day(215), subscriptionFileId: contract.id,
      })
    );
    const graph = await graphRepo.save(
      graphRepo.create({
        userId: athleteUser.id, responsibleId: coach.id, title: graphTitle,
        measuredValue: unit, listMonthlyValue: graphValues,
        startDate: day(-150), endDate: day(215), isActive: true,
      })
    );
    await ds.getRepository(Sportsman).save({
      user: athleteUser, sportCategoryId: sport.id, graphId: graph.id, subscriptionId: subscription.id,
      listMedicsIds: ids(medic.id), ...profile,
    });
    return athleteUser;
  };

  const lea = await athlete(
    {
      firstName: "Léa", lastName: "Martin", email: email("sportsman"), phone: "06 00 00 00 06",
      birthDate: new Date("1994-05-12"), isInHyperlinkNetwork: true,
      description: "Objectif : premier semi-marathon sous 1 h 45.",
    },
    running,
    {
      availableDays: "1010110", availableTime: "18:00 - 20:00",
      listMedicNotes:
        "{Bilan initial, Bonne condition générale. Légère raideur des mollets à surveiller.};{Suivi du mois dernier, Douleur au tendon d'Achille disparue. Reprise des séances de fractionné possible.}",
    },
    "1:13.8;2:14.2;3:14.5;4:14.9;5:15.3;6:15.6",
    "Vitesse maximale aérobie", "km/h"
  );
  const thomas = await athlete(
    {
      firstName: "Thomas", lastName: "Bernard", email: "thomas.bernard@sportlink.example",
      phone: "06 00 00 00 07", birthDate: new Date("1988-11-03"),
      description: "Traileur, prépare un ultra de 80 km.",
    },
    trail,
    { availableDays: "0101011", availableTime: "07:00 - 09:00", listMedicsIds: "", listMedicNotes: "{Bilan initial, Aucune contre-indication.}" },
    "1:52;2:53;3:55;4:56;5:56;6:58",
    "VO2 max", "ml/kg/min"
  );
  const ines = await athlete(
    {
      firstName: "Inès", lastName: "Dubois", email: "ines.dubois@sportlink.example",
      phone: "06 00 00 00 08", birthDate: new Date("1999-02-21"),
      description: "Cycliste, reprise après une fracture du poignet.",
    },
    cycling,
    { availableDays: "1111100", availableTime: "12:00 - 13:30", listMedicNotes: "{Reprise, Consolidation confirmée. Reprise progressive sur home-trainer.}" },
    "1:180;2:195;3:205;4:214;5:220;6:228",
    "Puissance au seuil", "W"
  );

  // ---- Who follows whom ----
  const clientRepo = ds.getRepository(Client);
  await clientRepo.save([
    { professionalId: coach.id, listOfClientIds: ids(lea.id, thomas.id, ines.id) },
    { professionalId: medic.id, listOfClientIds: ids(lea.id, ines.id) },
  ]);
  const contactRepo = ds.getRepository(Contact);
  await contactRepo.save([
    { userId: lea.id, listOfContactIds: ids(coach.id, medic.id, partner.id, thomas.id, ines.id) },
    { userId: thomas.id, listOfContactIds: ids(coach.id, lea.id) },
    { userId: ines.id, listOfContactIds: ids(coach.id, medic.id) },
    { userId: coach.id, listOfContactIds: ids(lea.id, thomas.id, ines.id, medic.id) },
    { userId: medic.id, listOfContactIds: ids(lea.id, ines.id, coach.id) },
  ]);

  // ---- Training library ----
  const exerciseRepo = ds.getRepository(Exercises);
  const exercise = (label: string, durationTime: string, muscles: Categories[], description: string, recommendations: string) =>
    exerciseRepo.save(
      exerciseRepo.create({
        label, durationTime, description, recommendations,
        listMuscleGroupIds: ids(...muscles.map((m) => m.id)), isActive: true,
      })
    );
  const warmUp = await exercise("Échauffement footing", "00:15:00", [quads, calves], "Footing en aisance respiratoire.", "Rester capable de parler.");
  const intervals = await exercise("Fractionné 10 × 400 m", "00:30:00", [quads, hamstrings, calves], "10 répétitions à allure 5 km, 1 min de récupération.", "Garder la même allure sur chaque répétition.");
  const plank = await exercise("Gainage dynamique", "00:10:00", [core], "Planches, planches latérales et mountain climbers.", "Dos neutre, respiration continue.");
  const hills = await exercise("Côtes 8 × 45 s", "00:25:00", [quads, calves], "Montées toniques, retour en trottinant.", "Petites foulées, bras actifs.");
  const coolDown = await exercise("Retour au calme et étirements", "00:10:00", [hamstrings, calves], "Footing lent puis étirements légers.", "Pas d'étirement forcé après une séance intense.");

  const sessionRepo = ds.getRepository(Sessions);
  const session = (label: string, list: Exercises[], durationTime: string, recommendations: string) =>
    sessionRepo.save(
      sessionRepo.create({
        label, numberOfExercises: list.length, durationTime, listExercises: ids(...list.map((e) => e.id)),
        recommendations, contributions: "Endurance, vitesse, prévention des blessures",
        publicImageUrl: "default-session", authorId: coach.id, isActive: true, done: false,
      })
    );
  const vmaSession = await session("Séance VMA courte", [warmUp, intervals, plank, coolDown], "01:05:00", "À faire sur piste ou terrain plat.");
  const hillSession = await session("Séance côtes", [warmUp, hills, coolDown], "00:50:00", "Choisir une côte de 6 à 8 %.");
  const coreSession = await session("Renforcement et gainage", [warmUp, plank], "00:25:00", "Idéal les jours sans course.");

  await ds.getRepository(LinkedSessions).save([
    { userId: lea.id, sessionId: vmaSession.id },
    { userId: lea.id, sessionId: coreSession.id },
    { userId: thomas.id, sessionId: hillSession.id },
    { userId: ines.id, sessionId: coreSession.id },
  ]);

  // ---- Objectives and billing ----
  const objectiveRepo = ds.getRepository(Objectives);
  const objective = await objectiveRepo.save(
    objectiveRepo.create({
      sportsmanId: lea.id, responsibleId: coach.id, label: "Semi-marathon sous 1 h 45",
      startDate: day(-150), endDate: day(60), isActive: true,
    })
  );
  await objectiveRepo.save(
    objectiveRepo.create({
      sportsmanId: thomas.id, responsibleId: coach.id, label: "Terminer un ultra-trail de 80 km",
      startDate: day(-90), endDate: day(120), isActive: true,
    })
  );
  await ds.getRepository(Billings).save([
    { objectiveId: objective.id, date: day(-150), globalAmount: 480, isMonthly: true, monthlyAmount: 80, paymentReceived: true, isActive: true },
    { objectiveId: objective.id, date: day(-30), globalAmount: 80, isMonthly: false, paymentReceived: false, isActive: true },
  ]);

  // ---- Events (one base row + one row in the table of its category) ----
  const eventRepo = ds.getRepository(Events);
  const event = (data: Partial<Events>) => eventRepo.save(eventRepo.create({ isActive: true, ...data }));

  const launch = await event({
    eventCategory: EventCategory.HYPERION, title: "Soirée des membres",
    responsibleIds: ids(admin.id), personOngoingIds: ids(lea.id, thomas.id, partner.id),
    location: "Rennes", date: day(6), time: "19:00:00",
    description: "Présentation des nouveaux partenaires et échanges entre membres.",
  });
  await ds.getRepository(HyperionEvent).save({ event: launch });

  const network = await event({
    eventCategory: EventCategory.HYPERLINK, title: "Afterwork nutrition et récupération",
    responsibleIds: ids(admin.id), personOngoingIds: ids(lea.id, coach.id),
    location: "Fraîcheur Sport Nutrition, Cesson-Sévigné", date: day(10), time: "18:30:00",
    description: "Atelier pratique : que manger avant et après une compétition.",
  });
  await ds.getRepository(HyperlinkEvent).save({ event: network, theme: "Nutrition" });

  const coaching = await event({
    eventCategory: EventCategory.COACHING, title: vmaSession.label,
    responsibleIds: ids(coach.id), personOngoingIds: ids(lea.id),
    location: "Stade de l'Exemple", date: day(2), time: "18:30:00",
  });
  await ds.getRepository(CoachingEvent).save({ event: coaching, sessionId: vmaSession.id, isDone: false });

  const pastCoaching = await event({
    eventCategory: EventCategory.COACHING, title: hillSession.label,
    responsibleIds: ids(coach.id), personOngoingIds: ids(lea.id),
    location: "Parc de l'Exemple", date: day(-5), time: "18:30:00",
  });
  await ds.getRepository(CoachingEvent).save({
    event: pastCoaching, sessionId: hillSession.id, isDone: true,
    sportsmanComment: "Dure mais bien passée, sensations bonnes sur les dernières côtes.",
    sportsmanNote: "8", coachComment: "Très bonne régularité. On garde ce volume la semaine prochaine.",
  });

  const checkup = await event({
    eventCategory: EventCategory.MEDICAL, title: "Bilan de suivi",
    responsibleIds: ids(medic.id), personOngoingIds: ids(lea.id),
    location: "Cabinet de l'Exemple, Rennes", date: day(4), time: "10:00:00",
    description: "Contrôle du tendon d'Achille et test d'effort.",
  });
  await ds.getRepository(MedicalEvent).save({ event: checkup });

  const groupRun = await event({
    eventCategory: EventCategory.SPORTING_ACTIVITY, title: "Sortie trail collective",
    responsibleIds: ids(coach.id), personOngoingIds: ids(lea.id, thomas.id),
    location: "Forêt de l'Exemple", date: day(8), time: "09:00:00",
    description: "15 km, 300 m de dénivelé, ouvert à tous les niveaux.",
  });
  await ds.getRepository(SportingActivityEvent).save({ event: groupRun, maxParticipants: 12 });

  // ---- Partner offers ----
  const offerRepo = ds.getRepository(Offers);
  const discount = await offerRepo.save(
    offerRepo.create({
      companyId: bikeShop.id, offerCategory: OfferCategory.DISCOUNT,
      title: "-15 % sur l'entretien vélo", description: "Révision complète, réglages et changement de pièces d'usure.",
      conditions: "Sur présentation de la carte de membre.", startDate: day(-20), endDate: day(90), isActive: true,
    })
  );
  await ds.getRepository(DiscountOffer).save({ offer: discount, amount: 15 });
  const sponsorship = await offerRepo.save(
    offerRepo.create({
      companyId: bikeShop.id, offerCategory: OfferCategory.SPONSORSHIP,
      title: "Équipement offert à 3 athlètes", description: "Un vélo d'entraînement prêté pour la saison et son entretien.",
      conditions: "Candidature avec un objectif sportif pour la saison.", startDate: day(-10), endDate: day(60), isActive: true,
    })
  );
  await ds.getRepository(SponsorshipOffer).save({ offer: sponsorship, nbPersonMax: 3, personOngoingIds: ids(ines.id) });
  const snack = await offerRepo.save(
    offerRepo.create({
      companyId: nutrition.id, offerCategory: OfferCategory.DISCOUNT,
      title: "-10 % sur la nutrition d'effort", description: "Boissons, barres et gels énergétiques.",
      startDate: day(-5), endDate: day(120), isActive: true,
    })
  );
  await ds.getRepository(DiscountOffer).save({ offer: snack, amount: 10 });

  // ---- Home message and news ----
  await ds.getRepository(Notifications).save([
    {
      notificationCategory: NotificationCategory.HOME_POPUP,
      title: "Bienvenue sur la démo",
      text: "Toutes les données sont fictives et la démo est remise à zéro chaque nuit : vous pouvez tout essayer.",
    },
    {
      notificationCategory: NotificationCategory.NEWS,
      title: "Nouveau partenaire",
      text: "L'Atelier Roue Libre rejoint le réseau : -15 % sur l'entretien vélo pour les membres.",
    },
    {
      notificationCategory: NotificationCategory.NEWS,
      title: "Sortie trail collective",
      text: "Inscriptions ouvertes pour la sortie en forêt de la semaine prochaine.",
    },
  ]);
}
