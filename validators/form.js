const { check } = require('express-validator');

exports.contactReferentFormValidator = [
	check('usr_name').not().isEmpty().withMessage(`Le nom de l'utilisateur est requis`),
	check('subject').not().isEmpty().withMessage(`L'objet du message est requis`),
	check('ref_email').isEmail().withMessage(`L'email du référent est requis`),
	check('usr_email').isEmail().withMessage(`Votre email n'est pas correcte`),
	check('usr_phone').not().isEmpty().withMessage(`Votre numero de téléphone est requis`),
	check('message')
		.not()
		.isEmpty()
		.isLength({ min: 20 })
		.withMessage('Le message doit contenir au moins 20 caractères')
];
