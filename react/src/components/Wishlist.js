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
			gifts: [],
			pageNumber: 1,
			pageSize: 10,
			pageCount: 1
		};
	}

	componentDidMount() {
		this.loadGifts(this.state.pageNumber, this.state.pageSize);
	}
	
	loadGifts(pageNumber, pageSize) {
		var self = this;
		
		$.ajax({
			type: 'get',
			url: this.getConfig().baseURL + 'gifts/',
			data: 'pageNumber=' + pageNumber + '&pageSize=' + pageSize
		}).done(function (data) {
			data['key'] = self.state.key + 1;
			self.mergeState(data);
		}).fail(function (jqXHR, textStatus, errorThrown) {
			self.showAlert('Server Error', 'Server returned a status of ' + jqXHR.status);
		});		
	}
	
	addGift() {
		console.log('add gift')
	}
	
	editGift(giftId) {
		this.props.history.push(this.getParentMatchPath() + '/gifts/' + giftId);
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
		return (
			<Container fluid>
				<Row>
					<Col sm={12}>
						<WishlistTable wishlist={this} key={this.state.key}
						  gifts={this.state.gifts} propsPageNumber={this.state.pageNumber} 
						  propsPageSize={this.state.pageSize} pageCount={this.state.pageCount}/>
					</Col>
				</Row>
			</Container>
		);
	}
}

export default Wishlist;