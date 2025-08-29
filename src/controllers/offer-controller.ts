import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Offers, OfferCategory } from "../models/offers-model";
import { DiscountOffer } from "../models/offers-model";
import { SponsorshipOffer } from "../models/offers-model";
import { Companies } from "../models/companies-model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { sendMail } from "../utils/mailService";
import { User } from "../models/users-model";

export const createOffer = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const {
    companyId,
    offerCategory,
    title,
    description,
    conditions,
    startDate,
    endDate,
    amount,
    link,
    nbPersonMax,
    personOngoingIds,
  } = req.body;

  const offersRepo = AppDataSource.getRepository(Offers);
  const companiesRepo = AppDataSource.getRepository(Companies);
  const discountRepo = AppDataSource.getRepository(DiscountOffer);
  const sponsorshipRepo = AppDataSource.getRepository(SponsorshipOffer);

  try {
    const company = await companiesRepo.findOneBy({ id: companyId });
    if (!company) {
      res.status(404).json({ message: "Entreprise non trouvée." });
      return;
    }

    const newOffer = offersRepo.create({
      companyId,
      offerCategory,
      title,
      description,
      conditions,
      startDate,
      endDate,
    });

    const savedOffer = await offersRepo.save(newOffer);

    if (offerCategory === OfferCategory.DISCOUNT) {
      if (!amount) {
        res.status(400).json({
          message: "Le montant est requis pour une offre de réduction.",
        });
        return;
      }

      const discount = discountRepo.create({
        offer: savedOffer,
        amount,
        link,
      });

      await discountRepo.save(discount);
    } else if (offerCategory === OfferCategory.SPONSORSHIP) {
      if (!nbPersonMax) {
        res.status(400).json({
          message: "nbPersonMax est requis pour une offre de parrainage.",
        });
        return;
      }

      const sponsorship = sponsorshipRepo.create({
        offer: savedOffer,
        nbPersonMax,
        personOngoingIds,
      });

      await sponsorshipRepo.save(sponsorship);
    }

    res.status(201).json({ message: "Offre créée avec succès." });
    return;
  } catch (error) {
    console.error("Erreur création offre :", error);
    res.status(500).json({ message: "Erreur serveur lors de la création." });
    return;
  }
};

export const getAllOffers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const offersRepo = AppDataSource.getRepository(Offers);
  const discountRepo = AppDataSource.getRepository(DiscountOffer);
  const sponsorshipRepo = AppDataSource.getRepository(SponsorshipOffer);

  try {
    const offers = await offersRepo.find();

    const enrichedOffers = await Promise.all(
      offers.map(async (offer) => {
        let specificData = null;

        if (offer.offerCategory === OfferCategory.DISCOUNT) {
          specificData = await discountRepo.findOne({
            where: { offer: { id: offer.id } },
          });
        } else if (offer.offerCategory === OfferCategory.SPONSORSHIP) {
          specificData = await sponsorshipRepo.findOne({
            where: { offer: { id: offer.id } },
          });
        }

        return {
          ...offer,
          specificOffer: specificData,
        };
      })
    );

    res.status(200).json(enrichedOffers);
    return;
  } catch (error) {
    console.error("Erreur récupération offres :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des offres." });
    return;
  }
};

export const getOfferById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const offerRepo = AppDataSource.getRepository(Offers);
  const discountRepo = AppDataSource.getRepository(DiscountOffer);
  const sponsorshipRepo = AppDataSource.getRepository(SponsorshipOffer);

  const offerId = parseInt(req.params.id);

  try {
    if (isNaN(offerId)) {
      res.status(400).json({ message: "ID d'offre invalide." });
      return;
    }
    const offer = await offerRepo.findOne({ where: { id: offerId } });

    if (!offer) {
      res.status(404).json({ message: "Offre introuvable." });
      return;
    }

    let specificOffer = null;

    if (offer.offerCategory === OfferCategory.DISCOUNT) {
      specificOffer = await discountRepo.findOne({
        where: { offer: { id: offer.id } },
      });
    } else if (offer.offerCategory === OfferCategory.SPONSORSHIP) {
      specificOffer = await sponsorshipRepo.findOne({
        where: { offer: { id: offer.id } },
      });
    }

    res.status(200).json({
      ...offer,
      specificOffer,
    });
    return;
  } catch (error) {
    console.error("Erreur récupération offre :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération de l'offre." });
    return;
  }
};

