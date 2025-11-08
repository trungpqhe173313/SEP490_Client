"use client";
import React, { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import { exportService } from "@/services/export.service";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";

export default function UpdateExport({ params }) {
    const router = useRouter();
    const { id } = React.use(params);
    const { setLoading } = useLoading();
    const [products, setProducts] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productsForSearch, setProductsForSearch] = useState([]);
    const [productLoading, setProductLoading] = useState(false);

    const [exportData, setExportData] = useState(null);

    const [cart, setCart] = useState([]);
    const [status, setStatus] = useState("");
    const [note, setNote] = useState("");
    const [totalPrice, setTotalPrice] = useState(0);

    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    const [errors, setErrors] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 18;

    const navigate = (path) => {
        setLoading(true);
        router.push(path);
    };

    const fetchExport = async () => {
        setLoading(true);
        await exportService.getExportDetail(id).then((response) => {
            setExportData(response.data);
            setStatus(response.data.status);
            setNote(response.data.list[0].note);
            fetchProducts(response.data.list);
        }).catch((error) => {
            console.log(error);
        })
    };

    const fetchProducts = async (exportData) => {
        const body = { pageIndex: 1, pageSize: 1000, productName: "" };
        await productService.getProductAvailable(body)
            .then((response) => {
                const cartItems = response.data.items.map((product) => {
                    const exportProduct = exportData.find((p) => p.productId === product.productId);
                    if (exportProduct) {
                        return {
                            ...product,
                            orderQuantity: exportProduct.quantity,
                            unitPrice: exportProduct.unitPrice
                        };
                    }
                    return null;
                }).filter(item => item !== null);

                setCart(cartItems);
                const total = cartItems.reduce((total, item) =>
                    total + (item.unitPrice * item.orderQuantity), 0
                );
                setTotalPrice(total);
                setProducts(response.data.items);
                setProductsForSearch(response.data.items);
            })
            .catch((error) => {
                console.log(error);
            });
        setLoading(false);
    };

    useEffect(() => {
        console.log(cart);
    }, [cart]);

    const searchProducts = async (name) => {
        try {
            setProductLoading(true);
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                productName: name,
            }
            const response = await productService.getProductAvailable(body);
            setProductsForSearch(response.data.items);
        } catch (error) {
            console.log(error);
        } finally {
            setProductLoading(false);
        }
    }

    useEffect(() => {
        fetchExport();
    }, []);

    const handleAddCart = (product) => {
        const existingProduct = cart.find((p) => p.productId === product.productId);
        if (existingProduct) {
            handleChangeCart(product.productId, "orderQuantity", existingProduct.orderQuantity + 1);
        } else {
            setCart((prev) => {
                const newProduct = { ...product, orderQuantity: 1, unitPrice: product.averageCost || 0 };
                const updatedCart = [...prev, newProduct];
                const newTotalPrice = updatedCart.reduce((total, item) => total + (item.unitPrice * item.orderQuantity), 0);
                setTimeout(() => {
                    setTotalPrice(newTotalPrice);
                }, 0);
                return updatedCart;
            });
        }
    };

    const handleRemoveCart = (productId) => {
        setCart((prev) => prev.filter((p) => p.productId !== productId));
    };

    const handleChangeCart = (id, field, value) => {
        setCart((prev) => {
            const updatedCart = prev.map((product) =>
                product.productId === id
                    ? { ...product, [field]: Number(value) || 0 }
                    : product
            );
            const newTotalPrice = updatedCart.reduce((total, item) => total + (item.unitPrice * item.orderQuantity), 0);
            setTimeout(() => {
                setTotalPrice(newTotalPrice);
            }, 0);
            return updatedCart;
        });
    };

    const handleChangeDropdown = (item, field) => {
        if (field === "customerId") {
            setSelectedCustomer(item);
        }
        if (field === "productId") {
            if (item) {
                handleAddCart(item);
                setTimeout(() => {
                    setSelectedProduct(null);
                }, 0);
            }
        }
    };
    const formatLargeNumber = (number) => {
        if (number === null) return 0;
        return number.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
    }

    const validateFields = () => {
        if (cart.filter((p) => p.orderQuantity > 0 && p.unitPrice > 0).length === 0) {
            setErrors("Sản phẩm không được để trống");
            return false;
        }
        if (cart.find((p) => p.orderQuantity > p.quantity)) {
            setErrors("Sản phẩm đặt hàng đang lớn hơn sản phẩm trong kho");
            return false;
        }
        if (cart.find((p) => p.orderQuantity < 0)) {
            setErrors("Số lượng sản phẩm không thể là số âm");
            return false;
        }
        if (cart.find((p) => p.unitPrice < 0)) {
            setErrors("Giá sản phẩm không thể là số âm");
            return false;
        }
        return true;
    }

    const handleSubmit = async () => {
        if (!validateFields()) return;
        setLoading(true);
        const body = {
            note,
            listProductOrder: cart.filter((p) => p.orderQuantity > 0 && p.unitPrice > 0).map((p) => ({ productId: p.productId, quantity: p.orderQuantity, unitPrice: p.unitPrice })),
            status: parseInt(status)
        };
        await exportService.updateExport(id, body)
            .then((response) => {
                setModalSuccessMessage("Chỉnh sửa phiếu xuất kho thành công");
                setModalSuccessOpen(true);
            })
            .catch((error) => {
                setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
                setModalFailedSubMessages(error.response.data.error.messages);
                setModalFailedOpen(true);
            });
        setLoading(false);
    }

    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    return (
        <div className="grid grid-cols-10 gap-4 px-4">
            <div className="col-span-6 mt-4 h-[90vh] justify-between flex flex-col">
                <div>
                    <div className="mb-4 p-4 bg-white rounded-xl">
                        <p className="text-xl font-bold">Tìm kiếm sản phẩm</p>
                        <AutocompleteCommon
                            name="productId"
                            value={selectedProduct}
                            loading={productLoading}
                            options={productsForSearch}
                            onSelect={(item) => handleChangeDropdown(item, "productId")}
                            onSearch={searchProducts}
                            getOptionLabel={(option) => option.productName}
                            getOptionKey={(option) => option.productId}
                        />
                    </div>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow className="background-primary">
                                    <TableCell sx={{ color: "white" }}>Mã hàng</TableCell>
                                    <TableCell sx={{ color: "white" }}>Tên hàng</TableCell>
                                    <TableCell sx={{ color: "white" }} align="center">Số lượng</TableCell>
                                    <TableCell sx={{ color: "white" }} align="center">Đơn giá</TableCell>
                                    <TableCell sx={{ color: "white" }} align="right">Thành tiền</TableCell>
                                    <TableCell sx={{ color: "white" }} align="center">Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cart.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <p className="my-10 text-xl">
                                                Chưa có sản phẩm
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cart.map((product) => (
                                        <TableRow key={product.productId} hover>
                                            <TableCell>{product.code}</TableCell>
                                            <TableCell>{product.productName}</TableCell>
                                            <TableCell align="center" >
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleChangeCart(product.productId, "orderQuantity", product.orderQuantity - 1)}
                                                    disabled={product.orderQuantity <= 0}
                                                    sx={{ marginRight: "10px", border: "1px solid #ccc", height: "28px" }}
                                                >
                                                    <RemoveIcon fontSize="small" />
                                                </IconButton>
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    inputProps={{
                                                        min: 0,
                                                        style: {
                                                            width: 40,
                                                            textAlign: "center",
                                                            height: "10px",
                                                            color: product.orderQuantity > product.quantity ? 'red' : 'inherit'
                                                        },
                                                    }}
                                                    value={product.orderQuantity}
                                                    onChange={(e) => handleChangeCart(product.productId, "orderQuantity", e.target.value)}
                                                    variant="outlined"
                                                    error={product.orderQuantity > product.quantity || product.orderQuantity < 0}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            '& fieldset': {
                                                                borderColor: product.orderQuantity > product.quantity ? 'red' : 'inherit',
                                                            },
                                                        },
                                                    }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleChangeCart(product.productId, "orderQuantity", product.orderQuantity + 1)}
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
                                                    error={product.unitPrice < 0}
                                                    value={product.unitPrice}
                                                    onChange={(e) => handleChangeCart(product.productId, "unitPrice", e.target.value)}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                {isNaN(product.unitPrice * product.orderQuantity) ? 0 : (product.unitPrice * product.orderQuantity).toLocaleString()} ₫
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveCart(product.productId)}
                                                    sx={{ backgroundColor: "red", height: "28px", color: "white" }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    )))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
                <div className="w-full bg-white rounded-xl h-auto p-4 flex flex-row items-center justify-between">
                    <div className="w-3/5 flex flex-row gap-4">
                        <textarea
                            placeholder="Ghi chú"
                            value={note || ""}
                            onChange={(e) => setNote(e.target.value)}
                            className="p-2 border border-gray-300 rounded bg-white w-full"
                        />
                        <div>
                            <label className="block text-md font-bold">Trạng thái</label>
                            <select
                                name="status"
                                value={status || 0}
                                disabled={status === 4}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-auto p-2 border border-gray-300 rounded-md"
                            >
                                <option value={0}>Nháp</option>
                                <option value={1}>Lên đơn</option>
                                <option value={2}>Đang giao</option>
                                <option value={3}>Đã giao</option>
                                <option value={4}>Đã hủy</option>
                            </select>
                        </div>
                    </div>
                    <div className="text-right mr-4">
                        <p>Tổng số lượng: {cart.length} sản phẩm</p>
                        <p className="text-xl font-bold">Tổng tiền hàng: {formatLargeNumber(totalPrice)} ₫</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl h-[90vh] col-span-4 mt-4 w-full flex flex-col items-center justify-between">
                <div>
                    <div className="w-full flex flex-row items-center">
                        <div className="w-full mt-4">
                            <p className="text-xl font-bold">Khách hàng</p>
                            <input
                                type="text"
                                disabled
                                value={exportData?.customer.fullName || ""}
                                className="p-2 bg-white w-full border-1 border-gray-300 rounded"
                            />
                        </div>

                    </div>
                    <div className="w-full grid grid-cols-2 py-4 gap-2 overflow-y-scroll scrollbar-hidden">
                        {currentProducts.map((product) => (
                            <div
                                key={product.productId}
                                className="flex col-span-1 p-2 gap-2 cursor-pointer border-1 border-white hover:border-green-600 rounded-xl"
                                onClick={() => handleAddCart(product)}
                            >
                                <div className="h-full">
                                    <InsertPhotoIcon sx={{ height: '100%', width: 'auto' }} />
                                </div>
                                <div>
                                    <p className="text-sm text-ellipsis whitespace-nowrap">
                                        {product.productName}
                                    </p>
                                    <p className="text-green-600 font-bold">{formatLargeNumber(product.averageCost)}</p>
                                </div>
                            </div>
                        ))
                        }
                    </div>
                </div>
                {errors && <p className="text-red-600">{errors}</p>}
                <div className="w-full flex flex-row items-center p-4 justify-between">
                    <div className="flex justify-center gap-2 items-center">
                        <IconButton
                            size="small"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ArrowBackIosNewIcon />
                        </IconButton>
                        <p>{currentPage} / {totalPages}</p>
                        <IconButton
                            size="small"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ArrowForwardIosIcon />
                        </IconButton>
                    </div>
                    <button
                        className="background-primary background-hovered text-white text-2xl font-bold py-2 px-4 rounded"
                        onClick={() => handleSubmit()}>
                        Hoàn thành chỉnh sửa
                    </button>
                </div>
            </div>
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => { setModalSuccessOpen(false), navigate("/exports") }} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    );
}
