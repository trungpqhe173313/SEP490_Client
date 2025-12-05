'use client';
import React, { useState, useEffect } from 'react';
import { jobService } from '@/services/job.service';
import { useLoading } from '@/context/LoadingContext';
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import { JobForm } from "@/components/Form/jobForm";
import Loader from "@/components/Loader/loader";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import { formatLargeNumber } from '@/lib/formattingLib';

export default function JobDetail({ params }) {
    const { id } = React.use(params);
    const { loading, setLoading } = useLoading();
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");

    const [job, setJob] = useState({});
    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Admin"];

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

    useEffect(() => {
        if (!pageReady) return;
        fetchJob();
    }, [pageReady])

    const fetchJob = async () => {
        try {
            if (!id) return;
            setLoading(true);
            const res = await jobService.getJobById(id);
            setJob(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleConfirm = async (jobData) => {
        setLoading(true);
        try {
            if (!job) return;
            await jobService.updateJob(jobData);
            setModalSuccessMessage("Cập nhật công việc thành công");
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchJob();
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    if (!pageReady) return <Loader />;

    return (
        <div className='flex flex-col gap-4 w-full p-4'>
            <div className='w-full bg-white p-4 rounded-xl flex items-center justify-between'>
                <h1 className='text-2xl font-semibold'>Chi tiết công việc</h1>
                <button className='background-primary text-white px-4 py-2 rounded-md' onClick={() => setModalOpen(true)}>Chỉnh sửa công việc</button>
            </div>

            <div className="w-full bg-white p-4 rounded-xl">
                <table className="w-full">
                    <tbody className="striped-table">
                        <tr>
                            <td className="p-4">Mã công việc</td>
                            <td className="p-4 w-8/10">{job.id}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Tên công việc</td>
                            <td className="p-4 w-8/10">{job.jobName}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Hình thức tính</td>
                            <td className="p-4 w-8/10">{job.payType === "Per_Tan" ? "Tính theo tấn" : job.payType === "Per_Ngay" ? "Tính theo ngày" : "Chưa có"}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Mức trả</td>
                            <td className="p-4 w-8/10">{formatLargeNumber(job.rate)}đ{job.payType === "Per_Tan" ? "/tán" : job.payType === "Per_Ngay" ? "/ngày" : ""}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Trạng thái</td>
                            <td className={`p-4 w-8/10 ${job.isActive ? "text-green-600" : "text-red-600"}`}>{job.isActive ? "Đang hoạt động" : "Dừng hoạt động"}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Ngày tạo</td>
                            <td className="p-4 w-8/10">{new Date(job.createdAt).toLocaleString('vi-VN')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <JobForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={job}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}