"use client";
import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";

export default function Expenses() {
    const { setLoading } = useLoading();
    
    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <div>
            <p>Expenses</p>
        </div>
    );
}