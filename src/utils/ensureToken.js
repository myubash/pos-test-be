/* eslint-disable consistent-return */
/* eslint-disable no-else-return */
const jwt = require('jsonwebtoken')
const { find } = require('lodash')
const { User } = require('../models')
const _setting = require('../constants/setting')
const _staticToken = require('../constants/staticToken.js')

const EnsureToken = async (req, res, next) => {
	const token = req.headers.Authorization
		|| req.headers.authorization
		|| req.query.token

	const checkUser = async (userId, isKapps) => {
		const user = await User.findOne({
			_id: userId,
			deleted: { $in: [true, false] },
		})
			.lean()
		// const userToken = await User.findOne({
		// 	_id: userId,
		// 	deleted: { $in: [true, false] },
		// })
		// 	.select(['token', 'tokenKapps'])
		// 	.lean()

		// handle only new driver & warehousepic token authorized
		// if (userToken.token !== token && _setting.limitLoginOneUserRole.includes(user.role)) {
		// 	return res.status(401).json({ message: 'Harap login kembali' })
		// }

		if (!user || user.deleted) {
			return res.status(401).json({ message: 'User deleted or disabled' })
		}
		// if access from kapps, limit login 1 device only
		// if (userToken.tokenKapps !== token && isKapps) {
		// 	return res.status(401).json({ message: 'Please re-login' })
		// }
		// if (user.deleted) {
		// 	return res.status(401).json({ message: 'User deleted or disabled' })
		// }
		return JSON.parse(JSON.stringify(user))
	}

	// decode token
	if (token && token.length !== 32) {
		// verifies secret and checks exp
		jwt.verify(token, _setting.jwtSecret, async (err, decoded) => {
			if (err) {
				// console.log(err)
				return res.status(401).json({ message: 'Please re-login' })
			}
			else {
				await checkUser(decoded.user._id, decoded.user.isKapps)

				// handle expire
				if (decoded.exp <= Date.now() / 1000) {
					return res.status(401).send({
						message: 'Please re-login',
						date: Date.now() / 1000,
						exp: decoded.exp,
					})
				}
				// if everything is good, save to request for use in other routes
				req.headers.tokenDecoded = decoded
				return next()
			}
		})
	}
	// static token
	else if (token && token.length === 32) {
		// console.log('masuk static')
		const isRegisteredToken = find(_staticToken, ['token', token])
		if (isRegisteredToken) {
			const user = await checkUser(isRegisteredToken.userId)
			// if everything is good, save to request for use in other routes
			req.headers.tokenDecoded = { user }
			return next()
		}
		else {
			return res.status(401).json({ message: 'Token tidak terdaftar' })
		}
	}
	else {
		// if there is no token
		// return an error
		return res.status(401).send({ message: 'No token provided.' })
	}
}

module.exports = EnsureToken
