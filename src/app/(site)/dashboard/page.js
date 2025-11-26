"use client";
import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";

export default function Dashboard() {
    const { loading, setLoading } = new useLoading();
    
    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <div>
            <p>Dashboard</p>
        </div>
    );
}