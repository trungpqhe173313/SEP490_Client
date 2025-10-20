import React, { useState, useEffect } from "react";
import {
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Typography,
    Button
} from '@mui/material';
import ConfirmModal from '@/components/Modal/confirmModal';

export default function TableCommon({
    headers,
    tableData,
    defaultSortColumn,
    rowPerPage,
    pageIndex,
    totalCount,
    rowPerPageOptions,
    handleEdit,
    handleDelete,
    messagePopupDelete,
    placeholderSearch,
    usePagination,
    useDetail,
}) {
    const [page, setPage] = useState(pageIndex);
    const [amountOnPage, setAmountOnPage] = useState(rowPerPage);
    const [sortType, setSortType] = useState('asc');
    const [sortColumn, setSortColumn] = useState(defaultSortColumn || headers[0].key);
    const [search, setSearch] = useState('');
    const [data, setData] = useState(tableData);
    const [isOpenPopupConfirmDelete, setIsOpenPopupConfirmDelete] = useState(false);
    const [idDeleting, setIdDeleting] = useState('');

    // Update data when tableData changes
    useEffect(() => {
        setData(tableData);
    }, [tableData]);

    // Pagination handlers for MUI TablePagination
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowPerPage = (event) => {
        setAmountOnPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortType(sortType === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortType('asc');
        }
    };

    const handleSearch = (value) => setSearch(value);

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

    // Sort and paginate data
    let displayedData = [...data];
    if (sortColumn) {
        displayedData.sort((a, b) => {
            if (a[sortColumn] < b[sortColumn]) return sortType === 'asc' ? -1 : 1;
            if (a[sortColumn] > b[sortColumn]) return sortType === 'asc' ? 1 : -1;
            return 0;
        });
    }
    if (usePagination) {
        displayedData = displayedData.slice(page * amountOnPage, page * amountOnPage + amountOnPage);
    }

    return (
        <div className="bg-white rounded-2xl">
            <ConfirmModal
                isOpen={isOpenPopupConfirmDelete}
                onClose={() => setIsOpenPopupConfirmDelete(false)}
                onConfirm={handleOkDelete}
                onCancel={() => setIsOpenPopupConfirmDelete(false)}
                message={messagePopupDelete}
            />
            <TableContainer
                sx={{
                    borderRadius: "12px",
                    overflow: "hidden",
                }}>
                <Table>
                    <TableHead className="bg-green-600">
                        <TableRow>
                            {headers.map((header, index) => (
                                <TableCell key={index} sx={{ color: "white" }}>
                                    <TableSortLabel
                                        sx={{
                                            "&.Mui-active": {
                                                color: "white",
                                            },
                                            "&.Mui-active .MuiTableSortLabel-icon": {
                                                color: "white !important",
                                            }
                                        }}
                                        active={sortColumn === header.key}
                                        direction={sortColumn === header.key ? sortType : 'asc'}
                                        onClick={() => handleSort(header.key)}
                                    >
                                        {header.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell sx={{ color: "white" }}>
                                Hành động
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedData.map((item, index) => (
                            <TableRow key={item.id || index}>
                                {headers.map((header, indexColumn) => (
                                    <TableCell key={indexColumn}>
                                        {getValueToDisplayOnTable(indexColumn, item)}
                                    </TableCell>
                                ))}
                                <TableCell>
                                    <Button onClick={() => handleEdit(item)}>Sửa</Button>
                                    <Button onClick={() => {
                                        setIsOpenPopupConfirmDelete(true);
                                        setIdDeleting(item.id);
                                    }}>Xóa</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {usePagination && (
                <TablePagination
                    rowsPerPageOptions={rowPerPageOptions}
                    component="div"
                    count={totalCount}
                    rowsPerPage={amountOnPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowPerPage}
                    labelRowsPerPage="Số hàng mỗi trang:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}–${to} trong tổng ${count !== -1 ? count : `hơn ${to}`}`
                    }
                />
            )}
        </div>
    );
}
