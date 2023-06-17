const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
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

exports.create = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const {
		name,
    type,
    price,
    description,
    photos,
    ingredients,
	} = req.body
	try {
		await validation.create.validate(req.body)

		const form = {
			...req.body,
			createdBy: user._id,
		}
    console.log(form)
		// const menu = await new Menu(form).save()

		return res.status(200).json({ message: 'success', data: 'menu' })
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
