// const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {
	_setting,
} = require('../constants')
const {
	User,
	Employee,
} = require('../models')

const {
	getQuery,
} = require('../utils')

const validation = require('./Validator/AuthValidation')

exports.register = async (req, res) => {
	const {
		username,
		password,
		role,
		employee,
	} = req.body

	try {
		await validation.register.validate(req.body)

		const isExistUsername = await User.findOne({ username })
		if (isExistUsername) {
			return res.status(400).json({ message: 'Username already used' })
		}

		const payloadUser = {
			username,
			password,
			role,
		}
		if (employee) payloadUser.employee = employee

		const user = new User(payloadUser)

		user.save()

		return res.status(200).json({ message: 'success' })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.login = async (req, res) => {
	const {
		username,
		password,
	} = req.body
	try {
		await validation.login.validate(req.body)

		const user = await User.findOne({ username })
			.select('+password')
			.populate('employee')

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		user.comparePassword(password, async (err, isMatch) => {
			if (err) throw err

			if (isMatch) {
				// Passwords match
				const userObj = { ...user._doc }
				delete userObj.password
				// generate token
				const token = jwt.sign({ user: userObj }, _setting.jwtSecret)

				return res.status(200).json({
					message: 'success',
					user: {
						...userObj,
					},
					token,
				})
			}

			// Passwords don't match
			return res.status(400).json({ message: 'Your password is incorrect' })
		})
		return 'success'
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

		const data = await User.find(condition)
			.sort(sortedLk)
			.skip(pageSize * page)
			.limit(pageSize)

		return res.status(200).json({ message: 'success', data })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.getOne = async (req, res) => {
	const { id } = req.params
	try {
		const data = await User.findOne({ _id: id })
			.populate('employee')

		return res.status(200).json({ message: 'success', data })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.update = async (req, res) => {
	const {
		passwordOld, passwordNew, role, employee,
	} = req.body
	const { id: user_id } = req.params
	try {
		if (!user_id) {
			return res.status(404).json({ message: 'User not found' })
		}

		const form = {}

		const _user = await User.findById(user_id).select('+password')
		if (!_user) return res.status(404).json({ message: 'User not found' })

		if (passwordNew) {
			await validation.changePassword.validate(form)
			await validation.passwordMix.validate(form)

			const match = bcrypt.compareSync(passwordOld, _user.password, (err, isMatch) => isMatch)
			if (match) {
				// Passwords match
				form.password = passwordNew
				delete form.passwordOld
				delete form.passwordVerify
			}
			else {
				return res.status(400).json({ message: 'Old password does not match' })
			}
		}

		// validate role
		if (role) {
			await validation.checkRole.validate(role)
			form.role = role
		}

		if (employee !== 'remove') {
			// check if employee exists
			const _employee = await Employee.findById(employee)
			if (!_employee) return res.status(404).json({ message: 'Employee not found' })

			// check if employee already
			const userEmployee = await User.find({
				employee: _employee,
				_id: { $ne: user_id },
			})
			if (userEmployee.length) return res.status(404).json({ message: 'Employee already assigned to another user' })

			form.employee = employee
		}
		else {
			form.employee = null
		}

		await Object.assign(_user, form).save()

		return res.status(200).json({ message: 'User updated' })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

exports.delete = async (req, res) => {
	const { user } = req.headers.tokenDecoded
	const { user_id } = req.body
	try {
		// validate cant delete current user
		if (user._id === user_id) return res.status(400).json({ message: 'Cant delete current user' })

		const _user = await User.findById(user_id)
		if (!_user) return res.status(404).json({ message: 'User not found' })

		await Object.assign(_user, { deleted: true }).save()

		return res.status(200).json({ message: 'User deleted' })
	}
	catch (error) {
		return res.status(400).json({ message: error.message })
	}
}
