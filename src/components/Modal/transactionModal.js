'use client';
import React, { useState, useEffect } from 'react'
import { paymentService } from '@/services/payment.service';
import { numberToVietnamese } from '@/lib/numberToVietnamese';
import { convertKgToTon, formatLargeNumber } from '@/lib/formattingLib';
import TableCommon from "@/components/Table/table";
import { getExportStatus, getImportStatus } from "@/lib/getStatus";
import { TableRow, TableCell } from '@mui/material';
import { Modal } from "@mui/material";

export function TransactionModal({ isOpen, handleClose, transaction }) {
    const [paidAmount, setPaidAmount] = useState(0);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                if (!transaction.transactionId) return;
                const body = {
                    pageIndex: 1,
                    pageSize: 1000,
                    relatedTransactionId: transaction.transactionId
                }
                const response = await paymentService.getAllPayments(body);
                const totalPaidAmount = response.data.items.reduce((acc, cur) => acc + (cur.amount < 0 ? cur.amount * -1 : cur.amount), 0);
                setPaidAmount(totalPaidAmount);
            } catch (error) {
                console.log(error);
            }
        }
        fetchPayments();
    }, [transaction]);

    const headerData = [
        {
            key: "productId",
            label: "ID sản phẩm",
            customValue: (item) => item.productId && <div>{item.productId}</div>
        },
        {
            key: "productName",
            label: "Tên sản phẩm",
            customValue: (item) => item.productName && <div>{item.productName}</div>
        },
        {
            key: "note",
            label: "Ghi chú",
            customValue: (item) => item.note && <div>{item.note}</div>
        },
        {
            key: "weightPerUnit",
            label: "Khối lượng (Kg)",
            customValue: (item) => item.weightPerUnit && <div>{item.weightPerUnit}</div>
        },
        {
            key: "quantity",
            label: "Số lượng (Bao)",
            customValue: (item) => item.quantity && <div>{item.quantity}</div>
        },
        {
            key: "totalWeight",
            label: "Tổng khối lượng (Khối lượng x Số lượng)",
            customValue: (item) => item.totalWeight && <div>{item.totalWeight}</div>
        },
        {
            key: "unitPrice",
            label: "Đơn giá (VND)",
            customValue: (item) => item.unitPrice && <div>{formatLargeNumber(item.unitPrice)}₫</div>
        },
        {
            key: "totalPrice",
            label: "Thành tiền (VND)",
            customValue: (item) => item.quantity && item.unitPrice && <div>{formatLargeNumber(item.quantity * item.unitPrice)}₫</div>
        },
    ]

    const extraRow = () => {
        return (
            <TableRow>
                <TableCell colSpan={1} align="center">Tổng</TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell align="center">{(transaction.details.reduce((total, item) => total + (item.totalWeight), 0))} Kg</TableCell>
                <TableCell />
                <TableCell align="center">{!transaction.totalCost ? formatLargeNumber(transaction.details.reduce((total, item) => total + (item.quantity * item.unitPrice), 0)) : formatLargeNumber(transaction.totalCost)}₫</TableCell>
            </TableRow>
        )
    }

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-4/5 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden">
                    <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0 z-50">
                        <h2 className="text-2xl font-bold my-auto">
                            Chi tiết giao dịch liên quan
                        </h2>
                        <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1" onClick={handleClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className='grid grid-cols-3 p-4 gap-4 w-full h-50'>
                        <div className='col-span-1 rounded-xl bg-white p-4'>
                            <h1 className='text-xl font-bold'>Chi tiết phiếu</h1>
                            <p className='my-2'>Mã giao dịch: {transaction.transactionId}</p>
                            <p className='my-2'>Ngày giao dịch: {new Date(transaction.transactionDate).toLocaleString('vi-VN')}</p>
                            <p className='my-2'>Nhà kho: {transaction.warehouseName}</p>
                            <div className='my-2 flex flex-row gap-2'>
                                <p>Trạng thái: </p>
                                {transaction.customerId ? getExportStatus(transaction.status) : getImportStatus(transaction.status)}
                            </div>
                            {transaction.customerName && <p className='my-2'>Khách hàng: {transaction.customerName}</p>}
                            {transaction.supplierName && <p className='my-2'>Nhà cung cấp: {transaction.supplierName}</p>}
                        </div>
                    </div>

                    <div className='w-auto rounded-xl h-auto bg-white mx-4 my-2'>
                        <h1 className='text-xl font-bold p-4'>Danh sách sản phẩm</h1>
                        <TableCommon
                            headers={headerData}
                            tableData={transaction.details}
                            extraRow={extraRow}
                        />
                        <div className='flex flex-row justify-between items-center p-4' />
                    </div>


                    <div className='w-auto rounded-xl h-auto bg-white mx-4 my-2 p-4 text-right flex flex-col items-end'>
                        <div className='text-xl flex flex-row justify-between w-1/3'>
                            <h3 className='w-1/3 text-left'>Tổng khối lượng:</h3>
                            <h3>{convertKgToTon(transaction.details.reduce((total, item) => total + item.totalWeight, 0))}</h3>
                        </div>
                        <div className='text-xl flex flex-row justify-between w-1/3'>
                            <h3 className='w-1/3 text-left'>Tổng tiền đơn:</h3>
                            <h3>{!transaction.totalCost ? formatLargeNumber(transaction.details.reduce((total, item) => total + (item.quantity * item.unitPrice), 0)) : formatLargeNumber(transaction.totalCost)}₫</h3>
                        </div>
                        {transaction?.status >= 11 && <div className='w-1/3'>
                            <div className='text-xl flex flex-row justify-between'>
                                <h3 className='w-1/3 text-left'>Đã thanh toán:</h3>
                                <h3 className='text-green-600'>{formatLargeNumber(paidAmount)}₫</h3>
                            </div>
                            <div className='text-xl flex flex-row justify-between'>
                                <h3 className='w-1/3 text-left'>Còn nợ:</h3>
                                <h3 className='text-red-600'>{formatLargeNumber(transaction.totalCost - paidAmount)}₫</h3>
                            </div>
                        </div>}
                        <div className='text-xl flex flex-row justify-between w-1/3'>
                            <h3 className='w-1/3 text-left'>Bằng chữ: </h3>
                            <h3>{transaction?.status >= 11 ? numberToVietnamese(transaction.totalCost - paidAmount) : numberToVietnamese(transaction.totalCost)}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
