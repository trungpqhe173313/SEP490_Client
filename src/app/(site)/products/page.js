"use client";
import { productService } from "@/services/product.service";
import React, { useState, useEffect } from "react";
import TableCommon from "@/components/Table/table";

export default function Products() {
    const [products, setProducts] = useState([]);

    const headerData = [
        {
            key: "ProductID",
            label: "Mã sản phẩm",
            customValue: (item) => item.ProductID && <div>{item.ProductID}</div>
        },
        {
            key: "ProductName",
            label: "Tên sản phẩm",
            customValue: (item) => item.ProductName && <div>{item.ProductName}</div>
        },
        {
            key: "Code",
            label: "Mã",
            customValue: (item) => item.Code && <div>{item.Code}</div>
        },
        {
            key: "WeightPerUnit",
            label: "Khối lượng",
            customValue: (item) => item.WeightPerUnit && <div>{item.WeightPerUnit}</div>
        },
        {
            key: "StockQuantity",
            label: "Số lượng",
            customValue: (item) => item.StockQuantity && <div>{item.StockQuantity}</div>
        },
        {
            key: "IsAvailable",
            label: "Trang thái",
            customValue: (item) => item.IsAvailable === 1 ? <div className="text-green-600" >Còn Hàng</div> : <div className="text-red-600" >Hết Hàng</div>
        },
        {
            key: "SupplierID",
            label: "Mã nhà cung cấp",
            customValue: (item) => item.SupplierID && <div>{item.SupplierID}</div>
        },
        {
            key: "CategoryID",
            label: "Mã danh mục",
            customValue: (item) => item.CategoryID && <div>{item.CategoryID}</div>
        }
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            const response = await productService.getAllProducts();
            setProducts(response.data);
        };
        fetchProducts();
    }, []);

    return (
        <div className="grid grid-cols-4 p-8 gap-4">
            <div className="col-span-1 p-4 rounded-2xl bg-white">
                <div className="p-4">
                    <h2 className="text-xl font-bold">Lọc sản phẩm</h2>
                    <div className="flex flex-col">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                            Danh mục
                        </label>
                        <select className="block w-full text-gray-700 text-sm font-semibold mb-2 h-10 border border-gray-200 rounded px-3" id="category" name="category">
                            <option value="">Tất cả</option>
                            <option value="1">Thực phẩm</option>
                            <option value="2">Máy móc</option>
                            <option value="3">Giống cây</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supplier">
                            Nhà cung cấp
                        </label>
                        <select className="block w-full text-gray-700 text-sm font-semibold mb-2 h-10 border border-gray-200 rounded px-3" id="supplier" name="supplier">
                            <option value="">Tất cả</option>
                            <option value="1">Nhà cung cấp 1</option>
                            <option value="2">Nhà cung cấp 2</option>
                            <option value="3">Nhà cung cấp 3</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                            Trang thái
                        </label>
                        <select className="block w-full text-gray-700 text-sm font-semibold mb-2 h-10 border border-gray-200 rounded px-3" id="status" name="status">
                            <option value="">Tất cả</option>
                            <option value="1">Còn Hàng</option>
                            <option value="2">Hết Hàng</option>
                        </select>
                    </div>
                    <div className="flex flex-row mb-2">
                        <div className="flex flex-col w-1/2 mr-4">
                            <label className="block text-gray-700 text-sm font-bold" htmlFor="weightFrom">
                                Khối lượng từ
                            </label>
                            <input className="block w-full text-gray-700 text-sm font-semibold mb-2 h-10 border border-gray-200 rounded px-3" id="weightFrom" type="number" name="weightFrom" />
                        </div>
                        <div className="flex flex-col w-1/2">
                            <label className="block text-gray-700 text-sm font-bold" htmlFor="weightTo">
                                Khối lượng đến
                            </label>
                            <input className="block w-full text-gray-700 text-sm font-semibold mb-2 h-10 border border-gray-200 rounded px-3" id="weightTo" type="number" name="weightTo" />
                        </div>
                    </div>

                    <div className="flex flex-row mb-2">
                        <div className="flex flex-col w-1/2 mr-4">
                            <label className="block text-gray-700 text-sm font-bold" htmlFor="quantityFrom">
                                Số lượng từ
                            </label>
                            <input className="block w-full text-gray-700 text-sm font-semibold mb-2 h-10 border border-gray-200 rounded px-3" id="quantityFrom" type="number" name="quantityFrom" />
                        </div>
                        <div className="flex flex-col w-1/2">
                            <label className="block text-gray-700 text-sm font-bold" htmlFor="quantityTo">
                                Số lượng đến
                            </label>
                            <input className="block w-full text-gray-700 text-sm font-semibold mb-2 h-10 border border-gray-200 rounded px-3" id="quantityTo" type="number" name="quantityTo" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-span-3">
                <TableCommon
                    headers={headerData}
                    tableData={products}
                    defaultSortColumn="ProductID"
                    rowPerPage={5}
                    pageIndex={0}
                    totalCount={products.length}
                    rowPerPageOptions={[5, 10, 20]}
                    handleEdit={(item) => console.log('edit', item)}
                    handleDelete={(ProductID) => console.log('delete', ProductID)}
                    messagePopupDelete="Bạn có muốn xóa sản phẩm này không?"
                    placeholderSearch="Tìm sản phẩm"
                    usePagination={true}
                    useSearch={true}
                />
            </div>
        </div>
    );
}
