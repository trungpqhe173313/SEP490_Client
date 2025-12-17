"use client";
import React, { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import { inventoryService } from "@/services/inventory.service";
import { warehouseService } from "@/services/warehouse.service";
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
import DeleteIcon from "@mui/icons-material/Delete";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import { useLogin } from "@/context/LoginContext";
import Loader from "@/components/Loader/loader";
import { removeLeadingZero } from "@/lib/formattingLib";

export default function ModifyInventory({ params }) {
    const router = useRouter();
    const { type, id } = React.use(params);
    const { isLogin, user, refreshUserInfo } = useLogin();
    const { loading, setLoading } = useLoading();
    const [products, setProducts] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productsForSearch, setProductsForSearch] = useState([]);
    const [productLoading, setProductLoading] = useState(false);

    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [warehouseLoading, setWarehouseLoading] = useState(false);
    const [validWarehouseMessage, setValidWarehouseMessage] = useState("");

    const [inventoryData, setInventoryData] = useState(null);

    const [cart, setCart] = useState([]);
    const [note, setNote] = useState("");

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

    const fetchInventory = async () => {
        setLoading(true);
        try {
            if (!id) return;
            const response = await inventoryService.getStockAdjustmentDetail(id);
            setInventoryData(response.data);
            const warehouse = {
                warehouseId: response.data.warehouseId,
                warehouseName: response.data.warehouseName
            }
            setSelectedWarehouse(warehouse);
            setNote(response.data.details[0].note);
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

    const fetchWarehouses = async (value) => {
        try {
            setWarehouseLoading(true);
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                isActive: true,
                warehouseName: value
            };
            const response = await warehouseService.getAllWarehouses(body);
            const warehouseData = response.data.items.map((warehouse) => ({
                warehouseId: warehouse.warehouseId,
                warehouseName: warehouse.warehouseName
            }));
            setWarehouses(warehouseData);
        } catch (error) {
            console.error("Error fetching warehouses:", error);
        } finally {
            setWarehouseLoading(false);
        }
    }

    const fetchCart = (products) => {
        if (!inventoryData) return;
        setLoading(true);
        const cartItems = products.map((product) => {
            const exportProduct = inventoryData.details.find((p) => p.productId === product.productId);
            if (exportProduct) {
                return {
                    productId: product.productId,
                    productCode: product.productCode,
                    productName: product.productName,
                    actualQuantity: exportProduct.actualQuantity,
                    systemQuantity: exportProduct.systemQuantity
                };
            }
            return null;
        }).filter(item => item !== null);
        setCart(cartItems);
        setLoading(false);
    }

    const searchProducts = async (name) => {
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

    const getProductQuantity = async (id) => {
        if (!selectedWarehouse) return;
        try {
            const body = { warehouseId: selectedWarehouse.warehouseId, productId: id };
            const response = await inventoryService.getProductQuantity(body);
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (!pageReady) return;
        fetchInventory();
        fetchProducts();
        fetchWarehouses();
    }, [pageReady]);

    useEffect(() => {
        if (!inventoryData || !products) return;
        fetchCart(products);
    }, [inventoryData, products]);

    useEffect(() => {
        if (!selectedWarehouse) {
            setValidWarehouseMessage("Vui lòng chọn kho");
            return;
        }
        const fetchQuantities = async () => {
            if (!cart) return;
            setLoading(true);
            const updatedCart = await Promise.all(cart.map(async (product) => ({
                ...product,
                systemQuantity: await getProductQuantity(product.productId)
            })));
            setValidWarehouseMessage("");
            setCart(updatedCart);
            setLoading(false);
        };
        fetchQuantities();
    }, [selectedWarehouse]);

    useEffect(() => {
        if (cart.length === 0) {
            setErrors("Sản phẩm không được để trống");
        } else if (cart.find((item) => item.actualQuantity < 0)) {
            setErrors("Số lượng sản phẩm không thể là số âm");
        } else if (cart.find((item) => Number.isInteger(item.actualQuantity) === false)) {
            setErrors("Số lượng sản phẩm không thể là số thập phân");
        } else {
            setErrors("");
        }
    }, [cart]);

    const handleAddCart = async (product) => {
        const existingProduct = cart.find((p) => p.productId === product.productId);
        if (existingProduct) return;
        setLoading(true);
        const newProduct = {
            productId: product.productId,
            productCode: product.productCode,
            productName: product.productName,
            actualQuantity: 0,
            systemQuantity: await getProductQuantity(product.productId) || 0,
            note: ""
        };
        const updatedCart = [...cart, newProduct];
        setCart(updatedCart);
        setLoading(false);
    };

    const handleRemoveCart = (productId) => {
        const updatedCart = cart.filter((p) => p.productId !== productId);
        setCart(updatedCart);
    };

    const handleChangeCart = (id, field, value) => {
        const updatedCart = cart.map((product) =>
            product.productId === id
                ? { ...product, [field]: Number(value) || 0 }
                : product
        );
        setCart(updatedCart);
    };

    const handleChangeDropdown = (item, field) => {
        if (field === "productId") {
            if (item) {
                handleAddCart(item);
                setTimeout(() => {
                    setSelectedProduct(null);
                }, 0);
            }
        }
        if (field === "warehouseId") {
            setSelectedWarehouse(item);
        }
    };

    const handleSubmit = async (action) => {
        if (!selectedWarehouse) {
            setValidWarehouseMessage("Vui lòng chọn kho");
            return;
        }
        if (cart.length === 0) {
            setErrors("Sản phẩm không được để trống");
            return;
        }
        if (cart.find((item) => item.actualQuantity < 0)) {
            setErrors("Số lượng sản phẩm không thể là số âm");
            return;
        }
        if (cart.find((item) => Number.isInteger(item.actualQuantity) === false)) {
            setErrors("Số lượng sản phẩm không thể là số thập phân");
            return;
        }
        setLoading(true);
        const body = {
            warehouseId: selectedWarehouse.warehouseId,
            details: cart.map((item) => ({
                productId: item.productId,
                actualQuantity: item.actualQuantity,
                systemQuantity: item.systemQuantity,
                note: note
            }))
        };
        if (type === "create") {
            await inventoryService.createStockAdjustment(body)
                .then(async (response) => {
                    if (action === "resolve") {
                        await inventoryService.resolveStockAdjustment(response.data.adjustmentId)
                            .catch((error) => {
                                setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
                                setModalFailedSubMessages(error.response.data.error.messages);
                                setModalFailedOpen(true);
                            });
                        setModalSuccessMessage("Tạo và xác nhận phiếu kiểm kho thành công");
                    } else {
                        setModalSuccessMessage("Tạo phiếu kiểm kho thành công");
                    }
                    setModalSuccessOpen(true);
                })
                .catch((error) => {
                    setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
                    setModalFailedSubMessages(error.response.data.error.messages);
                    setModalFailedOpen(true);
                });
        }
        if (type === "update") {
            await inventoryService.updateStockAdjustment(id, body)
                .then(async (response) => {
                    if (action === "resolve") {
                        await inventoryService.resolveStockAdjustment(response.data.adjustmentId)
                            .catch((error) => {
                                setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
                                setModalFailedSubMessages(error.response.data.error.messages);
                                setModalFailedOpen(true);
                            });

                        setModalSuccessMessage("Chỉnh sửa và xác nhận phiếu kiểm kho thành công");
                    } else {
                        setModalSuccessMessage("Chỉnh sửa phiếu kiểm kho thành công");
                    }
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

    const handleExit = () => {
        router.push("/stock-adjustment")
    }

    const getDifference = (system, actual) => {
        if (system < 0 || actual < 0) return <div style={{ color: "red" }}>Không hợp lệ</div>;
        if (system === 0 || actual === 0) return <div>Chưa có số lượng</div>;
        const difference = actual - system;
        if ((!difference || isNaN(difference)) && difference !== 0) return <div style={{ color: "red" }}>Không hợp lệ</div>;
        if (difference === 0) {
            return <div style={{ color: "green" }}>Số lượng chính xác</div>
        }
        if (difference > 0) {
            return <div style={{ color: "blue" }}>Thừa {difference} sản phẩm</div>
        } else if (difference < 0) {
            return <div style={{ color: "red" }}>Thiếu {difference * -1} sản phẩm</div>
        }
        return <div style={{ color: "red" }}>Không hợp lệ</div>
    }

    if (!pageReady) {
        return <Loader />
    }

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
                            getOptionLabel={(option) => `${option.productCode} - ${option.productName}`}
                            getOptionKey={(option) => option.productId}
                        />
                    </div>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow className="background-primary">
                                    <TableCell sx={{ color: "white" }}>Mã hàng</TableCell>
                                    <TableCell sx={{ color: "white" }}>Tên hàng</TableCell>
                                    <TableCell sx={{ color: "white" }} align="center">Tồn kho</TableCell>
                                    <TableCell sx={{ color: "white" }} align="center">Thực tế</TableCell>
                                    <TableCell sx={{ color: "white" }} align="center">Chênh lệch</TableCell>
                                    <TableCell sx={{ color: "white" }} align="right">Hành động</TableCell>
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
                                            <TableCell>{product.productCode}</TableCell>
                                            <TableCell>{product.productName}</TableCell>
                                            <TableCell align="center">{product.systemQuantity}</TableCell>
                                            <TableCell align="center" >
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    inputProps={{
                                                        min: 0,
                                                        style: {
                                                            width: 50,
                                                            textAlign: "center",
                                                            height: 10,
                                                            color: product.actualQuantity < 0 ? 'red' : 'inherit'
                                                        },
                                                    }}
                                                    value={removeLeadingZero(product.actualQuantity)}
                                                    onChange={(e) => handleChangeCart(product.productId, "actualQuantity", e.target.value)}
                                                    variant="outlined"
                                                    error={product.actualQuantity < 0}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            '& fieldset': {
                                                                borderColor: product.actualQuantity < 0 ? 'red' : 'inherit',
                                                            },
                                                        },
                                                        marginX: "5px",
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">{getDifference(product.systemQuantity, product.actualQuantity)}</TableCell>
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
            </div>

            <div className="w-full bg-white rounded-md shadow-md p-4 flex flex-col col-span-4 mt-4">
                <div className="flex flex-col gap-4">
                    <div>
                        <h3 className="font-semibold mb-4">Tổng hợp</h3>
                        <div className="flex gap-2 items-center mb-2 text-sm">
                            <span>Tổng số lượng sản phẩm thực tế:</span>
                            <span className="font-bold text-lg">{cart.reduce((total, row) => total + row.actualQuantity, 0)}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-md font-bold">Nhà kho</label>
                        {id ?
                            <input
                                type="text"
                                name="warehouseName"
                                disabled
                                value={inventoryData?.warehouseName || ""}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                            : <AutocompleteCommon
                                name="warehouseId"
                                value={selectedWarehouse}
                                loading={warehouseLoading}
                                options={warehouses}
                                onSelect={(item) => handleChangeDropdown(item, "warehouseId")}
                                onSearch={fetchWarehouses}
                                getOptionLabel={(option) => option.warehouseName}
                                getOptionKey={(option) => option.warehouseId}
                            />
                        }
                        {validWarehouseMessage && <span className="text-red-500">{validWarehouseMessage}</span>}
                    </div>
                    <div>
                        <label className="block text-md font-bold">Ghi chú</label>
                        <textarea
                            placeholder="Ghi chú"
                            value={note || ""}
                            onChange={(e) => setNote(e.target.value)}
                            className="p-2 border border-gray-300 rounded bg-white w-full"
                        />
                    </div>
                </div>
                {errors && <p className="text-red-600 text-center">{errors}</p>}
                <div className="w-full flex flex-row items-center py-4 justify-end gap-4 mt-auto">
                    <button
                        className="bg-blue-600 text-white text-2xl font-bold py-2 px-4 rounded"
                        onClick={() => handleSubmit("draft")}>
                        Lưu tạm
                    </button>
                    <button
                        className="background-primary background-hovered text-white text-2xl font-bold py-2 px-4 rounded"
                        onClick={() => handleSubmit("resolve")}>
                        Hoàn thành phiếu
                    </button>
                </div>
            </div>
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => { setModalSuccessOpen(false), handleExit() }} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    );
}
