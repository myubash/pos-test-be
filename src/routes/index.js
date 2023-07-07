/* eslint-disable func-names */
const express = require('express')
const path = require('path')

const router = express.Router()
const fs = require('fs')
const multer = require('multer')
// const {
// 	_role,
// 	_permissionModule: pm,
// } = require('../constants')
// require('../models')
const {
	ensureToken,
} = require('../utils')

// master data
const ProductTypeController = require('../controllers/MasterData/ProductTypeController')

const SeederController = require('../controllers/SeederController')
const AuthController = require('../controllers/AuthController')
const EmployeeController = require('../controllers/EmployeeController')
const MenuController = require('../controllers/MenuController')
const OrderController = require('../controllers/OrderController')

const FileController = require('../controllers/FileController')
// Upload File User
function storage(pathdocument, name = '') {
	return multer.diskStorage({
		destination: (req, file, cb) => {
			const _path = `public/${pathdocument}`
			fs.mkdirSync(_path, { recursive: true })
			return cb(null, _path)
		},
		filename: (req, file, cb) => {
			const { filename = true } = req.params
			cb(null, filename ? `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}` : file.originalname)
		},
	})
}

let fileUploadMenu = multer({ storage: storage('menu/photo') })

// // dokumen
// const fileUpload = uploadDokumen.fields([
// 	{ name: 'images' },
// ])

fileUploadMenu = fileUploadMenu.fields([
	{ name: 'images' },
])

module.exports = function routes(app) {
	app.use('/api', router)

	// seeder
	router.post('/seeder', SeederController.create)

	// auth
	router.post('/register', AuthController.register)
	router.post('/login', AuthController.login)

	// auth token middleware
	router.use(ensureToken)

	// user
	router.put('/user/:id/update', AuthController.update)
	router.delete('/user/delete', AuthController.delete)
	router.get('/user', AuthController.getAll)
	router.get('/user/:id', AuthController.getOne)

	// employee
	router.post('/employee/create', EmployeeController.create)
	router.get('/employee', EmployeeController.getAll)
	router.get('/employee/:id', EmployeeController.getOne)
	router.put('/employee/:id/update', EmployeeController.update)

	// product type
	router.post('/product-type/create', ProductTypeController.create)
	router.get('/product-type', ProductTypeController.getAll)
	router.get('/product-type/:id', ProductTypeController.getOne)
	router.put('/product-type/:id/update', ProductTypeController.update)
	router.delete('/product-type/delete', ProductTypeController.delete)

	// menu
	router.post('/menu/create', MenuController.create)
	router.get('/menu', MenuController.getAll)
	router.get('/menu/:id', MenuController.getOne)
	router.put('/menu/:id/update', MenuController.update)
	router.put('/menu/:id/accept', MenuController.accept)
	router.put('/menu/:id/reject', MenuController.reject)
	router.delete('/menu/delete', MenuController.delete)
	router.post('/menu/upload', fileUploadMenu, FileController.uploadFiles)
	// router.get('/menu/photo/:filename', MenuController.getMenuPhoto) // too secure

	// order
	router.post('/order/create', OrderController.create)
	router.get('/order', OrderController.getAll)
	router.get('/order-kitchen', OrderController.getAllForKitchen)
	router.get('/order-cashier', OrderController.getAllForCashier)
	router.get('/order/:id', OrderController.getOne)
	router.put('/order/:id/update', OrderController.update)
	router.delete('/order/delete', OrderController.delete)
	router.post('/order/upload', fileUploadMenu, FileController.uploadFiles)
	router.put('/order/:id/done', OrderController.done)
	router.put('/order/:id/process', OrderController.process)
	router.put('/order/:id/cancel', OrderController.cancel)
}
