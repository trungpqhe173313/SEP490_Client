"use client";
import { productService } from "@/services/product.service";
import React, { useState, useEffect } from "react";

export default function ProductTable() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const response = await productService.getAllProducts();
            setProducts(response.data);
        };
        fetchProducts();
    }, []);

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
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
            </table>
        </div>
    );
}
