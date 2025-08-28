import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Events, EventCategory } from "../models/events-model";
import { User } from "../models/users-model";
import {
  HyperionEvent,
  HyperlinkEvent,
  CoachingEvent,
  MedicalEvent,
  SportingActivityEvent,
} from "../models/events-model";
import { In } from "typeorm";
import { sendMail } from "../utils/mailService";

export const getAllEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const eventRepo = AppDataSource.getRepository(Events);
    const events = await eventRepo.find();

    const hyperionEventsRepo = AppDataSource.getRepository(HyperionEvent);
    const hyperlinkEventsRepo = AppDataSource.getRepository(HyperlinkEvent);
    const coachingEventsRepo = AppDataSource.getRepository(CoachingEvent);
    const medicalEventsRepo = AppDataSource.getRepository(MedicalEvent);
    const sportingActivityEventsRepo = AppDataSource.getRepository(
      SportingActivityEvent
    );

    const eventsWithDetails = await Promise.all(
      events.map(async (event) => {
        let specificEvent: any = null;

        switch (event.eventCategory) {
          case EventCategory.HYPERION:
            specificEvent = await hyperionEventsRepo.findOne({
              where: { id: event.id },
            });
            break;
          case EventCategory.HYPERLINK:
            specificEvent = await hyperlinkEventsRepo.findOne({
              where: { id: event.id },
            });
            break;
          case EventCategory.COACHING:
            specificEvent = await coachingEventsRepo.findOne({
              where: { id: event.id },
            });
            break;
          case EventCategory.MEDICAL:
            specificEvent = await medicalEventsRepo.findOne({
              where: { id: event.id },
            });
            break;
          case EventCategory.SPORTING_ACTIVITY:
            specificEvent = await sportingActivityEventsRepo.findOne({
              where: { id: event.id },
            });
            break;
          default:
            break;
        }

        return {
          ...event,
          specificEvent,
        };
      })
    );

    res.status(200).json({ events: eventsWithDetails });
  } catch (error) {
    console.error("Erreur lors de la récupération des événements :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const hyperionEventsRepo = AppDataSource.getRepository(HyperionEvent);
  const hyperlinkEventsRepo = AppDataSource.getRepository(HyperlinkEvent);
  const coachingEventsRepo = AppDataSource.getRepository(CoachingEvent);
  const medicalEventsRepo = AppDataSource.getRepository(MedicalEvent);
  const sportingActivityEventsRepo = AppDataSource.getRepository(
    SportingActivityEvent
  );

  const {
    eventCategory,
    responsibleIds,
    personOngoingIds,
    title,
    location,
    date,
    time,
    description,
    link,
    isActive,
    ...specificEventData
  } = req.body;

  try {
    if (!Object.values(EventCategory).includes(eventCategory)) {
      res.status(400).json({ message: "Catégorie d'événement invalide" });
      return;
    }

    const eventRepo = AppDataSource.getRepository(Events);
    const newEvent = eventRepo.create({
      eventCategory,
      responsibleIds,
      personOngoingIds,
      title,
      location,
      date,
      time,
      description,
      link,
      isActive,
    });
    const savedEvent = await eventRepo.save(newEvent);

    let specificEvent;

    switch (eventCategory) {
      case EventCategory.HYPERION:
        specificEvent = hyperionEventsRepo.create({
          event: savedEvent,
        });
        await hyperionEventsRepo.save(specificEvent);
        // Envoi du mail à tous les utilisateurs sauf les admins
        const allUserRepo = AppDataSource.getRepository(User);
        const users = await allUserRepo.find({
          where: {
            profileCategory: In([
              "sportsman",
              "coach",
              "medic",
              "free",
              "partner",
            ]),
          },
        });
        for (const user of users) {
          if (user.email) {
            sendMail(
              user.email,
              "HYPERION - Publication événement",
              `<h1 style="color: #1E3A8A">Un nouvel événement vient d'être publié.</h1>
              <p>Titre : ${savedEvent.title}</p>
              <p>Description : ${
                savedEvent.description || "Aucune description"
              }</p>
              <p>Date : ${savedEvent.date} à ${savedEvent.location}</p>
              <p>Consultez la plateforme pour plus d'informations.</p>`
            );
          }
        }
        break;
      case EventCategory.HYPERLINK:
        specificEvent = hyperlinkEventsRepo.create({
          event: savedEvent,
          theme: specificEventData.theme || null,
        });
        await hyperlinkEventsRepo.save(specificEvent);
        // Envoi du mail à tous les membres Hyperlink
        const userRepo = AppDataSource.getRepository(User);
        const hyperlinkMembers = await userRepo.find({
          where: { isInHyperlinkNetwork: true },
        });
        for (const member of hyperlinkMembers) {
          if (member.email) {
            await sendMail(
              member.email,
              "HYPERION - Evénement Hyperlink",
              `<h1 style="color: #1E3A8A">HYPERION - Evénement Hyperlink</h1>
              <p>Titre : ${
                savedEvent.title
              }</p><p>Consultez la plateforme pour plus d'informations.</p>
              <p>Cet événement a pour thème : ${
                specificEventData.theme || "Non renseigné"
              }</p>
              <p>Et aura lieu le: ${savedEvent.date} à ${
                savedEvent.location
              }</p>
              `
            );
          }
        }
        break;
      case EventCategory.COACHING:
        specificEvent = coachingEventsRepo.create({
          event: savedEvent,
          sessionId: specificEventData.sessionId || null,
          isDone: specificEventData.isDone || false,
          sportsmanComment: specificEventData.sportsmanComment || null,
          sportsmanNote: specificEventData.sportsmanNote || null,
          coachComment: specificEventData.coachComment || null,
        });
        await coachingEventsRepo.save(specificEvent);
        break;
      case EventCategory.MEDICAL:
        specificEvent = medicalEventsRepo.create({
          event: savedEvent,
        });
        await medicalEventsRepo.save(specificEvent);
        break;
      case EventCategory.SPORTING_ACTIVITY:
        specificEvent = sportingActivityEventsRepo.create({
          event: savedEvent,
          maxParticipants: specificEventData.maxParticipants || null,
        });
        await sportingActivityEventsRepo.save(specificEvent);

        // 1. Mail au sportif créateur
        const creatorId = responsibleIds?.split(";")[0];
        if (creatorId) {
          const userRepo = AppDataSource.getRepository(User);
          const creator = await userRepo.findOneBy({
            id: parseInt(creatorId, 10),
          });
          if (creator && creator.email) {
            await sendMail(
              creator.email,
              "HYPERION - Publication d'un événement",
              `<h1 style="color: #1E3A8A">Publication d'un événement</h1>
              <p>Votre événement à bien été envoyé aux administrateurs d'HYPERION pour vérification avant validation. Merci !</p>
              `
            );
          }
        }

        // 2. Mail aux admins (déjà présent)
        const usersRepo = AppDataSource.getRepository(User);
        const admins = await usersRepo.find({
          where: {
            profileCategory: In(["admin"]),
          },
        });
        for (const user of admins) {
          if (user.email) {
            await sendMail(
              user.email,
              "HYPERION - Nouvelle activité sportive à valider",
              `<h1 style="color: #1E3A8A">Une nouvelle activité sportive requiert votre validation</h1>
              <p>Titre : ${savedEvent.title}</p>
              <p>Description : ${
                savedEvent.description || "Aucune description"
              }</p>
              <p>Date : ${savedEvent.date} à ${savedEvent.location}</p>
              <p>Consultez la plateforme pour plus d'informations.</p>`
            );
          }
        }
        break;
      default:
        break;
    }

    res.status(201).json({
      message: "Événement créé avec succès",
      specificEvent,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'événement :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la création de l'événement" });
  }
};

export const getEventById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const eventRepo = AppDataSource.getRepository(Events);

  try {
    if (isNaN(parseInt(id, 10))) {
      res.status(400).json({ message: "ID d'événement invalide" });
      return;
    }
    const event = await eventRepo.findOneBy({ id: parseInt(id, 10) });

    if (!event) {
      res.status(404).json({ message: "Événement non trouvé" });
      return;
    }

    let specificEvent = null;

    switch (event.eventCategory) {
      case EventCategory.HYPERION:
        specificEvent = await AppDataSource.getRepository(
          HyperionEvent
        ).findOne({
          where: { event: { id: event.id } },
        });
        break;
      case EventCategory.HYPERLINK:
        specificEvent = await AppDataSource.getRepository(
          HyperlinkEvent
        ).findOne({
          where: { event: { id: event.id } },
        });
        break;
      case EventCategory.COACHING:
        specificEvent = await AppDataSource.getRepository(
          CoachingEvent
        ).findOne({
          where: { event: { id: event.id } },
          relations: ["session"],
        });
        break;
      case EventCategory.MEDICAL:
        specificEvent = await AppDataSource.getRepository(MedicalEvent).findOne(
          {
            where: { event: { id: event.id } },
          }
        );
        break;
      case EventCategory.SPORTING_ACTIVITY:
        specificEvent = await AppDataSource.getRepository(
          SportingActivityEvent
        ).findOne({
          where: { event: { id: event.id } },
        });
        break;
    }

    if (specificEvent && "event" in specificEvent) {
      delete (specificEvent as any).event;
    }

    res.status(200).json({
      event: {
        ...event,
        specificEvent: specificEvent || null,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'événement :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération de l'événement",
    });
  }
};

export const getEventsByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category } = req.params;
  const eventRepo = AppDataSource.getRepository(Events);

  try {
    if (!Object.values(EventCategory).includes(category as EventCategory)) {
      res.status(400).json({ message: "Catégorie d'événement invalide" });
      return;
    }

    const events = await eventRepo.find({
      where: { eventCategory: category as EventCategory },
      order: { date: "ASC", time: "ASC" },
    });

    const results = await Promise.all(
      events.map(async (event) => {
        let specificEvent = null;

        switch (event.eventCategory) {
          case EventCategory.HYPERION:
            specificEvent = await AppDataSource.getRepository(
              HyperionEvent
            ).findOne({
              where: { event: { id: event.id } },
            });
            break;
          case EventCategory.HYPERLINK:
            specificEvent = await AppDataSource.getRepository(
              HyperlinkEvent
            ).findOne({
              where: { event: { id: event.id } },
            });
            break;
          case EventCategory.COACHING:
            specificEvent = await AppDataSource.getRepository(
              CoachingEvent
            ).findOne({
              where: { event: { id: event.id } },
              relations: ["session"],
            });
            break;
          case EventCategory.MEDICAL:
            specificEvent = await AppDataSource.getRepository(
              MedicalEvent
            ).findOne({
              where: { event: { id: event.id } },
            });
            break;
          case EventCategory.SPORTING_ACTIVITY:
            specificEvent = await AppDataSource.getRepository(
              SportingActivityEvent
            ).findOne({
              where: { event: { id: event.id } },
            });
            break;
        }

        if (specificEvent && "event" in specificEvent) {
          delete (specificEvent as any).event;
        }

        return {
          ...event,
          specificEvent: specificEvent || null,
        };
      })
    );

    res.status(200).json({ events: results });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des événements par catégorie :",
      error
    );
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des événements",
    });
  }
};

