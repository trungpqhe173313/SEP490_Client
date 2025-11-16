"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";

import { productService } from "@/services/product.service";
import { importService } from "@/services/import.service";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TextField,
    TablePagination,
    Button
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLogin } from "@/context/LoginContext";
import Loader from "@/components/Loader/loader";

export default function UpdateImport({ params }) {
    const router = useRouter();
    const { loading, setLoading } = useLoading();
    const { id } = React.use(params);
    const { isLogin, user, refreshUserInfo } = useLogin();
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState(rows);
    const [importData, setImportData] = useState(null);
    const today = new Date();

    const [status, setStatus] = useState(null);
    const [expireDate, setExpireDate] = useState("");
    const [note, setNote] = useState("");

    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [searchTerm, setSearchTerm] = useState("");

    const [validExpireDateMessage, setValidExpireDateMessage] = useState("");
    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Manager"];

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

    const navigate = (path) => {
        router.push(path);
    };

    const [totalPrice, setTotalPrice] = useState(0);

    const paginatedRows = filteredRows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const formatDateToInput = (dt) => {
        return dt.toISOString().split('T')[0];
    }

    const removeLeadingZero = (number) => {
        if (number === null || isNaN(number)) return 0;
        return number.toString().replace(/^0+/, '');
    }

    const fetchProduct = (data) => {
        const body = { pageIndex: 1, pageSize: 1000, isActive: true, productName: "", supplierId: data.supplier.supplierId };
        productService
            .getAllProducts(body)
            .then((response) => {
                const updatedProducts = response.data.items.map((p) => {
                    const productInList = data.list.find(
                        (l) => l.productId === p.productId
                    );
                    return {
                        ...p,
                        quantity: productInList ? productInList.quantity : 0,
                        unitPrice: productInList ? productInList.unitPrice : p.unitPrice || 0,
                        discount: productInList ? productInList.discount : 0
                    };
                });

                setRows(updatedProducts.filter((p) => p.quantity > 0 && p.unitPrice > 0));
                setFilteredRows(updatedProducts.filter((p) => p.quantity > 0 && p.unitPrice > 0));

                const initialTotal = updatedProducts.reduce(
                    (total, item) => total + (item.quantity * (item.unitPrice || 0)),
                    0
                );
                setTotalPrice(initialTotal);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const fetchImport = async () => {
        setLoading(true);
        if (!id) return;
        await importService.getImportDetail(id)
            .then((response) => {
                setImportData(response.data);
                setStatus(response.data.status);
                setExpireDate(new Date(response.data.list[0].expireDate));
                setNote(response.data.list[0].note);
                fetchProduct(response.data);
                setTotalPrice(response.data.list.reduce((total, item) => total + item.quantity * item.unitPrice, 0));
            })
            .catch((error) => {
                console.log(error);
            });
        setLoading(false);
    }

    useEffect(() => {
        validateFields();
    }, [expireDate]);

    const validateFields = () => {
        if (!expireDate) {
            setValidExpireDateMessage("Vui lòng nhập hạn sử dụng");
            return false;
        }
        if (expireDate < today) {
            setValidExpireDateMessage("Hạn sử dụng phải là tương lai");
            return false;
        }
        setValidExpireDateMessage("");
        return true;
    }

    const validateProducts = () => {
        if (rows.filter((r) => r.quantity > 0 && r.unitPrice > 0).length === 0) {
            setModalFailedMessage("Sản phẩm không được để trống");
            setModalFailedOpen(true);
            return false;
        }
        if (rows.find((r) => r.quantity < 0)) {
            setModalFailedMessage("Số lượng sản phẩm không thể là số âm");
            setModalFailedOpen(true);
            return false;
        }
        if (rows.find((r) => r.unitPrice < 0)) {
            setModalFailedMessage("Giá sản phẩm không thể là số âm");
            setModalFailedOpen(true);
            return false;
        }
        if (rows.find((r) => r.discount < 0)) {
            setModalFailedMessage("Giá khuyến mãi không thể là số âm");
            setModalFailedOpen(true);
            return false;
        }
        if (rows.find((r) => r.discount > r.unitPrice)) {
            setModalFailedMessage("Giá khuyến mãi không thể lớn hơn giá gốc");
            setModalFailedOpen(true);
            return false;
        }
        return true;
    }

    const handleSubmit = async () => {
        if (!validateFields() || !validateProducts()) {
            return;
        }
        setLoading(true);
        const body = {
            listProductOrder: rows
                .filter((r) => r.quantity !== 0 && r.unitPrice !== 0)
                .map((r) => ({
                    productId: r.productId,
                    quantity: r.quantity,
                    unitPrice: r.unitPrice
                })),
            status: parseInt(status),
            expireDate: expireDate,
            totalCost: totalPrice,
            note: note
        }
        await importService.updateImport(id, body)
            .then((response) => {
                setModalSuccessMessage("Cập nhật phiếu nhập kho thành công");
                setModalSuccessOpen(true);
            })
            .catch((error) => {
                console.log(error);
                setModalFailedMessage(`Lỗi ${error?.response?.data?.statusCode}: ${error?.response?.data?.error?.message}`);
                setModalFailedSubMessages(error?.response?.data?.error?.messages || []);
                setModalFailedOpen(true);
            });
        setLoading(false);
    }

    const handleChangeProduct = (id, field, value) => {
        const newValue = Number(value) || 0;

        const updatedRows = rows.map(r =>
            r.productId === id ? { ...r, [field]: newValue } : r
        );

        setRows(updatedRows);
        setFilteredRows(updatedRows.map(r => ({ ...r })));

        const newTotalPrice = updatedRows.reduce(
            (total, item) => total + (item.quantity * (item.unitPrice || 0)),
            0
        );
        setTotalPrice(newTotalPrice);
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
            (p) => searchTerm === "" || p.code.toLowerCase().includes(searchTerm.toLowerCase()) || p.productName.toLowerCase().includes(searchTerm.toLowerCase()) && p.quantity > 0 && p.unitPrice > 0
        );
        setFilteredRows(filteredRows.filter((r) => r.quantity !== 0 && r.unitPrice !== 0));
    };

    useEffect(() => {
        handleSearch(searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        if (!pageReady) return;
        fetchImport();
    }, [pageReady]);

    if (!pageReady) { 
        return <Loader />
    };

    return (
        <div className="p-4 bg-gray-50 h-auto flex gap-6 grid grid-cols-4">
            <div className="col-span-3">
                <div className="flex items-center rounded-md shadow-md p-4 bg-white gap-4 mb-4">
                    <h1 className="text-2xl font-bold">Cập nhật phiếu nhập</h1>
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
                                <TableCell sx={{ color: "white" }} align="center">Số lượng</TableCell>
                                <TableCell sx={{ color: "white" }} align="center">Đơn giá</TableCell>
                                <TableCell sx={{ color: "white" }} align="center">Giảm giá</TableCell>
                                <TableCell sx={{ color: "white" }} align="right">Thành tiền</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <p className="my-10 text-xl">
                                            Không tìm thấy sản phẩm hoặc chưa chọn nhà cung cấp
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedRows.map((r) => (
                                    <TableRow key={r.productId} hover>
                                        <TableCell>{r.code}</TableCell>
                                        <TableCell>{r.productName}</TableCell>
                                        <TableCell align="center" >
                                            <IconButton
                                                size="small"
                                                onClick={() => handleChangeProduct(r.productId, "quantity", r.quantity - 1)}
                                                disabled={r.quantity <= 0}
                                                sx={{ border: "1px solid #ccc", height: "28px", width: "auto" }}
                                            >
                                                <RemoveIcon fontSize="small" />
                                            </IconButton>
                                            <TextField
                                                type="number"
                                                size="small"
                                                inputProps={{
                                                    min: 0,
                                                    style: { width: 50, textAlign: "center", height: 10 },
                                                }}
                                                sx={{ marginX: "5px" }}
                                                value={r.quantity}
                                                error={r.quantity < 0}
                                                onChange={(e) => handleChangeProduct(r.productId, "quantity", e.target.value)}
                                                variant="outlined"
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => handleChangeProduct(r.productId, "quantity", r.quantity + 1)}
                                                sx={{ border: "1px solid #ccc", height: "28px", width: "auto" }}
                                            >
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                type="number"
                                                size="small"
                                                inputProps={{
                                                    min: 0,
                                                    style: { width: 70, textAlign: "center", height: "10px" },
                                                }}
                                                error={r.unitPrice < 0}
                                                value={removeLeadingZero(r.unitPrice)}
                                                onChange={(e) => handleChangeProduct(r.productId, "unitPrice", e.target.value)}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                type="number"
                                                size="small"
                                                inputProps={{
                                                    min: 0,
                                                    style: { width: 70, textAlign: "center", height: "10px" },
                                                }}
                                                value={removeLeadingZero(r.discount)}
                                                error={r.discount > r.unitPrice || r.discount < 0}
                                                onChange={(e) =>
                                                    handleChangeProduct(r.productId, "discount", e.target.value)
                                                }
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            {(r.quantity * r.unitPrice).toLocaleString('vi-VN')}₫
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
                    />
                </TableContainer>
            </div>

            {/* Summary Card */}
            <div className="w-full bg-white rounded-md shadow-md p-4 flex flex-col col-span-1">
                <h3 className="font-semibold mb-4">Tổng hợp</h3>
                <div className="flex justify-between mb-2 text-sm">
                    <span>Tổng tiền hàng:</span>
                    <span>{totalPrice.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="my-4">
                    <label className="block text-md font-bold">Nhà kho</label>
                    <input type="text" name="warehouseName" disabled value={importData?.warehouseName || ""} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div className="my-4">
                    <label className="block text-md font-bold">Nhà cung cấp</label>
                    <input type="text" name="supplierName" disabled value={importData?.supplier?.supplierName || ""} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div className="my-4">
                    <label className="block text-md font-bold">Ngày hết hạn</label>
                    <input
                        type="date"
                        name="expireDate"
                        disabled
                        value={expireDate && formatDateToInput(expireDate)}
                        onChange={(e) => {
                            const date = new Date(e.target.value);
                            setExpireDate(date);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {validExpireDateMessage && <span className="text-red-500">{validExpireDateMessage}</span>}
                </div>
                <div className="my-4">
                    <label className="block text-md font-bold">Trạng thái</label>
                    <select
                        name="status"
                        value={status || 5}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        {/* <option value={0}>Lên đơn</option> */}
                        <option value={5}>Đang kiểm</option>
                        <option value={6}>Đã kiểm</option>
                    </select>
                </div>
                <div className="my-4">
                    <label className="block text-md font-bold">Ghi chú</label>
                    <textarea
                        type="text"
                        name="note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Nhập ghi chú"
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
                <button className="background-primary background-hovered cursor-pointer mt-auto py-2 rounded" onClick={handleSubmit}>
                    Hoàn thành
                </button>
            </div>
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => { setModalSuccessOpen(false), router.back() }} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    );
}