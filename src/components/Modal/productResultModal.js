import React, { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import TableCommon from "@/components/Table/table";

export default function ProductResultModal({ isOpen, message, onClose, data }) {

    const handleClose = () => onClose();

    const headerData = [
        { key: "productId", label: "ID sản phẩm", customValue: (item) => item.productId && <div>{item.productId}</div> },
        { key: "productName", label: "Tên sản phẩm", customValue: (item) => item.productName && <div>{item.productName}</div> },
        { key: "productCode", label: "Mã sản phẩm", customValue: (item) => item.productCode && <div>{item.productCode}</div> },
        { key: "categoryName", label: "Danh mục", customValue: (item) => item.categoryName && <div>{item.categoryName}</div> },
        { key: "supplierName", label: "Nhà cung cấp", customValue: (item) => item.supplierName && <div>{item.supplierName}</div> },
        { key: "weightPerUnit", label: "Khối lượng (kg)", customValue: (item) => item.weightPerUnit && <div>{item.weightPerUnit}</div> },
        { key: "sellingPrice", label: "Giá bán", customValue: (item) => item.sellingPrice && <div>{item.sellingPrice}</div> },
        { key: "description", label: "Ghi chú", customValue: (item) => item.description && <div>{item.description}</div> },
    ];

    const [rowPerPage, setRowPerPage] = useState(5);
    const [pageIndex, setPageIndex] = useState(0);
    const totalCount = data.length;

    const handleChangePage = (event, newPage) => {
        setPageIndex(newPage);
    };

    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    return (
        <Modal open={isOpen} aria-labelledby="modal-success-title" aria-describedby="modal-success-description">
            <Box
                sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', bgcolor: 'background.paper', border: '1px solid #000', boxShadow: 24, }}
                className="p-4 rounded-xl text-center"
            >
                <Typography id="modal-success-title" variant="h5" component="h2">
                    Thành công
                </Typography>
                <Typography id="modal-success-description" variant='subtitle1' sx={{ marginBottom: '20px' }}>
                    {message}
                </Typography>
                <TableCommon
                    headers={headerData}
                    tableData={data}
                    defaultSortColumn="productId"
                    rowPerPage={rowPerPage}
                    pageIndex={pageIndex}
                    totalCount={totalCount}
                    rowPerPageOptions={[5, 10, 20]}
                    handleChangePage={handleChangePage}
                    handleChangeRowPerPage={handleChangeRowPerPage}
                    usePagination={true}
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleClose()}
                    >
                        Xác nhận
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}