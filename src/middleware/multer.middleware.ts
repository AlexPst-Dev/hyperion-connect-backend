import multer from "multer";

// Configuration simplifiée - stockage en mémoire
const storage = multer.memoryStorage();

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
