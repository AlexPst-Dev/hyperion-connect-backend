import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Billings } from "../models/billings-model";
import { Objectives } from "../models/objectives-model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const createBilling = async (
  req: Request,
  res: Response
): Promise<void> => {
  const billingRepo = AppDataSource.getRepository(Billings);
  const objectiveRepo = AppDataSource.getRepository(Objectives);

  const {
    objectiveId,
    date,
    globalAmount,
    isMonthly,
    monthlyAmount,
    paymentReceived,
    isActive = true,
  } = req.body;

  try {
    if (isNaN(objectiveId)) {
      res
        .status(400)
        .json({ message: "L'ID de l'objectif n'est pas conforme." });
      return;
    }

    const objective = await objectiveRepo.findOne({
      where: { id: objectiveId },
    });

    if (!objective) {
      res.status(404).json({ message: "Objectif inexistant" });
      return;
    }

    if (isMonthly && !monthlyAmount) {
      res.status(400).json({
        message:
          "Le montant mensuel est requis pour une facturation mensuelle.",
      });
      return;
    }

    if (!isMonthly && monthlyAmount) {
      res.status(400).json({
        message:
          "Le montant mensuel ne doit pas être renseigné pour une facturation globale.",
      });
      return;
    }

    const newBilling = billingRepo.create({
      objectiveId,
      date,
      globalAmount,
      isMonthly,
      monthlyAmount,
      paymentReceived,
      isActive,
    });

    const savedBilling = await billingRepo.save(newBilling);

    res.status(201).json({
      message: "Facture créée avec succès.",
      billing: savedBilling,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la facture:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la création de la facture." });
  }
};

export const getAllBillings = async (
  req: Request,
  res: Response
): Promise<void> => {
  const billingRepo = AppDataSource.getRepository(Billings);

  try {
    const billings = await billingRepo.find({
      relations: ["objective"],
      order: { date: "ASC" },
    });

    if (billings.length === 0) {
      res.status(404).json({ message: "Aucune facture trouvée." });
      return;
    }

    res.status(200).json({
      message: "Factures récupérées avec succès.",
      billings,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des factures:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des factures.",
    });
  }
};

export const getBillingById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const billingRepo = AppDataSource.getRepository(Billings);
  const { id } = req.params;

  try {
    if (isNaN(parseInt(id))) {
      res
        .status(400)
        .json({ message: "L'ID de la facturation n'est pas valide." });
      return;
    }
    const billing = await billingRepo.findOne({
      where: { billingId: parseInt(id) },
      relations: ["objective"],
    });

    if (!billing) {
      res.status(404).json({ message: "Facturation non trouvée." });
      return;
    }

    res.status(200).json({
      message: "Facturation récupérée avec succès.",
      billing,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la facturation:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération de la facturation.",
    });
  }
};

export const getBillingsByObjectiveId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const billingRepo = AppDataSource.getRepository(Billings);

  const { objectiveId } = req.params;

  try {
    if (isNaN(Number(objectiveId))) {
      res
        .status(400)
        .json({ message: "L'ID de l'objectif doit être un nombre valide." });
      return;
    }

    const billings = await billingRepo.find({
      where: { objectiveId: parseInt(objectiveId) },
    });

    if (billings.length === 0) {
      res
        .status(404)
        .json({ message: "Aucune facturation trouvée pour cet objectif." });
      return;
    }

    res.status(200).json({
      message: "Facturations récupérées avec succès.",
      billings,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des facturations:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des facturations.",
    });
  }
};

export const getBillingsByUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const billingRepo = AppDataSource.getRepository(Billings);
  const { sportsmanId } = req.params;

  const id = parseInt(sportsmanId);

  if (isNaN(id)) {
    res
      .status(400)
      .json({ message: "L'ID de l'utilisateur n'est pas valide." });
    return;
  }

  const isSelf = req.user.role === "sportsman" && req.user.id === id;

  if (!isSelf && req.user.role !== "admin") {
    res.status(403).json({ message: "Accès interdit." });
    return;
  }

  try {
    const billings = await billingRepo.find({
      where: { objective: { sportsmanId: id } },
      relations: ["objective"],
    });

    res.status(200).json({
      message: "Facturations récupérées avec succès.",
      billings,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des facturations :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des facturations.",
    });
  }
};

export const updateBilling = async (
  req: Request,
  res: Response
): Promise<void> => {
  const billingRepo = AppDataSource.getRepository(Billings);
  const { billingId } = req.params;
  const dataToUpdate = req.body;

  try {
    if (isNaN(parseInt(billingId))) {
      res
        .status(400)
        .json({ message: "L'ID de la facturation n'est pas valide." });
      return;
    }
    const billing = await billingRepo.findOne({
      where: { billingId: parseInt(billingId) },
    });

    if (!billing) {
      res.status(404).json({ message: "Facturation non trouvée." });
      return;
    }

    const forbiddenFields = ["billingId", "objectiveId", "date"];
    for (const field of forbiddenFields) {
      if (field in dataToUpdate) {
        res
          .status(400)
          .json({ message: `Le champ '${field}' ne peut pas être modifié.` });
        return;
      }
    }

    billingRepo.merge(billing, dataToUpdate);
    const updatedBilling = await billingRepo.save(billing);

    res.status(200).json({
      message: "Facturation mise à jour avec succès.",
      billing: updatedBilling,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la facturation :", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour." });
  }
};

export const deleteBilling = async (
  req: Request,
  res: Response
): Promise<void> => {
  const billingRepo = AppDataSource.getRepository(Billings);
  const { billingId } = req.params;

  try {
    if (isNaN(parseInt(billingId))) {
      res
        .status(400)
        .json({ message: "L'ID de la facturation n'est pas valide." });
      return;
    }
    const billing = await billingRepo.findOne({
      where: { billingId: parseInt(billingId) },
    });

    if (!billing) {
      res.status(404).json({ message: "Facturation non trouvée." });
      return;
    }

    await billingRepo.remove(billing);

    res.status(200).json({ message: "Facturation supprimée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de la facturation :", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression." });
  }
};
