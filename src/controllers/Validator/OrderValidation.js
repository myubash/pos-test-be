const yup = require('yup')
const { filter } = require('lodash')
const { filterDataByField } = require('../../utils')

const allField = {
	table: yup
		.string()
		.required(),
	note: yup
		.string(),
	list: yup
		.array()
		.of(
			yup
				.object({
					menu: yup
						.string(),
					quantity: yup
						.number(),
					note: yup
						.string(),
				}),
		),
}

exports.create = yup.object({
	table: yup
		.string()
		.required(),
	note: yup
		.string(),
	list: yup
		.array()
		.of(
			yup
				.object({
					menu: yup
						.string(),
					quantity: yup
						.number(),
					note: yup
						.string(),
				}),
		),
})

exports.update = yup.object({
	table: yup
		.string(),
	note: yup
		.string(),
	list: yup
		.array()
		.of(
			yup
				.object({
					menu: yup
						.string(),
					quantity: yup
						.number(),
					note: yup
						.string(),
				}),
		),
})

exports.field = async (data, field) => {
	const _field = field
	// if (isUpdate) {
	// 	_field = filter(field, (row) => {
	// 		const condition = row !== 'durationFrom'
	// 										&& row !== 'durationTo'
	// 										&& row !== 'durationType'

	// 		return condition
	// 	})
	// }

	const validator = yup.object(filterDataByField(allField, _field))
	return validator.validate(data)
}
