import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Graphs } from "../models/graphs-model";
import { ProfileCategory, User } from "../models/users-model";

export const createGraph = async (
  req: Request,
  res: Response
): Promise<void> => {
  const graphRepo = AppDataSource.getRepository(Graphs);
  const userRepo = AppDataSource.getRepository(User);

  const {
    userId,
    responsibleId,
    title,
    measuredValue,
    listMonthlyValue,
    startDate,
    endDate,
  } = req.body;

  if (isNaN(userId) || isNaN(responsibleId)) {
    res
      .status(400)
      .json({ message: "Les IDs doivent être des nombres valides." });
    return;
  }

  try {
    const user = await userRepo.findOne({ where: { id: userId } });
    const responsible = await userRepo.findOne({
      where: { id: responsibleId },
    });

    if (!user) {
      res.status(404).json({ message: "Utilisateur (sportif) inexistant." });
      return;
    }

    if (!responsible) {
      res.status(404).json({ message: "Responsable inexistant." });
      return;
    }

    const graph = graphRepo.create({
      userId,
      responsibleId,
      title,
      measuredValue,
      listMonthlyValue,
      startDate,
      endDate,
      isActive: true,
    });

    await graphRepo.save(graph);

    res.status(201).json({ message: "Graph créé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la création du graph :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la création du graph." });
  }
};

export const getAllGraphs = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const graphRepo = AppDataSource.getRepository(Graphs);

  try {
    const graphs = await graphRepo.find();
    res.status(200).json(graphs);
  } catch (error) {
    console.error("Erreur lors de la récupération des graphs :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des graphs." });
  }
};

export const getGraphById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const graphId = parseInt(req.params.id, 10);

  if (isNaN(graphId)) {
    res
      .status(400)
      .json({ message: "L'ID du graph doit être un nombre valide." });
    return;
  }

  const graphRepo = AppDataSource.getRepository(Graphs);

  try {
    const graph = await graphRepo.findOne({
      where: { id: graphId },
      relations: ["user", "responsible"],
    });

    if (!graph) {
      res.status(404).json({ message: "Graph non trouvé." });
      return;
    }

    res.status(200).json(graph);
  } catch (error) {
    console.error("Erreur lors de la récupération du graph :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération du graph." });
  }
};

export const getGraphsByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    res
      .status(400)
      .json({ message: "L'ID de l'utilisateur doit être un nombre valide." });
    return;
  }

  const userRepo = AppDataSource.getRepository(User);
  const graphRepo = AppDataSource.getRepository(Graphs);

  try {
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user || user.profileCategory !== ProfileCategory.SPORTSMAN) {
      res
        .status(404)
        .json({ message: "Utilisateur inexistant ou non sportif." });
      return;
    }

    const graphs = await graphRepo.find({
      where: { userId },
      relations: ["responsible"],
    });

    res.status(200).json(graphs);
  } catch (error) {
    console.error("Erreur lors de la récupération des graphs :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des graphs." });
  }
};

export const updateGraphById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const graphId = parseInt(req.params.id, 10);

  if (isNaN(graphId)) {
    res
      .status(400)
      .json({ message: "L'ID du graph doit être un nombre valide." });
    return;
  }

  const allowedFields = [
    "title",
    "measuredValue",
    "listMonthlyValue",
    "startDate",
    "endDate",
    "isActive",
  ];

  const updates: Partial<Graphs> = {};
  for (const key of allowedFields) {
    if (key in req.body) {
      updates[key as keyof Graphs] = req.body[key];
    }
  }

  const graphRepo = AppDataSource.getRepository(Graphs);

  try {
    const graph = await graphRepo.findOneBy({ id: graphId });

    if (!graph) {
      res.status(404).json({ message: "Graph introuvable." });
      return;
    }

    graphRepo.merge(graph, updates);
    const updatedGraph = await graphRepo.save(graph);

    res.status(200).json(updatedGraph);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du graph :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la mise à jour du graph." });
  }
};

export const deleteGraphById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const graphId = parseInt(req.params.id, 10);

  if (isNaN(graphId)) {
    res
      .status(400)
      .json({ message: "L'ID du graph doit être un nombre valide." });
    return;
  }

  const graphRepo = AppDataSource.getRepository(Graphs);

  try {
    const graph = await graphRepo.findOneBy({ id: graphId });

    if (!graph) {
      res.status(404).json({ message: "Graph introuvable." });
      return;
    }

    await graphRepo.remove(graph);
    res.status(200).json({ message: "Graph supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression du graph :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la suppression du graph." });
  }
};
