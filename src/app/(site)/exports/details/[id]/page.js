'use client';
import React, { useState, useEffect } from 'react'
import { useLoading } from '@/context/LoadingContext';
import TableCommon from "@/components/Table/table";

export default function ExportDetail({ params }) {
    const { setLoading } = useLoading();
    const { id } = React.use(params);

    const [transaction, setTransaction] = useState({});
    const [customer, setCustomer] = useState({});
    const [products, setProducts] = useState([]);

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <div>
            <p>Export</p>
        </div>
    );
}