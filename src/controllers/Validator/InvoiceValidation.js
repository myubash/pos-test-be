const yup = require('yup')
const { filterDataByField } = require('../../utils')

const allField = {
	order: yup
		.string()
		.required(),
	totalPrice: yup
		.string()
		.required(),
	note: yup
		.string(),
}

exports.create = yup.object({
	...allField,
})

exports.update = yup.object({
	...allField,
})

exports.field = async (data, field) => {
	const _field = field

	const validator = yup.object(filterDataByField(allField, _field))
	return validator.validate(data)
}
