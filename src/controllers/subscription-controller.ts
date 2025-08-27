import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Subscriptions } from "../models/subscription-model";
import { Files } from "../models/files-model";
import { Sportsman, User, Admin } from "../models/users-model";
import { sendMail } from "../utils/mailService";

export const getAllSubscriptions = async (
  _: Request,
  res: Response
): Promise<void> => {
  try {
    const subscriptions = await AppDataSource.getRepository(
      Subscriptions
    ).find();
    res.status(200).json(subscriptions);
  } catch (error) {
    console.error("Erreur récupération abonnements :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getSubscriptionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ message: "L'ID doit être un nombre." });
    return;
  }

  try {
    const subscription = await AppDataSource.getRepository(
      Subscriptions
    ).findOne({
      where: { id },
      relations: ["subscriptionFile"],
    });

    if (!subscription) {
      res.status(404).json({ message: "Abonnement introuvable." });
      return;
    }

    res.status(200).json(subscription);
  } catch (error) {
    console.error("Erreur récupération abonnement :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getSubscriptionByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    res.status(400).json({ message: "ID utilisateur invalide" });
    return;
  }

  try {
    const sportsmanRepo = AppDataSource.getRepository(Sportsman);

    const sportsman = await sportsmanRepo.findOne({
      where: { user: { id: userId } },
      relations: ["subscription", "subscription.subscriptionFile"],
    });

    if (!sportsman || !sportsman.subscription) {
      res
        .status(404)
        .json({ message: "Abonnement introuvable pour cet utilisateur" });
      return;
    }

    res.json(sportsman.subscription);
    return;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'abonnement :", error);
    res.status(500).json({ message: "Erreur serveur" });
    return;
  }
};

export const createSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    monthlyMonitoringCategory,
    isBilanComplete,
    startDate,
    endDate,
    otherServises,
    subscriptionFileId,
  } = req.body;

  if (!startDate || !endDate || !subscriptionFileId) {
    res.status(400).json({
      message:
        "Les champs startDate, endDate et subscriptionFileId sont requis.",
    });
    return;
  }

  try {
    const fileRepo = AppDataSource.getRepository(Files);
    const file = await fileRepo.findOneBy({ id: subscriptionFileId });

    if (!file) {
      res.status(404).json({ message: "Fichier d'abonnement introuvable." });
      return;
    }

    const subscriptionRepo = AppDataSource.getRepository(Subscriptions);
    const newSubscription = subscriptionRepo.create({
      monthlyMonitoringCategory,
      isBilanComplete,
      startDate,
      endDate,
      otherServises,
      subscriptionFile: file,
      subscriptionFileId,
    });

    const saved = await subscriptionRepo.save(newSubscription);
    res.status(201).json(saved);
  } catch (error) {
    console.error("Erreur création abonnement :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const updateSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const {
    monthlyMonitoringCategory,
    isBilanComplete,
    startDate,
    endDate,
    otherServises,
    subscriptionFileId,
  } = req.body;

  if (isNaN(id)) {
    res.status(400).json({ message: "L'ID doit être un nombre." });
    return;
  }

  try {
    const subscriptionRepo = AppDataSource.getRepository(Subscriptions);
    const subscription = await subscriptionRepo.findOneBy({ id });

    if (!subscription) {
      res.status(404).json({ message: "Abonnement introuvable." });
      return;
    }

    if (monthlyMonitoringCategory)
      subscription.monthlyMonitoringCategory = monthlyMonitoringCategory;
    if (isBilanComplete) subscription.isBilanComplete = isBilanComplete;
    if (startDate) subscription.startDate = startDate;
    if (endDate) subscription.endDate = endDate;
    if (otherServises) subscription.otherServises = otherServises;

    if (subscriptionFileId) {
      const file = await AppDataSource.getRepository(Files).findOneBy({
        id: subscriptionFileId,
      });
      if (!file) {
        res.status(404).json({ message: "Fichier d'abonnement introuvable." });
        return;
      }
      subscription.subscriptionFile = file;
      subscription.subscriptionFileId = subscriptionFileId;
    }

    const updated = await subscriptionRepo.save(subscription);
    res.status(200).json(updated);
  } catch (error) {
    console.error("Erreur mise à jour abonnement :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const deleteSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ message: "L'ID doit être un nombre." });
    return;
  }

  try {
    const subscriptionRepo = AppDataSource.getRepository(Subscriptions);
    const subscription = await subscriptionRepo.findOneBy({ id });

    if (!subscription) {
      res.status(404).json({ message: "Abonnement introuvable." });
      return;
    }

    await subscriptionRepo.remove(subscription);
    res.status(200).json({ message: "Abonnement supprimé avec succès." });
  } catch (error) {
    console.error("Erreur suppression abonnement :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const askForChangeSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      res.status(400).json({ message: "userId requis" });
      return;
    }

    // Récupérer l'utilisateur demandeur
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) {
      res.status(404).json({ message: "Utilisateur introuvable" });
      return;
    }

    // Récupérer tous les admins
    const adminRepo = AppDataSource.getRepository(Admin);
    const admins = await adminRepo.find({ relations: ["user"] });

    // Envoyer le mail à chaque admin
    for (const admin of admins) {
      if (admin.user?.email) {
        await sendMail(
          admin.user.email,
          "HYPERION - Demande de changement d'abonnement",
          `<h1 style="color: #1E3A8A">Demande de changement d'abonnement</h1>
          <p>L'utilisateur suivant a fait une demande de changement d'abonnement :</p>
          <ul>
            <li>Nom : ${user.lastName}</li>
            <li>Prénom : ${user.firstName}</li>
            <li>Email : ${user.email}</li>
            <li>Téléphone : ${user.phone || "Non renseigné"}</li>
          </ul>`
        );
      }
    }

    res.status(200).json({ message: "Demande envoyée aux administrateurs." });
  } catch (error) {
    console.error(
      "Erreur lors de la demande de changement d'abonnement :",
      error
    );
    res.status(500).json({ message: "Erreur serveur." });
  }
};
