const mongoose = require('mongoose')

const { Schema } = mongoose

const ModelSchema = Schema({
	name: { type: String, required: true },
	type: { type: mongoose.Types.ObjectId, ref: 'ProductType', required: true },
	price: { type: Number, default: 0, required: true },
	description: { type: String },
	photos: [{ type: String }],
	ingredients: [
		{
			name: { Type: String },
			amount: { Type: Number },
			unit: { Type: String },
		},
	],
	status: { type: String },
	statusCode: { type: String },
	createdBy: { type: mongoose.Types.ObjectId, ref: 'User' },
	approvedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
	history: [
		{
			status: { type: String },
			statusCode: { type: String },
			createdBy: { type: mongoose.Types.ObjectId, ref: 'User' },
			approvedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
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

module.exports = mongoose.model('Menu', ModelSchema)
