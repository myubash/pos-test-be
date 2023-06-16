const mongoose = require('mongoose')

const { Schema } = mongoose

const ModelSchema = Schema({
	name: { type: String, required: true },
	description: { type: String },
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


module.exports = mongoose.model('ProductType', ModelSchema)
