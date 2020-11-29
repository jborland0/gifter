import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Col, Container, Row } from "react-bootstrap";
import GifterComponent from "./GifterComponent";
import MembersTable from "./MembersTable";
import $ from 'jquery';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class EditGroup extends GifterComponent {
  	constructor(props) {
		super(props);

		this.state = {
			key: 1,
			name: '',
			newMemberEmail: '',
			members: [],
			pageNumber: 0,
			pageSize: 10,
			pageCount: 0
		}
	}

	componentDidMount() {
		if (this.props.match.params.groupId !== 'new') {
			this.loadGroup();
		}
	}
	
	loadGroup() {
		var self = this;
		$.ajax({
			type: 'get',
			url: this.getConfig().baseURL + 'getgroup/',
			data: 'groupId=' + this.props.match.params.groupId /* + '&pageNumber=' + this.state.pageNumber + '&pageSize=' + this.state.pageSize */
		}).done(function (data) {
			self.mergeState({
				key: self.state.key + 1,
				name: data.groupName,
				members: data.members,
				pageNumber: data.pageNumber,
				pageSize: data.pageSize,
				pageCount: data.pageCount
			});
		}).fail(function (jqXHR, textStatus, errorThrown) {
			self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
		});	
	}
	
	addMember(event) {
		var self = this;
		event.preventDefault();
		
		$.ajax({
			type: 'post',
			url: this.getConfig().baseURL + 'addmember/',
			data: JSON.stringify({ groupId: this.props.match.params.groupId, email: this.state.newMemberEmail })
		}).done(function (data) {
			if (data.success) {
				self.loadGroup();
			} else {
				self.showAlert('Add Member Error', data.message);
			}
		}).fail(function (jqXHR, textStatus, errorThrown) {
			self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
		});
	}
	
	saveGroup(event) {
		var self = this;
		event.preventDefault();
		
		if (this.props.match.params.groupId === 'new') {
			$.ajax({
				type: 'post',
				url: this.getConfig().baseURL + 'addgroup/',
				data: JSON.stringify({ name: this.state.name })
			}).done(function (data) {
				if (data.success) {
					self.props.history.push(self.getParentMatchPath() + '/groups/' + data.id);
				} else {
					self.showAlert('Add Group Error', data.message);
				}
			}).fail(function (jqXHR, textStatus, errorThrown) {
				self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
			});
		} else {
			console.log(this.props.match.params.groupId);
		}
	}
	
	renderMemberControls() {
		if (this.props.match.params.groupId !== 'new') {
			return (<>
				<Form onSubmit={(event) => this.addMember(event)}>
					<Form.Group as={Row} controlId="email">
						<Col sm={2} />
						<Form.Label column sm={2}>New Member Email</Form.Label>
						<Col sm={5}>
							<Form.Control type="text" onChange={(event) => this.mergeState({ newMemberEmail: event.target.value })}/>
						</Col>
						<Col sm={1}>
							<Button variant="primary" type="submit" className="float-right">
								Add
							</Button>
						</Col>
					</Form.Group>
				</Form>
				<Row>
					<Col sm={12}>
						<MembersTable groupcomponent={this} key={this.state.key}
						  members={this.state.members} propsPageNumber={this.state.pageNumber} 
						  propsPageSize={this.state.pageSize} pageCount={this.state.pageCount}/>
					</Col>
				</Row>			
			</>);
		}
	}

	render() {
		return (
			<Container fluid>
				<Row>
					<Col sm={12}>
						<h2>Group {this.props.match.params.groupId}</h2>
					</Col>
				</Row>
				<Form onSubmit={(event) => this.saveGroup(event)}>
					<Form.Group as={Row} controlId="name">
						<Col sm={2} />
						<Form.Label column sm={2}>Group Name</Form.Label>
						<Col sm={5}>
							<Form.Control type="text" value={this.state.name} onChange={(event) => this.mergeState({ name: event.target.value })}/>
						</Col>
						<Col sm={1}>
							<Button variant="primary" type="submit" className="float-right">
								Save
							</Button>
						</Col>
					</Form.Group>
				</Form>
				{this.renderMemberControls()}
			</Container>
		);
	}
}

export default EditGroup;