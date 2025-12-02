import React from 'react'
import { Modal } from "@mui/material";
import TableCommon from '@/components/Table/table';
import { formatLargeNumber } from '@/lib/formattingLib';

export function PayrollModal({ isOpen, handleClose, payroll }) {
    const headers = [
        {
            key: "jobName",
            label: "Tên công việc",
            customValue: (item) => item.jobName && <div>{item.jobName}</div>
        },
        {
            key: "payType",
            label: "Hình thức tính",
            customValue: (item) => item.payType === "Per_Tan" ? <div>Theo số tấn</div> : item.payType === "Per_Ngay" ? <div>Theo số ngày</div> : <div>Chưa có</div>
        },
        {
            key: "rate",
            label: "Mức trả",
            customValue: (item) => item.rate && <div>{formatLargeNumber(item.rate)}₫{item.payType === "Per_Tan" ? "/tấn" : item.payType === "Per_Ngay" ? "/ngày" : ""}</div>
        },
        {
            key: "quantity",
            label: "Số công",
            customValue: (item) => item.quantity && <div>{item.quantity}</div>
        },
        {
            key: "amount",
            label: "Thành tiền (mức trả x số công)",
            customValue: (item) => item.amount && <div>{formatLargeNumber(item.amount)}₫</div>
        }
    ]

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-1/2 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden">
                    <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0">
                        <h2 className="text-2xl font-bold my-auto">
                            Chi tiết bảng lương
                        </h2>
                        <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1" onClick={handleClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="px-8 pt-4">
                        <div className='bg-white rounded-xl bg-gray-100'>
                            <h1 className='text-xl font-bold'>Thông tin chi tiết</h1>
                            <p className='my-2'>Mã nhân viên: {payroll.employeeId}</p>
                            <p className='my-2'>Tên nhân viên: {payroll.employeeName}</p>
                            <div className='my-2 flex flex-row gap-2'>
                                <p>Trạng thái: </p>
                                {payroll.status === "Chưa tạo bảng lương" ? <div className="text-yellow-500">{payroll.status}</div>
                                    : payroll.status === "Đã thanh toán" ? <div className="text-green-500">{payroll.status}</div>
                                        : <div className="text-blue-500">{payroll.status}</div>}
                            </div>
                        </div>
                    </div>
                    <div className="px-8 py-4">
                        <h1 className='text-xl font-bold mb-2'>Danh sách công việc</h1>
                        <TableCommon
                            headers={headers}
                            tableData={payroll.jobDetails}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    )
}

