import React from 'react';
import { useTable } from 'react-table';
import { useDrag, useDrop } from 'react-dnd';
import update from 'immutability-helper';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { ChevronDoubleLeft, ChevronDoubleRight, ChevronLeft, ChevronRight, GripHorizontal, PencilSquare, PlusSquare, Question } from 'react-bootstrap-icons'

const DndTable = ({ columns, data }) => {
  const [records, setRecords] = React.useState(data)

  const getRowId = React.useCallback(row => {
    return row.id
  }, [])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    data: records,
    columns,
    getRowId
  })

  const moveRow = (dragIndex, hoverIndex) => {
    const dragRecord = records[dragIndex]
    setRecords(
      update(records, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragRecord],
        ],
      })
    )
  }

  return (
      <Table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              <th></th>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(
            (row, index) =>
              prepareRow(row) || (
                <DndRow
                  index={index}
                  row={row}
                  moveRow={moveRow}
                  {...row.getRowProps()}
                />
              )
          )}
        </tbody>
      </Table>
  )
}

const DND_ITEM_TYPE = 'row'

const DndRow = ({ row, index, moveRow }) => {
  const dropRef = React.useRef(null)
  const dragRef = React.useRef(null)

  const [, drop] = useDrop({
    accept: DND_ITEM_TYPE,
    hover(item, monitor) {
      if (!dropRef.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }
      // Determine rectangle on screen
      const hoverBoundingRect = dropRef.current.getBoundingClientRect()
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      // Time to actually perform the action
      moveRow(dragIndex, hoverIndex)
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag, preview] = useDrag({
    item: { type: DND_ITEM_TYPE, index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0 : 1

  preview(drop(dropRef))
  drag(dragRef)

  return (
    <tr ref={dropRef} style={{ opacity }}>
      <td ref={dragRef}><GripHorizontal style={{ cursor: 'pointer' }} /></td>
      {row.cells.map(cell => {
        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
      })}
    </tr>
  )
}

const WishlistTable = ({ user, wishlist, gifts, isMyList, propsPageNumber, propsPageSize, pageCount }) => {
	
	const [pageNumber, setPageNumber] = React.useState(propsPageNumber)
	const [pageSize, setPageSize] = React.useState(propsPageSize)
		
	const formatDescription = (props) => {
		/* TODO find better way to do this */
		if (!props.value) return null;
		var hrefStart = props.value.indexOf('<a href="');
		var hrefEnd = props.value.indexOf('">');
		var aEnd = props.value.indexOf('</a>');
		if (hrefStart >= 0 && hrefEnd >= 0 && aEnd >= 0) {
			var link = props.value.substring(hrefStart + 9, hrefEnd);
			var description = props.value.substring(hrefEnd + 2, aEnd);
			if (link.length === 0) {
				return (<>{description}</>);
			} else {
				return (<a href={link} target="_blank">{description}</a>);
			}
		} else {
			return (<>{props.value}</>);
		}
	}
	
	const formatGivenBy = (props) => {
		if (isMyList) {
			return (<Question />);
		} else {
			return (<>{props.value}</>);
		}
	}
	
	const formatEditCell = (props) => {
		if (isMyList) {
			return (<PencilSquare style={{ cursor: 'pointer' }} onClick={() => wishlist.editGift(props.value)} />);			
		} else {
			var givenBy = null;
			// locate selected row and save given_by
			for (var i = 0; i < props.data.length; i++) {
				// if this is the selected row
				if (props.data[i].id === props.value) {
					// save given_by
					givenBy = props.data[i].given_by_username;
				}
			}

			// if it's given by me
			if (givenBy === user.username) {
				// editing will un-gift it
				return (<PencilSquare style={{ cursor: 'pointer' }} onClick={() => wishlist.unGift(props.value)} />);			
			} else if (givenBy === null || givenBy === '') {
				// editing will gift it
				return (<PencilSquare style={{ cursor: 'pointer' }} onClick={() => wishlist.buyGift(props.value)} />);						
			} else {
				// gift is given by someone else
				return null;
			}
		}
	}
	
	const formatEditHeader = (props) => {
		if (isMyList) {
			return (<PlusSquare style={{ cursor: 'pointer' }} onClick={() => wishlist.addGift()} />);
		} else {
			return null;
		}
	}
	
	const columns = React.useMemo(() => [
	    { Header: props => formatEditHeader(props), accessor: 'id', 
			Cell: props => formatEditCell(props) },
		{ Header: 'Description', accessor: 'html',
			Cell: props => formatDescription(props) },
		{ Header: 'From', accessor: 'given_by_username',
			Cell: props => formatGivenBy(props) }
	], []);	
	
  return (
  <Container fluid>
	<Row>
	  <Col sm={12}>
		<DndTable columns={columns} data={gifts} />
	  </Col>
	</Row>
	<Row>
	  <Col sm={12} className='d-flex justify-content-center'>
		<Form inline>
		  <Form.Group controlId='pageNumber'>
			Page <Form.Control type="text" style={{ marginLeft: 5, marginRight: 5, width: 70 }} 
					value={pageNumber} onChange={(event) => setPageNumber(event.target.value)} 
					onBlur={() => wishlist.setPageNumber(pageNumber)}
					onKeyPress={(event) => { if (event.charCode === 13) { wishlist.setPageNumber(pageNumber) }}} /> of {pageCount}
		  </Form.Group>
			<Button variant='outline-dark' style={{ paddingTop: 3, marginLeft: 10, marginRight: 4 }} onClick={() => wishlist.firstPage()}>
			  <ChevronDoubleLeft />
			</Button>
			<Button variant='outline-dark' style={{ paddingTop: 3, marginRight: 4 }} onClick={() => wishlist.previousPage()}>
			  <ChevronLeft />
			</Button>
			<Button variant='outline-dark' style={{ paddingTop: 3, marginRight: 4 }} onClick={() => wishlist.nextPage()}>
			  <ChevronRight />
			</Button>
			<Button variant='outline-dark' style={{ paddingTop: 3, marginRight: 10 }} onClick={() => wishlist.lastPage()}>
			  <ChevronDoubleRight />
			</Button>
		  <Form.Group controlId='pageSize'>
			Show <Form.Control type="text" style={{ marginLeft: 5, marginRight: 5, width: 70 }}
					value={pageSize} onChange={(event) => setPageSize(event.target.value)}
					onBlur={() => wishlist.setPageSize(pageSize)}
					onKeyPress={(event) => { if (event.charCode === 13) { wishlist.setPageSize(pageSize) }}} /> per page
		  </Form.Group>
		</Form>
	  </Col>
	</Row>
  </Container>
  )
}

export default WishlistTable
