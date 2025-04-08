import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Exercises } from "../models/exercices-model";
import { Files } from "../models/files-model";

export const createExercice = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const exerciceRepo = AppDataSource.getRepository(Exercises);

    const {
      label,
      listMuscleGroupIds,
      durationTime,
      description,
      recommendations,
      filePictureId,
    } = req.body;

    if (!label || !durationTime) {
      res.status(400).json({
        message: "label et durationTime sont requis.",
      });
      return;
    }

    const newExercice = exerciceRepo.create({
      label,
      durationTime,
      listMuscleGroupIds: listMuscleGroupIds || null,
      filePictureId: filePictureId || null,
      description: description || null,
      recommendations: recommendations || null,
      isActive: true,
    });

    const savedExercice = await exerciceRepo.save(newExercice);

    res
      .status(201)
      .json({ message: "Exercice créée avec succès", exercice: savedExercice });
  } catch (error) {
    console.error("Erreur lors de la création de l'exercice :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getAllExercices = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const exerciceRepo = AppDataSource.getRepository(Exercises);

    const exercises = await exerciceRepo
      .createQueryBuilder("exercice")
      .leftJoinAndSelect("exercice.filePicture", "filePicture")
      .where("exercice.isActive = :isActive", { isActive: true })
      .getMany();

    res.status(200).json(exercises);
  } catch (error) {
    console.error("Erreur lors de la récupération des exercices :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Return an exercice by ID with its file picture if it exists
export const getExerciceById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const exerciceId = parseInt(req.params.id, 10);
    if (isNaN(exerciceId)) {
      res.status(400).json({ message: "ID d'exercice invalide" });
      return;
    }

    const exerciceRepo = AppDataSource.getRepository(Exercises);
    const fileRepo = AppDataSource.getRepository(Files);

    const exercice = await exerciceRepo.findOne({
      where: { id: exerciceId, isActive: true },
    });

    if (!exercice) {
      res.status(404).json({ message: "Exercice introuvable" });
      return;
    }

    let file = null;

    if (exercice.filePictureId) {
      file = await fileRepo.findOne({ where: { id: exercice.filePictureId } });
    }

    res.status(200).json({
      exercice,
      filePicture: file || null,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'exercice :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateExerciceById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const exerciceId = parseInt(req.params.id, 10);

  try {
    const exerciceRepo = AppDataSource.getRepository(Exercises);
    const exercice = await exerciceRepo.findOneBy({ id: exerciceId });

    if (!exercice) {
      res.status(404).json({ message: "Exercice non trouvée" });
      return;
    }
    if ("id" in req.body) {
      delete req.body.id;
    }

    const updatedExercice = exerciceRepo.merge(exercice, req.body);
    const savedExercice = await exerciceRepo.save(updatedExercice);

    res
      .status(200)
      .json({ message: "Exercice mise à jour", exercice: savedExercice });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'exercice' :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const softDeleteExerciceById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const exerciceId = parseInt(req.params.id, 10);

  try {
    const exerciceRepo = AppDataSource.getRepository(Exercises);
    const exercice = await exerciceRepo.findOneBy({ id: exerciceId });

    if (!exercice) {
      res.status(404).json({ message: "Exercice non trouvée" });
      return;
    }

    exercice.isActive = false;
    await exerciceRepo.save(exercice);

    res
      .status(200)
      .json({ message: "Exercice archivé (soft delete)", exercice });
  } catch (error) {
    console.error("Erreur lors de l'archivage :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteExerciceById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const exerciceId = parseInt(req.params.id, 10);

  try {
    const exerciceRepo = AppDataSource.getRepository(Exercises);
    const result = await exerciceRepo.delete(exerciceId);

    if (result.affected === 0) {
      res.status(404).json({ message: "Exercice non trouvé" });
      return;
    }

    res.status(200).json({ message: "Exercice supprimé définitivement" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
