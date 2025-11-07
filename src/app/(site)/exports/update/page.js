"use client";
import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";

export default function UpdateExport() {
    const { setLoading } = useLoading();
    
    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <div>
            <p>UpdateExport</p>
        </div>
    );
}