const _status = require('./status')

const _condition = {
	order: {
		kitchen: {
			statusCode: {
				$in: [
					_status.order.create.statusCode,
					_status.order.process.statusCode,
				],
			},
		},
	},
}

module.exports = _condition
