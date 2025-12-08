import { useState, useEffect } from "react";
import { Modal } from "@mui/material";
import { getFinancialTransactionTypeText } from "@/lib/getStatus";

export function PaymentForm({
  isOpen,
  onClose,
  onConfirm,
  initialData,
  mode
}) {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [negativeAmount, setNegativeAmount] = useState(false);
  // data for check exist
  useEffect(() => {
    if (initialData) {
      setNegativeAmount(initialData.amount < 0);
      setForm({
        type: initialData.typeInt || "",
        amount: negativeAmount ? initialData.amount * -1 : initialData.amount || 0,
        description: initialData.description || "",
        paymentMethod: initialData.paymentMethod || ""
      });
    } else {
      setForm({
        type: "",
        amount: 0,
        description: "",
        paymentMethod: ""
      });
    }
    clearErrors();
  }, [initialData, isOpen]);

  const clearErrors = () => {
    setError("");
    setErrorAmount("");
    setValidAmount(true);
  };

  //Validation
  const [validAmount, setValidAmount] = useState(true);

  const [errorAmount, setErrorAmount] = useState("");

  const handleChange = (name, value) => {
    let newValue = value;
    switch (name) {
      case "type":
        newValue = parseInt(value);
        break;
      case "amount":
        if (value <= 0 && mode !== "completePayment") {
          setValidAmount(false);
          setErrorAmount("Số tiền phải lớn hơn 0.");
        } else {
          newValue = parseInt(value);
          setValidAmount(true);
          setErrorAmount("");
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
    if (form.jobName === "" || form.type === "" || form.amount < 0) {
      setError("Vui lòng nhập thông tin bắt buộc.");
      return;
    }
    const invalidForms = !validAmount;
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
              Mẫu điền giao dịch
            </h2>
            <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 p-8">
            {!initialData && <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
              <div>
                <label className="block text-md font-bold">Loại giao dịch</label>
                <p className="text-xs text-gray-500">Nhập loại giao dịch</p>
              </div>
              <select
                name="type"
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">-- Nhập loại giao dịch --</option>
                <option value={1}>{getFinancialTransactionTypeText(1)}</option>
                <option value={5}>{getFinancialTransactionTypeText(5)}</option>
              </select>
            </div>}
            {mode != "completePayment" && <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
              <div>
                <label className="block text-md font-bold">Số tiền</label>
                <p className="text-xs text-gray-500">Nhập số tiền</p>
              </div>
              <input
                type="number"
                name="amount"
                value={form.amount || 0}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                required
              />
              {!validAmount && <p className="text-red-500 text-xs">{errorAmount}</p>}
            </div>}
            <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
              <div className="grid grid-cols-1">
                <label className="block text-md font-bold">Mô tả</label>
                <p className="text-xs text-gray-500">Nhập mô tả giao dịch</p>
              </div>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
              <div>
                <label className="block text-md font-bold">Phương thức thanh toán</label>
                <p className="text-xs text-gray-500">Chọn phương thức thanh toán</p>
              </div>
              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">-- Nhập hình thức thanh toán --</option>
                <option value="TienMat">Tiền mặt</option>
                <option value="NganHang">Chuyển khoản</option>
              </select>
            </div>
            {error && <div className="text-red-600 text-md text-right">{error}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer" onClick={onClose}>Hủy</button>
              <button type="submit" className="px-4 py-2 rounded background-primary text-white background-hovered cursor-pointer">
                Hoàn thành
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
