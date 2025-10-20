"use client";
import { employeeService } from "@/services/employee.service";
import React, { useState, useEffect } from "react";
import TableCommon from "@/components/Table/table";

export default function Employees() {
    const [employees, setEmployees] = useState([]);

    const headerData = [
        { 
            key: "EmployeeID", 
            label: "Mã nhân viên",
            customValue: (item) => item.EmployeeID && <div>{item.EmployeeID}</div>
        },
        { 
            key: "UserID", 
            label: "Mã người dùng",
            customValue: (item) => item.UserID && <div>{item.UserID}</div>
        },
        { 
            key: "Position", 
            label: "Vị trí",
            customValue: (item) => item.Position && <div>{item.Position}</div>
        },
        { 
            key: "DailyWage", 
            label: "Lương cơ bản",
            customValue: (item) => item.DailyWage && <div>{item.DailyWage}</div>
        },
        { 
            key: "JobDescription", 
            label: "Mô tả công việc",
            customValue: (item) => item.JobDescription && <div>{item.JobDescription}</div>
        },
    ];

    useEffect(() => {
        const fetchEmployees = async () => {
            const response = await employeeService.getAllEmployees();
            setEmployees(response.data);
        };
        fetchEmployees();
    }, []);

    return (
        <div className="grid grid-cols-4 p-8 gap-4">
                    <div className="col-span-1 p-4 rounded-2xl bg-white">
                        <div className="p-4">
                            <h2 className="text-xl font-bold">Lọc nhân viên</h2>
                        </div>
                    </div>
                    <div className="col-span-3">
                        <TableCommon
                            headers={headerData}
                            tableData={employees}
                            defaultSortColumn="EmployeeID"
                            rowPerPage={5}
                            pageIndex={0}
                            totalCount={employees.length}
                            rowPerPageOptions={[5, 10, 20]}
                            handleEdit={(item) => console.log('edit', item)}
                            handleDelete={(id) => console.log('delete', id)}
                            messagePopupDelete="Bạn có muốn xóa nhân viên này không?"
                            placeholderSearch="Tìm kiếm nhân viên"
                            usePagination={true}
                            useSearch={true}
                        />
                    </div>
                </div>
    );
}