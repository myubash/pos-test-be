const randomCode = (
	length = 32,
	type = 'mix',
) => {
	let result = ''
	const charactersType = {
		mix: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
		mix_uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
		alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
		alphabet_uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		alphabet_lowercase: 'abcdefghijklmnopqrstuvwxyz',
		number: '0123456789',
	}
	const characters = charactersType[type]

	const charactersLength = characters.length
	for (let i = 0; i < length; i += 1) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}

module.exports = randomCode
