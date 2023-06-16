const mongoose = require('mongoose')

const { Schema } = mongoose

const ModelSchema = Schema({
	fullName: { type: String, required: true },
	email: { type: String, required: true },
	title: { type: String, required: true },
	profilePic: { type: String },
	phone: { type: Number },
	managedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
	updateHistory: [
		{
			fullName: { type: String },
			email: { type: String },
			title: { type: String },
			profilePic: { type: String },
			phone: { type: Number },
			managedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
			createdAt: { type: Date },
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

module.exports = mongoose.model('Employee', ModelSchema)
