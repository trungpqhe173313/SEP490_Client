"use client";
import React, { useState, useEffect } from "react";
import { exportService } from "@/services/export.service";
import { importService } from "@/services/import.service";
import { returnService } from "@/services/return.service";
import { priceListService } from "@/services/priceList.service";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    TablePagination,
    IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import { useLogin } from "@/context/LoginContext";
import Loader from "@/components/Loader/loader";
import { formatLargeNumber } from '@/lib/formattingLib';


export default function Returns({ params }) {
    const { mode, type, id } = React.use(params);
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();
    const { loading, setLoading } = useLoading();
    const [priceList, setPriceList] = useState(null);
    const [transaction, setTransaction] = useState(null);

    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState(rows);
    const [reason, setReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [totalCost, setTotalCost] = useState(0);

    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [searchTerm, setSearchTerm] = useState("");
    const [errors, setErrors] = useState("");
    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Manager"];

    const reasons = [
        "Sai số lượng hàng hóa",
        "Có dấu hiệu hư hỏng",
        "Không đúng mã hàng",
        "Chất lượng hàng hóa không đảm bảo",
        "Mặt hàng đã hết hạn sử dụng",
        "Thiếu chứng từ",
        "Khác"
    ];

    // Check authorization
    useEffect(() => {
        refreshUserInfo();
    }, []);

    useEffect(() => {
        if (loading) return;

        if (!isLogin) {
            router.push("/login");
            return;
        }

        if (user?.roles && user.roles.some((r) => pageRole.includes(r))) {
            setPageReady(true);
        } else {
            router.push("/");
        }

    }, [isLogin, user, loading]);

    const paginatedRows = filteredRows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const navigate = (path) => {
        router.push(path);
    };

    const fetchTransaction = async () => {
        if (!id) return;
        setLoading(true);
        try {
            if (type === "import") {
                const response = await importService.getImportDetail(id);
                setTransaction(response.data);
            } else {
                const response = await exportService.getExportDetail(id);
                setTransaction(response.data);
                (transaction.priceListId) && fetchPriceList(transaction.priceListId);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const fetchPriceList = async (priceListId) => {
        if (!priceListId) return;
        try {
            const response = await priceListService.getPriceListByID(priceListId);
            setPriceList(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    const fetchRows = async () => {
        setLoading(true);
        const updatedProducts = transaction.list.map((p) => {
            return {
                ...p,
                returnQuantity: 0,
            };
        });
        setRows(updatedProducts);
        setFilteredRows(updatedProducts);
        setLoading(false);
    }

    useEffect(() => {
        const overQuantity = filteredRows.find((r) => r.returnQuantity > r.quantity);
        if (overQuantity) {
            handleChangeProduct(overQuantity.productId, "returnQuantity", overQuantity.quantity);
        }
    }, [rows]);

    const validateProducts = () => {
        if (rows.filter((r) => r.returnQuantity > 0).length === 0) {
            setModalFailedMessage("Sản phẩm không được để trống");
            setModalFailedOpen(true);
            return false;
        }
        if (rows.find((r) => r.returnQuantity < 0)) {
            setModalFailedMessage("Số lượng sản phẩm không thể là số âm");
            setModalFailedOpen(true);
            return false;
        }
        if (rows.find((r) => r.returnQuantity > r.quantity)) {
            setModalFailedMessage("Không thể trả quá số lượng đã đặt");
            setModalFailedOpen(true);
            return false;
        }
        return true;
    }

    const handleSubmit = async () => {
        if (!validateProducts()) {
            return;
        }
        setLoading(true);
        const body = {
            listProductOrder: rows
                .filter((r) => r.returnQuantity !== 0)
                .map((r) => ({
                    productId: r.productId,
                    quantity: r.returnQuantity,
                    unitPrice: r.unitPrice
                })),
            totalCost: totalCost,
            reason: customReason,
            note: transaction.list[0].note || '',
            priceListId: transaction.priceListId ? transaction.priceListId : null,
        }
        if (mode === "create") {
            if (type === "import") {
                try {
                    await returnService.createImportReturn(transaction.transactionId, body);
                    setModalSuccessMessage("Tạo phiếu trả hàng nhập kho thành công");
                    setModalSuccessOpen(true);
                } catch (error) {
                    setModalFailedMessage(`Lỗi ${error?.response?.data?.statusCode}: ${error?.response?.data?.error?.message}`);
                    setModalFailedSubMessages(error?.response?.data?.error?.messages || []);
                    setModalFailedOpen(true);
                } finally {
                    setLoading(false);
                }
            } else {
                try {
                    await returnService.createExportReturn(transaction.transactionId, body);
                    setModalSuccessMessage("Tạo phiếu trả hàng xuất kho thành công");
                    setModalSuccessOpen(true);
                } catch (error) {
                    setModalFailedMessage(`Lỗi ${error?.response?.data?.statusCode}: ${error?.response?.data?.error?.message}`);
                    setModalFailedSubMessages(error?.response?.data?.error?.messages || []);
                    setModalFailedOpen(true);
                } finally {
                    setLoading(false);
                }
            }
        }
        setLoading(false);
    }

    useEffect(() => {
        if (!transaction) return;
        fetchRows();
    }, [transaction]);

    const handleChangeProduct = (id, field, value) => {
        const newValue = Number(value) || 0;

        const updatedRows = rows.map(r =>
            r.productId === id ? { ...r, [field]: newValue } : r
        );

        setRows(updatedRows);
        setFilteredRows(updatedRows.map(r => ({ ...r })));

        const newTotalCost = updatedRows.reduce(
            (total, item) => total + (item.returnQuantity * (item.unitPrice || 0)),
            0
        );
        setTotalCost(newTotalCost);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (searchTerm) => {
        const filteredRows = rows.filter(
            (p) => searchTerm === "" || p.code.toLowerCase().includes(searchTerm.toLowerCase()) || p.productName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredRows(filteredRows);
    };

    useEffect(() => {
        handleSearch(searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        if (!pageReady) return;
        fetchTransaction();
    }, [pageReady]);

    const handleSelect = (e) => {
        const value = e.target.value;
        setReason(value);
        setCustomReason(value === "Khác" ? "" : value);
    };

    const handleCustomReason = (e) => {
        setCustomReason(e.target.value);
    };

    const removeLeadingZero = (number) => {
        if (number === null || isNaN(number) || number == 0) return 0;
        return number.toString().replace(/^0+/, '');
    }

    const handleExit = () => {
        if (type === "import") {
            router.push("/returns/import");
        } else {
            router.push("/returns/export");
        }
    }

    if (!pageReady) return <Loader />

    return (
        <div className="p-4 bg-gray-50 h-auto flex gap-6 grid grid-cols-4">
            <div className="col-span-3">
                <div className="flex items-center rounded-md shadow-md p-4 bg-white gap-4 mb-4">
                    <h1 className="text-2xl font-bold">{mode === "create" ? "Tạo" : "Cập nhật"} phiếu trả hàng {type === "import" ? "nhập" : "xuất"} kho</h1>
                    <TextField
                        label="Tìm kiếm theo tên hoặc mã"
                        variant="outlined"
                        size="small"
                        sx={{ width: "30em" }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Table */}
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow className="background-primary">
                                <TableCell sx={{ color: "white" }}>Mã hàng</TableCell>
                                <TableCell sx={{ color: "white" }}>Tên hàng</TableCell>
                                <TableCell sx={{ color: "white" }} align="center">Giá bán</TableCell>
                                <TableCell sx={{ color: "white" }} align="center">Số lượng trả (Bao)</TableCell>
                                <TableCell sx={{ color: "white" }} align="right">Thành tiền trả (VND)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <p className="my-10 text-xl">
                                            Không tìm thấy sản phẩm
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedRows.map((r) => (
                                    <TableRow key={r.productId} hover>
                                        <TableCell>{r.code}</TableCell>
                                        <TableCell>{r.productName}</TableCell>
                                        <TableCell align="center">{formatLargeNumber(r.unitPrice)}</TableCell>
                                        <TableCell align="center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleChangeProduct(r.productId, "returnQuantity", r.returnQuantity - 1)}
                                                        disabled={r.returnQuantity <= 0}
                                                        sx={{ border: "1px solid #ccc", height: "28px" }}
                                                    >
                                                        <RemoveIcon fontSize="small" />
                                                    </IconButton>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        inputProps={{
                                                            min: 0,
                                                            style: { width: 70, textAlign: "center", height: "10px" },
                                                        }}
                                                        sx={{marginX: '5px'}}
                                                        error={r.returnQuantity < 0 || r.returnQuantity > r.quantity}
                                                        value={removeLeadingZero(r.returnQuantity)}
                                                        onChange={(e) => handleChangeProduct(r.productId, "returnQuantity", e.target.value)}
                                                        variant="outlined"
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleChangeProduct(r.productId, "returnQuantity", r.returnQuantity + 1)}
                                                        disabled={r.returnQuantity >= r.quantity}
                                                        sx={{ border: "1px solid #ccc", height: "28px" }}
                                                    >
                                                        <AddIcon fontSize="small" />
                                                    </IconButton>
                                                </div>
                                                <span className="text-lg text-gray-500">/{r.quantity}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell align="right">
                                            {(r.returnQuantity * r.unitPrice).toLocaleString('vi-VN')}₫
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={filteredRows.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 20]}
                        labelRowsPerPage="Số dòng mỗi trang:"
                        labelDisplayedRows={({ from, to, count }) => `Từ ${from}-${to} trong tổng ${count} dòng`}
                    />
                </TableContainer>
            </div>

            {/* Summary Card */}
            <div className="w-full bg-white rounded-md shadow-md p-4 flex flex-col col-span-1">
                <h3 className="font-semibold mb-4">Tổng hợp</h3>
                <div className="flex justify-between mb-2 text-sm">
                    <span>Tổng số lượng sản phẩm trả:</span>
                    <span>{rows.reduce((total, row) => total + row.returnQuantity, 0)}</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                    <span>Tổng tiền trả:</span>
                    <span>{totalCost?.toLocaleString('vi-VN') || 0} ₫</span>
                </div>
                {transaction?.supplier && <div className="my-4">
                    <label className="block text-md font-bold">Nhà cung cấp</label>
                    <input
                        type="text"
                        name="supplierName"
                        disabled
                        value={transaction?.supplier?.supplierName || ""}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>}
                {transaction?.customer && <div className="my-4">
                    <label className="block text-md font-bold">Khách hàng</label>
                    <input
                        type="text"
                        name="customerName"
                        disabled
                        value={transaction?.customer?.fullName || ""}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>}
                <div className="my-4">
                    <label className="block text-md font-bold">Nhà kho</label>
                    <input
                        type="text"
                        name="warehouseName"
                        disabled
                        value={transaction?.warehouseName || ""}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div className="my-4">
                    <div className="flex flex-col gap-3">
                        <label className="block text-md font-bold">Lí do</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={reason}
                            onChange={handleSelect}
                        >
                            <option value="">-- Chọn lý do --</option>
                            {reasons.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                        {reason === "Khác" && <textarea
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Nhập lý do khác..."
                            onChange={handleCustomReason}
                        />}
                    </div>
                </div>
                <button className="background-primary background-hovered cursor-pointer mt-auto py-2 rounded" onClick={handleSubmit}>
                    Hoàn thành
                </button>
            </div>
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => { setModalSuccessOpen(false), handleExit() }} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}