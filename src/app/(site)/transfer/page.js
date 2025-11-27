"use client";
import { transferService } from "@/services/transfer.service";
import { warehouseService } from "@/services/warehouse.service";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useLogin } from "@/context/LoginContext";
import DateInput from "@/components/Input/DateInput";

import TableCommon from "@/components/Table/table";
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";
import { getTransferStatus, getTransferStatusText } from "@/lib/getStatus";
import { formatDateToInput } from '@/lib/formattingLib';

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import Loader from "@/components/Loader/loader";


export default function Transfer() {
    const { loading, setLoading } = useLoading();
    useEffect(() => {
        setLoading(false);
    })
    return (
        <div>Transfer</div>
    )
}

