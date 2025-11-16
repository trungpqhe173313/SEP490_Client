'use client';
import React, { useState, useEffect } from 'react'
import { priceListService } from '@/services/priceList.service';
import { useLoading } from '@/context/LoadingContext';
import TableCommon from "@/components/Table/table";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader/loader";
import { formatLargeNumber } from '@/lib/formatLargeNumber';

export default function PriceDetail({ params }) {
    const { loading, setLoading } = useLoading();
    const { id } = React.use(params);
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const [priceList, setPriceList] = useState({});
    const [products, setProducts] = useState([]);
    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Manager"];

    // Check authorization
    useEffect(() => {
        refreshUserInfo();
    }, []);

    useEffect(() => {
        if (loading) return;

        if (!isLogin) {
            router.push("/login");
            return;
        }

        if (user?.roles && user.roles.some((r) => pageRole.includes(r))) {
            setPageReady(true);
        } else {
            router.push("/");
        }

    }, [isLogin, user, loading]);

    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const handleChangePage = (event, newPage) => setPageIndex(newPage);

    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    const fetchPriceList = async () => {
        setLoading(true);
        try {
            const response = await priceListService.getPriceListByID(id);
            setPriceList(response.data);
            setProducts(response.data.priceListDetails);
            setTotalCount(response.data.priceListDetails.length);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!pageReady) return;
        fetchPriceList();
    }, [pageReady]);

    const headerData = [
        {
            key: "priceListDetailId",
            label: "Mã chi tiết bảng giá",
            customValue: (item) => item.priceListDetailId && <div>{item.priceListDetailId}</div>
        },
        {
            key: "productName",
            label: "Sản phẩm",
            customValue: (item) => item.productName && <div>{item.productName}</div>
        },
        {
            key: "price",
            label: "Giá",
            customValue: (item) => item.price && <div>{formatLargeNumber(item.price)}</div>
        },
        {
            key: "note",
            label: "Ghi chú",
            customValue: (item) => item.note && <div>{item.note || "Không có"}</div>
        },
    ]

    const handleUpdate = () => {
        router.push(`/price-list/modify/${id}`);
    }

    if (!pageReady) return <Loader />

    return (
        <div className='flex flex-col gap-4 w-full p-4'>
            <div className='w-full bg-white p-4 rounded-xl flex items-center justify-between'>
                <h1 className='text-2xl font-semibold'>Chi tiết bảng giá</h1>
                <button className='background-primary text-white px-4 py-2 rounded-md' onClick={() => handleUpdate()}>Chỉnh sửa chi tiết bảng giá</button>
            </div>
            <TableCommon
                headers={headerData}
                tableData={products}
                defaultSortColumn='priceListDetailId'
                rowPerPageOptions={[5, 10, 20]}
                pageIndex={pageIndex}
                rowPerPage={rowPerPage}
                totalCount={totalCount}
                handleChangePage={handleChangePage}
                handleChangeRowPerPage={handleChangeRowPerPage}
                usePagination={true}
                fePagination={true}
            />
        </div>
    )
}