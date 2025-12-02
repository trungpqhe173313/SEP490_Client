"use client";
import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import { dashboardService } from "@/services/dashboard.service";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { payrollService } from "@/services/payroll.service";
import { employeeService } from "@/services/employee.service";
import { productService } from "@/services/product.service";
import { importService } from "@/services/import.service";
import { exportService } from "@/services/export.service";
import Loader from "@/components/Loader/loader";
import { paymentService } from "@/services/payment.service";
import { formatLargeNumber, formatDateToInput } from "@/lib/formattingLib";

export default function Dashboard() {
    const router = useRouter();
    const { user, isLogin } = useLogin();
    const { loading, setLoading } = useLoading();
    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Admin"];

    useEffect(() => {
        if (loading) return;
        if (isLogin && user?.roles && user.roles.some((r) => pageRole.includes(r))) {
            setPageReady(true);
        } else if (!isLogin) {
            router.push("/login");
        } else if (!user?.roles?.some((r) => pageRole.includes(r))) {
            router.push("/");
        }
    }, [isLogin, user, router]);

    const thisMonth = {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        // from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        // to: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    };
    const lastMonth = {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    };


    useEffect(() => {
        setLoading(false);
    }, []);

    const tabHeaders = [
        "Thu chi",
        "Hàng hóa",
        "Nhân sự"
    ];

    const [tab, setTab] = useState(0);

    const handleTabChange = (event, newTab) => {
        setTab(newTab);
    };

    //Payment Tab
    const [expenseThisMonth, setExpenseThisMonth] = useState(0);
    const [incomeThisMonth, setIncomeThisMonth] = useState(0);
    const [expenseLastMonth, setExpenseLastMonth] = useState(0);
    const [incomeLastMonth, setIncomeLastMonth] = useState(0);
    const [topSellingProducts, setTopSellingProducts] = useState([]);
    const [topPayingCustomers, setTopPayingCustomers] = useState([]);

    const fetchPaymentsThisMonth = async () => {
        try {
            const response = await paymentService.getAllPayments({
                pageIndex: 1,
                pageSize: 1000,
                transactionFromDate: thisMonth.from,
                transactionToDate: thisMonth.to
            });
            setExpenseThisMonth(response.data.items.reduce((acc, cur) => acc + (cur.amount < 0 ? cur.amount * -1 : 0), 0));
            setIncomeThisMonth(response.data.items.reduce((acc, cur) => acc + (cur.amount > 0 ? cur.amount : 0), 0));
        } catch (error) {
            console.log(error);
        }
    };

    const fetchPaymentsLastMonth = async () => {
        try {
            const response = await paymentService.getAllPayments({
                pageIndex: 1,
                pageSize: 1000,
                transactionFromDate: lastMonth.from,
                transactionToDate: lastMonth.to
            });
            setExpenseLastMonth(response.data.items.reduce((acc, cur) => acc + (cur.amount < 0 ? cur.amount * -1 : 0), 0));
            setIncomeLastMonth(response.data.items.reduce((acc, cur) => acc + (cur.amount > 0 ? cur.amount : 0), 0));
        } catch (error) {
            console.log(error);
        }
    };

    const fetchTopSellingProducts = async () => {
        try {
            const response = await dashboardService.getTopSellingProduct(formatDateToInput(thisMonth.from), formatDateToInput(thisMonth.to));
            console.log(response.data);
            setTopSellingProducts(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchTopPayingCustomers = async () => {
        try {
            const response = await dashboardService.getTopCustomerByTotalSpent(formatDateToInput(thisMonth.from), formatDateToInput(thisMonth.to));
            console.log(response.data);
            setTopPayingCustomers(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchPaymentsThisMonth();
        fetchPaymentsLastMonth();
        fetchTopSellingProducts();
        fetchTopPayingCustomers();
    }, []);

    function getProfitChangePercent(currentProfit, lastProfit) {
        if (lastProfit === 0) return null; // Avoid division by zero
        const diff = currentProfit - lastProfit;
        const percent = (diff / Math.abs(lastProfit)) * 100;
        return percent;
    }

    const profitThisMonth = incomeThisMonth - expenseThisMonth;
    const profitLastMonth = incomeLastMonth - expenseLastMonth;
    const profitChangePercent = getProfitChangePercent(profitThisMonth, profitLastMonth);

    function ProfitArrow({ percent }) {
        if (percent === null) return null;
        const isUp = percent > 0;
        const color = isUp ? "text-green-600" : "text-red-600";
        const arrow = isUp ? "▲" : "▼";
        return (
            <div className="flex flex-col items-end">
                <span className={`ml-2 font-bold ${color}`}>
                    {arrow} {Math.abs(percent).toFixed(1)}%
                </span>
                <p>So với tháng trước</p>
            </div>
        );
    }

    const PaymentTabContent = () => {
        return (
            <div className="flex flex-col gap-4 pb-10">
                <p className="text-2xl font-bold">Báo cáo thu chi</p>
                <div className="flex flex-row items-center justify-start gap-4">
                    <div className="border-2 border-gray-300 p-4 rounded-xl w-1/4 flex flex-row justify-between">
                        <div>
                            <p>Tổng doanh thu tháng này</p>
                            <p className="text-2xl font-bold text-green-600">{formatLargeNumber(incomeThisMonth)} đ</p>
                        </div>
                    </div>
                    <div className="border-2 border-gray-300 p-4 rounded-xl w-1/4 flex flex-row justify-between">
                        <div>
                            <p>Tổng chi tháng này</p>
                            <p className="text-2xl font-bold text-red-600">{formatLargeNumber(expenseThisMonth)} đ</p>
                        </div>
                    </div>
                    <div className="border-2 border-gray-300 p-4 rounded-xl w-1/4 flex flex-row justify-between items-center">
                        <div>
                            <p>Lợi nhuận tháng này</p>
                            <p className="text-2xl font-bold">{formatLargeNumber(incomeThisMonth - expenseThisMonth)} đ</p>
                        </div>
                        <ProfitArrow percent={profitChangePercent} />
                    </div>
                </div>
                <div className="flex flex-col items-center justify-start gap-4">
                    <div className="flex flex-row items-center justify-start w-full">
                        <div className="w-1/2 h-80 p-4">
                            <h2 className="text-xl font-semibold mb-3 text-center">Top sản phẩm bán chạy nhất (theo doanh thu)</h2>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={topSellingProducts}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis
                                        type="category"
                                        dataKey="productName"
                                        width={150}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="totalRevenue" name="Tổng doanh thu" fill="#00a544" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-1/2 h-80 p-4">
                            <h2 className="text-xl font-semibold mb-3 text-center">Top sản phẩm bán chạy nhất (theo số lượng, đơn)</h2>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={topSellingProducts}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        type="number"
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="productName"
                                        width={150}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="totalQuantitySold" name="Tổng số lượng bán ra" fill="#00a544" />
                                    <Bar dataKey="numberOfOrders" name="Tổng số đơn" fill="#00ccff" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="w-full h-80 p-4">
                        <h2 className="text-xl font-semibold mb-3 text-center">Khách hàng mua nhiều nhất</h2>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={topPayingCustomers}
                                layout="vertical"
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    type="number"
                                />
                                <YAxis
                                    type="category"
                                    dataKey="fullName"
                                    width={150}
                                />
                                <Tooltip />
                                <Bar dataKey="totalSpent" name="Tổng số tiền đã chi" fill="#00a544" />
                                <Bar dataKey="averageOrderValue" name="Trung bình" fill="#00ccff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    //Product Tab
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalWeight, setTotalWeight] = useState(0);
    const [totalImportWeight, setTotalImportWeight] = useState(0);
    const [totalExportWeight, setTotalExportWeight] = useState(0);

    const fetchProducts = async () => {
        
    }

    const fetchImports = async () => {
        
    }

    const fetchExports = async () => {
        
    }

    useEffect(() => {
        fetchProducts();
        fetchImports();
        fetchExports();
    }, []);

    const ProductTabContent = () => {
        return (
            <div className="flex flex-col gap-4">
                <p className="text-2xl font-bold">Báo cáo hàng hóa</p>
                <div className="flex flex-row items-center justify-start gap-4">
                    <div className="border-2 border-gray-300 p-4 rounded-xl w-1/4 flex flex-row justify-between">
                        <div>
                            <p>Tổng số mặt hàng</p>
                            <p className="text-2xl font-bold">{totalProducts}</p>
                        </div>
                    </div>
                    <div className="border-2 border-gray-300 p-4 rounded-xl w-1/4 flex flex-row justify-between">
                        <div>
                            <p>Tổng khối lượng trong kho</p>
                            <p className="text-2xl font-bold">{totalWeight}</p>
                        </div>
                    </div>
                    <div className="border-2 border-gray-300 p-4 rounded-xl w-1/4 flex flex-row justify-between">
                        <div>
                            <p>Tổng khối lượng nhập tháng này</p>
                            <p className="text-2xl font-bold">{totalImportWeight}</p>
                        </div>
                    </div>
                    <div className="border-2 border-gray-300 p-4 rounded-xl w-1/4 flex flex-row justify-between">
                        <div>
                            <p>Tổng khối lượng xuất tháng này</p>
                            <p className="text-2xl font-bold">{totalExportWeight}</p>
                        </div>
                    </div>
                </div>
                <p className="text-xl font-bold text-center">Thống kê </p>
            </div>
        );
    };

    //Employee Tab
    const [employeeRanking, setEmployeeRanking] = useState([]);
    const [numberOfEmployees, setNumberOfEmployees] = useState(0);

    useEffect(() => {
        const getEmployeeRanking = async () => {
            const res = await payrollService.getAllPayroll(
                thisMonth.from.getFullYear(),
                thisMonth.from.getMonth() + 1
            );
            setEmployeeRanking(getQuantityRankingPerJob(res.data));
        };
        const getNumberOfEmployees = async () => {
            const res = await employeeService.getAllEmployees({ pageIndex: 1, pageSize: 1000 });
            setNumberOfEmployees(res.data.totalCount);
        };
        getNumberOfEmployees();
        getEmployeeRanking();
    }, []);

    const getQuantityRankingPerJob = (data) => {
        if (!data || data.length === 0) return [];

        const jobMap = {};

        data.forEach(emp => {
            emp.jobDetails.forEach(job => {
                if (!jobMap[job.jobId]) {
                    jobMap[job.jobId] = {
                        jobId: job.jobId,
                        jobName: job.jobName,
                        employees: []
                    };
                }

                jobMap[job.jobId].employees.push({
                    employeeName: emp.employeeName,
                    quantity: job.quantity
                });
            });
        });

        Object.values(jobMap).forEach(job => {
            job.employees.sort((a, b) => b.quantity - a.quantity);
        });

        return Object.values(jobMap);
    }

    const EmployeeTabContent = () => {
        return (
            <div className="flex flex-col gap-4">
                <p className="text-2xl font-bold">Báo cáo nhân sự</p>
                <div className="flex flex-row items-center justify-start gap-4">
                    <div className="border-2 border-gray-300 p-4 rounded-xl w-1/4 flex flex-row justify-between">
                        <div>
                            <p>Tổng số nhân viên</p>
                            <p className="text-2xl font-bold">{numberOfEmployees}</p>
                        </div>
                    </div>
                </div>
                <p className="text-xl font-bold text-center">Thống kê năng suất làm việc theo công việc</p>
                <div className="flex flex-row items-center justify-start flex-wrap">
                    {employeeRanking.map(job => (
                        <div key={job.jobId} className="w-1/2 h-40 mb-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={job.employees}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis
                                        type="category"
                                        dataKey="employeeName"
                                        width={150}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="quantity" name={job.jobId === 1 ? "Số ngày" : job.jobId === 2 ? "Số tấn" : "quantity"} fill="#00a544" />
                                </BarChart>
                            </ResponsiveContainer>

                            <h2 className="text-xl font-semibold mb-3 text-center">{job.jobName}</h2>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (!pageReady) return <Loader />

    return (
        <div className="p-2 w-auto rounded-xl">
            <nav>
                <ul className="tabs flex gap-1">
                    {tabHeaders.map((tabHeader, index) => (
                        <li key={index} className={`px-4 py-2 rounded-t-xl cursor-pointer border border-gray-300 ${tab === index ? "background-primary" : "bg-white"}`} onClick={(event) => handleTabChange(event, index)}>
                            <a>
                                {tabHeader}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="bg-white p-4 border-x-1 border-b-1 border-gray-300 ">
                {tab === 0 && <PaymentTabContent />}
                {tab === 1 && <ProductTabContent />}
                {tab === 2 && <EmployeeTabContent />}
            </div>
        </div>
    );
}