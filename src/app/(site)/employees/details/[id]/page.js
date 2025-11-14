'use client'
import React, { useState, useEffect } from 'react'
import { useLoading } from '@/context/LoadingContext'

export default function EmployeeDetail({params}) {

    const { id } = React.use(params);
    const { loading, setLoading } = useLoading();

    useEffect(() => {
        setLoading(false);
    })
    
    return (
        <div>EmployeeDetail {id}</div>
    )
}