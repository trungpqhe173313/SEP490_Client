import React, { useState } from 'react';
import { Modal, Box, Typography, SvgIcon, Button } from '@mui/material';
import TableCommon from "@/components/Table/table";

export default function importResultModal({ isOpen, message, onClose, data }) {

    if (!isOpen) return null;

    const handleClose = () => onClose();

    const headerData = [
        { key: "batchId", label: "Mã lô", customValue: (item) => item.batchId && <div>{item.batchId}</div> },
        { key: "warehouseName", label: "Tên nhà kho", customValue: (item) => item.warehouseName && <div>{item.warehouseName}</div> },
        { key: "productName", label: "Tên sản phẩm", customValue: (item) => item.productName && <div>{item.productName}</div> },
        { key: "transactionId", label: "Mã giao dịch", customValue: (item) => item.transactionId && <div>{item.transactionId}</div> },
        { key: "batchCode", label: "Code lô", customValue: (item) => item.batchCode && <div>{item.batchCode}</div> },
        { key: "importDate", label: "Ngày nhập", customValue: (item) => item.importDate && <div>{new Date(item.importDate).toLocaleString()}</div> },
        { key: "expireDate", label: "Ngày hết hạn", customValue: (item) => item.expireDate && <div>{new Date(item.expireDate).toLocaleString()}</div> },
        { key: "quantityIn", label: "Số lượng nhập", customValue: (item) => item.quantityIn && <div>{item.quantityIn}</div> },
        { key: "isActive", label: "Trạng thái", customValue: (item) => item.isActive ? "Đang hoạt động" : "Dừng hoạt động" },
        { key: "note", label: "Ghi chú", customValue: (item) => item.note && <div>{item.note}</div> },
    ];

    return (
        <Modal open={isOpen} aria-labelledby="modal-success-title" aria-describedby="modal-success-description">
            <Box
                sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, bgcolor: 'background.paper', border: '1px solid #000', boxShadow: 24, }}
                className="p-4 rounded-xl text-center "
            >
                <Typography id="modal-success-title" variant="h5" component="h2">
                    Thành công
                </Typography>
                <Typography id="modal-success-description" variant='subtitle1'>
                    {message}
                </Typography>
                <TableCommon
                    headers={headerData}
                    tableData={data}
                    defaultSortColumn="batchId"
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
