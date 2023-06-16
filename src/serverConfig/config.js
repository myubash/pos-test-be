const dbConf = {
	production: 'mongodb+srv://simpleposbe:889rbTuW7sl8zJwQ@simplepos.80br5gj.mongodb.net/prod?retryWrites=true&w=majority',
	development: 'mongodb+srv://simpleposbe:889rbTuW7sl8zJwQ@simplepos.80br5gj.mongodb.net/dev?retryWrites=true&w=majority'
}

const ENV = process.env.NODE_ENV || 'development'
const db = dbConf[ENV]
const secret = '666'

const conf = {
	db,
	secret,
}

module.exports = conf