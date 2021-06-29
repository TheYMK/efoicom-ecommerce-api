import { createTransport } from 'nodemailer';
import { Request, Response } from 'express';

// interface Email {
// 	from: string;
// 	to: string;
// 	subject: string;
// 	text: string;
// 	html: string;
// }

export function sendEmailWithNodemailer(req: Request, res: Response, emailData: any) {
	const transporter = createTransport({
		host: 'smtp.gmail.com',
		port: 587,
		secure: false,
		requireTLS: true,
		auth: {
			user: 'bangwelamassiwa',
			pass: process.env.GMAIL_APP_PASSWORD
		},
		tls: {
			ciphers: 'SSLv3'
		}
	});
	// hioj-azor-mvuq-xcgp
	console.log(process.env.GMAIL_APP_PASSWORD);
	return transporter
		.sendMail(emailData)
		.then((info) => {
			return res.json({
				success: true
			});
		})
		.catch((err) => console.log(`Problem sending email: ${err}`));
}
