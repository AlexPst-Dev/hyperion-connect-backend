import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Companies } from "../models/companies-model";
import { User } from "../models/users-model";
import { Files } from "../models/files-model";

export const createCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  const companyRepo = AppDataSource.getRepository(Companies);
  const userRepo = AppDataSource.getRepository(User);
  const fileRepo = AppDataSource.getRepository(Files);

  const {
    responsibleId,
    name,
    fileImageCompanyId,
    description,
    dateEndMembership,
    city,
    postalCode,
    street,
    linkWebsite,
    linkFacebook,
    linkInstagram,
    linkLinkedin,
    linkTiktok,
    linkYoutube,
    isActive = true,
  } = req.body;

  try {
    if (isNaN(responsibleId)) {
      res.status(400).json({ message: "L'ID du responsable est invalide." });
      return;
    }

    const responsible = await userRepo.findOne({
      where: { id: responsibleId },
    });
    if (!responsible) {
      res.status(404).json({ message: "Responsable introuvable." });
      return;
    }

    let fileImageCompany: Files | null = null;
    if (fileImageCompanyId) {
      fileImageCompany = await fileRepo.findOne({
        where: { id: fileImageCompanyId },
      });
      if (!fileImageCompany) {
        res
          .status(404)
          .json({ message: "Fichier image de la société introuvable." });
        return;
      }
    }

    const newCompany = companyRepo.create({
      responsibleId,
      name,
      fileImageCompany: fileImageCompany || undefined,
      description,
      dateEndMembership,
      city,
      postalCode,
      street,
      linkWebsite,
      linkFacebook,
      linkInstagram,
      linkLinkedin,
      linkTiktok,
      linkYoutube,
      isActive,
    });

    const savedCompany = await companyRepo.save(newCompany);

    res.status(201).json({
      message: "Société créée avec succès.",
      company: savedCompany,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la société :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la création de la société." });
  }
};

export const getAllCompanies = async (
  req: Request,
  res: Response
): Promise<void> => {
  const companyRepo = AppDataSource.getRepository(Companies);

  try {
    const companies = await companyRepo.find({
      relations: ["responsible", "fileImageCompany"],
      order: { createdAt: "DESC" },
    });

    res.status(200).json(companies);
  } catch (error) {
    console.error("Erreur lors de la récupération des sociétés :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des sociétés.",
    });
  }
};

export const getCompanyById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const companyRepo = AppDataSource.getRepository(Companies);
  const companyId = parseInt(req.params.id);

  if (isNaN(companyId)) {
    res.status(400).json({ message: "ID de la société invalide." });
    return;
  }

  try {
    const company = await companyRepo.findOne({
      where: { id: companyId },
      relations: ["responsible", "fileImageCompany"],
    });

    if (!company) {
      res.status(404).json({ message: "Société non trouvée." });
      return;
    }

    res.status(200).json(company);
  } catch (error) {
    console.error("Erreur lors de la récupération de la société :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération de la société.",
    });
  }
};

export const getCompanyResponsibleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const companyRepo = AppDataSource.getRepository(Companies);
  const companyId = parseInt(req.params.id);

  if (isNaN(companyId)) {
    res.status(400).json({ message: "ID de la société invalide." });
    return;
  }

  try {
    const company = await companyRepo.findOne({
      where: { id: companyId },
      relations: ["responsible"],
    });

    if (!company) {
      res.status(404).json({ message: "Société non trouvée." });
      return;
    }

    res.status(200).json({
      responsible: company.responsible,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du responsable :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération du responsable.",
    });
  }
};

export const updateCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  const companyRepo = AppDataSource.getRepository(Companies);
  const companyId = parseInt(req.params.id);

  if (isNaN(companyId)) {
    res.status(400).json({ message: "ID de l'entreprise invalide." });
    return;
  }

  try {
    const existingCompany = await companyRepo.findOneBy({ id: companyId });

    if (!existingCompany) {
      res.status(404).json({ message: "Entreprise non trouvée." });
      return;
    }

    const { id, createdAt, updatedAt, ...updateData } = req.body;

    const updatedCompany = companyRepo.merge(existingCompany, updateData);
    const savedCompany = await companyRepo.save(updatedCompany);

    res.status(200).json({
      message: "Entreprise mise à jour avec succès.",
      company: savedCompany,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entreprise :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la mise à jour de l'entreprise.",
    });
  }
};

export const deleteCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  const companyRepo = AppDataSource.getRepository(Companies);
  const companyId = parseInt(req.params.id);

  if (isNaN(companyId)) {
    res.status(400).json({ message: "ID de l'entreprise invalide." });
    return;
  }

  try {
    const existingCompany = await companyRepo.findOneBy({ id: companyId });

    if (!existingCompany) {
      res.status(404).json({ message: "Entreprise non trouvée." });
      return;
    }

    await companyRepo.remove(existingCompany);

    res.status(200).json({ message: "Entreprise supprimée définitivement." });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'entreprise :", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression." });
  }
};
