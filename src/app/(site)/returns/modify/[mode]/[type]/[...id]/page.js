"use client";
import React, { useState, useEffect } from "react";
import { useLoading } from '@/context/LoadingContext';
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/Form/productForm";
import Loader from "@/components/Loader/loader";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";


export default function Returns({ params }) {
    const { mode, type, id } = React.use(params);
    const { loading, setLoading } = useLoading();
    useEffect(() => {
        setLoading(false);
    })
    return (
        <div>Return {mode} {type} {id}</div>
    )
}