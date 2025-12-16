import { useState, useEffect } from "react";
import { Modal } from "@mui/material";
import { jobService } from "@/services/job.service";

export function JobForm({
  isOpen,
  onClose,
  onConfirm,
  initialData
}) {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  // data for check exist
  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    try {
      const response = await jobService.getAllJobs();
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id,
        jobName: initialData.jobName || "",
        payType: initialData.payType || "",
        rate: initialData.rate || 0,
        isActive: initialData.isActive ?? true,
      });
    } else {
      setForm({
        jobName: "",
        payType: "",
        rate: 0,
      });
    }
    clearErrors();
    fetchJobs();
  }, [initialData, isOpen]);

  //Validation
  const [validJobName, setValidJobName] = useState(true);
  const [validRate, setValidRate] = useState(true);

  const [errorJobName, setErrorJobName] = useState("");
  const [errorRate, setErrorRate] = useState("");

  const clearErrors = () => {
    setError("");
    setErrorJobName("");
    setErrorRate("");
    setValidJobName(true);
    setValidRate(true);
  }

  const handleChange = (name, value) => {
    let newValue = value;
    switch (name) {
      case "isActive":
        newValue = value === "true";
        break;
      case "jobName":
        const checkingJobName = value.trim().replace(/\s\s+/g, ' ');
        if (value.length > 60 || value.length < 6) {
          setValidJobName(false);
          setErrorJobName("Tên công việc phải trong khoảng 6 đến 60 ky tự.");
        }
        const isExistingJobName = jobs.find(job => job.jobName.toLowerCase() === checkingJobName.toLowerCase() && job.jobName !== initialData?.jobName);
        if (isExistingJobName) {
          setValidJobName(false);
          setErrorJobName(`Công việc "${checkingJobName}" đã tồn tại, vui lòng nhập tên khác.`);
        } else {
          setValidJobName(true);
          setErrorJobName("");
        }
        break;
      case "rate":
        newValue = parseInt(value);
        if (value <= 0) {
          setValidRate(false);
          setErrorRate("Mức trả phải lớn hơn 0.");
        } else {
          setValidRate(true);
          setErrorRate("");
        }
        break;
      default:
        break;
    }
    setForm((prev) => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.jobName === "" || form.payType === "" || form.rate <= 0) {
      setError("Vui lòng nhập thông tin bắt buộc.");
      return;
    }
    const invalidForms = !validJobName || !validRate;
    if (invalidForms) {
      setError("Có nhập liệu không hợp lệ, vui lòng thử lại");
      return
    }
    setError("");
    onConfirm(form);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-1/2 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden">
          <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0">
            <h2 className="text-2xl font-bold my-auto">
              {initialData ? "Cập nhật công việc" : "Thêm công việc mới"}
            </h2>
            <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 p-8">
            <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
              <div>
                <label className="block text-md font-bold">Tên công việc *</label>
                <p className="text-xs text-gray-500">Nhập tên công việc</p>
              </div>
              <input
                type="text"
                name="jobName"
                value={form.jobName}
                onChange={(e) => handleChange("jobName", e.target.value)}
                className={`w-full bg-white border rounded px-3 py-2 ${!validJobName ? "border-red-500" : "border-green-500"}`}
                required
              />
              {!validJobName && <p className="text-red-500 text-xs">{errorJobName}</p>}
            </div>
            <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
              <div>
                <label className="block text-md font-bold">Hình thức tính</label>
                <p className="text-xs text-gray-500">Nhập hình thức tính</p>
              </div>
              <select
                name="payType"
                value={form.payType}
                onChange={(e) => handleChange("payType", e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">-- Nhập hình thức tính --</option>
                <option value="Per_Tan">Tính theo tấn</option>
                <option value="Per_Ngay">Tính theo ngày</option>
              </select>
            </div>
            <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
              <div>
                <label className="block text-md font-bold">Mức trả</label>
                <p className="text-xs text-gray-500">Nhập mức trả</p>
              </div>
              <input
                type="number"
                name="rate"
                value={form.rate || 0}
                onChange={(e) => handleChange("rate", e.target.value)}
                className={`w-full bg-white border ${!validRate ? "border-red-600" : "border-green-600"} rounded px-3 py-2`}
                required
              />
              {!validRate && <p className="text-red-500 text-xs">{errorRate}</p>}
            </div>
            {initialData && <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
              <div>
                <label className="block text-md font-bold">Trạng thái</label>
                <p className="text-xs text-gray-500">Nhập trạng thái công việc</p>
              </div>
              <select name="isActive" value={form.isActive ? "true" : "false"} onChange={(e) => handleChange("isActive", e.target.value)} className="w-full bg-white border border-gray-300 rounded px-3 py-2">
                <option value="true">Đang hoạt động</option>
                <option value="false">Dừng hoạt động</option>
              </select>
            </div>
            }
            {error && <div className="text-red-600 text-md text-right">{error}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer" onClick={onClose}>Hủy</button>
              <button type="submit" className="px-4 py-2 rounded background-primary text-white background-hovered cursor-pointer">
                {initialData ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
