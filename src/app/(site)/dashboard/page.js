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
import { transactionService } from "@/services/transaction.service";
import Loader from "@/components/Loader/loader";
import { paymentService } from "@/services/payment.service";
import { formatLargeNumber } from "@/lib/formattingLib";

export default function Dashboard() {
    const router = useRouter();
    const { user, isLogin } = useLogin();
    const { loading, setLoading } = useLoading();
    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Manager"];

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
    };
    const lastMonth = {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    };

    const thisYear = Object.entries({
        jan: new Date(new Date().getFullYear(), 0, 1),
        feb: new Date(new Date().getFullYear(), 1, 1),
        mar: new Date(new Date().getFullYear(), 2, 1),
        apr: new Date(new Date().getFullYear(), 3, 1),
        may: new Date(new Date().getFullYear(), 4, 1),
        jun: new Date(new Date().getFullYear(), 5, 1),
        jul: new Date(new Date().getFullYear(), 6, 1),
        aug: new Date(new Date().getFullYear(), 7, 1),
        sep: new Date(new Date().getFullYear(), 8, 1),
        oct: new Date(new Date().getFullYear(), 9, 1),
        nov: new Date(new Date().getFullYear(), 10, 1),
        dec: new Date(new Date().getFullYear(), 11, 1),
        next: new Date(new Date().getFullYear() + 1, 0, 1)
    }).map(([key, value]) => ({ key, date: value }));

    const translateMonth = (month) => {
        switch (month) {
            case "jan":
                return "Tháng 1";
            case "feb":
                return "Tháng 2";
            case "mar":
                return "Tháng 3";
            case "apr":
                return "Tháng 4";
            case "may":
                return "Tháng 5";
            case "jun":
                return "Tháng 6";
            case "jul":
                return "Tháng 7";
            case "aug":
                return "Tháng 8";
            case "sep":
                return "Tháng 9";
            case "oct":
                return "Tháng 10";
            case "nov":
                return "Tháng 11";
            case "dec":
                return "Tháng 12";
            default:
                return month;
        }
    }

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
            const response = await dashboardService.getTopSellingProduct(thisMonth.from, thisMonth.to);
            setTopSellingProducts(response.data.sort((a, b) => b.totalRevenue - a.totalRevenue));
        } catch (error) {
            console.log(error);
        }
    };

    const fetchTopPayingCustomers = async () => {
        try {
            const response = await dashboardService.getTopCustomerByTotalSpent(thisMonth.from, thisMonth.to);
            setTopPayingCustomers(response.data.sort((a, b) => b.totalSpent - a.totalSpent));
        } catch (error) {
            console.log(error);
        }
    };

    function getProfitChangePercent(currentProfit, lastProfit) {
        if (lastProfit === 0) return null;
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
                        {incomeThisMonth - expenseThisMonth > 0 && <ProfitArrow percent={profitChangePercent} />}
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
                                        width={200}
                                        interval={0}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="totalRevenue" name="Tổng doanh thu" fill="#00a544" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-1/2 h-80 p-4">
                            <h2 className="text-xl font-semibold mb-3 text-center">Top sản phẩm bán chạy nhất (theo số lượng)</h2>
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
                                        width={200}
                                        interval={0}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="totalQuantitySold" name="Tổng số lượng bán ra" fill="#00a544" />
                                    <Bar dataKey="numberOfOrders" name="Tổng số phiếu" fill="#00ccff" />
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
    const [weightData, setWeightData] = useState([]);
    const [reportMode, setReportMode] = useState("month");

    const fetchProducts = async () => {
        try {
            const response = await productService.getProductAvailable({ pageSize: 1000, pageIndex: 1 });
            setTotalProducts(response.data.totalCount);
            setTotalWeight(response.data.items.reduce((acc, item) => acc + (item.weightPerUnit * item.quantity), 0));
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    const fetchWeights = async () => {
        try {
            const promises = thisYear.slice(0, -1).map((monthObj, i) => {
                const fromDate = monthObj.date;
                const toDate = thisYear[i + 1].date;
                return Promise.all([
                    transactionService.getImportWeight(fromDate, toDate),
                    transactionService.getExportWeight(fromDate, toDate)
                ]).then(([importResponse, exportResponse]) => ({
                    month: translateMonth(monthObj.key),
                    importWeight: importResponse.data.totalWeight ?? 0,
                    exportWeight: exportResponse.data.totalWeight ?? 0
                }));
            });
            const results = await Promise.all(promises);
            setWeightData(results);
            console.log(results);
        } catch (error) {
            console.error('Error fetching imports:', error);
        }
    }

    const fetchImports = async () => {
        try {
            const response = await transactionService.getImportWeight(thisMonth.from, thisMonth.to);
            setTotalImportWeight(response.data.totalWeight);
        } catch (error) {
            console.error('Error fetching imports:', error);
        }
    }

    const fetchExports = async () => {
        try {
            const response = await transactionService.getExportWeight(thisMonth.from, thisMonth.to);
            setTotalExportWeight(response.data.totalWeight);
        } catch (error) {
            console.error('Error fetching exports:', error);
        }
    }

    const ProductTabContent = () => {
        let chartData = [];
        const now = new Date();
        const currentMonthIndex = now.getMonth();
        const currentQuarter = Math.floor(currentMonthIndex / 3);

        if (reportMode === "month") {
            chartData = weightData.slice(currentMonthIndex - 1, currentMonthIndex + 1);
        } else if (reportMode === "quarter") {
            chartData = weightData.slice(currentQuarter * 3, currentQuarter * 3 + 3);
        } else if (reportMode === "year") {
            chartData = weightData.slice(0, 12);
        }

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
                            <p className="text-2xl font-bold">{formatLargeNumber(totalWeight)} Kg</p>
                        </div>
                    </div>
                    <div className="border-2 border-gray-300 p-4 rounded-xl w-1/4 flex flex-row justify-between">
                        <div>
                            <p>Tổng khối lượng nhập tháng này</p>
                            <p className="text-2xl font-bold">{formatLargeNumber(totalImportWeight)} Kg</p>
                        </div>
                    </div>
                    <div className="border-2 border-gray-300 p-4 rounded-xl w-1/4 flex flex-row justify-between">
                        <div>
                            <p>Tổng khối lượng xuất tháng này</p>
                            <p className="text-2xl font-bold">{formatLargeNumber(totalExportWeight)} Kg</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-start gap-4">
                    <div className="flex flex-row items-center justify-start w-full pb-10">
                        <div className="w-full h-80 p-4">
                            <div className="flex flex-row justify-between items-center mb-3">
                                <h2 className="text-xl font-semibold text-center">Thống kê khối lượng hàng hóa nhập, xuất</h2>
                                <select
                                    value={reportMode}
                                    onChange={e => setReportMode(e.target.value)}
                                    className="px-4 py-2 rounded-lg background-primary text-white"
                                >
                                    <option value="month">Tháng này & tháng trước</option>
                                    <option value="quarter">Quý này</option>
                                    <option value="year">Cả năm</option>
                                </select>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    layout="horizontal"
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        type="category"
                                        dataKey="month"
                                        width={150}
                                    />
                                    <YAxis
                                        type="number"
                                    />
                                    <Tooltip />
                                    <Bar dataKey="importWeight" name="Tổng số lượng nhập" fill="#00a544" />
                                    <Bar dataKey="exportWeight" name="Tổng số lượng xuất" fill="#00ccff" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    //Employee Tab
    const [employeeRanking, setEmployeeRanking] = useState([]);
    const [numberOfEmployees, setNumberOfEmployees] = useState(0);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    (async () => {
                        const res = await employeeService.getAllEmployees({ pageIndex: 1, pageSize: 1000, isActive: true });
                        setNumberOfEmployees(res.data.totalCount);
                    })(),
                    (async () => {
                        const res = await payrollService.getAllPayroll(
                            thisMonth.from.getFullYear(),
                            thisMonth.from.getMonth() + 1
                        );
                        setEmployeeRanking(getQuantityRankingPerJob(res.data));
                    })(),
                    fetchPaymentsThisMonth(),
                    fetchPaymentsLastMonth(),
                    fetchTopSellingProducts(),
                    fetchTopPayingCustomers(),
                    fetchProducts(),
                    fetchWeights(),
                    fetchImports(),
                    fetchExports()
                ]);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
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