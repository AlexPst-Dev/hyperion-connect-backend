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

  try {
    const { uploadToASpecificId, companyId, fileCategory } = req.body;

    // Validation des paramètres
    if (!fileCategory) {
      return res.status(400).json({
        message: "La catégorie du fichier est requise",
      });
    }

    // Déterminer le dossier principal avec validation
    let mainFolder = "";
    let folderType = "";
    let folderId = "";

    if (companyId) {
      mainFolder = `company-${companyId}`;
      folderType = "company";
      folderId = companyId;
    } else if (uploadToASpecificId) {
      mainFolder = `user-${uploadToASpecificId}`;
      folderType = "user";
      folderId = uploadToASpecificId;
    } else if (req.user?.id) {
      mainFolder = `user-${req.user.id}`;
      folderType = "user";
      folderId = req.user.id;
    } else {
      return res.status(400).json({
        message: "Impossible de déterminer le dossier de destination",
      });
    }

    // Déterminer le sous-dossier
    const subfolderMap: Record<FileCategory, string> = {
      [FileCategory.SESSION_IMPORTED]: "sessions",
      [FileCategory.IMAGE]: "images",
      [FileCategory.MEDICAL_FILE]: "medical",
      [FileCategory.USER_FILE]: "files",
      [FileCategory.SUBSCRIPTION]: "subscriptions",
    };

    const subfolder = subfolderMap[fileCategory as FileCategory] || "";

    // Construire le chemin final
    const finalDestination = path.join(
      __dirname,
      "../uploads",
      mainFolder,
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
        return res.status(500).json({
          message: "Erreur lors du traitement du fichier",
          error:
            process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      }

      // Mettre à jour les informations du fichier
      req.file.path = finalPath;
      req.file.destination = finalDestination;
      req.file.folderType = folderType;
      req.file.folderId = folderId;

      next();
    });
  } catch (error) {
    console.error("Erreur dans moveFileToCorrectFolder:", error);
    return res.status(500).json({
      message: "Erreur interne du serveur",
    });
  }
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
