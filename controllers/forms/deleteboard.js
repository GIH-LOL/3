'use strict';

const { Boards } = require(__dirname+'/../../db/')
	, deleteBoard = require(__dirname+'/../../models/forms/deleteboard.js')
	, dynamicResponse = require(__dirname+'/../../helpers/dynamic.js')
	, alphaNumericRegex = require(__dirname+'/../../helpers/checks/alphanumregex.js')

module.exports = async (req, res, next) => {

	const errors = [];

	if (!req.body.confirm) {
		errors.push('Missing confirmation');
	}
	if (!req.body.uri) {
		errors.push('Missing URI');
	}
	let board;
	if (alphaNumericRegex.test(req.body.uri) !== true) {
		errors.push('URI must contain a-z 0-9 only');
	} else {
		//no need to check these if the board name is completely invalid
		if (req.params.board != null && req.params.board !== req.body.uri) {
			//board manage page to not be able to delete other boards;
			//req.params.board will be null on global delete, so this wont happen
			errors.push('URI does not match current board');
		}
		try {
			board = await Boards.findOne(req.body.uri)
		} catch (err) {
			return next(err);
		}
		if (!board) {
			//global must check exists because the route skips Boards.exists middleware
			errors.push(`Board /${req.body.uri}/ does not exist`);
		}
	}

	if (errors.length > 0) {
		return dynamicResponse(req, res, 400, 'message', {
			'title': 'Bad request',
			'errors': errors,
			'redirect': req.params.board ? `/${req.params.board}/manage/settings.html` : '/globalmanage/settings.html'
		});
	}

	try {
		await deleteBoard(board._id, board);
	} catch (err) {
		return next(err);
	}

	return dynamicResponse(req, res, 200, 'message', {
		'title': 'Success',
		'message': 'Board deleted',
		'redirect': req.params.board ? '/' : '/globalmanage/settings.html'
	});

}