export const getEventUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const eventRepo = AppDataSource.getRepository(Events);
  const userRepo = AppDataSource.getRepository(User);

  try {
    if (isNaN(parseInt(id, 10))) {
      res.status(400).json({ message: "ID d'événement invalide" });
      return;
    }

    const event = await eventRepo.findOneBy({ id: parseInt(id, 10) });

    if (!event) {
      res.status(404).json({ message: "Événement non trouvé" });
      return;
    }

    const parseIds = (idString: string | null): number[] => {
      return idString
        ? idString
            .split(";")
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id))
        : [];
    };

    const responsibleIds = parseIds(event.responsibleIds);
    const participantIds = parseIds(event.personOngoingIds);

    const [responsibles, participants] = await Promise.all([
      responsibleIds.length > 0
        ? userRepo.findBy({ id: In(responsibleIds) })
        : [],
      participantIds.length > 0
        ? userRepo.findBy({ id: In(participantIds) })
        : [],
    ]);

    res.status(200).json({ responsibles, participants });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des utilisateurs d'un événement :",
      error
    );
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des utilisateurs",
    });
  }
};

export const getEventsByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  if (isNaN(parseInt(userId, 10))) {
    res.status(400).json({ message: "ID utilisateur invalide" });
    return;
  }
  const userIdStr = String(parseInt(userId, 10));
  const eventRepo = AppDataSource.getRepository(Events);

  try {
    // Find events where userId is in responsibleIds or personOngoingIds
    const events = await eventRepo
      .createQueryBuilder("event")
      .where(
        "(event.responsibleIds LIKE :like1 OR event.responsibleIds LIKE :like2 OR event.responsibleIds LIKE :like3 OR event.responsibleIds = :exact1)",
        {
          like1: `${userIdStr};%`,
          like2: `%;${userIdStr};%`,
          like3: `%;${userIdStr}`,
          exact1: userIdStr,
        }
      )
      .orWhere(
        "(event.personOngoingIds LIKE :like4 OR event.personOngoingIds LIKE :like5 OR event.personOngoingIds LIKE :like6 OR event.personOngoingIds = :exact2)",
        {
          like4: `${userIdStr};%`,
          like5: `%;${userIdStr};%`,
          like6: `%;${userIdStr}`,
          exact2: userIdStr,
        }
      )
      .getMany();

    // Fetch specific event details as in getAllEvents
    const hyperionEventsRepo = AppDataSource.getRepository(HyperionEvent);
    const hyperlinkEventsRepo = AppDataSource.getRepository(HyperlinkEvent);
    const coachingEventsRepo = AppDataSource.getRepository(CoachingEvent);
    const medicalEventsRepo = AppDataSource.getRepository(MedicalEvent);
    const sportingActivityEventsRepo = AppDataSource.getRepository(
      SportingActivityEvent
    );

    const eventsWithDetails = await Promise.all(
      events.map(async (event) => {
        let specificEvent: any = null;
        switch (event.eventCategory) {
          case EventCategory.HYPERION:
            specificEvent = await hyperionEventsRepo.findOne({
              where: { event: { id: event.id } },
            });
            break;
          case EventCategory.HYPERLINK:
            specificEvent = await hyperlinkEventsRepo.findOne({
              where: { event: { id: event.id } },
            });
            break;
          case EventCategory.COACHING:
            specificEvent = await coachingEventsRepo.findOne({
              where: { event: { id: event.id } },
            });
            break;
          case EventCategory.MEDICAL:
            specificEvent = await medicalEventsRepo.findOne({
              where: { event: { id: event.id } },
            });
            break;
          case EventCategory.SPORTING_ACTIVITY:
            specificEvent = await sportingActivityEventsRepo.findOne({
              where: { event: { id: event.id } },
            });
            break;
          default:
            break;
        }
        if (specificEvent && "event" in specificEvent) {
          delete (specificEvent as any).event;
        }
        return {
          ...event,
          specificEvent,
        };
      })
    );

    res.status(200).json({ events: eventsWithDetails });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des événements par utilisateur :",
      error
    );
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des événements",
    });
  }
};

