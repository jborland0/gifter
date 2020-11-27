import React from 'react';
import $ from 'jquery';

class GifterComponent extends React.Component {
	constructor(props) {
		super(props);
	}
	
	getParentMatchPath() {
		return this.props.parent.props.match.path;
	}
	
	getConfig() {
		if (this.props.parent) {
			return this.props.parent.getConfig();
		} else {
			return this.props.config;
		}
	}
	
	getUser() {
		if (this.props.parent) {
			return this.props.parent.getUser();
		} else {
			return this.state.user;
		}
	}
	
	getCookie(name) {
		var cookieValue = null;
		if (document.cookie && document.cookie !== '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = $.trim(cookies[i]);
				if (cookie.substring(0, name.length + 1) === (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}	

	isObject(o) {
		// for our purposes exclude arrays even though they are technically objects
		return typeof o === 'object' && o !== null && !Array.isArray(o)
	}

	mergeState(newState) {
		this.mergeObject(this.state, newState);
		this.setState(newState);
	}
  
	mergeObject(oldObj, newObj) {
		var self = this;
		// for each key in the old object
		Object.keys(oldObj).map(function(key) {
			// if the key is not defined in the new object
			if (newObj[key] === undefined) {
				// add value to new object
				newObj[key] = oldObj[key];
			} else if (self.isObject(oldObj[key]) && self.isObject(newObj[key])) {
				// call recursively on child objects
				self.mergeObject(oldObj[key], newObj[key]);
			}
		});
	}
	
	setUser(user) {
		if (this.props.parent) {
			this.props.parent.setUser(user);
		} else {
			this.mergeState({ user: user });
		}
	}
	
	showAlert(title, content, callback) {
		this.props.parent.showAlert(title, content, callback);
	}
}

export default GifterComponent;