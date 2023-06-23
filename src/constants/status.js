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
		cancel: {
			status: 'Order canceled',
			statusCode: 'cancel',
		},
		update: {
			status: 'Order updated',
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
