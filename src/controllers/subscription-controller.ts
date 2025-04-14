import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Subscriptions } from "../models/subscription-model";
import { Files } from "../models/files-model";
import { Sportsman } from "../models/users-model";

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
  const { labelDiagnostic, labelPerformancePlan, subscriptionFileId } =
    req.body;

  if (!labelDiagnostic || !labelPerformancePlan || !subscriptionFileId) {
    res.status(400).json({ message: "Tous les champs sont requis." });
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
      labelDiagnostic,
      labelPerformancePlan,
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
  const { labelDiagnostic, labelPerformancePlan, subscriptionFileId } =
    req.body;

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

    if (labelDiagnostic) subscription.labelDiagnostic = labelDiagnostic;
    if (labelPerformancePlan)
      subscription.labelPerformancePlan = labelPerformancePlan;
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
