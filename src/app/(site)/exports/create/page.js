"use client";
import React, { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import { customerService } from "@/services/customer.service";
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
import { useLogin } from "@/context/LoginContext";
import Loader from "@/components/Loader/loader";
import { formatLargeNumber } from "@/lib/formatLargeNumber";

export default function CreateExport() {
    const router = useRouter();
    const { loading, setLoading } = useLoading();
    const { isLogin, user, refreshUserInfo } = useLogin();
    const [products, setProducts] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productsForSearch, setProductsForSearch] = useState([]);
    const [productLoading, setProductLoading] = useState(false);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [customerLoading, setCustomerLoading] = useState(false);

    const [cart, setCart] = useState([]);
    const [note, setNote] = useState("");

    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    const [errors, setErrors] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 14;
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

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                productName: "",
            }
            const response = await productService.getProductAvailable(body);
            setProducts(response.data.items);
            setProductsForSearch(response.data.items);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const searchProducts = async (name) => {
        try {
            setProductLoading(true);
            setProductsForSearch(products.filter((p) =>
                p.code.toLowerCase().includes(name.toLowerCase()) ||
                p.productName.toLowerCase().includes(name.toLowerCase())
            ));
        } catch (error) {
            console.log(error);
        } finally {
            setProductLoading(false);
        }
    }

    const fetchCustomers = async (name) => {
        try {
            setCustomerLoading(true);
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                fullName: name,
            }
            const response = await customerService.getAllCustomers(body);
            setCustomers(response.data.items);
        } catch (error) {
            console.log(error);
        } finally {
            setCustomerLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCustomers("");
        searchProducts("");
    }, []);

    const handleAddCart = (product) => {
        const existingProduct = cart.find((p) => p.productId === product.productId);
        if (existingProduct) {
            const updatedCart = cart.map((p) =>
                p.productId === product.productId ? { ...p, orderQuantity: (p.orderQuantity || 0) + 1 } : p
            );
            setCart(updatedCart);
            validateFields(updatedCart, selectedCustomer);
        } else {
            const newProduct = { ...product, orderQuantity: 1, unitPrice: product.averageCost || 0 };
            const updatedCart = [...cart, newProduct];
            setCart(updatedCart);
            validateFields(updatedCart, selectedCustomer);
        }
    };

    const handleRemoveCart = (productId) => {
        const updatedCart = cart.filter((p) => p.productId !== productId);
        setCart(updatedCart);
        validateFields(updatedCart, selectedCustomer);
    };

    const handleChangeCart = (id, field, value) => {
        const numericValue = field === "orderQuantity" || field === "unitPrice" ? (Number(value) || 0) : value;
        const updatedCart = cart.map((product) =>
            product.productId === id ? { ...product, [field]: numericValue } : product
        );
        setCart(updatedCart);
        validateFields(updatedCart, selectedCustomer);
    };

    const handleChangeDropdown = (item, field) => {
        if (field === "customerId") {
            setSelectedCustomer(item);
            validateFields(cart, item);
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

    const removeLeadingZero = (number) => {
        if (number === null || isNaN(number)) return 0;
        return number.toString().replace(/^0+/, '');
    }

    const validateFields = (cartArg = cart, selectedCustomerArg = selectedCustomer) => {
        if (selectedCustomerArg === null) {
            setErrors("Khách hàng không được để trống");
            return false;
        }
        if (cartArg.filter((p) => p.orderQuantity > 0 && p.unitPrice > 0).length === 0) {
            setErrors("Sản phẩm không được để trống");
            return false;
        }
        if (cartArg.find((p) => p.orderQuantity > p.quantity)) {
            setErrors("Sản phẩm đặt hàng đang lớn hơn sản phẩm trong kho");
            return false;
        }
        if (cartArg.find((p) => p.orderQuantity < 0)) {
            setErrors("Số lượng sản phẩm không thể là số âm");
            return false;
        }
        if (cartArg.find((p) => p.unitPrice < 0)) {
            setErrors("Giá sản phẩm không thể là số âm");
            return false;
        }
        setErrors("");
        return true;
    }

    const handleSubmit = async () => {
        if (!validateFields()) return;
        setLoading(true);
        const body = {
            note,
            totalCost: total,
            listProductOrder: cart.filter((p) => p.orderQuantity > 0 && p.unitPrice > 0).map((p) => ({ productId: p.productId, quantity: p.orderQuantity, unitPrice: p.unitPrice })),
        };
        await exportService.createExport(selectedCustomer.userId, body)
            .then((response) => {
                setModalSuccessMessage("Tạo phiếu xuất kho thành công");
                setModalSuccessOpen(true);
            })
            .catch((error) => {
                setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
                setModalFailedSubMessages(error.response.data.error.messages);
                setModalFailedOpen(true);
            });
        setLoading(false);
    }

    const total = cart.reduce((sum, p) => sum + p.unitPrice * p.orderQuantity, 0);

    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    if (!pageReady) {
        return <Loader />
    }

    return (
        <div className="grid grid-cols-10 gap-4 px-4 mt-4">
            <div className="col-span-6 justify-between flex flex-col">
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
                            getOptionLabel={(option) => `${option.code} - ${option.productName}`}
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
                                {cart.length == 0 ? (
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
                                                    sx={{ border: "1px solid #ccc", height: "28px" }}
                                                >
                                                    <RemoveIcon fontSize="small" />
                                                </IconButton>
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    inputProps={{
                                                        style: {
                                                            width: 50,
                                                            textAlign: "center",
                                                            height: 10,
                                                            color: product.orderQuantity > product.quantity ? 'red' : 'inherit'
                                                        },
                                                    }}
                                                    value={removeLeadingZero(product.orderQuantity)}
                                                    onChange={(e) => handleChangeCart(product.productId, "orderQuantity", e.target.value)}
                                                    variant="outlined"
                                                    error={product.orderQuantity > product.quantity || product.orderQuantity < 0}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            '& fieldset': {
                                                                borderColor: product.orderQuantity > product.quantity ? 'red' : 'inherit',
                                                            },
                                                        },
                                                        marginX: '5px'
                                                    }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleChangeCart(product.productId, "orderQuantity", product.orderQuantity + 1)}
                                                    sx={{ border: "1px solid #ccc", height: "28px" }}
                                                >
                                                    <AddIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell align="center">
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    inputProps={{
                                                        style: { width: 70, textAlign: "center", height: "10px" },
                                                    }}
                                                    value={removeLeadingZero(product.unitPrice)}
                                                    error={product.unitPrice < 0}
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
                    <input
                        type="text"
                        placeholder="Ghi chú"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="p-2 border border-gray-300 rounded ml-4 bg-white w-[50%]"
                    />
                    <div className="text-right mr-4">
                        <p>Tổng số lượng: {cart.length} sản phẩm</p>
                        <p className="text-xl font-bold">Tổng tiền hàng: {formatLargeNumber(total)} ₫</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl h-auto col-span-4 w-full flex flex-col items-center justify-between px-4">
                <div>
                    <div className="w-full flex flex-row items-center">
                        <div className="w-full mt-4">
                            <p className="text-xl font-bold">Khách hàng</p>
                            <AutocompleteCommon
                                name="customerId"
                                value={selectedCustomer}
                                loading={customerLoading}
                                options={customers}
                                onSelect={(item) => handleChangeDropdown(item, "customerId")}
                                onSearch={fetchCustomers}
                                getOptionLabel={(option) => option.fullName}
                                getOptionKey={(option) => option.customerId}
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
                        Thanh toán
                    </button>
                </div>
            </div>
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => { setModalSuccessOpen(false), navigate("/exports") }} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    );
}