export const updateEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const eventId = parseInt(req.params.id, 10);
  if (isNaN(eventId)) {
    res.status(400).json({ message: "ID invalide" });
    return;
  }

  const eventRepo = AppDataSource.getRepository(Events);
  const event = await eventRepo.findOneBy({ id: eventId });

  if (!event) {
    res.status(404).json({ message: "Événement non trouvé" });
    return;
  }

  if ("id" in req.body || "eventCategory" in req.body) {
    res
      .status(400)
      .json({ message: "Modification de l'ID ou de la catégorie interdite" });
    return;
  }

  const {
    responsibleIds,
    personOngoingIds,
    title,
    location,
    date,
    time,
    description,
    link,
    isActive,
    ...specificEventData
  } = req.body;

  event.responsibleIds = responsibleIds ?? event.responsibleIds;
  event.personOngoingIds = personOngoingIds ?? event.personOngoingIds;
  event.location = location ?? event.location;
  event.date = date ?? event.date;
  event.time = time ?? event.time;
  event.title = title ?? event.title;
  event.description = description ?? event.description;
  event.link = link ?? event.link;
  event.isActive = isActive ?? event.isActive;

  await eventRepo.save(event);

  try {
    switch (event.eventCategory) {
      case EventCategory.HYPERLINK: {
        const repo = AppDataSource.getRepository(HyperlinkEvent);
        const child = await repo.findOne({
          where: { event: { id: event.id } },
        });
        if (child) {
          child.theme = specificEventData.theme ?? child.theme;
          await repo.save(child);
        }
        break;
      }

      case EventCategory.COACHING: {
        const repo = AppDataSource.getRepository(CoachingEvent);
        const child = await repo.findOne({
          where: { event: { id: event.id } },
        });
        if (child) {
          child.sessionId = specificEventData.sessionId ?? child.sessionId;
          child.isDone = specificEventData.isDone ?? child.isDone;
          child.sportsmanComment =
            specificEventData.sportsmanComment ?? child.sportsmanComment;
          child.sportsmanNote =
            specificEventData.sportsmanNote ?? child.sportsmanNote;
          child.coachComment =
            specificEventData.coachComment ?? child.coachComment;
          await repo.save(child);

          // Envoi du mail aux participants
          const userRepo = AppDataSource.getRepository(User);
          const parseIds = (idString: string | null): number[] =>
            idString
              ? idString
                  .split(";")
                  .map((id) => parseInt(id.trim(), 10))
                  .filter((id) => !isNaN(id))
              : [];
          const participantIds = parseIds(event.personOngoingIds);
          if (participantIds.length > 0) {
            const participants = await userRepo.findBy({
              id: In(participantIds),
            });
            for (const participant of participants) {
              if (participant.email) {
                await sendMail(
                  participant.email,
                  "HYPERION - Votre séance a été modifiée par votre coach",
                  `<h1 style="color: #1E3A8A">HYPERION - Votre séance a été modifiée par votre coach</h1>
                  <p>Titre : ${event.title}</p>
                  <p>Votre coach vient d'effectuer une modification à l'une de vos séances à venir.</p>`
                );
              }
            }
          }
        }
        break;
      }

      case EventCategory.SPORTING_ACTIVITY: {
        const repo = AppDataSource.getRepository(SportingActivityEvent);
        const child = await repo.findOne({
          where: { event: { id: event.id } },
        });
        if (child) {
          child.maxParticipants =
            specificEventData.maxParticipants ?? child.maxParticipants;
          await repo.save(child);
        }
        break;
      }

      case EventCategory.HYPERION:
      case EventCategory.MEDICAL:
      default:
        break;
    }

    res.status(200).json({ message: "Événement mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la mise à jour de l'événement",
    });
  }
};

