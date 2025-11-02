"use client";
import React, { useEffect } from 'react'
import { useLoading } from '@/context/LoadingContext'

export default function page() {
    const { setLoading } = useLoading();

    useEffect(() => {
        setLoading(false)
    }, [])

  return (
    <div>page</div>
  )
}