import { config } from "../config/config";
import { Request, Response } from "express";
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
import { Graphs } from "../models/graphs-model";
import { Companies } from "../models/companies-model";
import { In } from "typeorm";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Files } from "../models/files-model";
import { Categories } from "../models/categories-model";
import { sendMail } from "../utils/mailService";
import { generateResetToken } from "../utils/resetToken";

// Fields a user may change on their own account. Role, activation and
// Hyperlink network membership are admin decisions;
// id, password and timestamps are never set through these routes.
const SELF_EDITABLE_FIELDS = [
  "firstName", "lastName", "email", "phone", "street", "city", "postalCode",
  "description", "filePictureId", "birthDate", "stravaLink", "facebookLink",
  "instagramLink", "linkedinLink", "tiktokLink", "youtubeLink",
] as const;
const ADMIN_ONLY_FIELDS = ["isActive", "isInHyperlinkNetwork"] as const;

function pickEditableUserFields(body: Record<string, unknown>, isAdmin: boolean): Partial<User> {
  const allowed: readonly string[] = isAdmin
    ? [...SELF_EDITABLE_FIELDS, ...ADMIN_ONLY_FIELDS]
    : SELF_EDITABLE_FIELDS;
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => allowed.includes(key))
  ) as Partial<User>;
}

