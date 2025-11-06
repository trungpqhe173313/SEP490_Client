"use client";
import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";

export default function UpdateImport() {
    const { setLoading } = useLoading();
    
    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <div>
            <p>UpdateImport</p>
        </div>
    );
}