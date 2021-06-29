import { Request, Response } from 'express';
import { NotFoundError } from '../errors/not-found-error';
import { sendEmailWithNodemailer } from '../helpers/email';

export const contactReferent = (req: Request, res: Response) => {
	console.log(req.body);
	const { usr_name, usr_email, usr_phone, ref_email, message, subject } = req.body;

	const emailData = {
		from: process.env.EMAIL, // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
		to: ref_email, // WHO SHOULD BE RECEIVING THIS EMAIL? IT SHOULD BE YOUR GMAIL
		subject: `Bangwé La Massiwa | Nouveau message`,
		text: `Vous avez un reçu un nouveau message d'un client de la plateforme \n Nom du client: ${usr_name} \n Email: ${usr_email} \n Tel: ${usr_phone} \n Message: ${message}`,
		html: `
        <h4>Vous avez un reçu un nouveau message d'un client de la plateforme:</h4>
        <hr/>
        <p><strong>Nom du client:</strong> ${usr_name}</p>
        <p><strong>Email:</strong> ${usr_email}</p>
		<p><strong>Objet: ${subject}</strong></p>
        <p><strong>Tel:</strong> <br/> ${usr_phone}</p>
        <p><strong>Message:</strong> <br/> ${message}</p>

        <hr />
        <p>Cet email peut contenir des informations sensible</p>
        <p>https://bangwelamassiwa.com</p>
    `
	};

	sendEmailWithNodemailer(req, res, emailData);
};

export const contactForm = (req: Request, res: Response) => {
	const { name, email, message, subject } = req.body;

	const emailData = {
		from: process.env.EMAIL, // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
		to: 'contact@bangwelamassiwa.com', // WHO SHOULD BE RECEIVING THIS EMAIL? IT SHOULD BE YOUR GMAIL
		subject: `Bangwé La Massiwa | Message d'un visiteur`,
		text: `Vous avez un reçu un nouveau message d'un visiteur de la plateforme \n Nom du visiteur: ${name} \n Email: ${email} \n Message: ${message}`,
		html: `
        <h4>Vous avez un reçu un nouveau message d'un client de la plateforme.</h4>
		
        <hr/>
        <p><strong>Nom du visiteur:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
		<p><strong>Objet du message: ${subject}</strong></p>
        <p><strong>Message:</strong> <br/> ${message}</p>
        <hr />
		<p>Cet email peut contenir des informations sensible</p>
        <p>https://bangwelamassiwa.com</p>
    `
	};

	sendEmailWithNodemailer(req, res, emailData);
};
