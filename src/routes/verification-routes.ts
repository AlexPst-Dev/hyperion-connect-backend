import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/users-model";
import { authenticateToken } from "../middleware/auth.middleware";
import { AppDataSource } from "../data-source";

const router = Router();

// Interface pour le token QR
interface QRTokenPayload {
  userId: number;
  type: "qr_verification";
  exp: number;
}

// Générer un token temporaire pour le QR code
router.post(
  "/generate-qr-token",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const userRepo = AppDataSource.getRepository(User);

      // Vérifier que l'utilisateur existe et est actif
      const user = await userRepo.findOne({
        where: { id: userId },
        select: ["id", "email", "profileCategory", "isActive"],
      });

      if (!user) {
        res
          .status(404)
          .json({ success: false, message: "Utilisateur non trouvé" });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({ success: false, message: "Compte inactif" });
        return;
      }

      // Générer un token temporaire (expire dans 5 minutes)
      const qrToken = jwt.sign(
        {
          userId: user.id,
          type: "qr_verification",
          exp: Math.floor(Date.now() / 1000) + 5 * 60, // 5 minutes
        } as QRTokenPayload,
        process.env.JWT_SECRET!
      );

      res.json({
        success: true,
        qrToken,
        expiresIn: 300, // 5 minutes en secondes
      });
    } catch (error) {
      console.error("Erreur génération QR token:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  }
);

// Page publique de vérification (accessible sans authentification)
router.get(
  "/verify/:token",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;

      // Vérifier et décoder le token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as QRTokenPayload;

      if (decoded.type !== "qr_verification") {
        res.status(400).json({
          success: false,
          message: "Token invalide",
          status: "invalid_token",
        });
        return;
      }

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: decoded.userId },
        select: [
          "id",
          "firstName",
          "lastName",
          "email",
          "profileCategory",
          "isActive",
          "createdAt",
        ],
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
          status: "user_not_found",
        });
        return;
      }

      // Renvoyer les informations de vérification
      const verificationData = {
        success: true,
        status: user.isActive ? "active" : "inactive",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.profileCategory,
          isActive: user.isActive,
          memberSince: user.createdAt,
        },
      };

      res.json(verificationData);
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        res.status(401).json({
          success: false,
          message: "QR code expiré",
          status: "expired",
        });
        return;
      }

      if (error.name === "JsonWebTokenError") {
        res.status(400).json({
          success: false,
          message: "QR code invalide",
          status: "invalid_token",
        });
        return;
      }

      console.error("Erreur vérification:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur",
        status: "server_error",
      });
    }
  }
);

// Endpoint pour obtenir la page HTML publique de vérification
import crypto from "crypto";