export const deleteEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const eventId = parseInt(req.params.id, 10);
  if (isNaN(eventId)) {
    res.status(400).json({ message: "ID invalide" });
    return;
  }

  const eventRepo = AppDataSource.getRepository(Events);
  const event = await eventRepo.findOneBy({ id: eventId });

  if (!event) {
    res.status(404).json({ message: "Événement non trouvé" });
    return;
  }

  try {
    switch (event.eventCategory) {
      case EventCategory.HYPERION: {
        const repo = AppDataSource.getRepository(HyperionEvent);
        await repo.delete({ event: { id: eventId } });
        break;
      }
      case EventCategory.HYPERLINK: {
        const repo = AppDataSource.getRepository(HyperlinkEvent);
        await repo.delete({ event: { id: eventId } });
        break;
      }
      case EventCategory.COACHING: {
        const repo = AppDataSource.getRepository(CoachingEvent);
        await repo.delete({ event: { id: eventId } });
        break;
      }
      case EventCategory.MEDICAL: {
        const repo = AppDataSource.getRepository(MedicalEvent);
        await repo.delete({ event: { id: eventId } });
        break;
      }
      case EventCategory.SPORTING_ACTIVITY: {
        const repo = AppDataSource.getRepository(SportingActivityEvent);
        await repo.delete({ event: { id: eventId } });
        break;
      }
    }

    await eventRepo.delete(eventId);

    res.status(200).json({ message: "Événement supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la suppression de l'événement",
    });
  }
};

