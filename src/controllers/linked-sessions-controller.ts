import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { LinkedSessions } from "../models/linked-sessions-model";

// Create a linked session
export const createLinkedSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, sessionId } = req.body;
    if (!userId || !sessionId) {
      res.status(400).json({ message: "userId and sessionId are required" });
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
