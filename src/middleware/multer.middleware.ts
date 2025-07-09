import multer from "multer";
import path from "path";
import fs from "fs";
import { FileCategory } from "../models/files-model";

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Créer un dossier temporaire
const tempDir = path.join(__dirname, "../uploads/temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: any, file, cb) => {
    // Stocker temporairement dans un dossier temp
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Nettoyer le nom du fichier
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${Date.now()}-${cleanName}`);
  },
});

// Configuration avec validation
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    console.log("Fichier reçu:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
    cb(null, true);
  },
});

// Middleware pour déplacer le fichier vers le bon dossier
export const moveFileToCorrectFolder = (req: any, res: any, next: any) => {
  if (!req.file) {
    return next();
  }

  const userId = req.user?.id;
  const fileCategory = req.body.fileCategory;

  let subfolder = "";
  switch (fileCategory) {
    case FileCategory.SESSION_IMPORTED:
      subfolder = "sessions";
      break;
    case FileCategory.IMAGE:
      subfolder = "images";
      break;
    case FileCategory.MEDICAL_FILE:
      subfolder = "medical";
      break;
    case FileCategory.SUBSCRIPTION:
      subfolder = "subscriptions";
      break;
    default:
      subfolder = "";
  }

  const userFolder = userId ? `user-${userId}` : "anonymous";
  const finalDestination = path.join(
    __dirname,
    "../uploads",
    userFolder,
    subfolder
  );

  // Créer le dossier de destination s'il n'existe pas
  if (!fs.existsSync(finalDestination)) {
    fs.mkdirSync(finalDestination, { recursive: true });
  }

  const tempPath = req.file.path;
  const finalPath = path.join(finalDestination, req.file.filename);

  // Déplacer le fichier
  fs.rename(tempPath, finalPath, (err) => {
    if (err) {
      console.error("Erreur lors du déplacement du fichier:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors du traitement du fichier" });
    }

    // Mettre à jour le path dans req.file
    req.file.path = finalPath;
    req.file.destination = finalDestination;
    next();
  });
};

// Middleware de gestion d'erreurs pour multer
export const handleMulterError = (
  error: any,
  req: any,
  res: any,
  next: any
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "Fichier trop volumineux (max 10MB)" });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ message: "Trop de fichiers" });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: "Champ de fichier inattendu" });
    }
  }
  console.error("Erreur multer:", error);
  res.status(500).json({ message: "Erreur lors du traitement du fichier" });
};
