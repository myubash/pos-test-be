/* eslint-disable func-names */
const express = require('express')

const router = express.Router()
// const path = require('path')
// const multer = require('multer')
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
}
