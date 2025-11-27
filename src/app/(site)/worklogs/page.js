"use client";
import React, { useState, useEffect } from "react";
import { employeeService } from "@/services/employee.service";
import { worklogService } from "@/services/worklog.service";

import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import { useLogin } from "@/context/LoginContext";
import Loader from "@/components/Loader/loader";
import { Calendar } from "@/components/Calendar/calendar";

export default function Worklog() {
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();
    const { loading, setLoading } = useLoading();

    const jobs = [{ jobId: 1, jobName: "Lái xe" }, { jobId: 2, jobName: "Bốc vác" }];

    const [employeeList, setEmployeeList] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    const [worklogData, setWorklogData] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);

    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");

    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    const [errors, setErrors] = useState("");

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

    const navigate = (path) => {
        router.push(path);
    };

    const fetchWorklog = async (date) => {
        if (!date) return;
        setLoading(true);
        try {
            const body = {
                workDate: date
            }
            const response = await worklogService.getAllWorklogs(body);
            setWorklogData(response.data);
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error?.response?.data?.statusCode}: ${error?.response?.data?.error?.message}`);
            setModalFailedSubMessages(error?.response?.data?.error?.messages || []);
            setModalFailedOpen(true);
        }
        finally {
            setLoading(false);
        }
    };

    const fetchEmployeeList = () => {
        if (!worklogData || worklogData.length === 0) {
            setEmployeeList([]);
            return;
        }

        // Group worklogData by employeeId
        const employeeMap = {};

        worklogData.forEach((entry) => {
            if (!employeeMap[entry.employeeId]) {
                employeeMap[entry.employeeId] = {
                    userId: entry.employeeId,
                    fullName: entry.employeeName,
                    phone: getPhone(entry.employeeId),
                    job: [],
                    quantity: 1,
                    note: "",
                    isActive: entry.isActive
                };
            }
            // Add jobId to job array if not present
            if (!employeeMap[entry.employeeId].job.includes(entry.jobId)) {
                employeeMap[entry.employeeId].job.push(entry.jobId);
            }
            // If jobId is 2 (Bốc vác), set quantity
            if (entry.jobId === 2) {
                employeeMap[entry.employeeId].quantity = entry.quantity;
            }
            // Prefer note from job 2, else from job 1
            if (entry.note && entry.note !== "") {
                employeeMap[entry.employeeId].note = entry.note;
            }
        });

        setEmployeeList(Object.values(employeeMap));
    };

    useEffect(() => {
        if (worklogData && employees && employees.length > 0) {
            fetchEmployeeList();
        }
    }, [worklogData, employees]);

    const fetchEmployees = async () => {
        try {
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                fullName: "",
            };
            const response = await employeeService.getAllEmployees(body);
            setEmployees(response.data.items);
            setFilteredEmployees(response.data.items);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddEmployeeList = (employee) => {
        if (employeeList.find((emp) => emp.userId === employee.userId)) return;
        const newEmployee = {
            userId: employee.userId,
            fullName: employee.fullName,
            username: employee.username,
            email: employee.email,
            phone: employee.phone,
            job: [],
            quantity: 1,
            note: "",
            isActive: false
        };
        setEmployeeList([...employeeList, newEmployee]);
    };

    const handleChangeEmployeeList = (id, field, value) => {
        const updatedEmployeeList = employeeList.map((employee) =>
            employee.userId === id
                ? { ...employee, [field]: value }
                : employee
        );
        setEmployeeList(updatedEmployeeList);
    };

    const handleCheckboxChange = (id, jobId) => {
        const updatedEmployeeList = employeeList.map((employee) =>
            employee.userId === id
                ? {
                    ...employee,
                    job: employee.job.includes(jobId)
                        ? employee.job.filter((job) => job !== jobId)
                        : [...employee.job, jobId],
                }
                : employee
        );
        setEmployeeList(updatedEmployeeList);
    };

    const handleRemoveEmployeeList = (id) => {
        const updatedEmployeeList = employeeList.filter(
            (employee) => employee.userId !== id
        );
        setEmployeeList(updatedEmployeeList);
    };

    const removeVietnameseTones = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase();
    };

    const handleSearch = (value) => {
        const search = removeVietnameseTones(value);

        const filtered = employees.filter((employee) =>
            removeVietnameseTones(employee.fullName).includes(search)
        );

        setFilteredEmployees(filtered);
    };

    const getPhone = (id) => {
        const employee = employees.find((emp) => emp.userId === id);
        return employee?.phone
    }

    const validation = () => {
        if (!pageReady) return
        if (employeeList.length === 0) {
            setErrors("Danh sách nhân viên không được để trống");
            return false;
        }
        if (employeeList.find((employee) => employee.job.length === 0)) {
            setErrors("Có nhân viên chưa được giao việc");
            return false;
        }
        if (employeeList.find((employee) => employee.job.includes(2) && employee.quantity === 0)) {
            setErrors("Số lượng bốc vác phải khác 0");
            return false;
        }
        if (employeeList.find((employee) => employee.quantity < 0)) {
            setErrors("Số lượng bốc vác không thể là số âm");
            return false;
        }
        setErrors("");
        return true;
    }

    useEffect(() => {
        validation();
    }, [employeeList]);


    const handleSubmit = async () => {
        if (!validation() || employeeList.length === 0) return;
        setLoading(true);

        try {
            const promises = [];

            employeeList.filter(employee => !employee.isActive).forEach(employee => {
                const existed = worklogData.filter(w => w.employeeId === employee.userId);

                // Build the jobs array only once
                const jobsPayload = employee.job.map(job => ({
                    jobId: job,
                    quantity: job === 2 ? parseInt(employee.quantity) : 1,
                    note: employee.note
                }));

                if (existed.length > 0) {
                    // Existing employee: update existing jobs, create new jobs if needed
                    employee.job.forEach(job => {
                        const jobExisted = existed.find(w => w.jobId === job);
                        const body = {
                            employeeId: employee.userId,
                            workDate: selectedDate,
                            jobId: job,
                            quantity: job === 2 ? parseInt(employee.quantity) : 1,
                            note: employee.note
                        };
                        if (jobExisted) {
                            // Update existing job
                            promises.push(worklogService.updateWorklog(body));
                        } else {
                            // Create new job for this employee
                            promises.push(worklogService.createWorklog({
                                employeeId: employee.userId,
                                workDate: selectedDate,
                                jobs: [{
                                    jobId: job,
                                    quantity: job === 2 ? parseInt(employee.quantity) : 1,
                                    note: employee.note
                                }]
                            }));
                        }
                    });
                } else {
                    // New employee: create all jobs
                    const body = {
                        employeeId: employee.userId,
                        workDate: selectedDate,
                        jobs: jobsPayload
                    };
                    promises.push(worklogService.createWorklog(body));
                }
            });

            // FAIL ALL IF ANY REQUEST FAILS
            await Promise.all(promises);

            await fetchWorklog(selectedDate);
            setModalSuccessMessage("Lưu chấm công thành công");
            setModalSuccessOpen(true);
        } catch (error) {
            setModalFailedMessage(
                `Lỗi ${error?.response?.data?.statusCode}: ${error?.response?.data?.error?.message}`
            );
            setModalFailedSubMessages(error?.response?.data?.error?.messages || []);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (id) => {
        if (!selectedDate) return;
        setLoading(true);
        try {
            const body = {
                employeeId: id,
                workDate: selectedDate
            }
            await worklogService.checkIn(body);
            await fetchWorklog(selectedDate);
            setModalSuccessMessage("Chấm công thanh công");
            setModalSuccessOpen(true);
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error?.response?.data?.statusCode}: ${error?.response?.data?.error?.message}`);
            setModalFailedSubMessages(error?.response?.data?.error?.messages || []);
            setModalFailedOpen(true);
        }
        finally {
            setLoading(false);
        }
    };

    const removeLeadingZero = (number) => {
        if (number === null || isNaN(number) || number == 0) return 0;
        return number.toString().replace(/^0+/, '');
    }

    useEffect(() => {
        if (!pageReady) return;
        fetchEmployees();
    }, [pageReady]);

    useEffect(() => {
        if (!pageReady) return;
        fetchWorklog(selectedDate);
    }, [pageReady, selectedDate]);

    if (!pageReady) return <Loader />

    return (
        <div className="flex gap-4 p-4">

            <div className="flex flex-col gap-4 w-2/3 justify-between">
                <div className="flex flex-col gap-4 overflow-y-scroll scrollbar-hidden">
                    <div className="p-4 bg-white rounded-xl">
                        <p className="text-xl font-bold">Danh sách chấm công ngày {selectedDate.toLocaleDateString('vi-VN')}</p>
                    </div>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow className="background-primary">
                                    <TableCell sx={{ color: "white" }} align="center">Mã nhân viên</TableCell>
                                    <TableCell sx={{ color: "white" }} align="center">Tên nhân viên</TableCell>
                                    <TableCell sx={{ color: "white" }} align="center">Số điện thoại</TableCell>
                                    <TableCell sx={{ color: "white" }} align="center">Công việc</TableCell>
                                    <TableCell sx={{ color: "white" }} align="center">Số lượng bốc vác (tấn)</TableCell>
                                    <TableCell sx={{ color: "white" }} align="center">Ghi chú</TableCell>
                                    <TableCell sx={{ color: "white" }} align="center">Trạng thái</TableCell>
                                    <TableCell sx={{ color: "white" }} align="center">Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {employeeList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <p className="text-lg my-10">
                                                Chưa có chấm công
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    employeeList.map((employee) => (
                                        <TableRow key={employee.userId} hover>
                                            <TableCell align="center">{employee.userId}</TableCell>
                                            <TableCell align="center">{employee.fullName}</TableCell>
                                            <TableCell align="center">{employee.phone}</TableCell>
                                            <TableCell align="center">
                                                <div className="flex flex-row items-center gap-4 justify-center">
                                                    {jobs.map((job) => (
                                                        <label
                                                            key={job.jobId}
                                                            className="flex items-center my-2 rounded-xl cursor-pointer gap-2"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                value={job.jobId}
                                                                disabled={employee.isActive}
                                                                checked={employee.job.includes(job.jobId)}
                                                                onChange={() => handleCheckboxChange(employee.userId, job.jobId)}
                                                                className="w-6 h-6 accent-green-600 cursor-pointer"
                                                            />
                                                            <span className="text-md">{job.jobName}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell align="center" >
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    disabled={!employee.job.includes(2) || employee.isActive}
                                                    inputProps={{
                                                        min: 0,
                                                        style: {
                                                            width: 50,
                                                            textAlign: "center",
                                                            height: 10
                                                        },
                                                    }}
                                                    value={removeLeadingZero(employee.quantity)}
                                                    onChange={(e) => handleChangeEmployeeList(employee.userId, "quantity", e.target.value)}
                                                    variant="outlined"
                                                    error={employee.quantity < 0}
                                                />
                                            </TableCell>
                                            <TableCell align="center" >
                                                <textarea
                                                    className="w-full h-10 p-2 border border-gray-300 rounded-md"
                                                    value={employee.note}
                                                    disabled={employee.isActive}
                                                    onChange={(e) => handleChangeEmployeeList(employee.userId, "note", e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell align="center">{employee.isActive ? <p className="text-green-600">Đã chấm công</p> : <p className="text-red-600">Chưa chấm công</p>}</TableCell>
                                            <TableCell align="center">
                                                {worklogData.find(w => w.employeeId === employee.userId) ? (
                                                    !employee.isActive ?
                                                        <button
                                                            className="bg-cyan-600 px-4 py-2 text-white rounded-md"
                                                            onClick={() => { handleCheckIn(employee.userId) }}
                                                        >
                                                            Chấm công
                                                        </button> :
                                                        <button
                                                            className="bg-green-600 px-4 py-2 text-white rounded-md"
                                                            disabled
                                                        >
                                                            Đã chấm công
                                                        </button>
                                                ) : (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveEmployeeList(employee.userId)}
                                                        sx={{ backgroundColor: "red", height: "28px", color: "white" }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>)
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
                <div className="p-4 bg-white rounded-xl flex justify-end">
                    <div className="flex flex-col items-end">
                        {errors && <p className="text-red-500 mb-4">{errors}</p>}
                        {worklogData.length > 0 ?
                            <button
                                className="bg-yellow-500 px-4 py-2 text-white rounded-xl"
                                onClick={handleSubmit}
                            >
                                Hoàn thành chỉnh sửa
                            </button>
                            : <button
                                className="background-primary background-hovered px-4 py-2 text-white rounded-xl"
                                onClick={handleSubmit}
                            >
                                Chấm công
                            </button>}
                    </div>
                </div>
            </div>

            <div className="w-1/3 flex flex-col gap-4">
                <div className="p-4 bg-white rounded-xl h-1/2">
                    <p className="text-xl font-bold">Tìm kiếm nhân viên</p>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên nhân viên"
                        className="px-4 py-2 border border-gray-300 rounded-xl w-full"
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee) => (
                            <div
                                key={employee.userId}
                                className="flex items-center my-2 px-4 py-2 border border-gray-300 rounded-xl cursor-pointer gap-4"
                                onClick={() => handleAddEmployeeList(employee)}
                            >
                                <span className="text-md w-full">{employee.fullName}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-lg my-10 text-center">Không tìm thấy nhân viên</p>
                    )}
                </div>
                <Calendar value={selectedDate} onChange={selectedDate => setSelectedDate(selectedDate)} />
            </div>
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => { setModalSuccessOpen(false) }} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div >
    );
}