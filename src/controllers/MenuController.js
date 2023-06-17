const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')
const { isObject, isArray } = require('lodash')
const {
	_setting,
} = require('../constants')
const {
	User,
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
			createdBy: user._id,
		}
		console.log(form)
		const menu = await new Menu(form).save()

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
		console.log('jajang')
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

		const data = await Employee.find(condition)
			.sort(sortedLk)
			.skip(pageSize * page)
			.limit(pageSize)
			.populate('managedBy')

		return res.status(200).json({ message: 'success', data })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.getOne = async (req, res) => {
	const { id } = req.params
	try {
		const data = await Employee.findOne({ _id: id })
			.populate('managedBy')

		return res.status(200).json({ message: 'success', data })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

function compareDiffOnly(original, copy) {
	let r = null
	for (const [k, v] of Object.entries(original)) {
		if (typeof v === 'object' && v !== null && !(v instanceof Date) && !(mongoose.isValidObjectId(v)) && !isArray(v)) {
			if (!copy.hasOwnProperty(k)) {
				r[k] = v
			}
			else {
				compareDiffOnly(v, copy[k])
			}
		}
		else if (!Object.is(v, copy[k]) && copy[k]) {
			if (!r) r = {}
			r[k] = v
		}
	}
	return r
}

exports.update = async (req, res) => {
	const {
		email, phone, managedBy,
	} = req.body
	const { id: employee_id } = req.params
	try {
		if (!employee_id) return res.status(404).json({ message: 'Employee id not found' })

		const _employee = await Employee.findById(employee_id)
		if (!_employee) return res.status(404).json({ message: 'Employee not found' })

		if (email) await validation.checkEmail.validate(email)
		if (phone) await validation.checkPhone.validate(phone)

		if (managedBy) {
			// check if user exists
			const isUserExists = await User.findById(managedBy)
			if (!isUserExists) return res.status(404).json({ message: 'User not found' })
		}

		const form = {
			...req.body,
		}
		const oldData = compareDiffOnly(_employee._doc, form)
		if (oldData) {
			form.updateHistory = [
				..._employee.updateHistory,
				{
					...oldData,
					createdAt: new Date(),
				},
			]
		}
		console.log(form)
		const employee = await Object.assign(_employee, form).save()

		return res.status(200).json({ message: 'Employee updated', data: employee })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.delete = async (req, res) => {
	const { employee_id } = req.body
	try {
		// validate cant delete current user
		const _user = await User.findById(employee_id)
		if (_user.employee._id === employee_id) return res.status(400).json({ message: 'Cant delete current employee' })

		const _employee = await User.findById(employee_id)

		if (!_employee) return res.status(404).json({ message: 'Employee not found' })

		await Object.assign(_employee, { deleted: true }).save()

		return res.status(200).json({ message: 'Employee deleted' })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}
