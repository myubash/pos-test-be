/* eslint-disable no-console */
const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(morgan('dev'))

app.use(bodyParser.json({ limit: '500mb', type: 'application/json' }))
app.use(bodyParser.urlencoded({ limit: '256mb', extended: true }))

app.use('/api', express.static(path.join(__dirname, 'public')))

// port config
const port = process.env.PORT || 2000

// DB Config
const config = require('./src/serverConfig/config.js')
const _setting = require('./src/constants/setting.js')

const { db } = config

// Connect to Mongo
mongoose.set('debug', _setting.modeDebug)
mongoose
	.connect(db, {
		useNewUrlParser: true, // Adding new mongo url parser
		useUnifiedTopology: true,
	})
	.then(() => console.log(`MongoDB Connected to ${process.env.NODE_ENV}`))
	.catch((err) => console.log(err))


// Require routes
require('./src/routes/index.js')(app)

app.get('/', (req, res) => {
	res.send(`Simple POS: ${process.env.NODE_ENV[1]}`)
})

// Express application will listen to port mentioned in our configuration
app.listen(port, (err) => {
	if (err) throw err
	console.log(`App listening on port ${port}`)
})

// if (!fs.existsSync('./public/uploads')) {
// 	fs.mkdirSync('./public/uploads', { recursive: true })
// }
// if (!fs.existsSync('./public/uploads/profile')) {
// 	fs.mkdirSync('./public/uploads/profile', { recursive: true })
// }
// if (!fs.existsSync('./public/uploads/job-vacancy')) {
// 	fs.mkdirSync('./public/uploads/job-vacancy', { recursive: true })
// }
// if (!fs.existsSync('./public/uploads/order')) {
// 	fs.mkdirSync('./public/uploads/order', { recursive: true })
// }
// if (!fs.existsSync('./public/uploads/truck')) {
// 	fs.mkdirSync('./public/uploads/truck', { recursive: true })
// }