export const getOffersByCompanyId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const offerRepo = AppDataSource.getRepository(Offers);
  const discountRepo = AppDataSource.getRepository(DiscountOffer);
  const sponsorshipRepo = AppDataSource.getRepository(SponsorshipOffer);

  const companyId = parseInt(req.params.companyId);

  try {
    if (isNaN(companyId)) {
      res
        .status(400)
        .json({ message: "L'ID de l'entreprise doit être un nombre valide." });
      return;
    }
    const offers = await offerRepo.find({ where: { companyId } });

    if (!offers || offers.length === 0) {
      res
        .status(404)
        .json({ message: "Aucune offre trouvée pour cette entreprise." });
      return;
    }

    const offersWithSpecificData = await Promise.all(
      offers.map(async (offer) => {
        let specificOffer = null;

        if (offer.offerCategory === OfferCategory.DISCOUNT) {
          specificOffer = await discountRepo.findOne({
            where: { offer: { id: offer.id } },
          });
        } else if (offer.offerCategory === OfferCategory.SPONSORSHIP) {
          specificOffer = await sponsorshipRepo.findOne({
            where: { offer: { id: offer.id } },
          });
        }

        return {
          ...offer,
          specificOffer,
        };
      })
    );

    res.status(200).json(offersWithSpecificData);
    return;
  } catch (error) {
    console.error("Erreur récupération des offres par entreprise :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des offres." });
    return;
  }
};

export const getOffersByCompanyIdAndCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const offerRepo = AppDataSource.getRepository(Offers);

  const companyId = parseInt(req.params.companyId);
  const category = req.params.category as OfferCategory;

  if (isNaN(companyId)) {
    res
      .status(400)
      .json({ message: "L'ID de l'entreprise doit être un nombre valide." });
    return;
  }

  if (!Object.values(OfferCategory).includes(category)) {
    res.status(400).json({ message: "La catégorie de l'offre est invalide." });
    return;
  }

  try {
    const offers = await offerRepo.find({
      where: { companyId, offerCategory: category },
    });

    if (!offers || offers.length === 0) {
      res.status(404).json({
        message: `Aucune offre de type ${category} trouvée pour cette entreprise.`,
      });
      return;
    }

    res.status(200).json(offers);
    return;
  } catch (error) {
    console.error(
      "Erreur récupération des offres par entreprise et catégorie :",
      error
    );
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des offres." });
    return;
  }
};

export const updateOffer = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const offerRepo = AppDataSource.getRepository(Offers);
  const discountOfferRepo = AppDataSource.getRepository(DiscountOffer);
  const sponsorshipOfferRepo = AppDataSource.getRepository(SponsorshipOffer);

  const offerId = parseInt(req.params.id);

  if (isNaN(offerId)) {
    res
      .status(400)
      .json({ message: "L'ID de l'offre doit être un nombre valide." });
    return;
  }

  try {
    const offer = await offerRepo.findOne({ where: { id: offerId } });

    if (!offer) {
      res.status(404).json({ message: "Offre non trouvée." });
      return;
    }

    const { title, description, conditions, startDate, endDate, isActive } =
      req.body;

    offer.title = title ?? offer.title;
    offer.description = description ?? offer.description;
    offer.conditions = conditions ?? offer.conditions;
    offer.startDate = startDate ?? offer.startDate;
    offer.endDate = endDate ?? offer.endDate;
    offer.isActive = isActive ?? offer.isActive;

    await offerRepo.save(offer);

    if (offer.offerCategory === OfferCategory.DISCOUNT) {
      const discountOffer = await discountOfferRepo.findOne({
        where: { offer: { id: offer.id } },
      });
      if (discountOffer) {
        discountOffer.amount = req.body.amount ?? discountOffer.amount;
        discountOffer.link = req.body.link ?? discountOffer.link;

        await discountOfferRepo.save(discountOffer);
      }
    } else if (offer.offerCategory === OfferCategory.SPONSORSHIP) {
      const sponsorshipOffer = await sponsorshipOfferRepo.findOne({
        where: { offer: { id: offer.id } },
      });
      if (sponsorshipOffer) {
        sponsorshipOffer.nbPersonMax =
          req.body.nbPersonMax ?? sponsorshipOffer.nbPersonMax;
        sponsorshipOffer.personOngoingIds =
          req.body.personOngoingIds ?? sponsorshipOffer.personOngoingIds;

        await sponsorshipOfferRepo.save(sponsorshipOffer);
      }
    }

    res.status(200).json({ message: "Offre mise à jour avec succès." });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'offre :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la mise à jour de l'offre." });
  }
};

