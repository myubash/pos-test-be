const mongoose = require('mongoose')
const { filter } = require('lodash')

const {
	_status,
} = require('../constants')

const { Schema } = mongoose

const ModelSchema = Schema({
	// -----  buffer -----
	currentUser: { type: mongoose.Types.ObjectId, ref: 'User' },
	// ----- end buffer ------
	name: { type: String, required: true },
	type: { type: mongoose.Types.ObjectId, ref: 'ProductType', required: true },
	price: { type: Number, default: 0, required: true },
	description: { type: String },
	photos: [{ type: String }],
	ingredients: [
		{
			name: { type: String },
			amount: { type: Number, default: 0 },
			unit: { type: mongoose.Types.ObjectId, ref: 'Measurement' },
		},
	],
	status: { type: String },
	statusCode: { type: String },
	user: { type: mongoose.Types.ObjectId, ref: 'User' },
	statusHistory: [
		{
			status: { type: String },
			statusCode: { type: String },
			user: { type: mongoose.Types.ObjectId, ref: 'User' },
			note: { type: String },
		},
	],
	deleted: { type: Boolean, default: false, select: false },
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
	const menu = this
	const { status } = menu
	if (status) {
		// eslint-disable-next-line no-console
		console.log(menu.statusCode, 'update status history')
		menu.statusHistory = [
			...menu.statusHistory,
			{
				statusCode: menu.statusCode,
				status: menu.status,
				note: menu.note,
				user: menu.currentUser,
				createdAt: new Date(),
			},
		]
		const checkStatusSkip = (value) => (
			value === _status.menu.update.statusCode
		)

		if (checkStatusSkip(menu.statusCode)) {
			const statusHistoryWithoutStatusInSkip = filter(
				menu.statusHistory,
				(row) => !checkStatusSkip(row.statusCode),
			)

			const idxLastStatusHistory = statusHistoryWithoutStatusInSkip.length - 1
			// console.log(statusHistoryWithoutStatusInSkip[idxLastStatusHistory],'cek jalan tikus')
			menu.status = statusHistoryWithoutStatusInSkip[idxLastStatusHistory].status
			menu.statusCode = statusHistoryWithoutStatusInSkip[idxLastStatusHistory].statusCode
		}
		menu.currentUser = undefined
		menu.note = undefined
	}
	next()
})

module.exports = mongoose.model('Menu', ModelSchema)
