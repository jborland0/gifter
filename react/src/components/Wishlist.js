import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Col, Container, Row, Table } from 'react-bootstrap';
import GifterComponent from './GifterComponent';
import WishlistTable from './WishlistTable';
import { useTable } from 'react-table';
import $ from 'jquery';

class Wishlist extends GifterComponent {
  	constructor(props) {
		super(props);
		
		this.state = {
			key: 1,
			groups: [],
			group: 0,
			members: [],
			member: 0,
			gifts: [],
			pageNumber: 1,
			pageSize: 10,
			pageCount: 0
		};
	}

	componentDidMount() {
		this.loadGroups();
	}

	loadGroups() {
		var self = this;
		
		$.ajax({
			type: 'get',
			url: this.getConfig().baseURL + 'getactivegroups/',
		}).done(function (data) {
			self.mergeState({ groups: data.groups });
			self.selectGroup(data.groups.length > 0 ? data.groups[0].group_id : 0);
		}).fail(function (jqXHR, textStatus, errorThrown) {
			self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
		});		
	}
	
	loadGifts(pageNumber, pageSize) {
		var self = this;
		
		$.ajax({
			type: 'get',
			url: this.getConfig().baseURL + 'getgifts/',
			data: 'groupId=' + this.state.group + '&memberId=' + this.state.member + '&pageNumber=' + pageNumber + '&pageSize=' + pageSize
		}).done(function (data) {
			data['key'] = self.state.key + 1;
			self.mergeState(data);
		}).fail(function (jqXHR, textStatus, errorThrown) {
			self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
		});		
	}
	
	selectGroup(groupId) {
		var self = this;
		this.mergeState({ group: groupId }, () => {
			$.ajax({
				type: 'get',
				url: self.getConfig().baseURL + 'getactivemembers/',
				data: 'groupId=' + this.state.group
			}).done(function (data) {
				self.mergeState({ members: data.members }, () => {
					self.selectMember(data.members.length > 0 ? data.members[0].user_id: 0);
				});
			}).fail(function (jqXHR, textStatus, errorThrown) {
				self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
			});					
		});
	}
	
	selectMember(memberId) {
		this.mergeState({ member: memberId }, () => {
			this.loadGifts(this.state.pageNumber, this.state.pageSize);
		});
	}
	
	addGift() {
		this.props.history.push(this.getParentMatchPath() + '/gifts/new');
	}
	
	editGift(giftId) {
		this.props.history.push(this.getParentMatchPath() + '/gifts/' + giftId);
	}
	
	buyGift(giftId) {
		var self = this;
		
		$.ajax({
			type: 'post',
			url: this.getConfig().baseURL + 'buygift/',
			data: JSON.stringify({ 
				giftId: giftId,
			})
		}).done(function (data) {
			self.loadGifts(self.state.pageNumber, self.state.pageSize);
		}).fail(function (jqXHR, textStatus, errorThrown) {
			self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
		});		
	}
	
	unGift(giftId) {
		var self = this;
		
		$.ajax({
			type: 'post',
			url: this.getConfig().baseURL + 'ungift/',
			data: JSON.stringify({ 
				giftId: giftId,
			})
		}).done(function (data) {
			self.loadGifts(self.state.pageNumber, self.state.pageSize);
		}).fail(function (jqXHR, textStatus, errorThrown) {
			self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
		});		
	}
	
	firstPage() {
		if (this.state.pageNumber != 1) {
			this.loadGifts(1, this.state.pageSize);
		}
	}
	
	previousPage() {
		if (this.state.pageNumber > 1) {
			this.loadGifts(this.state.pageNumber - 1, this.state.pageSize);
		}		
	}
	
	nextPage() {
		// server will correct if page number is too big
		this.loadGifts(this.state.pageNumber + 1, this.state.pageSize);		
	}
	
	lastPage() {
		// use -1 to indicate last page since we don't 
		// necessarily know how many pages there are now
		this.loadGifts(-1, this.state.pageSize);
	}
	
	setPageSize(pageSize) {
		if (pageSize != this.state.pageSize) {
			this.loadGifts(this.state.pageNumber, pageSize);
		}
	}
	
	setPageNumber(pageNumber) {
		if (pageNumber != this.state.pageNumber) {
			this.loadGifts(pageNumber, this.state.pageSize);
		}
	}

	render() {
		var isMyList = this.getUser().id == this.state.member;
		
		return (
			<Container fluid>
				<Form>
					<Row>
						<Form.Label column sm={3}>Group</Form.Label>
						<Col sm={3}>
							<Form.Control as="select" value={this.state.group} onChange={(event) => this.selectGroup(event.target.value)}>
								{this.state.groups.map((group) => {
									return (
										<option key={group.group_id} value={group.group_id}>{group.name}</option>
									);										
								})}
							</Form.Control>
						</Col>
						<Form.Label column sm={3}>Member</Form.Label>
						<Col sm={3}>
							<Form.Control as="select" value={this.state.member} onChange={(event) => this.selectMember(event.target.value)}>
								{this.state.members.map((member) => {
									return (
										<option key={member.user_id} value={member.user_id}>{member.username}</option>
									);										
								})}
							</Form.Control>
						</Col>
					</Row>
				</Form>
				<Row>
					<Col sm={12}>
						<WishlistTable user={this.getUser()} wishlist={this} isMyList={isMyList} key={this.state.key}
						  gifts={this.state.gifts} propsPageNumber={this.state.pageNumber} 
						  propsPageSize={this.state.pageSize} pageCount={this.state.pageCount}/>
					</Col>
				</Row>
			</Container>
		);
	}
}

export default Wishlist;