export const deleteOffer = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const offerRepo = AppDataSource.getRepository(Offers);
  const discountOfferRepo = AppDataSource.getRepository(DiscountOffer);
  const sponsorshipOfferRepo = AppDataSource.getRepository(SponsorshipOffer);

  const offerId = parseInt(req.params.id);

  if (isNaN(offerId)) {
    res
      .status(400)
      .json({ message: "L'ID de l'offre doit être un nombre valide." });
    return;
  }

  try {
    const offer = await offerRepo.findOne({ where: { id: offerId } });

    if (!offer) {
      res.status(404).json({ message: "Offre non trouvée." });
      return;
    }

    if (offer.offerCategory === OfferCategory.DISCOUNT) {
      const discountOffer = await discountOfferRepo.findOne({
        where: { offer: { id: offer.id } },
      });
      if (discountOffer) {
        await discountOfferRepo.remove(discountOffer);
      }
    } else if (offer.offerCategory === OfferCategory.SPONSORSHIP) {
      const sponsorshipOffer = await sponsorshipOfferRepo.findOne({
        where: { offer: { id: offer.id } },
      });
      if (sponsorshipOffer) {
        await sponsorshipOfferRepo.remove(sponsorshipOffer);
      }
    }

    await offerRepo.remove(offer);

    res.status(200).json({ message: "Offre supprimée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'offre :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la suppression de l'offre." });
  }
};

export const notifySponsorshipApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { offerId, userId, message } = req.body;
  if (!offerId || !userId || !message) {
    res.status(400).json({ message: "offerId, userId et message requis." });
    return;
  }

  try {
    const offerRepo = AppDataSource.getRepository(Offers);
    const companyRepo = AppDataSource.getRepository(Companies);
    const userRepo = AppDataSource.getRepository(User);

    // Récupérer l'offre
    const offer = await offerRepo.findOne({ where: { id: offerId } });
    if (!offer || offer.offerCategory !== OfferCategory.SPONSORSHIP) {
      res.status(404).json({ message: "Offre de sponsoring introuvable." });
      return;
    }

    // Récupérer l'entreprise et son responsable
    const company = await companyRepo.findOne({
      where: { id: offer.companyId },
    });
    if (!company || !company.responsibleId) {
      res
        .status(404)
        .json({ message: "Entreprise ou responsable introuvable." });
      return;
    }
    const responsible = await userRepo.findOne({
      where: { id: company.responsibleId },
    });
    if (!responsible || !responsible.email) {
      res
        .status(404)
        .json({ message: "Responsable introuvable ou sans email." });
      return;
    }

    // Récupérer le sportif candidat
    const candidate = await userRepo.findOne({ where: { id: userId } });
    if (!candidate) {
      res.status(404).json({ message: "Utilisateur candidat introuvable." });
      return;
    }

    // Envoi du mail au responsable
    await sendMail(
      responsible.email,
      "HYPERION - Nouvelle candidature à votre offre de sponsoring",
      `<h1 style="color: #1E3A8A">Nouvelle candidature à votre offre de sponsoring</h1>
      <p><strong>Offre :</strong> ${offer.title}</p>
      <p><strong>Entreprise :</strong> ${company.name}</p>
      <hr>
      <p><strong>Message du sportif :</strong></p>
      <blockquote>${message}</blockquote>
      <hr>
      <p><strong>Infos du sportif :</strong></p>
      <ul>
        <li>Nom : ${candidate.lastName}</li>
        <li>Prénom : ${candidate.firstName}</li>
        <li>Email : ${candidate.email}</li>
        <li>ID : ${candidate.id}</li>
      </ul>`
    );

    res
      .status(200)
      .json({ message: "Mail envoyé au responsable de l'entreprise." });
  } catch (error) {
    console.error("Erreur lors de l'envoi du mail de candidature :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de l'envoi du mail." });
  }
};
