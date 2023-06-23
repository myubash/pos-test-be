const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')
const { isArray } = require('lodash')
const {
	_status,
} = require('../constants')
const {
	Menu,
} = require('../models')

const {
	getQuery,
} = require('../utils')
const validation = require('./Validator/MenuValidation')

const menuDirectory = path.join(__dirname, '../../public/uploads/menu')

exports.create = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const {
		photos,
		ingredients,
	} = req.body
	try {
		await validation.create.validate(req.body)

		if (isArray(ingredients) && ingredients.length > 0) {
			// check unit
			for (let i = 0; i < ingredients.length; i += 1) {
				const { unit } = ingredients[i]
				if (unit) {
					// check if type objectid
					if (!mongoose.isValidObjectId(unit)) return res.status(400).json({ message: 'Unit is not valid' })
				}
			}
		}

		if (isArray(photos) && photos.length > 0) {
			for (let i = 0; i < photos.length; i += 1) {
				const isExists = fs.existsSync(`public/${photos[i]}`)
				if (!isExists) return res.status(400).json({ message: `File ${photos[i]} not exists, please reupload` })
			}
		}

		const form = {
			...req.body,
			..._status.menu.draft,
			user: user._id,
			currentUser: user._id,
		}

		const menu = await Menu.create(form)

		return res.status(200).json({ message: 'success', data: menu })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.update = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const { id: menu_id } = req.params
	const {
		photos,
		ingredients,
	} = req.body
	try {
		await validation.update.validate(req.body)
		const _menu = await Menu.findOne({
			_id: menu_id,
			statusCode: {
				$nin: [
					_status.menu.delete.statusCode,
					_status.menu.reject.statusCode,
				],
			},
		})
		if (!_menu) return res.status(400).json({ message: 'Menu not found' })

		if (isArray(ingredients) && ingredients.length > 0) {
			// check unit
			for (let i = 0; i < ingredients.length; i += 1) {
				const { unit } = ingredients[i]
				if (unit) {
					// check if type objectid
					if (!mongoose.isValidObjectId(unit)) return res.status(400).json({ message: 'Unit is not valid' })
				}
			}
		}

		if (isArray(photos) && photos.length > 0) {
			for (let i = 0; i < photos.length; i += 1) {
				const isExists = fs.existsSync(`public/${photos[i]}`)
				if (!isExists) return res.status(400).json({ message: `File ${photos[i]} not exists, please reupload` })
			}
		}

		const form = {
			...req.body,
			..._status.menu.update,
			currentUser: user._id,
		}

		const menu = await Object.assign(_menu, form).save()

		return res.status(200).json({ message: 'success', data: menu })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.getMenuPhoto = async (req, res) => {
	try {
		const { filename } = req.params
		const filedir = {
			root: menuDirectory,
		}

		return res.status(200).sendFile(filename, filedir, (err) => {
			if (err) res.status(400).json({ message: err.message })
		})
	}
	catch (error) {
		return res.return(400).json({ message: error.message })
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

		const data = await Menu.find(condition)
			.sort(sortedLk)
			.skip(pageSize * page)
			.limit(pageSize)
			.populate('type', ['name'])
			.populate({
				path: 'user',
				select: ['username', 'employee'],
				populate: {
					path: 'employee',
					select: ['fullName'],
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
	const { id: menu_id } = req.params
	try {
		const data = await Menu.findOne({
			_id: menu_id,
			deleted: false,
		})
			.populate('type', ['name'])
			.populate({
				path: 'user',
				select: ['username', 'employee'],
				populate: {
					path: 'employee',
					select: ['fullName'],
				},
			})
			.populate('statusHistory.user', ['username', 'fullName', 'role'])

		if (!data) return res.status(404).json({ message: 'Menu not found' })

		return res.status(200).json({ message: 'success', data })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.delete = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const { menu_id, note } = req.body
	try {
		const _menu = await Menu.findById(menu_id)

		if (!_menu) return res.status(404).json({ message: 'Menu not found' })

		const form = {
			deleted: true,
			currentUser: user._id,
			note,
			..._status.menu.delete,
		}

		await Object.assign(_menu, form).save()

		return res.status(200).json({ message: 'Menu deleted', note })
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
		const _menu = await Menu.findOne({
			_id: menu_id,
			statusCode: _status.menu.draft.statusCode,
		})
		if (!_menu) return res.status(404).json({ message: 'Menu not found' })

		const form = {
			note,
			..._status.menu.accept,
			acceptedBy: user._id,
			currentUser: user._id,
		}

		const data = await Object.assign(_menu, form).save()

		return res.status(200).json({ message: 'Menu accepted', data })
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
		const _menu = await Menu.findOne({
			_id: menu_id,
			statusCode: _status.menu.draft.statusCode,
		})
		if (!_menu) return res.status(404).json({ message: 'Menu not found' })

		const form = {
			note,
			..._status.menu.reject,
			currentUser: user._id,
		}

		const data = await Object.assign(_menu, form).save()

		return res.status(200).json({ message: 'Menu rejected', data })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}