export const notifyEventValidation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { eventId } = req.body;
  if (!eventId) {
    res.status(400).json({ message: "eventId requis" });
    return;
  }

  try {
    const eventRepo = AppDataSource.getRepository(Events);
    const event = await eventRepo.findOneBy({ id: eventId });

    if (!event || event.eventCategory !== EventCategory.SPORTING_ACTIVITY) {
      res.status(404).json({ message: "Activité sportive non trouvée" });
      return;
    }

    // On suppose que le créateur est le premier ID dans responsibleIds
    const sportsmanId = event.responsibleIds?.split(";")[0];
    if (!sportsmanId) {
      res
        .status(404)
        .json({ message: "Aucun sportif associé à cette activité" });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    const sportsman = await userRepo.findOneBy({
      id: parseInt(sportsmanId, 10),
    });

    if (!sportsman || !sportsman.email) {
      res.status(404).json({ message: "Sportif introuvable ou sans email" });
      return;
    }

    await sendMail(
      sportsman.email,
      "HYPERION - Evénément accepté",
      `<h1 style="color: #1E3A8A">HYPERION - Evénément accepté</h1>
      <p>L'événement que vous avez publié a bien été accepté. Il est maintenant visible sur l'application.</p>
      <p>Titre : ${event.title}</p>
      <p>Date : ${event.date} à ${event.location}</p>
      <p>Vous pouvez maintenant la retrouver sur la plateforme.</p>`
    );

    res.status(200).json({ message: "Mail envoyé au sportif." });
  } catch (error) {
    console.error("Erreur lors de la notification :", error);
    res.status(500).json({ message: "Erreur serveur lors de la notification" });
  }
};

