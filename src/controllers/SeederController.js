const {
  ProductType
} = require('../models')

const dataProductType = require('../seeders/productType')

const seedProductType = async () => {
  await ProductType.deleteMany()
	dataProductType.forEach((row) => {
		const data = new ProductType(row)
		data.save()
	})
	console.log('dataProductType has seed')
}

exports.create = async (req, res) => {
  try {
    
    await seedProductType()

    return res.status(200).json({ message: 'Success' })

  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}