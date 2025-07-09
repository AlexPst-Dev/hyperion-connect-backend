import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Files, FileCategory } from "../models/files-model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import path from "path";
import fs from "fs";

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

  if (!file) {
    console.log("Erreur: Fichier manquant");
    res.status(400).json({ message: "Le fichier est obligatoire." });
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

  const fileRepo = AppDataSource.getRepository(Files);

  try {
    let conditionalUrl: string = "";
    let physicalFileName: string = "";

    if (req.user) {
      switch (fileCategory) {
        case FileCategory.SESSION_IMPORTED:
          conditionalUrl = `/uploads/user-${req.user.id}/sessions/${file.filename}`;
          physicalFileName = file.filename;
          break;
        case FileCategory.IMAGE:
          conditionalUrl = `/uploads/user-${req.user.id}/images/${file.filename}`;
          physicalFileName = file.filename;
          break;
        default:
          conditionalUrl = `/uploads/${file.filename}`;
          physicalFileName = file.filename;
      }
    }
    const newFile = new Files();
    newFile.label = label;
    newFile.physicalName = physicalFileName;
    newFile.url = conditionalUrl;
    newFile.fileCategory = fileCategory;

    const savedFile = await fileRepo.save(newFile);
    res.status(201).json(savedFile);
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

    let filePath: string = "";

    switch (file.fileCategory) {
      case FileCategory.SESSION_IMPORTED:
        filePath = path.join(
          "src",
          "uploads",
          `user-${req.user.id}`,
          "sessions",
          file.physicalName
        );
        break;
      case FileCategory.IMAGE:
        filePath = path.join(
          "src",
          "uploads",
          `user-${req.user.id}`,
          "images",
          file.physicalName
        );
        break;
      default:
        filePath = path.join("src", "uploads", file.physicalName);
    }

    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "Fichier physique non trouvé." });
      return;
    }

    // Définir le type de contenu selon l'extension
    const ext = path.extname(file.label).toLowerCase();
    const contentType = getContentType(ext);

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.label}"`
    );

    // Servir le fichier
    res.download(filePath, file.label, (err) => {
      if (err) {
        console.error("Erreur lors du téléchargement:", err);
        if (!res.headersSent) {
          res
            .status(500)
            .json({ message: "Erreur lors du téléchargement du fichier." });
        }
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du fichier :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération du fichier.",
    });
  }
};

// Fonction utilitaire pour déterminer le type de contenu
function getContentType(ext: string): string {
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}
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

    const filePath = path.join(
      "src",
      "uploads",
      `user-${req.user.id}`,
      "images",
      file.physicalName
    );

    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "Fichier image non trouvé." });
      return;
    }

    // Déterminer le type MIME
    const ext = path.extname(file.physicalName).toLowerCase();
    const mimeType = getImageMimeType(ext);

    // Servir l'image
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache d'1 an
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type"
    );
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error("Erreur lors de la récupération de l'image :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération de l'image.",
    });
  }
};

// Fonction utilitaire pour les types MIME des images
function getImageMimeType(ext: string): string {
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "image/jpeg"; // Par défaut
  }
}

export const getAllFiles = async (
  _req: AuthenticatedRequest,
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

    // Supprimer le fichier physique s'il existe
    let physicalFileDeleted = false;
    if (file.url && file.fileCategory === FileCategory.IMAGE) {
      // Construire le chemin physique à partir de l'URL
      const physicalPath = path.join("src", file.url);

      try {
        // Vérifier si le fichier existe
        if (fs.existsSync(physicalPath)) {
          // Supprimer le fichier physique
          fs.unlinkSync(physicalPath);
          physicalFileDeleted = true;
          console.log(`Fichier physique supprimé: ${physicalPath}`);
        } else {
          console.log(`Fichier physique introuvable: ${physicalPath}`);
        }
      } catch (fileError) {
        console.error(
          `Erreur lors de la suppression du fichier physique: ${physicalPath}`,
          fileError
        );
        // On continue quand même pour supprimer l'enregistrement en base
      }
    }

    // Supprimer l'enregistrement en base de données
    await fileRepo.remove(file);

    // Message de réponse adapté
    const message = physicalFileDeleted
      ? "Fichier et enregistrement supprimés avec succès."
      : "Enregistrement supprimé avec succès (fichier physique introuvable).";

    res.status(200).json({
      message,
      physicalFileDeleted,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du fichier :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la suppression du fichier." });
  }
};
