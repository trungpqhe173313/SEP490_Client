'use client'
import { paymentService } from '@/services/payment.service'

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useLogin } from "@/context/LoginContext";
import DateInput from "@/components/Input/DateInput";

import TableCommon from "@/components/Table/table";
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";
import {
  getFinancialTransactionType,
  getFinancialTransactionTypeText,
  getPaymentMethod
} from "@/lib/getStatus";
import { formatDateToInput, formatLargeNumber } from '@/lib/formattingLib';
import { PaymentForm } from "@/components/Form/paymentForm";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import Loader from "@/components/Loader/loader";

export default function FinancialTransactions() {
  const router = useRouter();
  const { isLogin, user, refreshUserInfo } = useLogin();

  const navigate = (path) => {
    router.push(path);
  };

  //Data state
  const [payments, setPayments] = useState([]);
  const [editingPayment, setEditingPayment] = useState(null);

  //Modal state
  const [modalOpen, setModalOpen] = useState(false);

  const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
  const [modalSuccessMessage, setModalSuccessMessage] = useState("");

  const [modalFailedOpen, setModalFailedOpen] = useState(false);
  const [modalFailedMessage, setModalFailedMessage] = useState("");
  const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

  //Filter state
  const [filterType, setFilterType] = useState(null);
  const [filterTransactionFromDate, setFilterTransactionFromDate] = useState("");
  const [filterTransactionToDate, setFilterTransactionToDate] = useState("");

  const [errorToTransactionDate, setErrorToTransactionDate] = useState("");

  //Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const { loading, setLoading } = useLoading();
  const buttonRef = useRef(null);
  const [pageReady, setPageReady] = useState(false);

  const pageRole = ["Admin"];

  useEffect(() => {
    if (loading) return;
    if (isLogin && user?.roles && user.roles.some((r) => pageRole.includes(r))) {
      setPageReady(true);
    } else if (!isLogin) {
      router.push("/login");
    } else if (!user?.roles?.some((r) => pageRole.includes(r))) {
      router.push("/");
    }
  }, [isLogin, user, router]);

  const headerData = [
    {
      key: 'financialTransactionId',
      label: 'Mã giao dịch',
      customValue: (item) => item.financialTransactionId && <div>{item.financialTransactionId}</div>
    },
    {
      key: "type",
      label: "Loại",
      customValue: (item) => getFinancialTransactionType(item.typeInt)
    },
    {
      key: "description",
      label: "Mô tả",
      customValue: (item) => item.description ? <div>{item.description}</div> : <div>Chưa có</div>
    },
    {
      key: "amount",
      label: "Số tiền",
      customValue: (item) => item.amount && <div className={item.amount > 0 ? "text-green-500" : "text-red-500"}>{formatLargeNumber(item.amount)}₫</div>
    },
    {
      key: "paymentMethod",
      label: "Phương thức thanh toán",
      customValue: (item) => getPaymentMethod(item.paymentMethod)
    },
    {
      key: "createdByName",
      label: "Tạo bởi",
      customValue: (item) => item.createdByName ? <div>{item.createdByName}</div> : <div>Không rõ</div>
    },
    {
      key: "transactionDate",
      label: "Ngày giao dịch",
      customValue: (item) => item.transactionDate && <div>{new Date(item.transactionDate).toLocaleString('vi-VN')}</div>
    },
  ];

  //Pagination handlers
  const handleChangePage = (event, newPage) => setPageIndex(newPage);
  const handleChangeRowPerPage = (event) => {
    setRowPerPage(parseInt(event.target.value, 10));
    setPageIndex(0);
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const body = {
        pageIndex: pageIndex + 1,
        pageSize: rowPerPage,
        type: parseInt(filterType) || null,
        transactionFromDate: filterTransactionFromDate || null,
        transactionToDate: filterTransactionToDate || null,
      }
      const response = await paymentService.getAllPayments(body);
      setPayments(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
      setModalFailedOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!pageReady) return;
    fetchPayments();
  }, [pageIndex, rowPerPage, pageReady]);

  const handleCreate = () => {
    setEditingPayment(null);
    setModalOpen(true);
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setModalOpen(true);
  };

  const handleConfirm = async (paymentData) => {
    if (!paymentData) return;
    setLoading(true);
    try {
      const body = {
        type: paymentData.type,
        amount: paymentData.amount,
        description: paymentData.description,
        paymentMethod: paymentData.paymentMethod,
        createdBy: user.id
      }
      if (editingPayment) {
        await paymentService.updatePayment(editingPayment.financialTransactionId, body);
        setModalSuccessMessage("Cập nhật giao dịch thành công");
      } else {
        await paymentService.createPayment(body);
        setModalSuccessMessage("Tạo giao dịch thành công");
      }
      setModalSuccessOpen(true);
      setModalOpen(false);
      await fetchPayments();
    } catch (error) {
      setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
      setModalFailedOpen(true);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (payment) => {
    setLoading(true);
    try {
      await paymentService.deletePayment(payment.financialTransactionId);
      await fetchPayments();
      setModalSuccessMessage("Xoá giao dịch thanh toán thành công");
      setModalSuccessOpen(true);
    } catch (error) {
      setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
      setModalFailedOpen(true);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buttonRef.current?.click();
    }
  };

  useEffect(() => {
    validateFields();
  }, [filterTransactionFromDate, filterTransactionToDate]);

  const validateFields = () => {
    if (filterTransactionToDate && filterTransactionFromDate > filterTransactionToDate) {
      setErrorToTransactionDate("Ngày giao dịch đến phải lớn hơn ngày giao dịch từ");
      return false;
    }
    setErrorToTransactionDate("");
    return true;
  };

  const handleApplyFilter = () => {
    if (validateFields()) {
      setPageIndex(0);
      fetchPayments();
    }
  };

  const handleClearFilter = () => {
    setFilterType(null);
    setFilterTransactionFromDate("");
    setFilterTransactionToDate("");
    setErrorToTransactionDate("");
    setPageIndex(0);
  };

  if (!pageReady) return <Loader />

  return (
    <div className="flex flex-col p-4">
      <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4 justify-between">
        <div className="flex flex-col mr-4">
          <h1 className="text-2xl font-bold">Danh sách phiếu giao dịch</h1>
        </div>
        <div className="flex flex-col gap-2">
          <button
            className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto px-4"
            onClick={handleCreate}
          >
            Tạo phiếu giao dịch mới
          </button>
        </div>
      </div>

      {/* Filter sidebar */}
      <div className="p-4 rounded-2xl bg-white h-auto w-full mb-4">
        <h2 className="text-xl font-bold">Lọc phiếu giao dịch</h2>
        <div className="flex items-center my-4 gap-4">
          <div className="mt-2 w-[24.25%]">
            <label className="mr-2">Trạng thái:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={filterType || ""}
              onChange={(e) => setFilterType(e.target.value)}
              onKeyDown={handleKeyDown}
            >
              <option value="">Tất cả</option>
              <option value={0}>{getFinancialTransactionTypeText(0)}</option>
              <option value={1}>{getFinancialTransactionTypeText(1)}</option>
              <option value={2}>{getFinancialTransactionTypeText(2)}</option>
              <option value={3}>{getFinancialTransactionTypeText(3)}</option>
              <option value={4}>{getFinancialTransactionTypeText(4)}</option>
              <option value={5}>{getFinancialTransactionTypeText(5)}</option>
            </select>
          </div>
          <div className="mt-2 w-[24.25%]">
            <label className="mr-2">Giao dịch từ ngày:</label>
            {/* <DateInput
              className="w-full p-1.5 border border-gray-300 rounded block"
              value={filterTransactionFromDate}
              onChange={(e) => setFilterTransactionFromDate(e)}
            /> */}
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded"
              value={filterTransactionFromDate && formatDateToInput(filterTransactionFromDate)}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setFilterTransactionFromDate(date);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="mt-2 w-[24.25%]">
            <label className="mr-2">Đến ngày:</label>
            {/* <DateInput
              className="w-full p-1.5 border border-gray-300 rounded block"
              value={filterTransactionToDate}
              onChange={(e) => setFilterTransactionToDate(e)}
              onKeyDown={handleKeyDown}
            /> */}
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded"
              value={filterTransactionToDate && formatDateToInput(filterTransactionToDate)}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setFilterTransactionToDate(date);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        <div className="flex flex-col justify-center">
          {errorToTransactionDate && <span className="text-red-500 text-center mb-2">{errorToTransactionDate}</span>}
          <div className="flex flex-row items-center justify-center gap-4">
            <button
              className="px-4 py-2 background-primary text-white rounded cursor-pointer"
              onClick={() => handleApplyFilter()}
              ref={buttonRef}
            >
              Lọc
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
              onClick={() => handleClearFilter()}
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <TableCommon
        headers={headerData}
        tableData={payments}
        defaultSortColumn="transactionDate"
        defaultSortType="desc"
        rowPerPage={rowPerPage}
        pageIndex={pageIndex}
        totalCount={totalCount}
        rowPerPageOptions={[5, 10, 20]}
        handleChangePage={handleChangePage}
        handleChangeRowPerPage={handleChangeRowPerPage}
        usePagination={true}
        useAction={true}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        messagePopupDelete={'Bạn có muốn xóa giao dịch này không?'}
        navigateDetail={(item) => router.push(`/payment/details/${item.financialTransactionId}`)}
      />
      <PaymentForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        initialData={editingPayment}
        mode="Others"
      />
      <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
      <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
    </div>
  )
}

