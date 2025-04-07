import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Contact } from "../models/contact-model";
import { User } from "../models/users-model";

export const createContactList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, contactId } = req.body;

    if (!userId || !contactId) {
      res.status(400).json({ message: "userId et contactId sont requis" });
      return;
    }

    if (userId === contactId) {
      res
        .status(400)
        .json({ message: "Un utilisateur ne peut pas s'ajouter lui-même" });
      return;
    }

    const contactRepo = AppDataSource.getRepository(Contact);

    const existingContactList = await contactRepo.findOne({
      where: { userId },
    });

    if (existingContactList) {
      res.status(400).json({
        message:
          "Une liste de contacts existe déjà pour cet utilisateur. Utilisez la méthode update.",
      });
      return;
    }

    const newContact = contactRepo.create({
      userId,
      listOfContactIds: `${contactId}`,
    });

    await contactRepo.save(newContact);

    res
      .status(201)
      .json({ message: "Liste de contacts créée", contactList: newContact });
  } catch (error) {
    console.error(
      "Erreur lors de la création de la liste de contacts :",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getContactListByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const contactRepo = AppDataSource.getRepository(Contact);
    const contactEntry = await contactRepo.findOne({
      where: { userId: Number(userId) },
    });

    if (!contactEntry) {
      res.status(404).json({
        message: "Aucune liste de contacts trouvée pour cet utilisateur",
      });
      return;
    }

    // Conversion of the string to an array of numbers
    const contactIds = contactEntry.listOfContactIds
      ? contactEntry.listOfContactIds
          .split(";")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id))
      : [];

    res.status(200).json({
      userId: contactEntry.userId,
      contactIds,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des contacts :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateContactListByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { contactId, method } = req.body;

    if (!contactId || !method || !["add", "remove"].includes(method)) {
      res.status(400).json({
        message: "Paramètres invalides (contactId ou méthode manquante)",
      });
      return;
    }

    if (Number(userId) === Number(contactId)) {
      res.status(400).json({
        message: "Impossible d'ajouter son propre ID à ses contacts.",
      });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    const contactUser = await userRepo.findOne({
      where: { id: Number(contactId) },
    });

    if (!contactUser) {
      res.status(404).json({ message: "Utilisateur à ajouter introuvable." });
      return;
    }

    const contactRepo = AppDataSource.getRepository(Contact);
    let contactEntry = await contactRepo.findOne({
      where: { userId: Number(userId) },
    });

    if (!contactEntry) {
      if (method === "add") {
        // Creation of a new contact entry if it doesn't exist
        const newEntry = contactRepo.create({
          userId: Number(userId),
          listOfContactIds: contactId.toString(),
        });
        await contactRepo.save(newEntry);
        res.status(201).json({ message: "Contact ajouté et liste créée" });
      } else {
        res.status(404).json({
          message: "Aucune liste de contacts à modifier pour ce user",
        });
      }
      return;
    }

    // Split the current list of contact IDs into an array
    let contactIds = contactEntry.listOfContactIds
      ? contactEntry.listOfContactIds.split(";").map((id) => id.trim())
      : [];

    if (method === "add") {
      if (contactIds.includes(contactId.toString())) {
        res
          .status(400)
          .json({ message: "Ce contact est déjà présent dans la liste." });
        return;
      }
      contactIds.push(contactId.toString());
    } else if (method === "remove") {
      contactIds = contactIds.filter((id) => id !== contactId.toString());
    }

    // Update in the database
    contactEntry.listOfContactIds = contactIds.join("; ");
    await contactRepo.save(contactEntry);

    res.status(200).json({
      message: `Contact ${method === "add" ? "ajouté" : "supprimé"}`,
      contactIds,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des contacts :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const clearContactListByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const contactRepo = AppDataSource.getRepository(Contact);
    const contactEntry = await contactRepo.findOne({
      where: { userId: Number(userId) },
    });

    if (!contactEntry) {
      res.status(404).json({
        message: "Aucune liste de contacts trouvée pour cet utilisateur.",
      });
      return;
    }

    contactEntry.listOfContactIds = "";
    await contactRepo.save(contactEntry);

    res.status(200).json({ message: "Liste de contacts vidée avec succès." });
  } catch (error) {
    console.error("Erreur lors du vidage de la liste de contacts :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
