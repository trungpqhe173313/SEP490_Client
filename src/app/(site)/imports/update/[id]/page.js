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

export default function UpdateImport({ params }) {
    const router = useRouter();
    const { setLoading } = useLoading();
    const { id } = React.use(params);
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState(rows);
    const [importData, setImportData] = useState(null);
    const today = new Date();

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

    const navigate = (path) => {
        setLoading(true);
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

                setRows(updatedProducts);
                setFilteredRows(updatedProducts);

                // Calculate initial total price
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

    const fetchImport = async (id) => {
        setLoading(true);
        await importService.getImportDetail(id)
            .then((response) => {
                setImportData(response.data);
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

    const validateFields = () => {
        if (!expireDate) {
            setValidExpireDateMessage("Vui lòng nhập hạn sử dụng");
            return false;
        }
        if (expireDate < today) {
            setValidExpireDateMessage("Hạn sử dụng phải là tương lai");
            return false;
        }
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
        if (!validateFields()) {
            return;
        }
        setLoading(true);
        const body = {
            products: rows
                .filter((r) => r.quantity !== 0 && r.unitPrice !== 0)
                .map((r) => ({
                    productId: r.productId,
                    quantity: r.quantity,
                    unitPrice: r.unitPrice
                })),
            expireDate: expireDate,
            note: note
        }
        console.log(body);
        // await importService.updateImport(body)
        //     .then((response) => {
        //         setModalSuccessMessage("Cập nhật phiếu nhập kho thành công");
        //         setModalSuccessOpen(true);
        //     })
        //     .catch((error) => {
        //         setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
        //         setModalFailedSubMessages(error.response.data.error.messages);
        //         setModalFailedOpen(true);
        //     });
        setLoading(false);
    }

    const handleChangeProduct = (id, field, value) => {
        const newValue = Number(value) || 0;

        // Update rows first
        const updatedRows = rows.map(r =>
            r.productId === id ? { ...r, [field]: newValue } : r
        );

        setRows(updatedRows);
        setFilteredRows(updatedRows.map(r => ({ ...r })));

        // Calculate total price after state update
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
            (p) => searchTerm === "" || p.code.toLowerCase().includes(searchTerm.toLowerCase()) || p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredRows(filteredRows);
    };

    useEffect(() => {
        handleSearch(searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        fetchImport(id);
    }, []);

    return (
        <div className="p-4 bg-gray-50 h-auto flex gap-6 grid grid-cols-4">
            <div className="col-span-3">
                <div className="flex items-center rounded-md shadow-md p-4 bg-white gap-4 mb-4">
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/imports")}
                        sx={{ backgroundColor: "#00a544", color: "white" }}
                    >
                        Quay lại
                    </Button>
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
                                            Chưa có dữ liệu, xin hãy chọn nhà cung cấp trước
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
                                                sx={{ marginRight: "10px", border: "1px solid #ccc", height: "28px" }}
                                            >
                                                <RemoveIcon fontSize="small" />
                                            </IconButton>
                                            <TextField
                                                type="number"
                                                size="small"
                                                inputProps={{
                                                    min: 0,
                                                    style: { width: 40, textAlign: "center", height: "10px" },
                                                }}
                                                value={r.quantity}
                                                error={r.quantity < 0}
                                                onChange={(e) => handleChangeProduct(r.productId, "quantity", e.target.value)}
                                                variant="outlined"
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => handleChangeProduct(r.productId, "quantity", r.quantity + 1)}
                                                sx={{ marginLeft: "10px", border: "1px solid #ccc", height: "28px" }}
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
                                                value={r.unitPrice || 0}
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
                                                value={r.discount || 0}
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
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => { setModalSuccessOpen(false), navigate("/imports") }} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    );
}