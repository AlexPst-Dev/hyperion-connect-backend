import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Files, FileCategory } from "../models/files-model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { Companies } from "../models/companies-model";

export const createFile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { label, fileCategory } = req.body;
  const file = req.file;

  if (!label) {
    console.log("Erreur: Label manquant");
    res.status(400).json({ message: "Le label est obligatoire." });
    return;
  }

  if (!fileCategory) {
    console.log("Erreur: FileCategory manquant");
    res
      .status(400)
      .json({ message: "La catégorie de fichier est obligatoire." });
    return;
  }

  if (!Object.values(FileCategory).includes(fileCategory)) {
    console.log("Erreur: Catégorie invalide:", fileCategory);
    res.status(400).json({
      message: "Catégorie de fichier invalide.",
      validCategories: Object.values(FileCategory),
    });
    return;
  }

  if (!file) {
    res.status(400).json({ message: "Aucun fichier fourni." });
    return;
  }

  const fileRepo = AppDataSource.getRepository(Files);

  try {
    const newFile = new Files();
    newFile.label = label;
    newFile.mimeType = file.mimetype;
    newFile.data = file.buffer;
    newFile.physicalName = file.originalname;
    newFile.fileCategory = fileCategory;
    // URL peut rester null ou être utilisée pour d'autres besoins
    const savedFile = await fileRepo.save(newFile);

    // Ne pas renvoyer les données binaires dans la réponse
    const { data, ...fileResponse } = savedFile;
    res.status(201).json(fileResponse);
  } catch (error) {
    console.error("Erreur lors de la création du fichier :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la création du fichier." });
  }
};

export const downloadFile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const fileId = parseInt(id, 10);
  if (isNaN(fileId)) {
    res.status(400).json({
      message: "L'identifiant du fichier doit être un nombre valide.",
    });
    return;
  }

  const fileRepo = AppDataSource.getRepository(Files);

  try {
    const file = await fileRepo.findOneBy({ id: fileId });
    if (!file) {
      res.status(404).json({ message: "Fichier non trouvé." });
      return;
    }

    // Définir les headers appropriés
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.label}"`
    );
    res.setHeader("Content-Length", file.data.length.toString());

    // Envoyer les données binaires
    res.send(file.data);
  } catch (error) {
    console.error("Erreur lors de la récupération du fichier :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération du fichier.",
    });
  }
};

export const serveImage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const fileId = parseInt(id, 10);

  if (isNaN(fileId)) {
    res.status(400).json({
      message: "L'identifiant du fichier doit être un nombre valide.",
    });
    return;
  }

  const fileRepo = AppDataSource.getRepository(Files);

  try {
    const file = await fileRepo.findOneBy({
      id: fileId,
      fileCategory: FileCategory.IMAGE,
    });

    if (!file) {
      res.status(404).json({ message: "Image non trouvée." });
      return;
    }

    // Servir l'image depuis la base de données
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Length", file.data.length.toString());
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache d'1 an
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type"
    );

    res.send(file.data);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'image :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération de l'image.",
    });
  }
};

export const serveCompanyImage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    res.status(400).json({
      message: "L'identifiant de l'entreprise doit être un nombre valide.",
    });
    return;
  }

  const companyRepo = AppDataSource.getRepository(Companies);
  const companySearched = await companyRepo.findOne({
    where: { id: Number(id) },
    relations: ["fileImageCompany"],
  });

  if (!companySearched?.fileImageCompany) {
    res.status(404).json({
      message: "L'entreprise n'a pas pu être trouvée ou n'a pas d'image.",
    });
    return;
  }

  const fileRepo = AppDataSource.getRepository(Files);

  try {
    const file = await fileRepo.findOneBy({
      id: companySearched.fileImageCompany.id,
      fileCategory: FileCategory.IMAGE,
    });

    if (!file) {
      res.status(404).json({ message: "Image non trouvée." });
      return;
    }

    // Servir l'image depuis la base de données
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Length", file.data.length.toString());
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache d'1 an
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type"
    );

    res.send(file.data);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'image :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération de l'image.",
    });
  }
};

export const getAllFiles = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const fileRepo = AppDataSource.getRepository(Files);

  try {
    // Ne pas récupérer les données binaires pour la liste
    const files = await fileRepo
      .createQueryBuilder("file")
      .select([
        "file.id",
        "file.label",
        "file.mimeType",
        "file.physicalName",
        "file.url",
        "file.fileCategory",
        "file.createdAt",
        "file.updatedAt",
      ])
      .orderBy("file.createdAt", "DESC")
      .getMany();

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
    // Ne pas récupérer les données binaires pour les métadonnées
    const file = await fileRepo
      .createQueryBuilder("file")
      .select([
        "file.id",
        "file.label",
        "file.mimeType",
        "file.physicalName",
        "file.url",
        "file.fileCategory",
        "file.createdAt",
        "file.updatedAt",
      ])
      .where("file.id = :id", { id: fileId })
      .getOne();

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
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const fileRepo = AppDataSource.getRepository(Files);
  const { category } = req.params;

  if (!Object.values(FileCategory).includes(category as FileCategory)) {
    res.status(400).json({ message: "Catégorie de fichier invalide." });
    return;
  }

  try {
    // Ne pas récupérer les données binaires pour la liste
    const files = await fileRepo
      .createQueryBuilder("file")
      .select([
        "file.id",
        "file.label",
        "file.mimeType",
        "file.physicalName",
        "file.url",
        "file.fileCategory",
        "file.createdAt",
        "file.updatedAt",
      ])
      .where("file.fileCategory = :category", { category })
      .getMany();

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
  req: AuthenticatedRequest,
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

    const { label, fileCategory } = req.body;

    if (fileCategory && !Object.values(FileCategory).includes(fileCategory)) {
      res.status(400).json({ message: "Catégorie de fichier invalide." });
      return;
    }

    file.label = label ?? file.label;
    file.fileCategory = fileCategory ?? file.fileCategory;

    await fileRepo.save(file);

    // Ne pas renvoyer les données binaires
    const { data, ...fileResponse } = file;
    res
      .status(200)
      .json({ message: "Fichier mis à jour avec succès.", file: fileResponse });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du fichier :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la mise à jour du fichier." });
  }
};

export const deleteFile = async (
  req: AuthenticatedRequest,
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

    // Supprimer l'enregistrement en base de données (les données BLOB seront supprimées automatiquement)
    await fileRepo.remove(file);

    res.status(200).json({
      message: "Fichier supprimé avec succès.",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du fichier :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la suppression du fichier." });
  }
};
