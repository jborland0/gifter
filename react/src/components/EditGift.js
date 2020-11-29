import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Col, Container, Row } from "react-bootstrap";
import GifterComponent from "./GifterComponent";
import $ from 'jquery';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class EditGift extends GifterComponent {
  	constructor(props) {
		super(props);

		this.state = {
			groups: [],
			group: 0,
			description: '',
			link: ''
		}
	}

	componentDidMount() {
		var self = this;
		
		$.ajax({
			type: 'get',
			url: this.getConfig().baseURL + 'getactivegroups/',
		}).done(function (data) {
			self.mergeState({ 
				groups: data.groups,
				group: data.groups.length > 0 ? data.groups[0].group_id : 0
			}, () => {
				if (self.props.match.params.giftId !== 'new') {
					self.loadGift();
				}				
			});
		}).fail(function (jqXHR, textStatus, errorThrown) {
			self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
		});		
	}

	loadGift() {
		var self = this;

		$.ajax({
			type: 'get',
			url: this.getConfig().baseURL + 'getgift/',
			data: 'giftId=' + this.props.match.params.giftId
		}).done(function (data) {
			self.mergeState({
				group: data.groupId,
				description: data.description,
				link: data.link
			});
		}).fail(function (jqXHR, textStatus, errorThrown) {
			self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
		});
	}
	
	cancelEdit() {
		this.props.history.push(this.getParentMatchPath() + '/gifts');
	}
	
	saveGift(event) {
		var self = this;
		event.preventDefault();
				
		if (this.props.match.params.giftId === 'new') {
			$.ajax({
				type: 'post',
				url: this.getConfig().baseURL + 'addgift/',
				data: JSON.stringify({ 
					groupId: this.state.group,
					description: this.state.description,
					link: this.state.link
				})
			}).done(function (data) {
				self.props.history.push(self.getParentMatchPath() + '/gifts');
			}).fail(function (jqXHR, textStatus, errorThrown) {
				self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
			});
		} else {
			$.ajax({
				type: 'post',
				url: this.getConfig().baseURL + 'updategift/',
				data: JSON.stringify({ 
					giftId: this.props.match.params.giftId,
					groupId: this.state.group,
					description: this.state.description,
					link: this.state.link
				})
			}).done(function (data) {
				self.props.history.push(self.getParentMatchPath() + '/gifts');
			}).fail(function (jqXHR, textStatus, errorThrown) {
				self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
			});			
		}
	}
	
	deleteGift() {
		var self = this;
		
		$.ajax({
			type: 'post',
			url: this.getConfig().baseURL + 'deletegift/',
			data: JSON.stringify({ 
				giftId: this.props.match.params.giftId,
			})
		}).done(function (data) {
			self.props.history.push(self.getParentMatchPath() + '/gifts');
		}).fail(function (jqXHR, textStatus, errorThrown) {
			self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
		});	
	}
	
	renderDeleteButton() {
		if (this.props.match.params.giftId !== 'new') {
			return (
				<Button variant="primary" type="button" className="float-right" style={{ marginRight: '10px'}} onClick={() => this.deleteGift()}>
					Delete
				</Button>
			);
		}
	}

	render() {
		return (
			<Form onSubmit={(event) => this.saveGift(event)}>
			    <Container fluid>
					<Row>
						<Col sm={12}>
							<h2>Gift {this.props.match.params.giftId}</h2>
						</Col>
					</Row>
					<Form.Group as={Row} controlId="group">
						<Col sm={2} />
						<Form.Label column sm={2}>Group</Form.Label>
						<Col sm={4}>
							<Form.Control as="select" value={this.state.group} onChange={(event) => this.mergeState({ group: event.target.value })}>
								{this.state.groups.map((group) => {
									return (
										<option key={group.group_id} value={group.group_id}>{group.name}</option>
									);										
								})}
							</Form.Control>
						</Col>
					</Form.Group>
					<Form.Group as={Row} controlId="description">
						<Col sm={2} />
						<Form.Label column sm={2}>Description</Form.Label>
						<Col sm={6}>
							<Form.Control type="text" value={this.state.description} onChange={(event) => this.mergeState({ description: event.target.value })}/>
						</Col>
					</Form.Group>
					<Form.Group as={Row} controlId="link">
						<Col sm={2} />
						<Form.Label column sm={2}>Link</Form.Label>
						<Col sm={6}>
							<Form.Control type="text" value={this.state.link} onChange={(event) => this.mergeState({ link: event.target.value })}/>
						</Col>
					</Form.Group>
					<Row>
						<Col sm={{offset: 2, span: 8}} md={{offset: 3, span: 6}} lg={{offset: 4, span: 4}}>
							<Button variant="primary" type="button" className="float-right" onClick={() => this.cancelEdit()}>
								Cancel
							</Button>
							{this.renderDeleteButton()}
							<Button variant="primary" type="submit" className="float-right" style={{ marginRight: '10px'}}>
								Save
							</Button>
						</Col>
					</Row>
				</Container>
			</Form>
		);
	}
}

export default EditGift;