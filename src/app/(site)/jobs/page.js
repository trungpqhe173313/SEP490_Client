'use client';
import { jobService } from '@/services/job.service';

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";

import TableCommon from "@/components/Table/table";
import { JobForm } from "@/components/Form/jobForm";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import Loader from "@/components/Loader/loader";
import { formatLargeNumber } from '@/lib/formattingLib';

export default function Joblist() {
  const { isLogin, user, refreshUserInfo } = useLogin();

  //Data state
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);

  //Modal state
  const [modalOpen, setModalOpen] = useState(false);

  const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
  const [modalSuccessMessage, setModalSuccessMessage] = useState("");

  const [modalFailedOpen, setModalFailedOpen] = useState(false);
  const [modalFailedMessage, setModalFailedMessage] = useState("");
  const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

  //Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const { loading, setLoading } = useLoading();
  const [pageReady, setPageReady] = useState(false);
  const router = useRouter();
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

  const headerData = [
    {
      key: "id",
      label: "Mã công việc",
      customValue: (item) => item.id && <div>{item.id}</div>
    },
    {
      key: "jobName",
      label: "Tên công việc",
      customValue: (item) => item.jobName && <div>{item.jobName}</div>
    },
    {
      key: "payType",
      label: "Hình thức tính",
      customValue: (item) => item.payType === "Per_Tan" ? <div>Theo số tấn</div> : item.payType === "Per_Ngay" ? <div>Theo số ngày</div> : <div>Chưa có</div>
    },
    {
      key: "rate",
      label: "Mức trả",
      customValue: (item) => item.rate && <div>{formatLargeNumber(item.rate)}₫{item.payType === "Per_Tan" ? "/tán" : item.payType === "Per_Ngay" ? "/ngày" : ""}</div>
    },
    {
      key: "isActive",
      label: "Trạng thái",
      customValue: (item) => item.isActive == 1 ? <div className="text-green-600">Đang hoạt động</div> : <div className="text-red-600">Dừng hoạt động</div>
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      customValue: (item) => item.createdAt && <div>{new Date(item.createdAt).toLocaleString('vi-VN')}</div>
    }
  ];

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPageIndex(newPage);
  const handleChangeRowPerPage = (event) => {
    setRowPerPage(parseInt(event.target.value, 10));
    setPageIndex(0);
  };

  const fetchJobs = async () => {
    try {
      const response = await jobService.getAllJobs();
      setJobs(response.data);
      setTotalCount(response.data.length);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!pageReady) return;
    fetchJobs();
  }, [pageReady]);

  // Modal handlers
  const handleCreate = () => {
    setEditingJob(null);
    setModalOpen(true);
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  const handleDelete = async (job) => {
    if (job.isActive === false) {
      setModalFailedMessage("Công việc đã bị xóa từ trước");
      setModalFailedOpen(true);
      return;
    }
    setLoading(true);
    try {
      await jobService.deleteJob(job.id);
      setModalSuccessMessage("Xoá công việc thành công");
      setModalSuccessOpen(true);
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
      setModalFailedOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (jobData) => {
    setLoading(true);
    try {
      if (editingJob) {
        await jobService.updateJob(jobData);
        setModalSuccessMessage("Cập nhật công việc thành công");
      } else {
        await jobService.createJob(jobData);
        setModalSuccessMessage("Tạo công việc thành công");
      }
      setModalSuccessOpen(true);
      setModalOpen(false);
      fetchJobs();
    } catch (error) {
      setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message}`);
      setModalFailedOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (!pageReady) {
    return <Loader />;
  }

  return (
    <div className="w-full p-8">
      <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4">
        <div className="flex flex-col w-3/4 mr-4">
          <h1 className="text-2xl font-bold">Danh sách công việc</h1>
        </div>
        <div className="flex flex-col w-1/4">
          <button className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto" onClick={() => handleCreate()}>Thêm công việc</button>
        </div>
      </div>
      <TableCommon
        headers={headerData}
        tableData={jobs}
        defaultSortColumn="createdAt"
        defaultSortType="desc"
        rowPerPage={rowPerPage}
        pageIndex={pageIndex}
        totalCount={totalCount}
        rowPerPageOptions={[5, 10, 20]}
        handleChangePage={handleChangePage}
        handleChangeRowPerPage={handleChangeRowPerPage}
        navigateDetail={(item) => router.push(`/jobs/details/${item.id}`)}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        messagePopupDelete="Bạn có muốn xóa công việc này không?"
        usePagination={true}
        useAction={true}
        fePagination={true}
      />
      <JobForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        initialData={editingJob}
      />
      <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
      <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
    </div >
  );
}