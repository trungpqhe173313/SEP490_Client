"use client";
import React, { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import { transferService } from "@/services/transfer.service";
import { warehouseService } from "@/services/warehouse.service";
import { inventoryService } from "@/services/inventory.service";
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
import { formatLargeNumber } from '@/lib/formattingLib';


export default function ModifyTransfer({ params }) {
    const router = useRouter();
    const { type, id } = React.use(params);
    const { isLogin, user, refreshUserInfo } = useLogin();
    const { loading, setLoading } = useLoading();

    const [products, setProducts] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [warehousesForSearch, setWarehousesForSearch] = useState([]);
    const [warehousesInForSearch, setWarehousesInForSearch] = useState([]);


    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productsForSearch, setProductsForSearch] = useState([]);
    const [productLoading, setProductLoading] = useState(false);

    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouseLoading, setWarehouseLoading] = useState(false);
    const [selectedWarehouseIn, setSelectedWarehouseIn] = useState(null);
    const [warehouseInLoading, setWarehouseInLoading] = useState(false);

    const [transferData, setTransferData] = useState({});

    const [cart, setCart] = useState([]);
    const [note, setNote] = useState("");
    const [totalCost, setTotalCost] = useState(0);

    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    const [errors, setErrors] = useState("");
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

    const fetchTransfer = async () => {
        setLoading(true);
        try {
            if (!id) return;
            const response = await transferService.getTransferDetail(id)
            setTransferData(response.data);
            setNote(response.data.note);
            setSelectedWarehouse({
                warehouseId: await fetchExactWarehouse(response.data.sourceWarehouseName),
                warehouseName: response.data.sourceWarehouseName
            });
            setSelectedWarehouseIn({
                warehouseId: await fetchExactWarehouse(response.data.destinationWarehouseName),
                warehouseName: response.data.destinationWarehouseName
            });
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        const body = { pageIndex: 1, pageSize: 1000, productName: "" };
        await productService.getProductAvailable(body)
            .then((response) => {
                setProducts(response.data.items);
                setProductsForSearch(response.data.items.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const fetchCart = async () => {
        if (!transferData || !products || !transferData.list) return;
        setLoading(true);
        const cartItems = await Promise.all(
            products.map(async (product) => {
                const transferProduct = transferData.list.find((p) => p.productId === product.productId);
                if (transferProduct) {
                    return {
                        ...product,
                        quantity: await getQuantity(product.productId),
                        transferQuantity: transferProduct.quantity
                    };
                }
                return null;
            })
        );
        setCart(cartItems.filter(item => item !== null));
        setLoading(false);
    }

    const fetchWarehouses = async () => {
        const body = { pageIndex: 1, pageSize: 1000, warehouseName: "", isActive: true };
        await warehouseService.getAllWarehouses(body)
            .then((response) => {
                setWarehouses(response.data.items);
                setWarehousesForSearch(response.data.items);
                setWarehousesInForSearch(response.data.items);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const searchWarehouses = (name) => {
        try {
            setWarehouseLoading(true);
            setWarehousesForSearch(warehouses.filter((w) => w.warehouseName.toLowerCase().includes(name.toLowerCase())));
        } catch (error) {
            console.log(error);
        } finally {
            setWarehouseLoading(false);
        }
    }

    const searchWarehouseIns = (name) => {
        try {
            setWarehouseInLoading(true);
            setWarehousesInForSearch(warehouses.filter((w) => w.warehouseName.toLowerCase().includes(name.toLowerCase())));
        } catch (error) {
            console.log(error);
        } finally {
            setWarehouseInLoading(false);
        }
    }

    const searchProducts = (name) => {
        try {
            setProductLoading(true);
            setProductsForSearch(products.filter((p) =>
                p.productCode.toLowerCase().includes(name.toLowerCase()) ||
                p.productName.toLowerCase().includes(name.toLowerCase())
            ).sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
        } catch (error) {
            console.log(error);
        } finally {
            setProductLoading(false);
        }
    }

    const fetchExactWarehouse = async (name) => {
        const body = { pageIndex: 1, pageSize: 1000, warehouseName: name };
        const response = await warehouseService.getAllWarehouses(body);
        return response.data.items[0].warehouseId;
    }

    const getQuantity = async (id) => {
        if (!selectedWarehouse) return;
        try {
            const body = { warehouseId: selectedWarehouse.warehouseId, productId: id };
            const response = await inventoryService.getProductQuantity(body);
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }

    const handleAddCart = async (product) => {
        const existingProduct = cart.find((p) => p.productId === product.productId);
        if (existingProduct) {
            const updatedCart = cart.map((p) =>
                p.productId === product.productId ? { ...p, transferQuantity: (p.transferQuantity || 0) + 1 } : p
            );
            setCart(updatedCart);
        } else {
            setLoading(true);
            const newProduct = { ...product, transferQuantity: 1, quantity: await getQuantity(product.productId) || 0 };
            setCart((prev) => [...prev, newProduct]);
            setLoading(false);
        }
    };

    const handleRemoveCart = (productId) => {
        const updatedCart = cart.filter((p) => p.productId !== productId);
        setCart(updatedCart);
    };

    const handleChangeCart = (id, field, value) => {
        setCart((prev) => {
            const updatedCart = prev.map((product) =>
                product.productId === id
                    ? { ...product, [field]: Number(value) || 0 }
                    : product
            );
            return updatedCart;
        });
    };

    const handleChangeDropdown = (item, field) => {
        if (field === "warehouseId") {
            setSelectedWarehouse(item);
        }
        if (field === "warehouseInId") {
            setSelectedWarehouseIn(item);
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
        if (number === null || isNaN(number) || number == 0) return 0;
        return number.toString().replace(/^0+/, '');
    }

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true); const body = {
            note,
            listProductOrder: cart.filter((p) => p.transferQuantity > 0).map((p) => ({ productId: p.productId, quantity: p.transferQuantity, unitPrice: p.sellingPrice })),
            warehouseId: selectedWarehouse.warehouseId,
            warehouseInId: selectedWarehouseIn.warehouseId
        };
        if (type === "create") {
            await transferService.createTransfer(body)
                .then((response) => {
                    setModalSuccessMessage("Tạo phiếu chuyển kho thành công");
                    setModalSuccessOpen(true);
                })
                .catch((error) => {
                    setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
                    setModalFailedSubMessages(error.response.data.error.messages);
                    setModalFailedOpen(true);
                });
        }
        if (type === "update") {
            await transferService.updateTransfer(id, body)
                .then((response) => {
                    setModalSuccessMessage("Chỉnh sửa phiếu chuyển kho thành công");
                    setModalSuccessOpen(true);
                })
                .catch((error) => {
                    setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message}`);
                    setModalFailedSubMessages(error?.response?.data?.error?.messages);
                    setModalFailedOpen(true);
                });
        }
        setLoading(false);
    }

    const validate = () => {
        if (!pageReady) return
        if (cart.filter((p) => p.transferQuantity > 0).length === 0) {
            setErrors("Sản phẩm không được để trống");
            return false
        }
        if (cart.find((p) => p.transferQuantity < 0)) {
            setErrors("Số lượng chuyển kho không thể là số âm");
            return false
        }
        if (cart.find((p) => p.transferQuantity > p.quantity)) {
            setErrors("Số lượng chuyển kho đang lớn hơn số lượng trong kho");
            return false
        }
        if (!selectedWarehouse) {
            setErrors("Kho xuất không được để trống")
            return false
        }
        if (!selectedWarehouseIn) {
            setErrors("Kho nhập không được để trống")
            return false
        }
        if (selectedWarehouse.warehouseId === selectedWarehouseIn.warehouseId) {
            setErrors("Kho xuất không được trùng với kho nhập")
            return false
        }
        setErrors("");
        return true;
    }

    useEffect(() => {
        validate();
    }, [cart, selectedWarehouse, selectedWarehouseIn]);

    useEffect(() => {
        if (!selectedWarehouse) return;
        const fetchQuantities = async () => {
            if (!cart) return;
            setLoading(true);
            const updatedCart = await Promise.all(cart.map(async (product) => ({
                ...product,
                quantity: await getQuantity(product.productId)
            })));
            setCart(updatedCart);
            setLoading(false);
        };
        fetchQuantities();
    }, [selectedWarehouse]);

    useEffect(() => {
        if (!products || !transferData) return;
        fetchCart();
    }, [transferData, products]);

    useEffect(() => {
        if (!cart) return;
        setTotalCost(cart.reduce((total, item) => total + (item.sellingPrice * item.transferQuantity), 0));
    }, [cart]);

    useEffect(() => {
        if (!pageReady) return;
        fetchTransfer();
        fetchProducts();
        fetchWarehouses();
    }, [pageReady]);

    const handleExit = () => {
        (type === "create") ? router.push("/transfer") : router.back();
    }

    if (!pageReady) {
        return <Loader />
    }

    return (
        <div className="p-4 bg-gray-50 h-auto flex gap-6 grid grid-cols-4">
            <div className="col-span-3">
                <div className="flex items-center rounded-md shadow-md p-4 bg-white gap-4 mb-4">
                    <div className="w-full">
                        <p className="text-xl font-bold">Tìm kiếm sản phẩm</p>
                        <AutocompleteCommon
                            name="productId"
                            value={selectedProduct}
                            loading={productLoading}
                            options={productsForSearch}
                            onSelect={(item) => handleChangeDropdown(item, "productId")}
                            onSearch={searchProducts}
                            getOptionLabel={(option) => `${option.productCode} - ${option.productName}`}
                            getOptionKey={(option) => option.productId}
                        />
                    </div>
                </div>

                {/* Table */}
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow className="background-primary">
                                <TableCell sx={{ color: "white" }}>Mã hàng</TableCell>
                                <TableCell sx={{ color: "white" }}>Tên hàng</TableCell>
                                <TableCell sx={{ color: "white" }} align="center">Số lượng trong kho (Bao)</TableCell>
                                <TableCell sx={{ color: "white" }} align="center">Giá bán</TableCell>
                                <TableCell sx={{ color: "white" }} align="center">Số lượng chuyển (Bao)</TableCell>
                                <TableCell sx={{ color: "white" }} align="right">Thành tiền (VND)</TableCell>
                                <TableCell sx={{ color: "white" }} align="center">Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cart.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <p className="my-10 text-xl">
                                            Không tìm thấy sản phẩm
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                cart.map((r) => (
                                    <TableRow key={r.productId} hover>
                                        <TableCell>{r.productCode}</TableCell>
                                        <TableCell>{r.productName}</TableCell>
                                        <TableCell align="center">{r.quantity}</TableCell>
                                        <TableCell align="center">{formatLargeNumber(r.sellingPrice)}</TableCell>
                                        <TableCell align="center" >
                                            <IconButton
                                                size="small"
                                                onClick={() => handleChangeCart(r.productId, "transferQuantity", r.transferQuantity - 1)}
                                                disabled={r.transferQuantity <= 0}
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
                                                value={removeLeadingZero(r.transferQuantity)}
                                                error={r.transferQuantity < 0 || r.transferQuantity > r.quantity}
                                                onChange={(e) => handleChangeCart(r.productId, "transferQuantity", e.target.value)}
                                                variant="outlined"
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => handleChangeCart(r.productId, "transferQuantity", r.transferQuantity + 1)}
                                                sx={{ border: "1px solid #ccc", height: "28px", width: "auto" }}
                                            >
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell align="right">
                                            {(r.transferQuantity * r.sellingPrice).toLocaleString('vi-VN')}₫
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveCart(r.productId)}
                                                sx={{ backgroundColor: "red", height: "28px", color: "white" }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            {/* Summary Card */}
            <div className="w-full bg-white rounded-md shadow-md p-4 flex flex-col col-span-1">
                <h3 className="font-semibold mb-4">Tổng hợp</h3>
                <div className="flex justify-between mb-2 text-sm">
                    <span>Tổng số loại sản phẩm:</span>
                    <span>{cart.filter((row) => row.transferQuantity > 0 && row.sellingPrice > 0).length}</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                    <span>Tổng số lượng sản phẩm:</span>
                    <span>{cart.reduce((total, row) => total + row.transferQuantity, 0)}</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                    <span>Tổng tiền hàng:</span>
                    <span>{totalCost?.toLocaleString('vi-VN') || 0} ₫</span>
                </div>
                <div className="my-4">
                    <label className="block text-md font-bold">Nhà kho xuất</label>
                    {id ?
                        <input
                            type="text"
                            name="warehouseName"
                            disabled
                            value={transferData?.sourceWarehouseName || ""}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        : <AutocompleteCommon
                            name="warehouseId"
                            value={selectedWarehouse}
                            loading={warehouseLoading}
                            options={warehousesForSearch}
                            onSelect={(item) => handleChangeDropdown(item, "warehouseId")}
                            onSearch={searchWarehouses}
                            getOptionLabel={(option) => option.warehouseName}
                            getOptionKey={(option) => option.warehouseId}
                        />
                    }
                </div>
                <div className="my-4">
                    <label className="block text-md font-bold">Nhà kho nhập</label>
                    {id ?
                        <input
                            type="text"
                            name="warehouseName"
                            disabled
                            value={transferData?.destinationWarehouseName || ""}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        : <AutocompleteCommon
                            name="warehouseId"
                            value={selectedWarehouseIn}
                            loading={warehouseInLoading}
                            options={warehousesInForSearch}
                            onSelect={(item) => handleChangeDropdown(item, "warehouseInId")}
                            onSearch={searchWarehouseIns}
                            getOptionLabel={(option) => option.warehouseName}
                            getOptionKey={(option) => option.warehouseId}
                        />
                    }
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
                {errors && <p className="text-red-500 text-center my-2">{errors}</p>}
                <button className="background-primary background-hovered cursor-pointer mt-auto py-2 rounded" onClick={handleSubmit}>
                    Hoàn thành
                </button>
            </div>
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => { setModalSuccessOpen(false), handleExit() }} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}
