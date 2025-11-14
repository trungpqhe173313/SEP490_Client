import React, { useState, useEffect } from 'react'
import { useLoading } from '@/context/LoadingContext'


export default function CreateTransfer() {
    const { loading, setLoading } = useLoading();
    useEffect(() => {
        setLoading(false);
    })
    return (
        <div>Create Transfer</div>
    )
}