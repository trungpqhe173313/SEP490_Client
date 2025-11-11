'use client'
import React, { useState, useEffect } from 'react'
import { useLoading } from '@/context/LoadingContext'

export default function SupplierDetail({params}) {

    const { id } = React.use(params);
    const { setLoading } = useLoading();

    useEffect(() => {
        setLoading(false);
    })
    
    return (
        <div>SupplierDetail {id}</div>
    )
}