const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')
const { isArray } = require('lodash')
const moment = require('moment')
const {
	_status,
} = require('../constants')
const {
	Order,
	Menu,
} = require('../models')

const {
	getQuery,
	getRandomCode,
} = require('../utils')
const validation = require('./Validator/OrderValidation')

const menuDirectory = path.join(__dirname, '../../public/uploads/menu')

const generateOrderNumber = async () => {
	const a = moment().format('YYYY-MM-DD 00:00:00')
	const b = moment().format('YYYY-MM-DD 23:59:59')

	const amount = await Order.countDocuments({
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

	const prefix = 'A'
	let orderNumber = `${prefix}${date}${randomNumber}${counter}`

	const isExist = await Order.findOne({ orderNumber })

	if (isExist) {
		orderNumber = await generateOrderNumber()
	}

	return orderNumber
}

exports.create = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const {
		list,
	} = req.body
	try {
		await validation.create.validate(req.body)

		// validate list
		if (isArray(list) && list.length > 0) {
			// check unit
			for (let i = 0; i < list.length; i += 1) {
				const { menu } = list[i]
				if (menu) {
					// check if type objectid
					if (!mongoose.isValidObjectId(menu)) return res.status(400).json({ message: 'Unit is not valid' })
					// eslint-disable-next-line no-await-in-loop
					const isExists = await Menu.findOne({ _id: menu })
					if (!isExists) return res.status(400).json({ message: 'Menu not found' })
				}
				list[i] = {
					...list[i],
					..._status.orderList.new,
				}
			}
		}

		const form = {
			...req.body,
			..._status.order.create,
			orderNumber: await generateOrderNumber(),
			currentUser: user._id,
		}

		const order = await Order.create(form)

		return res.status(200).json({ message: 'success', data: order })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.update = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const { id: order_id } = req.params
	const {
		list,
	} = req.body
	try {
		await validation.update.validate(req.body)
		const _order = await Order.findOne({
			_id: order_id,
			statusCode: {
				$nin: [
					_status.order.cancel.statusCode,
					_status.order.done.statusCode,
				],
			},
		})
		if (!_order) return res.status(400).json({ message: 'Order not found' })
		const { list: currentList } = _order
		// validate list
		if (isArray(list) && list.length > 0) {
			// check unit
			for (let i = 0; i < list.length; i += 1) {
				const { menu } = list[i]
				const { statusCode } = currentList[i]
				if (statusCode !== _status.orderList.new.statusCode) return null
				if (menu) {
					// check if type objectid
					if (!mongoose.isValidObjectId(menu)) return res.status(400).json({ message: 'Unit is not valid' })
					// eslint-disable-next-line no-await-in-loop
					const isExists = await Menu.findOne({ _id: menu })
					if (!isExists) return res.status(400).json({ message: 'Menu not found' })
				}
				list[i] = {
					...currentList[i],
					...list[i],
					..._status.orderList.update,
				}
			}
		}

		const form = {
			...req.body,
			list,
			..._status.menu.update,
			currentUser: user._id,
		}

		const menu = await Object.assign(_order, form).save()

		return res.status(200).json({ message: 'success', data: menu })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.process = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const { id: order_id } = req.params
	const {
		note,
	} = req.body
	try {
		await validation.update.validate(req.body)
		const _order = await Order.findOne({
			_id: order_id,
			statusCode: _status.order.create,
		})
		if (!_order) return res.status(400).json({ message: 'Order not found' })

		const form = {
			note,
			..._status.order.process,
			currentUser: user._id,
		}

		const menu = await Object.assign(_order, form).save()

		return res.status(200).json({ message: 'success', data: menu })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.done = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const { id: order_id } = req.params
	const {
		note,
	} = req.body
	try {
		await validation.update.validate(req.body)
		const _order = await Order.findOne({
			_id: order_id,
			statusCode: _status.order.process,
		})
		if (!_order) return res.status(400).json({ message: 'Order not found' })

		const form = {
			note,
			..._status.order.done,
			currentUser: user._id,
		}

		const menu = await Object.assign(_order, form).save()

		return res.status(200).json({ message: 'success', data: menu })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.cancel = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const { id: order_id } = req.params
	const {
		note,
	} = req.body
	try {
		await validation.update.validate(req.body)
		const _order = await Order.findOne({
			_id: order_id,
			statusCode: {
				$nin: [
					_status.order.cancel.statusCode,
					_status.order.done.statusCode,
				],
			},
		})
		if (!_order) return res.status(400).json({ message: 'Order not found' })

		const form = {
			note,
			..._status.order.done,
			currentUser: user._id,
		}

		const menu = await Object.assign(_order, form).save()

		return res.status(200).json({ message: 'success', data: menu })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.changeStatusList = async (req, res) => {
	// const { user } = req.headers.tokenDecoded
	const { id: order_id } = req.params
	// const {
	// 	note,
	// } = req.body
	try {
		const _order = await Order.findOne({
			_id: order_id,
			statusCode: _status.order.process.statusCode,
		})
		if (!_order) return res.status(400).json({ message: 'Order not found' })

		return res.status(200).json({ message: 'success' })
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

		const data = await Order.find(condition)
			.sort(sortedLk)
			.skip(pageSize * page)
			.limit(pageSize)
			.populate('statusHistory.user', ['username', 'fullName', 'role'])

		return res.status(200).json({ message: 'success', data })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.getOne = async (req, res) => {
	const { id: order_id } = req.params
	try {
		const data = await Order.findOne({
			_id: order_id,
			deleted: false,
		})
			.populate('statusHistory.user', ['username', 'fullName', 'role'])
			.populate('list.statusHistory.user', ['username', 'fullName', 'role'])

		if (!data) return res.status(404).json({ message: 'Order not found' })

		return res.status(200).json({ message: 'success', data })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.delete = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const { order_id, note } = req.body
	try {
		const _menu = await Order.findById(order_id)

		if (!_menu) return res.status(404).json({ message: 'Order not found' })

		const form = {
			deleted: true,
			currentUser: user._id,
			note,
			..._status.menu.delete,
		}

		await Object.assign(_menu, form).save()

		return res.status(200).json({ message: 'Order deleted', note })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.accept = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const { id: menu_id } = req.params
	const { note } = req.body
	try {
		const _menu = await Order.findOne({
			_id: menu_id,
			statusCode: _status.menu.draft,
		})
		if (!_menu) return res.status(404).json({ message: 'Order not found' })

		const form = {
			note,
			..._status.menu.accept,
			acceptedBy: user._id,
			currentUser: user._id,
		}

		const data = await Object.assign(_menu, form).save()

		return res.status(200).json({ message: 'Order accepted', data })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.reject = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const { id: menu_id } = req.params
	const { note } = req.body
	try {
		const _menu = await Order.findOne({
			_id: menu_id,
			statusCode: _status.menu.draft,
		})
		if (!_menu) return res.status(404).json({ message: 'Order not found' })

		const form = {
			note,
			..._status.menu.reject,
			currentUser: user._id,
		}

		const data = await Object.assign(_menu, form).save()

		return res.status(200).json({ message: 'Order rejected', data })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}
