'use client';
import React, { useState, useEffect } from 'react'
import { useLoading } from '@/context/LoadingContext';

export default function TransactionDetail({ params }) {
    const { setLoading } = useLoading();
    const { id } = React.use(params)

    useEffect(() => {
        setLoading(false)
    }, [])

    return (
        <div>{id}</div>
    )
}
