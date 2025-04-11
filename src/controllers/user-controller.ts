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

// Get all users
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();
    res.status(200).json(users);
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
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    } else {
      let profile = null;

      switch (user.profileCategory) {
        case ProfileCategory.SPORTSMAN:
          profile = await AppDataSource.getRepository(Sportsman).findOne({
            where: { user: { id: userId } },
          });
          break;
        case ProfileCategory.COACH:
          profile = await AppDataSource.getRepository(Coach).findOne({
            where: { user: { id: userId } },
          });
          break;
        case ProfileCategory.MEDIC:
          profile = await AppDataSource.getRepository(Medic).findOne({
            where: { user: { id: userId } },
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

    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      where: { profileCategory: category as ProfileCategory },
    });
    const userIds = users.map((user) => user.id);

    if (users.length === 0) {
      res
        .status(404)
        .json({ message: "Aucun utilisateur trouvé pour cette catégorie" });
      return;
    }

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
        });
        break;
      case ProfileCategory.MEDIC:
        profiles = await AppDataSource.getRepository(Medic).find({
          where: { user: { id: In(userIds) } },
        });
        break;
      case ProfileCategory.FREE:
        profiles = await AppDataSource.getRepository(Free).find({
          where: { user: { id: In(userIds) } },
        });
        break;
      case ProfileCategory.PARTNER:
        profiles = await AppDataSource.getRepository(Partner).find({
          where: { user: { id: In(userIds) } },
        });
        break;
      case ProfileCategory.ADMIN:
        profiles = await AppDataSource.getRepository(Admin).find({
          where: { user: { id: In(userIds) } },
        });
        break;
    }

    const result = users.map((user) => ({
      profile: profiles.find((p) => p.user.id === user.id) || null,
    }));

    res.status(200).json(result);
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

    const { password, id, ...updateData } = req.body;

    Object.assign(user, updateData);

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
        delete data.id;
        delete data.password;

        Object.assign(user, data);
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
