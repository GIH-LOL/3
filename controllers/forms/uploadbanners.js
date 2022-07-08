'use strict';

const uploadBanners = require(__dirname+'/../../models/forms/uploadbanners.js')
	, dynamicResponse = require(__dirname+'/../../helpers/dynamic.js')
	, deleteTempFiles = require(__dirname+'/../../helpers/files/deletetempfiles.js')
	, { globalLimits } = require(__dirname+'/../../configs/main.js');

module.exports = async (req, res, next) => {

	const errors = [];

	if (res.locals.numFiles === 0) {
		errors.push('Must provide a file');
	} else if (res.locals.numFiles > globalLimits.bannerFiles.max) {
		errors.push(`Exceeded max banner uploads in one request of ${globalLimits.bannerFiles.max}`)
	} else if (res.locals.board.banners.length+res.locals.numFiles > 100) {
		errors.push('Number of uploads would exceed 100 banner limit');
	}

	if (errors.length > 0) {
		await deleteTempFiles(req).catch(e => console.error);
		return dynamicResponse(req, res, 400, 'message', {
			'title': 'Bad request',
			'errors': errors,
			'redirect': `/${req.params.board}/manage/banners.html`
		})
	}

	try {
		await uploadBanners(req, res, next);
	} catch (err) {
		await deleteTempFiles(req).catch(e => console.error);
		return next(err);
	}

}
