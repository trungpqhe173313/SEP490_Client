import React, { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { formatLargeNumber } from '@/lib/formattingLib';
import TableCommon from "@/components/Table/table";

export default function ImportResultModal({ isOpen, message, onClose, data }) {

    const handleClose = () => onClose();

    const headerData = [
        { key: "transactionDetailId", label: "Mã chi tiết", customValue: (item) => item.transactionDetailId && <div>{item.transactionDetailId}</div> },
        { key: "productId", label: "ID sản phẩm", customValue: (item) => item.productId && <div>{item.productId}</div> },
        { key: "code", label: "Code sản phẩm", customValue: (item) => item.code && <div>{item.code}</div> },
        { key: "productName", label: "Tên sản phẩm", customValue: (item) => item.productName && <div>{item.productName}</div> },
        { key: "unitPrice", label: "Đơn giá", customValue: (item) => item.unitPrice && <div>{formatLargeNumber(item.unitPrice)}₫</div> },
        { key: "weightPerUnit", label: "Khối lượng", customValue: (item) => item.weightPerUnit && <div>{item.weightPerUnit}</div> },
        { key: "quantity", label: "Số lượng nhập", customValue: (item) => item.quantity && <div>{item.quantity}</div> },
        { key: "note", label: "Ghi chú", customValue: (item) => item.note && <div>{item.note}</div> },
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
                className="p-4 rounded-xl text-center "
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
                    defaultSortColumn="batchId"
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
