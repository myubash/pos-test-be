const _status = {
	menu: {
		draft: {
			status: 'Draft menu created',
			statusCode: 'draft',
		},
		accept: {
			status: 'Menu accepted',
			statusCode: 'accept',
		},
		reject: {
			status: 'Menu rejected',
			statusCode: 'reject',
		},
		update: {
			status: 'Menu updated',
			statusCode: 'update',
		},
		delete: {
			status: 'Menu deleted',
			statusCode: 'delete',
		},
	},
	order: {
		create: {
			status: 'Order created',
			statusCode: 'create',
		},
		process: {
			status: 'Processing order',
			statusCode: 'process',
		},
		done: {
			status: 'Order done',
			statusCode: 'done',
		},
		paid: {
			status: 'Order paid',
			statusCode: 'paid',
		},
		cancel: {
			status: 'Order canceled',
			statusCode: 'cancel',
		},
		update: {
			status: 'Order updated',
			statusCode: 'update',
		},
	},
	invoice: {
		create: {
			status: 'Invoice created',
			statusCode: 'create',
		},
		process: {
			status: 'Processing invoice',
			statusCode: 'process',
		},
		done: {
			status: 'Invoice done',
			statusCode: 'done',
		},
		cancel: {
			status: 'Invoice canceled',
			statusCode: 'cancel',
		},
		update: {
			status: 'Invoice updated',
			statusCode: 'update',
		},
	},
	orderList: {
		new: {
			status: 'New',
			statusCode: 'new',
		},
		process: {
			status: 'Processing',
			statusCode: 'process',
		},
		done: {
			status: 'Done',
			statusCode: 'done',
		},
		cancel: {
			status: 'Canceled',
			statusCode: 'cancel',
		},
		update: {
			status: 'Updated',
			statusCode: 'update',
		},
	},
}

module.exports = _status
