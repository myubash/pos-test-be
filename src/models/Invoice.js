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
	invoiceNumber: { type: String, required: true },
	order: { type: mongoose.Types.ObjectId, ref: 'Order', required: true },
	totalPrice: { type: Number, default: 0, required: true },
	note: { type: String },
	status: { type: String },
	statusCode: { type: String },
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
	const invoice = this
	const { status } = invoice
	if (status) {
		// eslint-disable-next-line no-console
		console.log(invoice.statusCode, 'update status history')
		invoice.statusHistory = [
			...invoice.statusHistory,
			{
				statusCode: invoice.statusCode,
				status: invoice.status,
				note: invoice.note,
				user: invoice.currentUser,
				createdAt: new Date(),
			},
		]
		const checkStatusSkip = (value) => (
			value === _status.invoice.update.statusCode
		)

		if (checkStatusSkip(invoice.statusCode)) {
			const statusHistoryWithoutStatusInSkip = filter(
				invoice.statusHistory,
				(row) => !checkStatusSkip(row.statusCode),
			)

			const idxLastStatusHistory = statusHistoryWithoutStatusInSkip.length - 1
			// console.log(statusHistoryWithoutStatusInSkip[idxLastStatusHistory],'cek jalan tikus')
			invoice.status = statusHistoryWithoutStatusInSkip[idxLastStatusHistory].status
			invoice.statusCode = statusHistoryWithoutStatusInSkip[idxLastStatusHistory].statusCode
		}
		invoice.currentUser = undefined
		invoice.note = undefined
	}
	next()
})

module.exports = mongoose.model('Invoice', ModelSchema)
