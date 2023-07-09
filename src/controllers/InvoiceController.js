const mongoose = require('mongoose')
// const path = require('path')
// const fs = require('fs')
const { isArray } = require('lodash')
const moment = require('moment')
const {
	_status,
	_condition,
} = require('../constants')
const {
	Order,
	Menu,
	Invoice,
} = require('../models')

const {
	getQuery,
	getRandomCode,
} = require('../utils')
const validation = require('./Validator/InvoiceValidation')

// const menuDirectory = path.join(__dirname, '../../public/uploads/menu')

const generateInvoiceNumber = async () => {
	const a = moment().format('YYYY-MM-DD 00:00:00')
	const b = moment().format('YYYY-MM-DD 23:59:59')

	const amount = await Invoice.countDocuments({
		createdAt: {
			$gte: a,
			$lte: b,
		},
	})
	const date = moment().format('YYMMDD')
	const randomNumber = getRandomCode(2, 'number')
	let counter = (amount + 1).toString()

	const digitCounter = 5
	for (let i = 0; i <= digitCounter - counter.length; i += 1) {
		counter = `0${counter}`
	}

	const prefix = 'I'
	let invoiceNumber = `${prefix}${date}${randomNumber}${counter}`

	const isExist = await Invoice.findOne({ invoiceNumber })

	if (isExist) {
		invoiceNumber = await generateInvoiceNumber()
	}

	return invoiceNumber
}

exports.create = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	try {
		await validation.create.validate(req.body)

		const form = {
			...req.body,
			..._status.invoice.create,
			invoiceNumber: await generateInvoiceNumber(),
			currentUser: user._id,
		}

		const invoice = await Invoice.create(form)

		return res.status(200).json({ message: 'success', data: invoice })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.update = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const { id: invoice_id } = req.params
	try {
		await validation.update.validate(req.body)
		const _invoice = await Invoice.findOne({
			_id: invoice_id,
			statusCode: {
				$nin: [
					_status.invoice.cancel.statusCode,
					_status.invoice.done.statusCode,
				],
			},
		})
		if (!_invoice) return res.status(400).json({ message: 'Invoice not found' })

		const form = {
			...req.body,
			..._status.invoice.update,
			currentUser: user._id,
		}

		const menu = await Object.assign(_invoice, form).save()

		return res.status(200).json({ message: 'success', data: menu })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.process = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const { id: invoice_id } = req.params
	const {
		note,
	} = req.body
	try {
		await validation.update.validate(req.body)
		const _order = await Order.findOne({
			_id: invoice_id,
			statusCode: _status.invoice.create.statusCode,
		})
		if (!_order) return res.status(400).json({ message: 'Order not found' })

		const form = {
			note,
			..._status.invoice.process,
			currentUser: user._id,
		}

		const invoice = await Object.assign(_order, form).save()

		return res.status(200).json({ message: 'success', data: invoice })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.done = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const { id: invoice_id } = req.params
	const {
		note,
	} = req.body
	try {
		await validation.update.validate(req.body)
		const _invoice = await Invoice.findOne({
			_id: invoice_id,
			statusCode: {
				$in: [
					_status.invoice.create.statusCode,
					_status.invoice.process.statusCode,
				],
			},
		})
		if (!_invoice) return res.status(400).json({ message: 'Invoice not found' })

		const form = {
			note,
			..._status.invoice.done,
			currentUser: user._id,
		}

		const invoice = await Object.assign(_invoice, form).save()

		return res.status(200).json({ message: 'success', data: invoice })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.cancel = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const { id: invoice_id } = req.params
	const {
		note,
	} = req.body
	try {
		await validation.update.validate(req.body)
		const _invoice = await Invoice.findOne({
			_id: invoice_id,
			statusCode: {
				$nin: [
					_status.invoice.cancel.statusCode,
					_status.invoice.done.statusCode,
				],
			},
		})
		if (!_invoice) return res.status(400).json({ message: 'Invoice not found' })

		const form = {
			note,
			..._status.invoice.done,
			currentUser: user._id,
		}

		const menu = await Object.assign(_invoice, form).save()

		return res.status(200).json({ message: 'success', data: menu })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.getAll = async (req, res) => {
	const {
		page,
		pageSize,
		filteredLk,
		sortedLk,
	} = await getQuery(req.query, true)
	try {
		const condition = {
			...filteredLk,
			deleted: false,
		}

		const data = await Invoice.find(condition)
			.sort(sortedLk)
			.skip(pageSize * page)
			.limit(pageSize)
			.populate({
				path: 'order',
				populate: {
					path: 'list.menu',
					select: ['name', 'price'],
				},
			})
			.populate('statusHistory.user', ['username', 'fullName', 'role'])

		return res.status(200).json({ message: 'success', data })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.getOne = async (req, res) => {
	const { id: invoice_id } = req.params
	try {
		const data = await Invoice.findOne({
			_id: invoice_id,
			deleted: false,
		})
			.populate({
				path: 'order',
				populate: {
					path: 'list.menu',
					select: ['name', 'price'],
				},
			})
			.populate('statusHistory.user', ['username', 'fullName', 'role'])

		if (!data) return res.status(404).json({ message: 'Invoice not found' })

		return res.status(200).json({ message: 'success', data })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.delete = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const { invoice_id, note } = req.body
	try {
		const _invoice = await Invoice.findById(invoice_id)

		if (!_invoice) return res.status(404).json({ message: 'Invoice not found' })

		const form = {
			deleted: true,
			currentUser: user._id,
			note,
			..._status.menu.delete,
		}

		await Object.assign(_invoice, form).save()

		return res.status(200).json({ message: 'Invoice deleted', note })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}
