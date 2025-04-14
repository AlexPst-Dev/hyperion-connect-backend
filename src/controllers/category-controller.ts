import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Categories, CategoryType } from "../models/categories-model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { label, backgroundColor, textColor, categoryType } = req.body;

  if (!label || !backgroundColor || !textColor || !categoryType) {
    res.status(400).json({ message: "Tous les champs sont requis." });
    return;
  }

  try {
    if (!Object.values(CategoryType).includes(categoryType)) {
      res.status(400).json({ message: "Type de catégorie invalide." });
      return;
    }

    const categoryRepo = AppDataSource.getRepository(Categories);
    const newCategory = categoryRepo.create({
      label,
      backgroundColor,
      textColor,
      categoryType,
    });

    const saved = await categoryRepo.save(newCategory);
    res.status(201).json(saved);
  } catch (error) {
    console.error("Erreur création catégorie :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getAllCategories = async (
  _: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const categories = await AppDataSource.getRepository(Categories).find();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Erreur récupération catégories :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getCategoryById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ message: "L'ID doit être un nombre." });
    return;
  }

  try {
    const category = await AppDataSource.getRepository(Categories).findOneBy({
      id,
    });

    if (!category) {
      res.status(404).json({ message: "Catégorie introuvable." });
      return;
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Erreur récupération par ID :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getCategoriesByType = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { type } = req.params;

  if (!Object.values(CategoryType).includes(type as CategoryType)) {
    res.status(400).json({ message: "Type de catégorie invalide." });
    return;
  }

  try {
    const categories = await AppDataSource.getRepository(Categories).find({
      where: { categoryType: type as CategoryType },
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error("Erreur récupération par type :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { label, backgroundColor, textColor, categoryType } = req.body;

  if (isNaN(id)) {
    res.status(400).json({ message: "L'ID doit être un nombre." });
    return;
  }

  try {
    if (categoryType && !Object.values(CategoryType).includes(categoryType)) {
      res.status(400).json({ message: "Type de catégorie invalide." });
      return;
    }
    const categoryRepo = AppDataSource.getRepository(Categories);
    const category = await categoryRepo.findOneBy({ id });

    if (!category) {
      res.status(404).json({ message: "Catégorie introuvable." });
      return;
    }

    if (label) category.label = label;
    if (backgroundColor) category.backgroundColor = backgroundColor;
    if (textColor) category.textColor = textColor;
    if (categoryType) category.categoryType = categoryType;

    const updated = await categoryRepo.save(category);
    res.status(200).json(updated);
  } catch (error) {
    console.error("Erreur mise à jour catégorie :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ message: "L'ID doit être un nombre." });
    return;
  }

  try {
    const categoryRepo = AppDataSource.getRepository(Categories);
    const category = await categoryRepo.findOneBy({ id });

    if (!category) {
      res.status(404).json({ message: "Catégorie introuvable." });
      return;
    }

    await categoryRepo.remove(category);
    res.status(200).json({ message: "Catégorie supprimée avec succès." });
  } catch (error) {
    console.error("Erreur suppression catégorie :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
