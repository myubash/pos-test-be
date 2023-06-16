const yup = require('yup')

exports.create = yup.object({
	fullName: yup
		.string()
		.required(),
	email: yup
		.string()
		.email(),
	phone: yup
		.string(),
	title: yup
		.string()
		.required(),
	profilePic: yup
		.string(),
})

exports.checkEmail = yup.string()
	.email

exports.checkPhone = yup.string()
	.matches(/^(\+62|62|0)8[1-9][0-9]{6,9}$/)

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
