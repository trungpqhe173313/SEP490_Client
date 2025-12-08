'use client';
import React, { useState, useEffect } from 'react'
import { priceListService } from '@/services/priceList.service';
import { productService } from '@/services/product.service';
import { formatLargeNumber } from '@/lib/formattingLib';

import { useLoading } from '@/context/LoadingContext';
import { useLogin } from '@/context/LoginContext';
import { useRouter } from "next/navigation";
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
} from "@mui/material";

import Loader from "@/components/Loader/loader";
import { AutocompleteCommon } from '@/components/Autocomplete/Autocomplete';

import { PriceListForm, PriceListUploadProductForm } from '@/components/Form/priceListForm';
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";

export default function ModifyPriceList({ params }) {
    const { id } = React.use(params);
    const { loading, setLoading } = useLoading();
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    const [modalCreateOpen, setModalCreateOpen] = useState(false);
    const [modalUploadProductOpen, setModalUploadProductOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    const [selectedPriceList, setSelectedPriceList] = useState(null);
    const [selectedPriceListDetail, setSelectedPriceListDetail] = useState([]);
    const [filteredPriceListDetail, setFilteredPriceListDetail] = useState([]);
    const [priceLists, setPriceLists] = useState([]);
    const [priceListLoading, setPriceListLoading] = useState(false);
    const [products, setProducts] = useState([]);
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

    const fetchPriceLists = async (name, id) => {
        try {
            setPriceListLoading(true);
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                priceListName: name,
                priceListId: id ? parseInt(id) : 0
            }
            const response = await priceListService.getAllPriceLists(body);
            setPriceLists(response.data.items);
            if (id) setSelectedPriceList(response.data.items[0]);
        } catch (error) {
            console.log(error);
        } finally {
            setPriceListLoading(false);
        }
    };

    const fetchPriceListDetail = async (id) => {
        setLoading(true);
        try {
            const response = await priceListService.getPriceListByID(id);
            const updatedPriceListDetail = response.data.priceListDetails.map((detail) => ({
                productId: detail.productId,
                productName: detail.productName,
                code: detail.productCode,
                unitPrice: detail.price
            }));
            setSelectedPriceListDetail(updatedPriceListDetail);
            setFilteredPriceListDetail(updatedPriceListDetail);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                isAvailable: true
            };
            const response = await productService.getAllProducts(body);
            const productData = response.data.items.map((product) => ({
                productName: product.productName,
                productId: product.productId,
                sellingPrice: product.sellingPrice,
                code: product.code
            }))
            setProducts(productData);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (!pageReady) return;
        fetchProducts();
        if (id) {
            fetchPriceLists("", id);
            fetchPriceListDetail(id);
        } else {
            fetchPriceLists("", 0);
        }
    }, [pageReady, id]);

    useEffect(() => {
        if (!selectedPriceList) return;
        fetchPriceListDetail(selectedPriceList.priceListId);
    }, [selectedPriceList]);

    const handleUploadAllProducts = () => {
        if (!products) return;
        setLoading(true);
        const updatedPriceListDetail = products.map((product) => ({
            productId: product.productId,
            productName: product.productName,
            code: product.code,
            unitPrice: product.sellingPrice
        }));
        setSelectedPriceListDetail(updatedPriceListDetail);
        setFilteredPriceListDetail(updatedPriceListDetail);
        setLoading(false);
    };

    const handleUploadProductFromSupplier = async (data) => {
        if (!data) return;
        setLoading(true);
        try {
            const response = await productService.getProductBySupplier(data);
            const updatedPriceListDetail = response.data.map((product) => ({
                productId: product.productId,
                productName: product.productName,
                code: product.code,
                unitPrice: product.sellingPrice
            }))
            setSelectedPriceListDetail(updatedPriceListDetail);
            setFilteredPriceListDetail(updatedPriceListDetail);
            setModalUploadProductOpen(false);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = async (data) => {
        setLoading(true);
        try {
            await priceListService.createPriceList(data);
            setModalSuccessMessage("Tạo bảng giá thành công");
            setModalSuccessOpen(true);
            fetchPriceLists("", 0);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        const filtered = selectedPriceListDetail.filter((detail) => detail.productName.toLowerCase().includes(value.toLowerCase()) || detail.code.toLowerCase().includes(value.toLowerCase()));
        setFilteredPriceListDetail(filtered);
    };

    useEffect(() => {
        handleSearch(searchTerm);
    }, [searchTerm]);

    const handleChange = (id, value) => {
        const updatedPriceListDetail = selectedPriceListDetail.map((detail) => (detail.productId === id ? { ...detail, unitPrice: value } : detail));
        const updatedPriceListDetailFiltered = filteredPriceListDetail.map((detail) => (detail.productId === id ? { ...detail, unitPrice: value } : detail));
        setSelectedPriceListDetail(updatedPriceListDetail);
        setFilteredPriceListDetail(updatedPriceListDetailFiltered);
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            if (!selectedPriceList) return;
            const body = {
                priceListDetails: selectedPriceListDetail.map((detail) => ({
                    productId: detail.productId,
                    unitPrice: detail.unitPrice ? detail.unitPrice : 0,
                }))
            }
            await priceListService.updatePriceListDetail(selectedPriceList.priceListId, body);
            setModalSuccessMessage("Cập nhật bảng giá thành công");
            setModalSuccessOpen(true);
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };
    const handleChangeDropdown = (item) => {
        if (item) {
            setSelectedPriceList(item);
        }
    };

    const removeLeadingZero = (number) => {
        if (number === null || isNaN(number) || number == 0) return 0;
        return number.toString().replace(/^0+/, '');
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedRows = filteredPriceListDetail.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const getProductSellingPrice = (productId) => {
        if (!products) return 0;
        const product = products.find((product) => product.productId === productId);
        return product ? product.sellingPrice : 0;
    };

    if (!pageReady) return <Loader />;

    return (
        <div className='flex flex-col gap-4 p-4'>
            <div className="w-full p-4 bg-white rounded-lg">
                <h1 className="text-2xl font-bold">Chỉnh sửa bảng giá {id && selectedPriceList?.priceListName}</h1>
            </div>

            <div className="w-full p-4 bg-white rounded-lg flex flex-col gap-4">
                <div className="flex flex-row flex-wrap gap-4 w-full items-center">
                    <div className='w-full lg:w-1/7'>
                        <p className="text-sm font-medium">Chọn bảng giá</p>
                        {id ? <input
                            type="text"
                            value={selectedPriceList?.priceListName || ""}
                            className="w-full border border-gray-300 rounded-md pl-2 pr-8 py-1.75"
                            readOnly
                        /> : <AutocompleteCommon
                            name="priceList"
                            value={selectedPriceList}
                            loading={priceListLoading}
                            options={priceLists}
                            onSelect={handleChangeDropdown}
                            onSearch={(value) => fetchPriceLists(value, 0)}
                            getOptionLabel={(option) => option.priceListName}
                            getOptionKey={(option) => option.priceListId}
                        />
                        }
                    </div>
                    <div className='mt-5'>
                        <TextField
                            label="Tìm kiếm theo tên hoặc mã"
                            variant="outlined"
                            size="small"
                            sx={{ width: "30em" }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className='ml-auto'>
                        {!id &&
                            <button
                                onClick={() => setModalCreateOpen(true)}
                                className="background-primary text-white py-2 px-4 rounded"
                            >
                                Tạo bảng giá mới
                            </button>
                        }
                    </div>
                </div>
                <div>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow className="background-primary">
                                    <TableCell sx={{ color: "white" }}>Mã hàng</TableCell>
                                    <TableCell sx={{ color: "white" }}>Tên hàng</TableCell>
                                    <TableCell sx={{ color: "white" }} align="center">Giá bán</TableCell>
                                    <TableCell sx={{ color: "white" }} align="center">Đơn giá theo bảng</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {!selectedPriceList ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <p className="my-10 text-xl">Chưa chọn bảng giá</p>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedRows.length === 0 && searchTerm ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <p className="my-10 text-xl">
                                                Không tìm thấy sản phẩm phù hợp
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedRows.length === 0 && !searchTerm ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <div className="flex flex-col items-center my-10 gap-8">
                                                <p className="text-xl">Chưa có sản phẩm trong bảng giá</p>
                                                <div className="flex justify-center gap-4">
                                                    <button
                                                        onClick={() => handleUploadAllProducts()}
                                                        className="background-primary text-white py-2 px-4 rounded"
                                                    >
                                                        Tải lên tất cả sản phẩm
                                                    </button>
                                                    <button
                                                        onClick={() => setModalUploadProductOpen(true)}
                                                        className="text-green-600 border border-green-600 py-2 px-4 rounded"
                                                    >
                                                        Tải lên sản phẩm theo nhà cung cấp
                                                    </button>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedRows.map((r) => (
                                        <TableRow key={r.productId} hover>
                                            <TableCell>{r.code}</TableCell>
                                            <TableCell>{r.productName}</TableCell>
                                            <TableCell align="center">{formatLargeNumber(getProductSellingPrice(r.productId))}đ</TableCell>
                                            <TableCell align="center">
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    inputProps={{
                                                        min: 0,
                                                        style: { width: 70, textAlign: "center", height: "10px" },
                                                    }}
                                                    value={removeLeadingZero(r.unitPrice)}
                                                    error={r.unitPrice < 0}
                                                    onChange={(e) => handleChange(r.productId, e.target.value)}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            component="div"
                            count={filteredPriceListDetail.length}
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
                <div className="w-full flex justify-end">
                    <button
                        className="background-primary text-white py-2 px-4 rounded"
                        onClick={() => handleConfirm()}
                    >
                        Lưu bảng giá
                    </button>
                </div>
            </div>
            <PriceListForm isOpen={modalCreateOpen} onClose={() => setModalCreateOpen(false)} onConfirm={handleCreate} />
            <PriceListUploadProductForm isOpen={modalUploadProductOpen} onClose={() => setModalUploadProductOpen(false)} onConfirm={handleUploadProductFromSupplier} />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}

