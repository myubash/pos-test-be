const mongoose = require('mongoose')

const { Schema } = mongoose

const ModelSchema = Schema({
	table: { type: String, required: true },
	orderNumber: { type: String, required: true },
	orderNote: { type: String },
  list: [
    {
      menu: { type: mongoose.Types.ObjectId, ref: 'Menu' },
      quantity: { Type: Number },
      status: {Type: String},
      statusCode: {Type: String},
      history: [
        {
          status: { type: String },
          statusCode: { type: String },
          createdBy: { type: mongoose.Types.ObjectId, ref: 'User' },
          note: { type: String },
        }
      ]
    }
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
    }
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

module.exports = mongoose.model('Order', ModelSchema)
