import React, { useState, useEffect, use } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
} from '@mui/material';
import ConfirmModal from '@/components/Modal/confirmModal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';

export default function TableCommon({
    headers,
    tableData,
    defaultSortColumn,
    defaultSortType,
    rowPerPage,
    pageIndex,
    totalCount,
    rowPerPageOptions,
    handleChangePage,
    handleChangeRowPerPage,
    navigateDetail = () => { },
    handleEdit,
    handleDelete,
    messagePopupDelete,
    usePagination,
    useAction,
    fePagination,
    extraRow,
    useDetail,
    tableDetail
}) {
    const [sortType, setSortType] = useState(defaultSortType || 'asc');
    const [sortColumn, setSortColumn] = useState(defaultSortColumn || headers[0].key);
    const [data, setData] = useState(tableData);
    const [isOpenPopupConfirmDelete, setIsOpenPopupConfirmDelete] = useState(false);
    const [idDeleting, setIdDeleting] = useState('');
    const [expandedIndex, setExpandedIndex] = useState([]);

    const toggleExpand = (id) => {
        if (expandedIndex === id) {
            setExpandedIndex([]);
        } else {
            setExpandedIndex(id);
        }
    };

    // Update data when tableData changes
    useEffect(() => {
        setData(tableData);
    }, [tableData]);

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortType(sortType === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortType('asc');
        }
    };

    const getValueToDisplayOnTable = (indexColumn, item) => {
        const customValue = headers[indexColumn].customValue;
        return customValue ? customValue(item) : item[headers[indexColumn].key];
    }

    const handleOkDelete = () => {
        if (handleDelete) {
            handleDelete(idDeleting);
            setIsOpenPopupConfirmDelete(false);
        }
    };

    // Sort data
    let displayedData = [...data];
    if (sortColumn) {
        displayedData.sort((a, b) => {
            if (a[sortColumn] < b[sortColumn]) return sortType === 'asc' ? -1 : 1;
            if (a[sortColumn] > b[sortColumn]) return sortType === 'asc' ? 1 : -1;
            return 0;
        });
    }

    if (fePagination) {
        displayedData = displayedData.slice(pageIndex * rowPerPage, (pageIndex + 1) * rowPerPage);
    }

    if (displayedData.length === 0) return (
        <div className="bg-white rounded-2xl overflow-scroll overflow-x-hidden">
            <TableContainer sx={{ borderRadius: "12px", overflow: "hidden" }}>
                <Table>
                    <TableHead className="background-primary">
                        <TableRow>
                            {headers.map((header, index) => (
                                <TableCell key={index} sx={{ color: "white" }} className="!text-center">
                                    <TableSortLabel
                                        sx={{ "&.Mui-active": { color: "white" }, "&.Mui-active .MuiTableSortLabel-icon": { color: "white !important" } }}
                                    >
                                        {header.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            {useAction && <TableCell sx={{ color: "white" }} className="!text-center">Hành động</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={useAction ? headers.length + 1 : headers.length}>
                                <p className="text-center my-5 text-lg">
                                    Không có dữ liệu
                                </p>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )

    return (
        <div className="bg-white rounded-2xl overflow-scroll overflow-x-hidden">
            <ConfirmModal
                isOpen={isOpenPopupConfirmDelete}
                onClose={() => setIsOpenPopupConfirmDelete(false)}
                onConfirm={handleOkDelete}
                onCancel={() => setIsOpenPopupConfirmDelete(false)}
                message={messagePopupDelete}
            />
            {usePagination && (
                <TablePagination
                    rowsPerPageOptions={rowPerPageOptions}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowPerPage}
                    page={pageIndex}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowPerPage}
                    labelRowsPerPage="Số dòng mỗi trang:"
                    labelDisplayedRows={({ from, to, count }) => `Từ ${from}-${to} trong tổng ${count} dòng`}
                />
            )}
            <TableContainer sx={{ borderRadius: "12px", overflow: "hidden" }}>
                <Table>
                    <TableHead className="background-primary">
                        <TableRow>
                            {headers.map((header, index) => (
                                <TableCell key={index} sx={{ color: "white" }} className="!text-center">
                                    <TableSortLabel
                                        sx={{ "&.Mui-active": { color: "white" }, "&.Mui-active .MuiTableSortLabel-icon": { color: "white !important" } }}
                                        active={sortColumn === header.key}
                                        direction={sortColumn === header.key ? sortType : 'asc'}
                                        onClick={() => handleSort(header.key)}
                                    >
                                        {header.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            {useAction && <TableCell sx={{ color: "white" }} className="!text-center">Hành động</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedData.map((item, index) =>
                            <React.Fragment key={index}>
                                <TableRow className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} ${useDetail && "cursor-pointer"}`} onClick={() => toggleExpand(index)}>
                                    {headers.map((header, indexColumn) => (
                                        <TableCell key={indexColumn} className="!text-center">
                                            {getValueToDisplayOnTable(indexColumn, item)}
                                        </TableCell>
                                    ))}
                                    {useAction && (
                                        <TableCell align="center" verticalalign="middle">
                                            <button className="bg-cyan-500 ml-2 my-1 text-white px-2 py-1 rounded" onClick={() => navigateDetail(item)}>
                                                <AssignmentIcon />
                                            </button>
                                            <button className="bg-yellow-500 ml-2 my-1 text-white px-2 py-1 rounded" onClick={() => handleEdit(item)}>
                                                <EditIcon />
                                            </button>
                                            <button className="bg-red-500 ml-2 my-1 text-white px-2 py-1 rounded" onClick={() => {
                                                setIsOpenPopupConfirmDelete(true);
                                                setIdDeleting(item);
                                            }}>
                                                <DeleteIcon />
                                            </button>
                                        </TableCell>
                                    )}
                                </TableRow>
                                {useDetail && tableDetail && expandedIndex === index && (
                                    <TableRow>
                                        <TableCell colSpan={headers.length} sx={{ padding: 0 }}>
                                            {tableDetail(displayedData[index][headers[0].key])}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        )}
                        {extraRow && (
                            extraRow()
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {usePagination && (
                <TablePagination
                    rowsPerPageOptions={rowPerPageOptions}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowPerPage}
                    page={pageIndex}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowPerPage}
                    labelRowsPerPage="Số dòng mỗi trang:"
                    labelDisplayedRows={({ from, to, count }) => `Từ ${from}-${to} trong tổng ${count} dòng`}
                />
            )}
        </div>
    );
}
