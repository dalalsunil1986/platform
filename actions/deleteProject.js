/*global window, io */

'use strict';

import {navigateAction} from 'fluxible-router';

module.exports = function(context, payload, done) {
	context.service.delete('projects', payload, {}, function(error, response) {
		if (error) {
			context.dispatch('DELETE_PROJECT_FAILURE', payload);
			done();
			return;
		}

		context.dispatch('DELETE_PROJECT_SUCCESS', response.repository);

		if ('undefined' !== typeof window && 'undefined' !== typeof io) {
			var socket = io();
			socket.emit('leave', { repository: payload.project.repository } );
		}

		navigateAction(context, {
	        url: '/projects'
	    }, done);
	});
};