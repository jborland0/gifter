import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Col, Container, Row, Table } from 'react-bootstrap';
import GifterComponent from './GifterComponent';
import GroupsTable from './GroupsTable';
import { useTable } from 'react-table';
import $ from 'jquery';

class Groups extends GifterComponent {
  	constructor(props) {
		super(props);
		
		this.state = {
			key: 1,
			groups: [],
			pageNumber: 1,
			pageSize: 10,
			pageCount: 1
		};
	}

	componentDidMount() {
		this.loadGroups(this.state.pageNumber, this.state.pageSize);
	}
	
	loadGroups(pageNumber, pageSize) {
		var self = this;
		
		$.ajax({
			type: 'get',
			url: this.getConfig().baseURL + 'getgroups/',
			data: 'pageNumber=' + pageNumber + '&pageSize=' + pageSize
		}).done(function (data) {
			data['key'] = self.state.key + 1;
			self.mergeState(data);
		}).fail(function (jqXHR, textStatus, errorThrown) {
			self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
		});		
	}
	
	addGroup() {
		this.props.history.push(this.getParentMatchPath() + '/groups/new');
	}
	
	editGroup(groupId) {
		this.props.history.push(this.getParentMatchPath() + '/groups/' + groupId);
	}
	
	acceptInvitation(groupId) {
		var self = this;
		
		$.ajax({
			type: 'post',
			url: this.getConfig().baseURL + 'acceptinvitation/',
			data: JSON.stringify({ groupId: groupId })
		}).done(function (data) {
			if (data.success) {
				self.loadGroups(self.state.pageNumber, self.state.pageSize);
			} else {
				self.showAlert('Accept Invitation Error', data.message);
			}
		}).fail(function (jqXHR, textStatus, errorThrown) {
			self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
		});
	}
	
	firstPage() {
		if (this.state.pageNumber != 1) {
			this.loadGroups(1, this.state.pageSize);
		}
	}
	
	previousPage() {
		if (this.state.pageNumber > 1) {
			this.loadGroups(this.state.pageNumber - 1, this.state.pageSize);
		}		
	}
	
	nextPage() {
		// server will correct if page number is too big
		this.loadGroups(this.state.pageNumber + 1, this.state.pageSize);		
	}
	
	lastPage() {
		// use -1 to indicate last page since we don't 
		// necessarily know how many pages there are now
		this.loadGroups(-1, this.state.pageSize);
	}
	
	setPageSize(pageSize) {
		if (pageSize != this.state.pageSize) {
			this.loadGroups(this.state.pageNumber, pageSize);
		}
	}
	
	setPageNumber(pageNumber) {
		if (pageNumber != this.state.pageNumber) {
			this.loadGroups(pageNumber, this.state.pageSize);
		}
	}

	render() {
		return (
			<Container fluid>
				<Row>
					<Col sm={12}>
						<h3>Groups</h3>
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<GroupsTable groupscomponent={this} key={this.state.key}
						  groups={this.state.groups} propsPageNumber={this.state.pageNumber} 
						  propsPageSize={this.state.pageSize} pageCount={this.state.pageCount}/>
					</Col>
				</Row>
			</Container>
		);
	}
}

export default Groups;