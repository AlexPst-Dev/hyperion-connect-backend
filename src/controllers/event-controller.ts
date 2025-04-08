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
        break;
      case EventCategory.HYPERLINK:
        specificEvent = hyperlinkEventsRepo.create({
          event: savedEvent,
          theme: specificEventData.theme || null,
        });
        await hyperlinkEventsRepo.save(specificEvent);
        break;
      case EventCategory.COACHING:
        specificEvent = coachingEventsRepo.create({
          event: savedEvent,
          sessionId: specificEventData.sessionId || null,
          isDone: specificEventData.isDone || false,
          sportsmanComment: specificEventData.sportsmanComment || null,
          sportsmanNote: specificEventData.sportsmanNote || null,
          coachComment: specificEventData.coachComment || null,
          coachNote: specificEventData.coachNote || null,
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
          child.coachNote = specificEventData.coachNote ?? child.coachNote;
          await repo.save(child);
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
