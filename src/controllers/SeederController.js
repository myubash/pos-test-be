const {
	ProductType,
	Measurement,
} = require('../models')

const dataProductType = require('../seeders/productType')
const dataMeasurement = require('../seeders/measurementType')

const seedProductType = async () => {
	await ProductType.deleteMany()
	dataProductType.forEach((row) => {
		const data = new ProductType(row)
		data.save()
	})
	console.log('dataProductType has seed')
}

const seedMeasurement = async () => {
	await Measurement.deleteMany()
	dataMeasurement.forEach((row) => {
		const data = new Measurement(row)
		data.save()
	})
	console.log('dataMeasurement has seed')
}

exports.create = async (req, res) => {
	try {
		await seedProductType()
		await seedMeasurement()

		return res.status(200).json({ message: 'Success' })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}
