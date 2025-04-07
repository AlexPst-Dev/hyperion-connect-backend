import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Client } from "../models/client-model";
import { User } from "../models/users-model";

export const createClientList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { professionalId, clientId } = req.body;

    if (!professionalId || !clientId) {
      res
        .status(400)
        .json({ message: "professionalId et clientId sont requis" });
      return;
    }

    if (professionalId === clientId) {
      res
        .status(400)
        .json({ message: "Un professionnel ne peut pas s'ajouter lui-même" });
      return;
    }

    const clientRepo = AppDataSource.getRepository(Client);

    const existingClientist = await clientRepo.findOne({
      where: { professionalId },
    });

    if (existingClientist) {
      res.status(400).json({
        message:
          "Une liste de clients existe déjà pour ce professionnel. Utilisez la méthode update.",
      });
      return;
    }

    const newClient = clientRepo.create({
      professionalId,
      listOfClientIds: `${clientId}`,
    });

    await clientRepo.save(newClient);

    res
      .status(201)
      .json({ message: "Liste de clients créée", clientList: newClient });
  } catch (error) {
    console.error("Erreur lors de la création de la liste de clients :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getClientListByProfessionalId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { professionalId } = req.params;

    const clientRepo = AppDataSource.getRepository(Client);
    const clientEntry = await clientRepo.findOne({
      where: { professionalId: Number(professionalId) },
    });

    if (!clientEntry) {
      res.status(404).json({
        message: "Aucune liste de clients trouvée pour ce professionnel",
      });
      return;
    }

    // Conversion of the string to an array of numbers
    const clientIds = clientEntry.listOfClientIds
      ? clientEntry.listOfClientIds
          .split(";")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id))
      : [];

    res.status(200).json({
      professionalId: clientEntry.professionalId,
      clientIds,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des clients :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateClientListByProfessionalId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { professionalId } = req.params;
    const { clientId, method } = req.body;

    if (!clientId || !method || !["add", "remove"].includes(method)) {
      res.status(400).json({
        message: "Paramètres invalides (clientId ou méthode manquante)",
      });
      return;
    }

    if (Number(professionalId) === Number(clientId)) {
      res.status(400).json({
        message: "Impossible d'ajouter son propre ID à ses clients.",
      });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    const clientUser = await userRepo.findOne({
      where: { id: Number(clientId) },
    });

    if (!clientUser) {
      res.status(404).json({ message: "Utilisateur à ajouter introuvable." });
      return;
    }

    const clientRepo = AppDataSource.getRepository(Client);
    let clientEntry = await clientRepo.findOne({
      where: { professionalId: Number(professionalId) },
    });

    if (!clientEntry) {
      if (method === "add") {
        // Creation of a new client entry if it doesn't exist
        const newEntry = clientRepo.create({
          professionalId: Number(professionalId),
          listOfClientIds: clientId.toString(),
        });
        await clientRepo.save(newEntry);
        res.status(201).json({ message: "Client ajouté et liste créée" });
      } else {
        res.status(404).json({
          message: "Aucune liste de clients à modifier pour ce professionnel",
        });
      }
      return;
    }

    // Split the current list of clients IDs into an array
    let clientIds = clientEntry.listOfClientIds
      ? clientEntry.listOfClientIds.split(";").map((id) => id.trim())
      : [];

    if (method === "add") {
      if (clientIds.includes(clientId.toString())) {
        res
          .status(400)
          .json({ message: "Ce client est déjà présent dans la liste." });
        return;
      }
      clientIds.push(clientId.toString());
    } else if (method === "remove") {
      clientIds = clientIds.filter((id) => id !== clientId.toString());
    }

    // Update in the database
    clientEntry.listOfClientIds = clientIds.join("; ");
    await clientRepo.save(clientEntry);

    res.status(200).json({
      message: `Client ${method === "add" ? "ajouté" : "supprimé"}`,
      clientIds,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des clients :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const clearClientListByProfessionalId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { professionalId } = req.params;

    const clientRepo = AppDataSource.getRepository(Client);
    const clientEntry = await clientRepo.findOne({
      where: { professionalId: Number(professionalId) },
    });

    if (!clientEntry) {
      res.status(404).json({
        message: "Aucune liste de clients trouvée pour cet utilisateur.",
      });
      return;
    }

    clientEntry.listOfClientIds = "";
    await clientRepo.save(clientEntry);

    res.status(200).json({ message: "Liste de clients vidée avec succès." });
  } catch (error) {
    console.error("Erreur lors du vidage de la liste de clients :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
