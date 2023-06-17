const yup = require('yup')

exports.create = yup.object({
	name: yup
		.string()
		.required(),
	type: yup
		.string()
		.required(),
	price: yup
		.number(),
	description: yup
		.string(),
	photos: yup
		.array()
		.of(
			yup
				.string(),
		),
	ingredients: yup
		.array()
		.of(
			yup.object({
				name: yup
					.string(),
				amount: yup
					.number(),
				unit: yup
					.string(),
			}),
		),

})
