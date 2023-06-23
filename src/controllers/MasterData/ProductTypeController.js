const { ProductType } = require('../../models')
const { getQuery } = require('../../utils')

exports.getAll = async (req, res) => {
	try {
		const {
			page,
			pageSize,
			filtered,
			sorted,
		} = await getQuery(req.query)

		const condition = {
			...filtered,
		}

		const productType = await ProductType
			.find(condition)
			.limit(pageSize)
			.skip(pageSize * page)
			.sort(sorted)

		const total = await ProductType
			.countDocuments(condition)

		const data = {
			data: productType,
			page,
			pageSize,
			totalPage: Math.ceil(total / pageSize),
			totalData: total,
		}

		return res.status(200).json({ message: 'success', data })
	}
	catch (err) {
		return res.status(400).json({ message: err.message })
	}
}

exports.getOne = async (req, res) => {
	const { id } = req.params

	const productType = await ProductType.findOne({ _id: id })
  if (!productType) return res.status(404).json({ message: 'Product type not found' })

	return res.status(200).json({ message: 'success', data: productType })
}

exports.create = async (req, res) => {
	try {
		const productType = new ProductType(req.body)
		await productType.save()
		return res.status(200).json({ message: 'success', data: productType })
	}
	catch (err) {
		return res.status(400).json({ message: err.message })
	}
}

exports.update = async function (req, res) {
	const { id } = req.params
	const form = req.body

	const data = {}

	if (form.name) data.name = form.name
	if (form.description) data.description = form.description
	if (form.cargoType) data.cargoType = form.cargoType
	if (form.requirement) data.requirement = form.requirement

	try {
		let productType = await ProductType.findOne({ _id: id })
		productType = await Object.assign(productType, data).save()

		return res.status(200).json({ message: 'success', data: productType })
	}
	catch (err) {
		return res.status(400).json({ message: err.message })
	}
}

exports.delete = async (req, res) => {
	const { product_type_id } = req.body
	try {
		const _producttype = await ProductType.findById(product_type_id)

		if (!_producttype) return res.status(404).json({ message: 'Product type not found' })

		const form = {
			deleted: true,
		}

		await Object.assign(_producttype, form).save()

		return res.status(200).json({ message: 'Product type deleted' })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}
