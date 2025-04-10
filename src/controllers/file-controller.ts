import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Files, FileCategory } from "../models/files-model";

export const createFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { label, url, fileCategory } = req.body;

  if (!label || !url || !fileCategory) {
    res
      .status(400)
      .json({ message: "Veuillez fournir tous les champs obligatoires." });
    return;
  }

  if (!Object.values(FileCategory).includes(fileCategory)) {
    res.status(400).json({ message: "Catégorie de fichier invalide." });
    return;
  }

  const fileRepo = AppDataSource.getRepository(Files);

  try {
    const newFile = fileRepo.create({
      label,
      url,
      fileCategory,
    });

    const savedFile = await fileRepo.save(newFile);
    res.status(201).json(savedFile);
  } catch (error) {
    console.error("Erreur lors de la création du fichier :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la création du fichier." });
  }
};

export const getAllFiles = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const fileRepo = AppDataSource.getRepository(Files);

  try {
    const files = await fileRepo.find({ order: { createdAt: "DESC" } });
    res.status(200).json(files);
  } catch (error) {
    console.error("Erreur lors de la récupération des fichiers :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des fichiers.",
    });
  }
};

export const getFileById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const fileRepo = AppDataSource.getRepository(Files);
  const { id } = req.params;
  const fileId = parseInt(id, 10);

  if (isNaN(fileId)) {
    res.status(400).json({
      message: "L'identifiant du fichier doit être un nombre valide.",
    });
    return;
  }

  try {
    const file = await fileRepo.findOneBy({ id: fileId });

    if (!file) {
      res.status(404).json({ message: "Fichier non trouvé." });
      return;
    }

    res.status(200).json(file);
  } catch (error) {
    console.error("Erreur lors de la récupération du fichier :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération du fichier." });
  }
};

export const getFilesByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const fileRepo = AppDataSource.getRepository(Files);
  const { category } = req.params;

  if (!Object.values(FileCategory).includes(category as FileCategory)) {
    res.status(400).json({ message: "Catégorie de fichier invalide." });
    return;
  }

  try {
    const files = await fileRepo.find({
      where: { fileCategory: category as FileCategory },
    });

    res.status(200).json(files);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des fichiers par catégorie :",
      error
    );
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des fichiers.",
    });
  }
};

export const updateFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const fileRepo = AppDataSource.getRepository(Files);
  const fileId = parseInt(req.params.id, 10);

  if (isNaN(fileId)) {
    res
      .status(400)
      .json({ message: "L'ID du fichier doit être un nombre valide." });
    return;
  }

  try {
    const file = await fileRepo.findOneBy({ id: fileId });

    if (!file) {
      res.status(404).json({ message: "Fichier introuvable." });
      return;
    }

    const { label, url, fileCategory } = req.body;

    if (fileCategory && !Object.values(FileCategory).includes(fileCategory)) {
      res.status(400).json({ message: "Catégorie de fichier invalide." });
      return;
    }

    file.label = label ?? file.label;
    file.url = url ?? file.url;
    file.fileCategory = fileCategory ?? file.fileCategory;

    await fileRepo.save(file);

    res.status(200).json({ message: "Fichier mis à jour avec succès.", file });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du fichier :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la mise à jour du fichier." });
  }
};

export const deleteFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const fileRepo = AppDataSource.getRepository(Files);
  const fileId = parseInt(req.params.id, 10);

  if (isNaN(fileId)) {
    res
      .status(400)
      .json({ message: "L'ID du fichier doit être un nombre valide." });
    return;
  }

  try {
    const file = await fileRepo.findOneBy({ id: fileId });

    if (!file) {
      res.status(404).json({ message: "Fichier introuvable." });
      return;
    }

    await fileRepo.remove(file);

    res.status(200).json({ message: "Fichier supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression du fichier :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la suppression du fichier." });
  }
};
