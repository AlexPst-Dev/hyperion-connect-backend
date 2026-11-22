import { config } from "../config/config";
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { LinkedSessions } from "../models/linked-sessions-model";
import { sendMail } from "../utils/mailService";
import { Sportsman } from "../models/users-model";

// Create a linked session
export const createLinkedSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, sessionId } = req.body;
    if (!userId || !sessionId) {
      res.status(400).json({ message: "userId and sessionId are required" });
      return;
    }

    // Vérifier si userId est un sportif
    const sportsmanRepo = AppDataSource.getRepository(Sportsman);
    const sportsman = await sportsmanRepo.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });

    if (sportsman && sportsman.user && sportsman.user.email) {
      // Envoyer le mail au sportif
      await sendMail(
        sportsman.user.email,
        `${config.appName} - Nouvel entrainement disponible`,
        `<h1 style="color: #1E3A8A">${config.appName} - Nouvel entrainement disponible</h1><p>Votre coach vient de vous partager un nouvel entrainement. Vous pouvez le retrouvez via votre application ${config.appName}.</p>`
      );
    }

    const repo = AppDataSource.getRepository(LinkedSessions);
    const linkedSession = repo.create({ userId, sessionId });
    const saved = await repo.save(linkedSession);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Error creating linked session", error });
  }
};

// Get all linked sessions
export const getAllLinkedSessions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const repo = AppDataSource.getRepository(LinkedSessions);
    const linkedSessions = await repo.find();
    res.status(200).json(linkedSessions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching linked sessions", error });
  }
};

// Get a linked session by id
export const getLinkedSessionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(LinkedSessions);
    const linkedSession = await repo.findOne({ where: { id: Number(id) } });
    if (!linkedSession) {
      res.status(404).json({ message: "Linked session not found" });
    }
    res.status(200).json(linkedSession);
  } catch (error) {
    res.status(500).json({ message: "Error fetching linked session", error });
  }
};

// Update a linked session
export const updateLinkedSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId, sessionId } = req.body;
    const repo = AppDataSource.getRepository(LinkedSessions);
    const linkedSession = await repo.findOne({ where: { id: Number(id) } });
    if (!linkedSession) {
      res.status(404).json({ message: "Linked session not found" });
      return;
    }
    linkedSession.userId = userId ?? linkedSession.userId;
    linkedSession.sessionId = sessionId ?? linkedSession.sessionId;
    const updated = await repo.save(linkedSession);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating linked session", error });
  }
};

// Delete a linked session
export const deleteLinkedSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(LinkedSessions);
    const result = await repo.delete(Number(id));
    if (result.affected === 0) {
      res.status(404).json({ message: "Linked session not found" });
    }
    res.status(200).json({ message: "Linked session deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting linked session", error });
  }
};
