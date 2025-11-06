"use client";
import React, { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import { customerService } from "@/services/customer.service";
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

export default function CreateExport() {

    const { setLoading } = useLoading();
    const [products, setProducts] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productsForSearch, setProductsForSearch] = useState([]);
    const [productLoading, setProductLoading] = useState(false);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [customerLoading, setCustomerLoading] = useState(false);

    const [cart, setCart] = useState([]);
    const [note, setNote] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 18; // Number of products per page

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
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

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
            console.log(response.data.items);
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
            handleChangeCart(product.productId, "quantity", existingProduct.quantity + 1);
        } else {
            setCart((prev) => [...prev, { ...product, quantity: 1, unitPrice: product.averageCost || 0 }]);
        }
    };

    const handleRemoveCart = (productId) => {
        setCart((prev) => prev.filter((p) => p.productId !== productId));
    };

    const handleChangeCart = (id, field, value) => {
        setCart((prev) =>
            prev.map((product) => (product.productId === id ? { ...product, [field]: Number(value) || 0 } : product))
        );
    };

    const handleChangeDropdown = (item, field) => {
        if (field === "customerId") {
            setSelectedCustomer(item);
        }
        if (field === "productId") {
            if (item) {
                handleAddCart(item);
                // Force a reset of the Autocomplete by using setTimeout
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

    const handleCreate = () => {
        console.log({ note, cart });
    };

    const total = cart.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0);

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
                                                    onClick={() => handleChangeCart(product.productId, "quantity", product.quantity - 1)}
                                                    disabled={product.quantity <= 0}
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
                                                    value={product.quantity}
                                                    onChange={(e) => handleChangeCart(product.productId, "quantity", e.target.value)}
                                                    variant="outlined"
                                                />
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleChangeCart(product.productId, "quantity", product.quantity + 1)}
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
                                                    value={product.unitPrice}
                                                    onChange={(e) => handleChangeCart(product.productId, "unitPrice", e.target.value)}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                {isNaN(product.unitPrice * product.quantity) ? 0 : (product.unitPrice * product.quantity).toLocaleString()} ₫
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
                <div className="w-full bg-white rounded-xl h-[10vh] flex flex-row items-center justify-between">
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

            <div className="bg-white rounded-xl h-[90vh] col-span-4 mt-4 w-full flex flex-col items-center justify-between">
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
                        onClick={() => handleCreate()}>
                        Thanh toán
                    </button>
                </div>
            </div>
        </div>
    );
}
