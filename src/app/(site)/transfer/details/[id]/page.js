import React, { useState, useEffect } from 'react'
import { useLoading } from '@/context/LoadingContext'


export default function DetailsTransfer({ params }) {
    const { id } = React.use(params);
    const { setLoading } = useLoading();
    useEffect(() => {
        setLoading(false);
    })
    return (
        <div>DetailsTransfer {id}</div>
    )
}