import React, { useState, useEffect } from 'react'
import { useLoading } from '@/context/LoadingContext'


export default function Transfer() {
    const { setLoading } = useLoading();
    useEffect(() => {
        setLoading(false);
    })
    return (
        <div>Transfer</div>
    )
}

