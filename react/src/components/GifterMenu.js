import React from 'react';
import { Switch, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Col, Container, Row } from 'react-bootstrap';
import GifterComponent from './GifterComponent';
import Wishlist from './Wishlist';
import Groups from "./Groups";
import Login from './Login';
import Register from './Register';
import EditGift from './EditGift';
import EditGroup from './EditGroup';
import $ from 'jquery';
import mosquito from '../images/mosquito_tiny.png'

class GifterMenu extends GifterComponent {
  	constructor(props) {
		super(props);
		
		this.state = {
			alert: {
				title: '',
				content: '',
				callback: null,
				show: false
			},
			user: {
				id: -1,
				username: ''
			}
		}
		
		var self = this;
		$.ajaxSetup({
			beforeSend: function(xhr, settings) {
				if (settings.type=='POST') {
					xhr.setRequestHeader("X-CSRFToken", self.getCookie('csrftoken'));
				}
			},
			cache: false,
			xhrFields: {
			   withCredentials: true
			}
		});
	}
	
	componentDidMount() {
		var self = this;

		$.ajax({
			type: "get",
			url: this.getConfig().baseURL + "getuser/",
		}).done(function (user) {
			if (user.id == -1) {
				self.mergeState({ user: user });
				self.props.history.push(self.props.match.path + '/login');
			} else {
				self.mergeState({ user: user });
				self.props.history.push(self.props.match.path + '/gifts');
			}
		}).fail(function (jqXHR, textStatus, errorThrown) {
			self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
		});
	}

	logOut() {
		var self = this;
		
		$.ajax({
			type: 'post',
			url: this.getConfig().baseURL + 'logout/',
			data: JSON.stringify(this.state.user)
		}).done(function (data) {
			if (data.success) {
				self.mergeState({ user: { id: -1, username: '' }});
				self.props.history.push(self.props.match.path + '/login');
			} else {
				self.showAlert('Server Error', data.message);
			}
		}).fail(function (jqXHR, textStatus, errorThrown) {
			self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
		});
	}
	
	showAlert(title, content, callback) {		
		this.mergeState({
			alert: {
				title: title,
				content: content,
				callback: callback,
				show: true
			}
		});
	}

	onAlertClose() {
		var callback = this.state.alert.callback;
		
		this.mergeState({
			alert: {
				title: "",
				content: "",
				callback: null,
				show: false
			}
		});
		
		if (callback) callback();
	}
	
	renderAccountLinks() {
		if (this.state.user.id == -1) {
			return(<>
				<Nav.Link href='#' onSelect={(eventKey, event) => this.props.history.push(this.props.match.path + '/register')}>Register</Nav.Link>
				<Nav.Link href='#' onSelect={(eventKey, event) => this.props.history.push(this.props.match.path + '/login')}>Log In</Nav.Link>
			</>)
		} else {
			return(<>
				<Nav.Link href='#' onSelect={() => this.logOut()}>Log Out</Nav.Link>
			</>);			
		}
	}
 
	render() {
		return (
			<>
				<Navbar bg="dark" variant="dark">
					<Navbar.Brand href="/">
						<img
							alt=""
							src={mosquito}
							className="d-inline-block"
							style={{marginTop: -7}}
							width={20}
							height={20}
						/>{' '}
						Wishlist
					</Navbar.Brand>
					<Nav className="justify-content-end" style={{ width: "100%" }}>
						<Nav.Link href='#' onSelect={(eventKey, event) => this.props.history.push(this.props.match.path + '/gifts')}>Gifts</Nav.Link>
						<Nav.Link href='#' onSelect={(eventKey, event) => this.props.history.push(this.props.match.path + '/groups')}>Groups</Nav.Link>
						{this.renderAccountLinks()}
					</Nav>
				</Navbar>
				<div style={{height: '10px', width: '100%'}}></div>
				<Switch>
					<Route path={this.props.match.path + '/gifts/:giftId'} render={props => <EditGift parent={this} {...props} />} />
					<Route exact path={this.props.match.path + '/gifts'} render={props => <Wishlist parent={this} {...props} />} />
					<Route path={this.props.match.path + '/groups/:groupId'} render={props => <EditGroup parent={this} {...props} />} />
					<Route exact path={this.props.match.path + '/groups'} render={props => <Groups parent={this} {...props} />} />
					<Route exact path={this.props.match.path + '/login'} render={props => <Login parent={this} {...props} />} />
					<Route exact path={this.props.match.path + '/register'} render={props => <Register parent={this} {...props} />} />
				</Switch>
				<Modal show={this.state.alert.show} onHide={() => this.onAlertClose()}>
					<Modal.Header closeButton>
						<Modal.Title>{this.state.alert.title}</Modal.Title>
					</Modal.Header>

					<Modal.Body>
						<p>{this.state.alert.content}</p>
					</Modal.Body>

					<Modal.Footer>
						<Button variant="primary" onClick={() => this.onAlertClose()}>OK</Button>
					</Modal.Footer>
				</Modal>
			</>
		)
	}
}

export default GifterMenu;