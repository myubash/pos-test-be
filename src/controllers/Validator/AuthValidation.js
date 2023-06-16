const yup = require('yup')

exports.login = yup.object({
	username: yup
		.string()
		.required(),
	password: yup
		.string()
		.required(),
})

exports.register = yup.object({
	username: yup
		.string()
		.required(),
	password: yup
		.string()
		.required(),
	employee: yup
		.string(),
	role: yup
		.string()
		.required()
		.matches(/(admin|cashier|kitchen|waiter|table)/),
})

exports.checkRole = yup.string()
	.required()
	.matches(/(admin|cashier|kitchen|waiter|table)/)

exports.changePassword = yup.object({
	passwordNew: yup
		.string()
		.required(),
	passwordOld: yup
		.string()
		.required(),
	passwordVerify: yup
		.string()
		.required(),
})

exports.passwordMix = yup.object({
	passwordNew: yup
		.string()
		.required()
		.matches(
			/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-z,A-Z,0-9])(?=.{8,})/,
			'Password harus berisi minimal 8 karakter, satu huruf besar, satu huruf kecil, satu angka dan satu simbol',
		),
	passwordVerify: yup
		.string()
		.oneOf([yup.ref('passwordNew'), null], 'Password harus sama'),
})
