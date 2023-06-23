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
	table: { type: String, required: true },
	orderNumber: { type: String, required: true },
	note: { type: String },
	list: [
		{
			menu: { type: mongoose.Types.ObjectId, ref: 'Menu' },
			quantity: { type: Number },
			status: { type: String },
			statusCode: { type: String },
			note: { type: String },
			statusHistory: [
				{
					status: { type: String },
					statusCode: { type: String },
					user: { type: mongoose.Types.ObjectId, ref: 'User' },
				},
			],
		},
	],
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
	const order = this
	const { status } = order
	if (status) {
		// eslint-disable-next-line no-console
		console.log(order.statusCode, 'update status history')
		order.statusHistory = [
			...order.statusHistory,
			{
				statusCode: order.statusCode,
				status: order.status,
				note: order.note,
				user: order.currentUser,
				createdAt: new Date(),
			},
		]
		const checkStatusSkip = (value) => (
			value === _status.order.update.statusCode
		)

		if (checkStatusSkip(order.statusCode)) {
			const statusHistoryWithoutStatusInSkip = filter(
				order.statusHistory,
				(row) => !checkStatusSkip(row.statusCode),
			)

			const idxLastStatusHistory = statusHistoryWithoutStatusInSkip.length - 1
			// console.log(statusHistoryWithoutStatusInSkip[idxLastStatusHistory],'cek jalan tikus')
			order.status = statusHistoryWithoutStatusInSkip[idxLastStatusHistory].status
			order.statusCode = statusHistoryWithoutStatusInSkip[idxLastStatusHistory].statusCode
		}
		order.currentUser = undefined
		order.note = undefined
	}

	// statusHistory list
	order.list = order.list.map((row) => {
		const _row = { ...row._doc }
		if (_row.status) {
			_row.statusHistory = [
				..._row.statusHistory,
				{
					statusCode: _row.statusCode,
					status: _row.status,
					note: _row.note,
					user: _row.currentUser,
					createdAt: new Date(),
				},
			]

			const checkStatusSkip = (value) => (
				value === _status.orderList.update.statusCode
			)

			if (checkStatusSkip(_row.statusCode)) {
				const statusHistoryWithoutStatusInSkip = filter(
					_row.statusHistory,
					(sh) => !checkStatusSkip(sh.statusCode),
				)

				const idxLastStatusHistory = statusHistoryWithoutStatusInSkip.length - 1
				// console.log(statusHistoryWithoutStatusInSkip[idxLastStatusHistory],'cek jalan tikus')
				_row.status = statusHistoryWithoutStatusInSkip[idxLastStatusHistory].status
				_row.statusCode = statusHistoryWithoutStatusInSkip[idxLastStatusHistory].statusCode
			}
		}
		return _row
	})

	next()
})

module.exports = mongoose.model('Order', ModelSchema)
