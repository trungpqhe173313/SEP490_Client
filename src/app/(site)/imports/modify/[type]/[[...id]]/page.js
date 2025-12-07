"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import { formatLargeNumber, formatDateToInput } from '@/lib/formattingLib';
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";

import { productService } from "@/services/product.service";
import { warehouseService } from "@/services/warehouse.service";
import { supplierService } from "@/services/supplier.service";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLogin } from "@/context/LoginContext";
import Loader from "@/components/Loader/loader";

export default function UpdateImport({ params }) {
    const router = useRouter();
    const { type, id } = React.use(params);
    const { isLogin, user, refreshUserInfo } = useLogin();
    const { loading, setLoading } = useLoading();

    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouseLoading, setWarehouseLoading] = useState(false);

    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [supplierLoading, setSupplierLoading] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [productsForSearch, setProductsForSearch] = useState([]);
    const [productLoading, setProductLoading] = useState(false);

    const [importData, setImportData] = useState(null);

    const [cart, setCart] = useState([]);
    const [note, setNote] = useState("");
    const [totalCost, setTotalCost] = useState(0);

    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    const [validWarehouseMessage, setValidWarehouseMessage] = useState("");
    const [validSupplierMessage, setValidSupplierMessage] = useState("");
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

    const removeLeadingZero = (number) => {
        if (number === null || isNaN(number) || number == 0) return 0;
        return number.toString().replace(/^0+/, '');
    }

    const fetchProduct = async () => {
        const body = { pageIndex: 1, pageSize: 1000, isActive: true };
        await productService
            .getProductAvailable(body)
            .then((response) => {
                setProducts(response.data.items.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const fetchCart = () => {
        if (!products || !importData) return;
        setLoading(true);
        const cartItems = products.map((product) => {
            const importProduct = importData.list.find((p) => p.productId === product.productId);
            if (importProduct) {
                return {
                    ...product,
                    importQuantity: importProduct.quantity,
                    unitPrice: importProduct.unitPrice
                };
            }
            return null;
        }).filter((item) => item !== null);
        setCart(cartItems);
        setLoading(false);
    }

    const searchProducts = async (name) => {
        try {
            setProductLoading(true);
            const body = { pageIndex: 1, pageSize: 1000, isActive: true, supplierId: selectedSupplier.supplierId };
            const response = await productService.getProductAvailable(body);
            setProductsForSearch(response.data.items
                .filter((p) => p.productName.toLowerCase().includes(name.toLowerCase()) || p.productCode.toLowerCase().includes(name.toLowerCase()))
                .sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
        } catch (error) {
            console.log(error);
        } finally {
            setProductLoading(false);
        }
    }

    const fetchImport = async () => {
        if (!id) return;
        setLoading(true);
        await importService.getImportDetail(id)
            .then((response) => {
                setImportData(response.data);
                setNote(response.data.list[0].note);
                setTotalCost(response.data.totalCost);
                setSelectedSupplier(response.data.supplier);
                fetchExactWarehouse(response.data.warehouseName);
            })
            .catch((error) => {
                console.log(error);
            });
        setLoading(false);
    }

    const fetchSupplier = async (supplierName) => {
        const body = { pageIndex: 1, pageSize: 1000, isActive: true, supplierName: supplierName || "" };
        await supplierService
            .getAllSuppliers(body)
            .then((response) => {
                setSuppliers(response.data.items);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const fetchWarehouse = async (warehouseName) => {
        const body = { pageIndex: 1, pageSize: 1000, warehouseName: warehouseName || "" };
        await warehouseService
            .getAllWarehouses(body)
            .then((response) => {
                setWarehouses(response.data.items);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const fetchExactWarehouse = async (warehouseName) => {
        const body = { pageIndex: 1, pageSize: 1000, warehouseName: warehouseName };
        await warehouseService
            .getAllWarehouses(body)
            .then((response) => {
                setSelectedWarehouse(response.data.items[0]);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    useEffect(() => {
        validateFields();
    }, [selectedSupplier, selectedWarehouse]);

    const validateFields = () => {
        if (!selectedSupplier) {
            setValidSupplierMessage("Vui lòng chọn nhà cung cấp");
            return false;
        }
        if (!selectedWarehouse) {
            setValidWarehouseMessage("Vui lòng chọn kho");
            return false;
        }
        setValidSupplierMessage("");
        setValidWarehouseMessage("");
        return true;
    }

    const validateProducts = () => {
        if (cart.filter((r) => r.importQuantity > 0 && r.unitPrice > 0).length === 0) {
            setModalFailedMessage("Sản phẩm không được để trống");
            setModalFailedOpen(true);
            return false;
        }
        if (cart.find((r) => r.importQuantity < 0)) {
            setModalFailedMessage("Số lượng sản phẩm không thể là số âm");
            setModalFailedOpen(true);
            return false;
        }
        if (cart.find((r) => r.unitPrice < 0)) {
            setModalFailedMessage("Giá sản phẩm không thể là số âm");
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
        if (type === "create") {
            const body = {
                warehouseId: selectedWarehouse.warehouseId,
                supplierId: selectedSupplier.supplierId,
                note: note,
                products: cart
                    .filter((r) => r.importQuantity !== 0 && r.unitPrice !== 0)
                    .map((r) => ({
                        productId: r.productId,
                        quantity: r.importQuantity,
                        unitPrice: r.unitPrice
                    }))
            }
            await importService.createImport(body)
                .then((response) => {
                    setModalSuccessMessage("Tạo phiếu nhập kho thành công");
                    setModalSuccessOpen(true);
                })
                .catch((error) => {
                    console.log(error);
                    setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message}`);
                    setModalFailedSubMessages(error?.response?.data?.error?.messages || []);
                    setModalFailedOpen(true);
                });
        }
        if (type === "update") {
            const body = {
                listProductOrder: cart
                    .filter((r) => r.importQuantity !== 0 && r.unitPrice !== 0)
                    .map((r) => ({
                        productId: r.productId,
                        quantity: r.importQuantity,
                        unitPrice: r.unitPrice
                    })),
                note: note
            }
            await importService.updateImport(id, body)
                .then((response) => {
                    setModalSuccessMessage("Cập nhật phiếu nhập kho thành công");
                    setModalSuccessOpen(true);
                })
                .catch((error) => {
                    console.log(error);
                    setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message}`);
                    setModalFailedSubMessages(error?.response?.data?.error?.messages || []);
                    setModalFailedOpen(true);
                });
        }
        setLoading(false);
    }

    const handleAddCart = (product) => {
        const existingProduct = cart.find((p) => p.productId === product.productId);
        if (existingProduct) {
            const updatedCart = cart.map((p) =>
                p.productId === product.productId ? { ...p, importQuantity: (p.importQuantity || 0) + 1 } : p
            );
            const newTotalCost = updatedCart.reduce((total, item) => total + (item.unitPrice * item.importQuantity), 0);
            setTimeout(() => {
                setTotalCost(newTotalCost);
            })
            setCart(updatedCart);
        } else {
            const updatedCart = [...cart, { ...product, importQuantity: 1, unitPrice: 0 }];
            const newTotalCost = updatedCart.reduce((total, item) => total + (item.unitPrice * item.importQuantity), 0);
            setTimeout(() => {
                setTotalCost(newTotalCost);
            }, 0);
            setCart(updatedCart);
        }
    };

    const handleRemoveCart = (productId) => {
        const updatedCart = cart.filter((p) => p.productId !== productId);
        setCart(updatedCart);
        const newTotalCost = updatedCart.reduce((total, item) => total + (item.unitPrice * item.importQuantity), 0);
        setTimeout(() => {
            setTotalCost(newTotalCost);
        }, 0);
    };

    const handleChangeCart = (id, field, value) => {
        setCart((prev) => {
            const updatedCart = prev.map((product) =>
                product.productId === id
                    ? { ...product, [field]: Number(value) || 0 }
                    : product
            );
            const newTotalCost = updatedCart.reduce((total, item) => total + (item.unitPrice * item.importQuantity), 0);
            setTimeout(() => {
                setTotalCost(newTotalCost);
            }, 0);
            return updatedCart;
        });
    };

    const handleChangeDropdown = (item) => {
        if (item) {
            if (item.warehouseId) {
                setSelectedWarehouse(item);
            }
            if (item.supplierId) {
                setSelectedSupplier(item);
            }
            if (item.productId) {
                handleAddCart(item);
                setTimeout(() => {
                    setSelectedProduct(null);
                }, 0);
            }
        }
    }

    useEffect(() => {
        if (!pageReady) return;
        fetchImport();
        fetchProduct();
        fetchSupplier();
        fetchWarehouse();
    }, [pageReady]);

    useEffect(() => {
        if (!selectedSupplier) return;
        setLoading(true);
        searchProducts("");
        setCart(cart.filter((p) => p.supplierId === selectedSupplier.supplierId));
        setLoading(false);
    }, [selectedSupplier]);

    useEffect(() => {
        if (!products || !importData) return;
        fetchCart();
    }, [importData, products]);

    const handleExit = () => {
        (type === "create") ? router.push("/imports") : router.back();
    }

    if (!pageReady) {
        return <Loader />
    };

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
                            onSelect={(item) => handleChangeDropdown(item)}
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
                                <TableCell sx={{ color: "white" }} align="center">Giá bán</TableCell>
                                <TableCell sx={{ color: "white" }} align="center">Số lượng (Bao)</TableCell>
                                <TableCell sx={{ color: "white" }} align="center">Đơn giá nhập (VND)</TableCell>
                                <TableCell sx={{ color: "white" }} align="right">Thành tiền (VND)</TableCell>
                                <TableCell sx={{ color: "white" }} align="center">Hành động</TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cart.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <p className="my-10 text-xl">
                                            Không tìm thấy sản phẩm hoặc chưa chọn nhà cung cấp
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                cart.map((r) => (
                                    <TableRow key={r.productId} hover>
                                        <TableCell>{r.productCode}</TableCell>
                                        <TableCell>{r.productName}</TableCell>
                                        <TableCell align="center">{formatLargeNumber(r.sellingPrice)}</TableCell>
                                        <TableCell align="center" >
                                            <IconButton
                                                size="small"
                                                onClick={() => handleChangeCart(r.productId, "importQuantity", r.importQuantity - 1)}
                                                disabled={r.importQuantity <= 0}
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
                                                value={r.importQuantity}
                                                error={r.importQuantity < 0}
                                                onChange={(e) => handleChangeCart(r.productId, "importQuantity", e.target.value)}
                                                variant="outlined"
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => handleChangeCart(r.productId, "importQuantity", r.importQuantity + 1)}
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
                                                onChange={(e) => handleChangeCart(r.productId, "unitPrice", e.target.value)}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            {(r.importQuantity * r.unitPrice).toLocaleString('vi-VN')}₫
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
                    <span>{cart.filter((row) => row.importQuantity > 0 && row.unitPrice > 0).length}</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                    <span>Tổng số lượng sản phẩm:</span>
                    <span>{cart.reduce((total, row) => total + row.importQuantity, 0)}</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                    <span>Tổng tiền hàng:</span>
                    <span>{totalCost?.toLocaleString('vi-VN') || 0} ₫</span>
                </div>
                <div className="my-4">
                    <label className="block text-md font-bold">Nhà kho</label>
                    {id ?
                        <input
                            type="text"
                            name="warehouseName"
                            disabled
                            value={importData?.warehouseName || ""}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        : <AutocompleteCommon
                            name="warehouseId"
                            value={selectedWarehouse}
                            loading={warehouseLoading}
                            options={warehouses}
                            onSelect={(item) => handleChangeDropdown(item)}
                            onSearch={fetchWarehouse}
                            getOptionLabel={(option) => option.warehouseName}
                            getOptionKey={(option) => option.warehouseId}
                        />
                    }
                    {!selectedWarehouse && <span className="text-red-500">{validWarehouseMessage}</span>}
                </div>
                <div className="my-4">
                    <label className="block text-md font-bold">Nhà cung cấp</label>
                    {id ?
                        <input
                            type="text"
                            name="supplierName"
                            disabled
                            value={importData?.supplier?.supplierName || ""}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        :
                        <AutocompleteCommon
                            name="supplierId"
                            value={selectedSupplier}
                            loading={supplierLoading}
                            options={suppliers}
                            onSelect={(item) => handleChangeDropdown(item)}
                            onSearch={fetchSupplier}
                            getOptionLabel={(option) => option.supplierName}
                            getOptionKey={(option) => option.supplierId}
                        />
                    }
                    {!selectedSupplier && <span className="text-red-500">{validSupplierMessage}</span>}
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
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => { setModalSuccessOpen(false), handleExit() }} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    );
}