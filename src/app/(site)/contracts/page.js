import React, { useState, useEffect } from 'react'
import { useLoading } from '@/context/LoadingContext'

export default function Contracts() {
    const { setLoading } = useLoading();
    useEffect(() => {
        setLoading(false);
    })
    return (
        <div>Contracts</div>
    )
}