export const notifySportingActivityParticipation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { eventId, sportsmanId } = req.body;
  if (!eventId || !sportsmanId) {
    res.status(400).json({ message: "eventId et sportsmanId requis" });
    return;
  }

  try {
    const eventRepo = AppDataSource.getRepository(Events);
    const event = await eventRepo.findOneBy({ id: eventId });

    if (!event || event.eventCategory !== EventCategory.SPORTING_ACTIVITY) {
      res.status(404).json({ message: "Activité sportive non trouvée" });
      return;
    }

    // Récupérer le sportif qui participe
    const userRepo = AppDataSource.getRepository(User);
    const participant = await userRepo.findOneBy({ id: sportsmanId });
    if (!participant || !participant.email) {
      res
        .status(404)
        .json({ message: "Sportif participant introuvable ou sans email" });
      return;
    }

    // Récupérer le créateur de l'événement
    const creatorId = event.responsibleIds?.split(";")[0];
    if (!creatorId) {
      res.status(404).json({ message: "Créateur de l'événement introuvable" });
      return;
    }
    const creator = await userRepo.findOneBy({ id: parseInt(creatorId, 10) });
    if (!creator || !creator.email) {
      res.status(404).json({ message: "Créateur introuvable ou sans email" });
      return;
    }

    // Mail au participant
    await sendMail(
      participant.email,
      "HYPERION - Participation événement",
      `<h1 style="color: #1E3A8A">Participation événement</h1>
      <p>Vous êtes bien inscrit à l'activité sportive :</p>
      <p>Titre : ${event.title}</p>
      <p>Date : ${event.date} à ${event.location}</p>
      <p>Retrouvez toutes les infos sur la plateforme.</p>`
    );

    // Mail au créateur
    await sendMail(
      creator.email,
      "HYPERION - Votre événement",
      `<h1 style="color: #1E3A8A">Votre événement</h1>
      <p>${participant.lastName} ${participant.firstName} participe à votre événement : ${event.title} (${event.date} à ${event.location})</p>`
    );

    res
      .status(200)
      .json({ message: "Mails envoyés au participant et au créateur." });
  } catch (error) {
    console.error("Erreur lors de la notification de participation :", error);
    res.status(500).json({ message: "Erreur serveur lors de la notification" });
  }
};
