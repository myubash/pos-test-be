/* eslint-disable consistent-return */
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const {
	// _setting,
} = require('../constants')

const { Schema } = mongoose
const saltRounds = 12

const ModelSchema = Schema({
	username: { type: String, required: true }, // unique: true
	password: { type: String, required: true, select: false },
	employee: { type: mongoose.Types.ObjectId, ref: 'Employee' },
	role: { type: String, required: true },
	deleted: { type: Boolean, default: false },
}, {
	timestamps: true,
})

ModelSchema.pre([
	'find',
	'findOne',
	'countDocuments',
], function () {
	const { withDeleted } = this.options
	if (this._conditions.deleted) {
		// query by this._conditions
	}
	else if (!withDeleted) {
		this.where({ deleted: false })
	}
})

ModelSchema.pre('save', function (next) {
	const user = this

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next()

	// generate a salt
	bcrypt.genSalt(saltRounds, (err, salt) => {
		if (err) return next(err)

		// hash the password using our new salt
		bcrypt.hash(user.password, salt, (err2, hash) => {
			if (err2) return next(err2)

			// override the cleartext password with the hashed one
			user.password = hash
			next()
		})
	})
})

ModelSchema.methods.comparePassword = function (candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
		if (err) return cb(err)
		cb(null, isMatch)
	})
}

/*
role
----
- admin
- cashier
- kitchen
- waiter
- table

*/
module.exports = mongoose.model('User', ModelSchema)
