"use client";
import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";

export default function Materials() {
    const { setLoading } = useLoading();
    
    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <div>
            <p>Materials</p>
        </div>
    );
}