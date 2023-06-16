/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-lonely-if */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-const */
const mongoose = require('mongoose')
const moment = require('moment')
const transformFilter = require('./transformFilter')

const getFilter = (fd) => {
	let condition = {}

	let fieldPopulate = []

	for (let i = 0; i < fd.length; i += 1) {
		let fieldName = fd[i].id
		let fieldValue = fd[i].value
		let checkField = fieldName.split('.')

		if (checkField.length > 1) {
			if (fd[i].type === 'in') {
				fieldPopulate.push({
					parent: checkField[0],
					child: checkField[1],
					value: { $in: fieldValue },
				})
			}
			else if (fd[i].type === 'equal') {
				fieldPopulate.push({
					parent: checkField[0],
					child: checkField[1],
					value: fieldValue,
				})
			}
			else if (fd[i].type === 'between') {
				// for type between
				let fieldValueSplit = fieldValue.split('&')
				fieldValueSplit = fieldValueSplit.length === 2
					? fieldValueSplit : [0, 0]

				fieldPopulate.push({
					parent: checkField[0],
					child: checkField[1],
					value: {
						$gte: fieldValueSplit[0],
						$lte: fieldValueSplit[1],
					},
				})
			}
			else {
				fieldPopulate.push({
					parent: checkField[0],
					child: checkField[1],
					value: {
						$regex: `.*${fieldValue}.*`,
						$options: 'i',
					},
				})
			}
		}
		else {
			if (fd[i].type === 'in') {
				condition[fieldName] = { $in: fieldValue }
			}
			else if (fd[i].type === 'equal') {
				condition[fieldName] = fieldValue
			}
			else if (fd[i].type === 'between') {
				// for type between
				let fieldValueSplit = fieldValue.split('.')
				fieldValueSplit = fieldValueSplit.length === 2
					? fieldValueSplit : [0, 0]

				condition[fieldName] = {
					$gte: fieldValueSplit[0],
					$lte: fieldValueSplit[1],
				}
			}
			else {
				condition[fieldName] = {
					$regex: `.*${fieldValue}.*`,
					$options: 'i',
				}
			}
		}
	}

	return {
		condition,
		conditionPopulate: fieldPopulate,
	}
}

const getSort = (sData) => {
	let sorting = []

	if (sData.length !== 0) sorting.push(['createdAt', 'DESC'])

	for (let data of sData) {
		let fieldSplit = data.id
		fieldSplit = fieldSplit.split('.')
		if (fieldSplit.length > 1) sorting.push([...fieldSplit, data.desc ? 'DESC' : 'ASC'])
		else sorting.push([data.id, data.desc ? 'DESC' : 'ASC'])
	}

	return sorting
}

const getFilterLk = async (fd, isAggregate) => {
	let condition = {}
	for (let i = 0; i < fd.length; i += 1) {
		let [
			fieldName,
			fieldValue,
			filterType,
			// eslint-disable-next-line no-await-in-loop
		] = await transformFilter(fd[i].id, fd[i].value, fd[i].type, isAggregate)

		if (fieldValue !== 'assignDriver') {
			fieldValue = mongoose.Types.ObjectId.isValid(fieldValue)
				// && fieldName !== 'externalId'
				// && filterType !== 'in'
				? new mongoose.Types.ObjectId(fieldValue)
				: fieldValue
		}

		// condition per type
		if (filterType === 'in') {
			const valueIn = fieldValue.split(',').map((row) => (
				mongoose.Types.ObjectId.isValid(row)
                && fieldName !== 'externalId'
					? mongoose.Types.ObjectId(row)
					: row
			)).filter((row) => row)

			condition[fieldName] = { $in: valueIn }
		}
		else if (filterType === 'equal') {
			condition[fieldName] = Number.isNaN(Number(fieldValue))
				? fieldValue
				: Number(fieldValue) // lookup use original type, for _id city that has property Number)
		}
		else if (filterType === 'between') {
			// for type between number
			let fieldValueSplit = fieldValue.split('.')

			fieldValueSplit = fieldValueSplit.length === 2
				? fieldValueSplit : [0, 0]

			condition[fieldName] = {
				$gte: Number(fieldValueSplit[0]),
				$lte: Number(fieldValueSplit[1]),
			}
		}
		else if (filterType === 'between-date') {
			// for type between date
			let fieldValueSplit = fieldValue.split('.')

			fieldValueSplit = fieldValueSplit.length === 2
				? fieldValueSplit : [0, 0]

			condition[fieldName] = {
				$gte: moment(fieldValueSplit[0]).toDate(),
				$lte: moment(fieldValueSplit[1]).toDate(),
			}
      console.log(condition)
		}
		else if (filterType === 'between-date3') {
			// for type between date
			let fieldValueSplit = fieldValue.split('.')

			fieldValueSplit = fieldValueSplit.length === 2
				? fieldValueSplit : [0, 0]

			condition[fieldName] = {
				$gte: moment(`${fieldValueSplit[0]}T00:00:00+07:00`).toDate(),
				$lte: moment(`${fieldValueSplit[1]}T23:59:59+07:00`).toDate(),
			}
		}
		else if (filterType === 'between-date2') {
			// for type between date
			let fieldValueSplit = fieldValue.split('.')

			fieldValueSplit = fieldValueSplit.length === 2
				? fieldValueSplit : [0, 0]

			condition[fieldName] = {
				$gte: fieldValueSplit[0] ? new Date(fieldValueSplit[0] * 1000) : new Date(),
				$lte: fieldValueSplit[1] ? new Date(fieldValueSplit[1] * 1000) : new Date(),
			}
		}
		else if (filterType === 'size') {
			condition[fieldName] = {
				$size: Number(fieldValue),
			}
		}
		else if (filterType === 'exists') {
			condition[fieldName] = {
				$exists: fieldValue,
			}
		}
		else {
			condition[fieldName] = {
				$regex: `.*${fieldValue}.*`,
				$options: 'i',
			}
		}
	}

	return condition
}

const getSortLk = async (sData) => {
	let sorting = {}

	if (sData.length === 0) sorting.createdAt = -1

	for (let data of sData) {
		sorting[data.id] = data.desc ? -1 : 1
	}

	return sorting
}

const getQuery = async (query, isAggregate = false) => {
	try {
		let {
			page,
			pageSize,
			filtered,
			sorted,
			variety,
		} = query

		page = page ? Number(page) : 0
		pageSize = pageSize ? Number(pageSize) : 1600
		filtered = filtered ? JSON.parse(filtered) : []
		sorted = sorted ? JSON.parse(sorted) : []
		const sortedLk = await getSortLk(sorted)
		let filteredLk = await getFilterLk(filtered, isAggregate)
		sorted = getSort(sorted)
		const filter = getFilter(filtered)

		if (variety === 'pageByDate') {
			const interval = 1 // days

			const from = (page + 1) * interval
			const to = (page) * interval

			filteredLk.createdAt = {
				$gte: new Date(new Date().setDate(new Date().getDate() - from)),
				$lte: new Date(new Date().setDate(new Date().getDate() - to)),
			}
		}

		return {
			...query,
			page,
			pageSize,
			filtered: filter.condition,
			filteredPopulate: filter.conditionPopulate,
			sorted,
			sortedLk,
			filteredLk,
		}
	}
	catch (e) {
		throw new Error(`getQuery: ${e.message}`)
	}
}

module.exports = getQuery
