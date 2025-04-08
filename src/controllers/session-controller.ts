import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Sessions } from "../models/sessions-model";
import { Files } from "../models/files-model";

export const createSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sessionRepo = AppDataSource.getRepository(Sessions);

    const {
      label,
      numberOfExercises,
      durationTime,
      filePictureId,
      listExercises,
      recommendations,
      contributions,
    } = req.body;

    if (!label || !numberOfExercises || !durationTime) {
      res.status(400).json({
        message: "label, numberOfExercises et durationTime sont requis.",
      });
      return;
    }

    const newSession = sessionRepo.create({
      label,
      numberOfExercises,
      durationTime,
      filePictureId: filePictureId || null,
      listExercises: listExercises || null,
      recommendations: recommendations || null,
      contributions: contributions || null,
      done: false,
      isActive: true,
    });

    const savedSession = await sessionRepo.save(newSession);

    res
      .status(201)
      .json({ message: "Session créée avec succès", session: savedSession });
  } catch (error) {
    console.error("Erreur lors de la création de la session :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getAllSessions = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const sessionRepo = AppDataSource.getRepository(Sessions);

    const sessions = await sessionRepo
      .createQueryBuilder("session")
      .leftJoinAndSelect("session.filePicture", "filePicture")
      .where("session.isActive = :isActive", { isActive: true })
      .getMany();

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Erreur lors de la récupération des sessions :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Return a session by ID with its file picture if it exists
export const getSessionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sessionId = parseInt(req.params.id, 10);
    if (isNaN(sessionId)) {
      res.status(400).json({ message: "ID de session invalide" });
      return;
    }

    const sessionRepo = AppDataSource.getRepository(Sessions);
    const fileRepo = AppDataSource.getRepository(Files);

    const session = await sessionRepo.findOne({
      where: { id: sessionId, isActive: true },
    });

    if (!session) {
      res.status(404).json({ message: "Session introuvable" });
      return;
    }

    let file = null;

    if (session.filePictureId) {
      file = await fileRepo.findOne({ where: { id: session.filePictureId } });
    }

    res.status(200).json({
      session,
      filePicture: file || null,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la session :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateSessionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sessionId = parseInt(req.params.id, 10);

  try {
    const sessionRepo = AppDataSource.getRepository(Sessions);
    const session = await sessionRepo.findOneBy({ id: sessionId });

    if (!session) {
      res.status(404).json({ message: "Session non trouvée" });
      return;
    }
    if ("id" in req.body) {
      delete req.body.id;
    }

    const updatedSession = sessionRepo.merge(session, req.body);
    const savedSession = await sessionRepo.save(updatedSession);

    res
      .status(200)
      .json({ message: "Session mise à jour", session: savedSession });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la session :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const softDeleteSessionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sessionId = parseInt(req.params.id, 10);

  try {
    const sessionRepo = AppDataSource.getRepository(Sessions);
    const session = await sessionRepo.findOneBy({ id: sessionId });

    if (!session) {
      res.status(404).json({ message: "Session non trouvée" });
      return;
    }

    session.isActive = false;
    await sessionRepo.save(session);

    res
      .status(200)
      .json({ message: "Session archivée (soft delete)", session });
  } catch (error) {
    console.error("Erreur lors de l'archivage :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteSessionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sessionId = parseInt(req.params.id, 10);

  try {
    const sessionRepo = AppDataSource.getRepository(Sessions);
    const result = await sessionRepo.delete(sessionId);

    if (result.affected === 0) {
      res.status(404).json({ message: "Session non trouvée" });
      return;
    }

    res.status(200).json({ message: "Session supprimée définitivement" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