// Endpoint pour obtenir la page HTML publique de vérification
router.get("/verify-page/:token", async (req: Request, res: Response) => {
  const { token } = req.params;

  // Générer un nonce unique pour ce script
  const nonce = crypto.randomBytes(16).toString("base64");

  // Configurer CSP avec le nonce
  res.setHeader(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline';`
  );

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification de compte sportif</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 600px; 
                margin: 50px auto; 
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container { 
                background: white; 
                padding: 30px; 
                border-radius: 10px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .loading { text-align: center; color: #666; }
            .success { color: #28a745; }
            .error { color: #dc3545; }
            .inactive { color: #ffc107; }
            .user-info { 
                background: #f8f9fa; 
                padding: 15px; 
                border-radius: 5px; 
                margin-top: 20px; 
            }
            .logo {
                text-align: center;
                margin-bottom: 30px;
                color: #007AFF;
                font-size: 24px;
                font-weight: bold;
            }
            .status-badge {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: bold;
                text-transform: uppercase;
                font-size: 12px;
            }
            .status-active {
                background-color: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            .status-inactive {
                background-color: #fff3cd;
                color: #856404;
                border: 1px solid #ffeaa7;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">🏃‍♀️ HYPERION CONNECT</div>
            <h1>Vérification de compte sportif</h1>
            <div id="result" class="loading">
                <div style="text-align: center;">
                    <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #007AFF; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <p>Vérification en cours...</p>
                </div>
            </div>
        </div>

        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>

        <script nonce="${nonce}">
            function formatDate(dateString) {
                try {
                    return new Date(dateString).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                } catch (e) {
                    return dateString;
                }
            }

            function getProfileCategoryLabel(category) {
                const labels = {
                    'athlete': 'Athlète',
                    'coach': 'Coach',
                    'healthcare': 'Soignant',
                    'partner': 'Partenaire',
                    'free': 'Compte gratuit'
                };
                return labels[category] || category;
            }

            // Faire l'appel API
            fetch('/api/verifications/verify/${token}')
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => Promise.reject(err));
                    }
                    return response.json();
                })
                .then(data => {
                    const resultDiv = document.getElementById('result');
                    
                    if (data.success) {
                        if (data.status === 'active') {
                            resultDiv.innerHTML = \`
                                <div class="success">
                                    <h2 style="color: #28a745; text-align: center; margin-bottom: 20px;">
                                        ✅ Compte Valide et Actif
                                    </h2>
                                    <div class="user-info">
                                        <div style="text-align: center; margin-bottom: 20px;">
                                            <span class="status-badge status-active">Compte Actif</span>
                                        </div>
                                        <p><strong>👤 Nom complet:</strong> \${data.user.firstName} \${data.user.lastName}</p>
                                        <p><strong>📧 Email:</strong> \${data.user.email}</p>
                                        <p><strong>🏷️ Type de profil:</strong> \${getProfileCategoryLabel(data.user.userType)}</p>
                                        <p><strong>📅 Membre depuis:</strong> \${formatDate(data.user.memberSince)}</p>
                                        <hr style="margin: 15px 0; border: 1px solid #dee2e6;">
                                        <p style="text-align: center; color: #28a745; font-weight: bold;">
                                            Ce membre est autorisé à accéder aux services Hyperion Connect
                                        </p>
                                    </div>
                                </div>
                            \`;
                        } else {
                            resultDiv.innerHTML = \`
                                <div class="inactive">
                                    <h2 style="color: #ffc107; text-align: center; margin-bottom: 20px;">
                                        ⚠️ Compte Inactif
                                    </h2>
                                    <div class="user-info">
                                        <div style="text-align: center; margin-bottom: 20px;">
                                            <span class="status-badge status-inactive">Compte Inactif</span>
                                        </div>
                                        <p><strong>👤 Nom:</strong> \${data.user.firstName} \${data.user.lastName}</p>
                                        <p><strong>📧 Email:</strong> \${data.user.email}</p>
                                        <hr style="margin: 15px 0; border: 1px solid #dee2e6;">
                                        <p style="text-align: center; color: #856404;">
                                            Ce compte existe mais n'est pas actif.<br>
                                            L'accès aux services peut être limité.
                                        </p>
                                    </div>
                                </div>
                            \`;
                        }
                    } else {
                        let message = 'Erreur de vérification';
                        let emoji = '❌';
                        
                        if (data.status === 'expired') {
                            message = 'QR code expiré. Demandez un nouveau code au membre.';
                            emoji = '🕐';
                        } else if (data.status === 'invalid_token') {
                            message = 'QR code invalide ou corrompu.';
                            emoji = '❌';
                        } else if (data.status === 'user_not_found') {
                            message = 'Aucun utilisateur trouvé pour ce QR code.';
                            emoji = '👤';
                        }
                        
                        resultDiv.innerHTML = \`
                            <div class="error">
                                <h2 style="text-align: center;">\${emoji} \${message}</h2>
                                <p style="text-align: center; margin-top: 20px;">
                                    Veuillez demander au membre de générer un nouveau QR code.
                                </p>
                            </div>
                        \`;
                    }
                })
                .catch(error => {
                    console.error('Erreur de vérification:', error);
                    document.getElementById('result').innerHTML = \`
                        <div class="error">
                            <h2 style="text-align: center;">❌ Erreur de connexion</h2>
                            <p style="text-align: center;">
                                Impossible de vérifier le compte pour le moment.<br>
                                Veuillez réessayer dans quelques instants.
                            </p>
                        </div>
                    \`;
                });
        </script>
    </body>
    </html>
  `;

  res.send(html);
});

export default router;
