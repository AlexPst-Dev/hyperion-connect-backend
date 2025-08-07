import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppDataSource } from "../data-source";
import {
  User,
  Sportsman,
  ProfileCategory,
  Coach,
  Medic,
  Free,
  Partner,
  Admin,
} from "../models/users-model";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";

// Login user post method
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email et mot de passe requis" });
      return;
    }
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Identifiants invalides" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Identifiants invalides" });
      return;
    }
    const token = generateToken(user.id, user.profileCategory);

    // Renvoyer l'utilisateur ET le token
    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileCategory: user.profileCategory,
        imageUrl: user.filePicture ? user.filePicture.url : "",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const sportsmanRepo = AppDataSource.getRepository(Sportsman);
    const coachRepo = AppDataSource.getRepository(Coach);
    const medicRepo = AppDataSource.getRepository(Medic);
    const freeRepo = AppDataSource.getRepository(Free);
    const partnerRepo = AppDataSource.getRepository(Partner);
    const adminRepo = AppDataSource.getRepository(Admin);

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      street,
      city,
      postalCode,
      description,
      filePictureId,
      birthDate,
      stravaLink,
      facebookLink,
      instagramLink,
      linkedinLink,
      tiktokLink,
      youtubeLink,
      isActive,
      profileCategory,
      ...profileData
    } = req.body;

    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepo.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      street,
      city,
      postalCode,
      description,
      filePictureId,
      birthDate,
      stravaLink,
      facebookLink,
      instagramLink,
      linkedinLink,
      tiktokLink,
      youtubeLink,
      isActive,
      profileCategory,
    });

    const savedUser = await userRepo.save(newUser);

    let profile;
    switch (profileCategory) {
      case ProfileCategory.SPORTSMAN:
        profile = sportsmanRepo.create({
          user: savedUser,
          sportCategoryId: profileData.sportCategoryId || null,
          availableDays: profileData.availableDays || null,
          availableTime: profileData.availableTime || null,
          listMedicNotes: profileData.listMedicNotes || null,
          listMedicFiles: profileData.listMedicFiles || null,
          listMedicsIds: profileData.listMedicsIds || null,
          graphId: profileData.graphId || null,
          subscriptionId: profileData.subscriptionId || null,
        });
        await sportsmanRepo.save(profile);
        break;

      case ProfileCategory.COACH:
        profile = coachRepo.create({
          user: savedUser,
          sportCategories: profileData.sportCategories || null,
          canImportSessions: profileData.canImportSessions || false,
        });
        await coachRepo.save(profile);
        break;

      case ProfileCategory.MEDIC:
        profile = medicRepo.create({
          user: savedUser,
          sportCategories: profileData.sportCategories || null,
          canImportSessions: profileData.canImportSessions || false,
        });
        await medicRepo.save(profile);
        break;

      case ProfileCategory.FREE:
        profile = freeRepo.create({
          user: savedUser,
        });
        await freeRepo.save(profile);
        break;

      case ProfileCategory.PARTNER:
        profile = partnerRepo.create({
          user: savedUser,
          companyId: profileData.companyId || null,
        });
        await partnerRepo.save(profile);
        break;

      case ProfileCategory.ADMIN:
        profile = adminRepo.create({
          user: savedUser,
        });
        await adminRepo.save(profile);
        break;

      default:
        break;
    }
    const { password: _, ...userSafe } = savedUser;
    const token = generateToken(savedUser.id, savedUser.profileCategory);
    res.status(201).json({ message: "User registered", user: userSafe, token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user.id } });

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    const { password, ...userSafe } = user;
    res.json({ user: userSafe });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res
        .status(400)
        .json({ message: "Ancien et nouveau mot de passe requis" });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      res.status(401).json({ message: "Ancien mot de passe incorrect" });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    await userRepo.save(user);

    res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur changement mdp :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
