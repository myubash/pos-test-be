/* eslint-disable no-restricted-syntax */
module.exports = (
	data = {},
	fields = [],
) => {
	const newData = {}
	for (const ft of fields) {
		if (![undefined, null, ''].includes(data[ft])) newData[ft] = data[ft]
	}
	return newData
}
