"use client";
import { productService } from "@/services/product.service";
import React, { useState, useEffect } from "react";
import TableCommon from "@/components/Table/table";

export default function ProductTable() {
    const [products, setProducts] = useState([]);

    const headerData = [
        {
            key: "id",
            label: "Id",
            customValue: (item) => item.id && <div>{item.id}</div>
        },
        {
            key: "name",
            label: "Name",
            customValue: (item) => item.name && <div>{item.name}</div>
        },
        {
            key: "price",
            label: "Price",
            customValue: (item) => item.price && <div>{item.price}</div>
        },
        {
            key: "description",
            label: "Description",
            customValue: (item) => item.description && <div>{item.description}</div>
        },
        {
            key: "brand",
            label: "Brand",
            customValue: (item) => item.brand && <div>{item.brand}</div>
        },
        {
            key: "category",
            label: "Category",
            customValue: (item) => item.category && <div>{item.category}</div>
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
        <div className="overflow-x-auto">
            {/* <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs leading-4">
                            Id
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs leading-4">
                            Name
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs leading-4">
                            Price
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs leading-4">
                            Description
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs leading-4">
                            Brand
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 text-left text-xs leading-4">
                            Category
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                {product.id}
                            </td>
                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                {product.price}
                            </td>
                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                {product.description}
                            </td>
                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                {product.brand}
                            </td>
                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                {product.category}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table> */}
            <TableCommon
                headers={headerData}
                tableData={products}
                defaultSortColumn="id"
                rowPerPage={5}
                pageIndex={0}
                totalCount={products.length}
                rowPerPageOptions={[5, 10, 20]}
                handleEdit={(item) => console.log('edit', item)}
                handleDelete={(id) => console.log('delete', id)}
                messagePopupDelete="Are you sure you want to delete this product?"
                placeholderSearch="Search by name"
                usePagination={true}
                useSearch={true}
            />
        </div>
    );
}
