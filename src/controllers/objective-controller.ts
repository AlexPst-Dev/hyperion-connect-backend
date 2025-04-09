import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Objectives } from "../models/objectives-model";
import { ProfileCategory, User } from "../models/users-model";

export const createObjective = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    sportsmanId,
    label,
    responsibleId,
    startDate,
    endDate,
    isActive = true,
  } = req.body;

  try {
    if (!sportsmanId || !label || !responsibleId || !startDate || !endDate) {
      res.status(400).json({ message: "Champs requis manquants" });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);

    const sportsman = await userRepo.findOneBy({ id: sportsmanId });
    const responsible = await userRepo.findOneBy({ id: responsibleId });

    if (!sportsman || !responsible) {
      res.status(404).json({ message: "Sportif ou responsable introuvable" });
      return;
    }

    const objectiveRepo = AppDataSource.getRepository(Objectives);

    const newObjective = objectiveRepo.create({
      sportsman,
      sportsmanId,
      label,
      responsible,
      responsibleId,
      startDate,
      endDate,
      isActive,
    });

    const savedObjective = await objectiveRepo.save(newObjective);

    res.status(201).json({
      message: "Objectif créé avec succès",
      objective: savedObjective,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'objectif :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la création de l'objectif" });
  }
};

export const getAllObjectives = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const objectiveRepo = AppDataSource.getRepository(Objectives);

    const objectives = await objectiveRepo.find({
      relations: ["sportsman", "responsible"],
      order: { createdAt: "DESC" },
    });

    res.status(200).json({ objectives });
  } catch (error) {
    console.error("Erreur lors de la récupération des objectifs :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des objectifs",
    });
  }
};

export const getObjectiveById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const objectiveRepo = AppDataSource.getRepository(Objectives);

    if (isNaN(Number(id))) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }

    const objective = await objectiveRepo.findOne({
      where: { id: parseInt(id, 10) },
      relations: ["sportsman", "responsible"],
    });

    if (!objective) {
      res.status(404).json({ message: "Objectif non trouvé" });
      return;
    }

    res.status(200).json({ objective });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'objectif :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération de l'objectif",
    });
  }
};

export const getObjectivesBySportsman = async (
  req: Request,
  res: Response
): Promise<void> => {
  const objectiveRepo = AppDataSource.getRepository(Objectives);
  const userRepo = AppDataSource.getRepository(User);
  const { sportsmanId } = req.params;

  try {
    if (isNaN(Number(sportsmanId))) {
      res.status(400).json({ message: "ID sportif invalide" });
      return;
    }
    const sportsman = await userRepo.findOneBy({
      id: parseInt(sportsmanId, 10),
    });

    if (!sportsman || sportsman.profileCategory !== ProfileCategory.SPORTSMAN) {
      res.status(404).json({ message: "Sportif inexistant ou rôle incorrect" });
      return;
    }

    const objectives = await objectiveRepo.find({
      where: { sportsmanId: sportsman.id },
      relations: ["sportsman", "responsible"],
      order: { startDate: "DESC" },
    });

    res.status(200).json({ objectives });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des objectifs du sportif :",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getObjectivesByResponsible = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { responsibleId } = req.params;

  try {
    if (isNaN(Number(responsibleId))) {
      res.status(400).json({ message: "ID responsable invalide" });
      return;
    }

    const objectiveRepo = AppDataSource.getRepository(Objectives);

    const objectives = await objectiveRepo.find({
      where: { responsibleId: parseInt(responsibleId, 10) },
      relations: ["sportsman", "responsible"],
      order: { startDate: "DESC" },
    });

    res.status(200).json({ objectives });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des objectifs du responsable :",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getInactiveObjectivesBySportsman = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sportsmanId } = req.params;
  const userRepo = AppDataSource.getRepository(User);
  const objectiveRepo = AppDataSource.getRepository(Objectives);

  try {
    if (isNaN(Number(sportsmanId))) {
      res.status(400).json({ message: "ID sportif invalide" });
      return;
    }
    const sportsman = await userRepo.findOneBy({
      id: parseInt(sportsmanId, 10),
    });

    if (!sportsman || sportsman.profileCategory !== ProfileCategory.SPORTSMAN) {
      res.status(404).json({ message: "Sportif inexistant ou rôle incorrect" });
      return;
    }

    const inactiveObjectives = await objectiveRepo.find({
      where: {
        sportsmanId: sportsman.id,
        isActive: false,
      },
      relations: ["sportsman", "responsible"],
      order: { startDate: "DESC" },
    });

    res.status(200).json({ objectives: inactiveObjectives });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des objectifs inactifs :",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateObjective = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const objectiveRepo = AppDataSource.getRepository(Objectives);

  try {
    if (isNaN(Number(id))) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }

    const objective = await objectiveRepo.findOneBy({ id: parseInt(id, 10) });

    if (!objective) {
      res.status(404).json({ message: "Objectif introuvable" });
      return;
    }

    const { id: ignoredId, ...updateData } = req.body;

    objectiveRepo.merge(objective, updateData);
    const updatedObjective = await objectiveRepo.save(objective);

    res
      .status(200)
      .json({ message: "Objectif mis à jour", objective: updatedObjective });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'objectif :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la mise à jour de l'objectif" });
  }
};

export const deleteObjective = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const objectiveRepo = AppDataSource.getRepository(Objectives);

  try {
    if (isNaN(Number(id))) {
      res.status(400).json({ message: "ID invalide" });
      return;
    }

    const objective = await objectiveRepo.findOneBy({ id: parseInt(id, 10) });

    if (!objective) {
      res.status(404).json({ message: "Objectif introuvable" });
      return;
    }

    await objectiveRepo.remove(objective);

    res.status(200).json({ message: "Objectif supprimé définitivement" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'objectif :", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression" });
  }
};
