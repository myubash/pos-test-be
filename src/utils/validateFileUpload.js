const path = require('path')
const fs = require('fs')

module.exports = validateFileUpload = async (
	req = {},
	filenames = [],
	arrFileType = ['pdf', 'jpeg', 'jpg', 'png'],
	isMulti = false,
	maxSize = 5 * 1024 * 1024,
) => {
	const mathCeilSize = Math.ceil(maxSize / 1048576) // ... MB

	const files = {}
	for (const filename of filenames) {
		if (isMulti) files[filename] = []

		const reqfiles = req.files && req.files[filename]
		if (reqfiles) {
			for (const fd of reqfiles) {
				let { originalname, path: pathfile, size } = fd
				const extName = path
					.extname(originalname)
					.toLowerCase()
					.substr(1)
				if (!arrFileType.includes(extName)) {
					fs.unlinkSync(pathfile)
					throw new Error(`Hanya ekstensi file ${arrFileType.join(', ')}`)
				}
				if (size > maxSize) {
					fs.unlinkSync(pathfile)
					throw new Error(`Ukuran file terlalu besar, maksimal ${mathCeilSize} MB`)
				}

				pathfile = pathfile.replace('public', '')

				files[filename] = isMulti
					? [...files[filename], pathfile]
					: pathfile
			}
		}
	}
	return files
}
