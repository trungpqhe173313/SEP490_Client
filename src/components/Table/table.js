import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
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
    handleChangePage,
    handleChangeRowPerPage,
    handleEdit,
    handleDelete,
    messagePopupDelete,
    usePagination,
    useDetail,
    handleFetchDetail
}) {
    const [sortType, setSortType] = useState('asc');
    const [sortColumn, setSortColumn] = useState(defaultSortColumn || headers[0].key);
    const [data, setData] = useState(tableData);
    const [isOpenPopupConfirmDelete, setIsOpenPopupConfirmDelete] = useState(false);
    const [idDeleting, setIdDeleting] = useState('');

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
                                    <Button sx={{backgroundColor:"#ffc107", margin:"5px", color:"black"}} onClick={() => handleEdit(item)}>Sửa</Button>
                                    <Button sx={{backgroundColor:"red", margin:"5px", color:"white"}} onClick={() => {
                                        setIsOpenPopupConfirmDelete(true);
                                        setIdDeleting(item);
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
                    rowsPerPage={rowPerPage}
                    page={pageIndex}
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
