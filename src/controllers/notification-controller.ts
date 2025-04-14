import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import {
  Notifications,
  NotificationCategory,
} from "../models/notifications-model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const createNotification = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { notificationCategory, title, text } = req.body;

  if (!notificationCategory || !title || !text) {
    res.status(400).json({ message: "Tous les champs sont requis." });
    return;
  }

  if (!Object.values(NotificationCategory).includes(notificationCategory)) {
    res.status(400).json({ message: "Catégorie de notification invalide." });
    return;
  }

  try {
    const notificationRepo = AppDataSource.getRepository(Notifications);
    const newNotification = notificationRepo.create({
      notificationCategory,
      title,
      text,
    });

    const saved = await notificationRepo.save(newNotification);
    res.status(201).json(saved);
  } catch (error) {
    console.error("Erreur lors de la création de la notification :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la création de la notification.",
    });
  }
};

export const getAllNotifications = async (
  _: Request,
  res: Response
): Promise<void> => {
  try {
    const notifications = await AppDataSource.getRepository(
      Notifications
    ).find();
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getNotificationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ message: "L'ID doit être un nombre." });
    return;
  }

  try {
    const notification = await AppDataSource.getRepository(
      Notifications
    ).findOneBy({ id });

    if (!notification) {
      res.status(404).json({ message: "Notification introuvable." });
      return;
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Erreur récupération par ID :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getNotificationsByCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { category } = req.params;

  if (
    !Object.values(NotificationCategory).includes(
      category as NotificationCategory
    )
  ) {
    res.status(400).json({ message: "Catégorie invalide." });
    return;
  }

  try {
    const notifications = await AppDataSource.getRepository(Notifications).find(
      {
        where: { notificationCategory: category as NotificationCategory },
      }
    );
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Erreur récupération par catégorie :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const updateNotification = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { notificationCategory, title, text } = req.body;

  if (isNaN(id)) {
    res.status(400).json({ message: "L'ID doit être un nombre." });
    return;
  }

  try {
    const notificationRepo = AppDataSource.getRepository(Notifications);
    const notification = await notificationRepo.findOneBy({ id });

    if (!notification) {
      res.status(404).json({ message: "Notification introuvable." });
      return;
    }

    if (notificationCategory)
      notification.notificationCategory = notificationCategory;
    if (title) notification.title = title;
    if (text) notification.text = text;

    const updated = await notificationRepo.save(notification);
    res.status(200).json(updated);
  } catch (error) {
    console.error("Erreur mise à jour :", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour." });
  }
};

export const deleteNotification = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ message: "L'ID doit être un nombre." });
    return;
  }

  try {
    const notificationRepo = AppDataSource.getRepository(Notifications);
    const notification = await notificationRepo.findOneBy({ id });

    if (!notification) {
      res.status(404).json({ message: "Notification introuvable." });
      return;
    }

    await notificationRepo.remove(notification);
    res.status(200).json({ message: "Notification supprimée avec succès." });
  } catch (error) {
    console.error("Erreur suppression :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
