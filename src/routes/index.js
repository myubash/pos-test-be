/* eslint-disable func-names */
const express = require('express')

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

const SeederController = require('../controllers/SeederController')
const AuthController = require('../controllers/AuthController')
const EmployeeController = require('../controllers/EmployeeController')
const MenuController = require('../controllers/MenuController')
const FileController = require('../controllers/FileController')

// Upload File User
function storage(pathdocument) {
	return multer.diskStorage({
		destination: (req, file, cb) => {
			const _path = `public/${pathdocument}`
			fs.mkdirSync(_path, { recursive: true })
			return cb(null, _path)
		},
		filename: (req, file, cb) => {
			cb(null, file.originalname)
		},
	})
}

let fileUploadMenu = multer({ storage: storage('uploads/menu') })

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

	// menu
	router.post('/menu/create', MenuController.create)
	router.post('/menu/upload', fileUploadMenu, FileController.uploadFiles)
	// router.get('/menu', MenuController.getAll)
	// router.get('/menu/:id', MenuController.getOne)
	// router.put('/menu/:id/update', MenuController.update)
	router.get('/menu/photo/:filename', MenuController.getMenuPhoto)
}