// Get all users
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userRepository = AppDataSource.getRepository(User);

    // Parse limit and offset from query, with defaults
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    const [users, total] = await userRepository.findAndCount({
      skip: offset,
      take: limit,
      order: { id: "ASC" }, // Optional: order by id
    });

    res.status(200).json({
      users,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user by ID
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ message: "ID utilisateur invalide" });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        profileCategory: true,
        filePictureId: true,
        postalCode: true,
        street: true,
        city: true,
        description: true,
        birthDate: true,
        stravaLink: true,
        facebookLink: true,
        instagramLink: true,
        linkedinLink: true,
        tiktokLink: true,
        youtubeLink: true,
        isActive: true,
        isInHyperlinkNetwork: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const fileRepo = AppDataSource.getRepository(Files);

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    } else {
      let profile = null;
      let file = null;

      if (user.filePictureId) {
        file = await fileRepo.findOne({ where: { id: user.filePictureId } });
      }

      switch (user.profileCategory) {
        case ProfileCategory.SPORTSMAN:
          profile = await AppDataSource.getRepository(Sportsman).findOne({
            where: { user: { id: userId } },
          });
          break;
        case ProfileCategory.COACH:
          profile = await AppDataSource.getRepository(Coach).findOne({
            where: { user: { id: userId } },
            relations: ["sportCategories"],
          });
          break;
        case ProfileCategory.MEDIC:
          profile = await AppDataSource.getRepository(Medic).findOne({
            where: { user: { id: userId } },
            relations: ["sportCategories"],
          });
          break;
        case ProfileCategory.FREE:
          profile = await AppDataSource.getRepository(Free).findOne({
            where: { user: { id: userId } },
          });
          break;
        case ProfileCategory.PARTNER:
          profile = await AppDataSource.getRepository(Partner).findOne({
            where: { user: { id: userId } },
          });
          break;
        case ProfileCategory.ADMIN:
          profile = await AppDataSource.getRepository(Admin).findOne({
            where: { user: { id: userId } },
          });
          break;
        default:
          res.status(500).json({ message: "Catégorie de profil inconnue" });
      }

      res.status(200).json({
        user,
        filePicture: file || null,
        profile,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Get users by profile category
export const getUsersByProfileCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category } = req.params;

    if (!Object.values(ProfileCategory).includes(category as ProfileCategory)) {
      res.status(400).json({ message: "Catégorie de profil invalide" });
      return;
    }

    // Parse limit and offset from query, with defaults
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    const userRepository = AppDataSource.getRepository(User);
    const [users, total] = await userRepository.findAndCount({
      skip: offset,
      take: limit,
      where: { profileCategory: category as ProfileCategory },
      order: { id: "ASC" },
    });

    if (users.length === 0) {
      res
        .status(404)
        .json({ message: "Aucun utilisateur trouvé pour cette catégorie" });
      return;
    }

    const userIds = users.map((user) => user.id);

    let profiles:
      | Sportsman[]
      | Coach[]
      | Medic[]
      | Partner[]
      | Free[]
      | Admin[] = [];

    switch (category) {
      case ProfileCategory.SPORTSMAN:
        profiles = await AppDataSource.getRepository(Sportsman).find({
          where: { user: { id: In(userIds) } },
          relations: ["user"],
        });
        break;
      case ProfileCategory.COACH:
        profiles = await AppDataSource.getRepository(Coach).find({
          where: { user: { id: In(userIds) } },
          relations: ["user"],
        });
        break;
      case ProfileCategory.MEDIC:
        profiles = await AppDataSource.getRepository(Medic).find({
          where: { user: { id: In(userIds) } },
          relations: ["user"],
        });
        break;
      case ProfileCategory.FREE:
        profiles = await AppDataSource.getRepository(Free).find({
          where: { user: { id: In(userIds) } },
          relations: ["user"],
        });
        break;
      case ProfileCategory.PARTNER:
        profiles = await AppDataSource.getRepository(Partner).find({
          where: { user: { id: In(userIds) } },
          relations: ["user"],
        });
        break;
      case ProfileCategory.ADMIN:
        profiles = await AppDataSource.getRepository(Admin).find({
          where: { user: { id: In(userIds) } },
          relations: ["user"],
        });
        break;
    }

    // Combine user and profile in the response
    const result = profiles.map((profile) => ({
      profile,
    }));

    res.status(200).json({
      users: result,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// Get subscription thanks to sporstman's user ID
export const getSubscriptionBySportsmanUserId = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ message: "ID utilisateur invalide" });
      return;
    }

    const sportsmanRepository = AppDataSource.getRepository(Sportsman);

    const sportsman = await sportsmanRepository.findOne({
      where: { user: { id: userId } },
      relations: ["subscription"],
    });

    if (!sportsman) {
      res.status(404).json({ message: "Sportif non trouvé" });
      return;
    }

    res.status(200).json({
      subscription: sportsman.subscription || null,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du sportif :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Get graph thanks to sporstman's user ID
export const getGraphBySportsmanUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ message: "ID utilisateur invalide" });
      return;
    }

    const sportsmanRepository = AppDataSource.getRepository(Sportsman);

    const sportsman = await sportsmanRepository.findOne({
      where: { user: { id: userId } },
      relations: ["graph"],
    });

    if (!sportsman) {
      res.status(404).json({ message: "Sportif non trouvé" });
      return;
    }

    res.status(200).json({
      graph: sportsman.graph || null,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du sportif :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Get company of a partner user
export const getCompanyByPartnerId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ message: "ID utilisateur invalide" });
      return;
    }

    const partnerRepository = AppDataSource.getRepository(Partner);

    const partner = await partnerRepository.findOne({
      where: { user: { id: userId } },
      relations: ["company"],
    });

    if (!partner) {
      res.status(404).json({ message: "Partenaire non trouvé" });
      return;
    }

    res.status(200).json({
      company: partner.company || null,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du sportif :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Update user by ID
export const updateUserById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      res.status(400).json({ message: "ID utilisateur invalide" });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    Object.assign(user, pickEditableUserFields(req.body, req.user?.role === "admin"));

    await userRepository.save(user);

    res
      .status(200)
      .json({ message: "Utilisateur mis à jour avec succès", user });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Update user with profile by ID
export const updateUserByProfileAndId = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id, profileCategory } = req.params;
  const data = { ...req.body };

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: Number(id) });

    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      if (user.profileCategory !== profileCategory) {
        res.status(400).json({
          message: `Invalid profile category for user ${id}. Expected '${user.profileCategory}', received '${profileCategory}'.`,
        });
      } else {
        Object.assign(user, pickEditableUserFields(data, req.user?.role === "admin"));
        await userRepo.save(user);

        const updateProfile = async <T>(
          entityClass: { new (): T },
          assignData: Partial<T>
        ): Promise<T | null> => {
          const repo = AppDataSource.getRepository(entityClass);
          const profile = await repo.findOne({
            where: { user: { id: Number(id) } },
          });
          if (!profile) return null;
          Object.assign(profile, assignData);
          await repo.save(profile);
          return profile as T;
        };

        let updatedProfile = null;

        switch (profileCategory) {
          case ProfileCategory.SPORTSMAN:
            updatedProfile = await updateProfile(Sportsman, data);
            break;
          case ProfileCategory.COACH:
            updatedProfile = await updateProfile(Coach, data);
            break;
          case ProfileCategory.MEDIC:
            updatedProfile = await updateProfile(Medic, data);
            break;
          case ProfileCategory.FREE:
            updatedProfile = await updateProfile(Free, data);
            break;
          case ProfileCategory.PARTNER:
            updatedProfile = await updateProfile(Partner, data);
            break;
          case ProfileCategory.ADMIN:
            updatedProfile = await updateProfile(Admin, data);
            break;
          default:
            res.status(400).json({ message: "Invalid profile category" });
        }

        if (!updatedProfile) {
          res.status(404).json({
            message: `Profile entity not found for user ${id} with category ${profileCategory}`,
          });
        } else {
          res.status(200).json({
            message: "User and profile updated successfully",
          });
        }
      }
    }
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new user with profile
export const createNewUserWithProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const sportsmanRepo = AppDataSource.getRepository(Sportsman);
    const coachRepo = AppDataSource.getRepository(Coach);
    const medicRepo = AppDataSource.getRepository(Medic);
    const freeRepo = AppDataSource.getRepository(Free);
    const partnerRepo = AppDataSource.getRepository(Partner);
    const adminRepo = AppDataSource.getRepository(Admin);

    // Extract user fields and profile fields
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
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
      isInHyperlinkNetwork,
      profileCategory,
      profile, // profile-specific fields (object)
    } = req.body;

    // Check if email already exists
    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    // Generate a temporary password if not provided
    let userPassword = password;
    let isTempPassword = false;
    if (!userPassword) {
      userPassword = crypto.randomBytes(8).toString("hex"); // 16 chars
      isTempPassword = true;
    }
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Create user
    const newUser = userRepo.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
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
      isInHyperlinkNetwork,
      profileCategory,
    });

    const savedUser = await userRepo.save(newUser);

    // Create profile based on category
    let createdProfile = null;
    switch (profileCategory) {
      case ProfileCategory.SPORTSMAN:
        createdProfile = sportsmanRepo.create({
          user: savedUser,
          sportCategoryId: profile?.sportCategoryId || null,
          availableDays: profile?.availableDays || null,
          availableTime: profile?.availableTime || null,
          listMedicNotes: profile?.listMedicNotes || null,
          listMedicFiles: profile?.listMedicFiles || null,
          listMedicsIds: profile?.listMedicsIds || null,
          listUserFiles: profile?.listUserFiles || null,
          graphId: profile?.graphId || null,
          subscriptionId: profile?.subscriptionId || null,
        });
        await sportsmanRepo.save(createdProfile);
        break;
      case ProfileCategory.COACH:
        const coachCategoryIds = profile?.sportCategoryIds || [];
        const coachCategoriesRepo = AppDataSource.getRepository(Categories);
        const coachCategories = coachCategoryIds.length
          ? await coachCategoriesRepo.findBy({ id: In(coachCategoryIds) })
          : [];

        createdProfile = coachRepo.create({
          user: savedUser,
          sportCategories: coachCategories,
          canImportSessions: profile?.canImportSessions || false,
        });
        await coachRepo.save(createdProfile);
        break;
      case ProfileCategory.MEDIC:
        const categoryIds = profile?.medicCategoryIds || [];
        const categoriesRepo = AppDataSource.getRepository(Categories);
        const categories = categoryIds.length
          ? await categoriesRepo.findBy({ id: In(categoryIds) })
          : [];

        createdProfile = medicRepo.create({
          user: savedUser,
          sportCategories: categories,
          canImportSessions: profile?.canImportSessions || false,
        });
        await medicRepo.save(createdProfile);
        break;
      case ProfileCategory.FREE:
        createdProfile = freeRepo.create({
          user: savedUser,
        });
        await freeRepo.save(createdProfile);
        break;
      case ProfileCategory.PARTNER:
        createdProfile = partnerRepo.create({
          user: savedUser,
          companyId: profile?.companyId || null,
        });
        await partnerRepo.save(createdProfile);
        break;
      case ProfileCategory.ADMIN:
        createdProfile = adminRepo.create({
          user: savedUser,
        });
        await adminRepo.save(createdProfile);
        break;
      default:
        res.status(400).json({ message: "Invalid profile category" });
        return;
    }

    // The hash is still on the saved entity in memory: never send it back.
    const { password: _hash, ...userSafe } = savedUser;
    res.status(201).json({
      message: "User and profile created successfully",
      user: userSafe,
      profile: createdProfile,
      tempPassword: isTempPassword ? userPassword : undefined,
    });

    // Create welcome email and reset password with it
    const token = generateResetToken(savedUser.id.toString());

    // Lien de reset → ton front va le gérer
    const resetLink = `${config.frontendUrl}/reset-password?token=${token}`;

    await sendMail(
      savedUser.email,
      `${config.appName} - Création de votre compte`,
      `<h1 style="color: #1E3A8A">Création de votre compte</h1>
        <p>Votre compte est désormais créé, vous pouvez utiliser le lien ci-dessous pour créér votre mot de passe :</p>
        <ul>
          <li>Email : ${savedUser.email}</li>
          <p><a href="${resetLink}">Créér mon mot de passe</a></p>
        </ul>`
    );
  } catch (error) {
    console.error("Error creating user and profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete user by ID
export const deleteUserById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userRepo = AppDataSource.getRepository(User);

  try {
    const user = await userRepo.findOneBy({ id: Number(id) });

    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      const profileCategory = user.profileCategory;

      switch (profileCategory) {
        case ProfileCategory.SPORTSMAN: {
          const sportsmanRepo = AppDataSource.getRepository(Sportsman);
          const graphRepo = AppDataSource.getRepository(Graphs);

          const sportsman = await sportsmanRepo.findOne({
            where: { user: { id: user.id } },
            relations: ["graph"],
          });

          if (sportsman?.graphId) {
            await graphRepo.delete(sportsman.graphId);
          }

          if (sportsman) {
            await sportsmanRepo.delete(sportsman.id);
          }

          break;
        }

        case ProfileCategory.COACH: {
          const coachRepo = AppDataSource.getRepository(Coach);
          await coachRepo.delete({ user: { id: user.id } });
          break;
        }

        case ProfileCategory.MEDIC: {
          const medicRepo = AppDataSource.getRepository(Medic);
          await medicRepo.delete({ user: { id: user.id } });
          break;
        }

        case ProfileCategory.FREE: {
          const freeRepo = AppDataSource.getRepository(Free);
          await freeRepo.delete({ user: { id: user.id } });
          break;
        }

        case ProfileCategory.PARTNER: {
          const partnerRepo = AppDataSource.getRepository(Partner);
          const companyRepo = AppDataSource.getRepository(Companies);

          const partner = await partnerRepo.findOne({
            where: { user: { id: user.id } },
            relations: ["company"],
          });

          if (partner?.companyId) {
            await companyRepo.delete(partner.companyId);
          }

          if (partner) {
            await partnerRepo.delete(partner.id);
          }

          break;
        }

        case ProfileCategory.ADMIN: {
          const adminRepo = AppDataSource.getRepository(Admin);
          await adminRepo.delete({ user: { id: user.id } });
          break;
        }

        default:
          console.warn("Unknown profileCategory:", profileCategory);
      }

      await userRepo.delete(user.id);

      res.status(200).json({
        message: `User with id ${id} and related data deleted successfully.`,
      });
    }
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user.id;
  const userRepo = AppDataSource.getRepository(User);

  try {
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const profileCategory = user.profileCategory;
    switch (profileCategory) {
      case ProfileCategory.SPORTSMAN: {
        const sportsmanRepo = AppDataSource.getRepository(Sportsman);
        const graphRepo = AppDataSource.getRepository(Graphs);
        const sportsman = await sportsmanRepo.findOne({
          where: { user: { id: user.id } },
          relations: ["graph"],
        });
        if (sportsman?.graphId) {
          await graphRepo.delete(sportsman.graphId);
        }
        if (sportsman) {
          await sportsmanRepo.delete(sportsman.id);
        }
        break;
      }
      case ProfileCategory.COACH: {
        const coachRepo = AppDataSource.getRepository(Coach);
        await coachRepo.delete({ user: { id: user.id } });
        break;
      }
      case ProfileCategory.MEDIC: {
        const medicRepo = AppDataSource.getRepository(Medic);
        await medicRepo.delete({ user: { id: user.id } });
        break;
      }
      case ProfileCategory.FREE: {
        const freeRepo = AppDataSource.getRepository(Free);
        await freeRepo.delete({ user: { id: user.id } });
        break;
      }
      case ProfileCategory.PARTNER: {
        const partnerRepo = AppDataSource.getRepository(Partner);
        const companyRepo = AppDataSource.getRepository(Companies);
        const partner = await partnerRepo.findOne({
          where: { user: { id: user.id } },
          relations: ["company"],
        });
        if (partner?.companyId) {
          await companyRepo.delete(partner.companyId);
        }
        if (partner) {
          await partnerRepo.delete(partner.id);
        }
        break;
      }
      case ProfileCategory.ADMIN: {
        const adminRepo = AppDataSource.getRepository(Admin);
        await adminRepo.delete({ user: { id: user.id } });
        break;
      }
      default:
        console.warn("Unknown profileCategory:", profileCategory);
    }

    await userRepo.delete(user.id);
    res.status(200).json({
      message: "Account deleted successfully.",
    });
  } catch (err) {
    console.error("Delete current user error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
