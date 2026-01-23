"use client";
import React, { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import { productionService } from "@/services/production.service";
import { productionEmployeeService } from "@/services/productionEmployee.service";
import { employeeService } from "@/services/employee.service";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";
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
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";
import FactoryIcon from "@mui/icons-material/Factory";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ScaleIcon from "@mui/icons-material/Scale";
import { Tooltip, Chip, Alert, Box, LinearProgress } from "@mui/material";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import { useLogin } from "@/context/LoginContext";
import Loader from "@/components/Loader/loader";
import { removeLeadingZero, removeVietnameseTones } from "@/lib/formattingLib";

export default function ModifyProduction({ params }) {
  const router = useRouter();
  const { type, id } = React.use(params);
  const { isLogin, user, refreshUserInfo } = useLogin();
  const { loading, setLoading } = useLoading();
  const [products, setProducts] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productsForSearch, setProductsForSearch] = useState([]);
  const [productLoading, setProductLoading] = useState(false);

  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [materialsOriginal, setMaterialsOriginal] = useState([]);
  const [materialLoading, setMaterialLoading] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeesOriginal, setEmployeesOriginal] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  const [productionData, setProductionData] = useState(null);
  const [productionWeightLog, setProductionWeightLog] = useState(null);

  const [cart, setCart] = useState([]);
  const [note, setNote] = useState("");

  const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
  const [modalSuccessMessage, setModalSuccessMessage] = useState("");
  const [modalFailedOpen, setModalFailedOpen] = useState(false);
  const [modalFailedMessage, setModalFailedMessage] = useState("");
  const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

  const [errors, setErrors] = useState("");
  const [pageReady, setPageReady] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const pageRole = ["Manager", "Employee"];

  useEffect(() => {
    refreshUserInfo();
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!isLogin) {
      router.push("/login");
      return;
    }
    console.log(user.roles, typeof user.roles[0]);
    if (user?.roles && user.roles.some((r) => pageRole.includes(r))) {
      setPageReady(true);
    } else {
      router.push("/");
    }

  }, [isLogin, user, loading]);

  const fetchProduction = async () => {
    setDataLoading(true);
    try {
      if (!id || type === "create") {
        setDataLoading(false);
        return;
      }
      const response = await productionService.getProductionDetail(id);
      const weightLog = await productionService.getProductionWeight(id);
      setProductionData(response.data);
      setProductionWeightLog(weightLog.data);
      const cart = response.data.finishProducts.map((item) => ({
        productCode: item.productCode,
        productName: item.productName,
        productId: item.productId,
        produceQuantity: item.quantity, // Lấy từ GetDetail API
        actualWeight: weightLog.data.products.find((p) => p.productId === item.productId)?.totalWeight || 0, // Cân IoT chỉ để tham khảo
        iotQuantity: weightLog.data.products.find((p) => p.productId === item.productId)?.totalBags || 0, // Số lượng từ cân IoT để tham khảo
        weightPerUnit: item.weightPerUnit
      }));
      setCart(cart)
      const material = await Promise.all(
        response.data.materials.map(async (item) => ({
          productCode: item.productCode,
          productName: item.productName,
          productId: item.productId,
          produceQuantity: item.quantity,
          quantity: await getMaterialQuantity(item.productId),
          weightPerUnit: item.weightPerUnit
        }))
      );
      console.log(material)
      setSelectedMaterial(material[0]);
      setNote(response.data.note);
    } catch (error) {
      setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
      setModalFailedOpen(true);
    } finally {
      setDataLoading(false);
    }
  }

  const fetchProducts = async () => {
    try {
      // Fetch nguyên liệu từ kho ID 2
      const materialsResponse = await productService.getProductsByWarehouse(2);
      const materialsData = materialsResponse.data || [];
      const sortedMaterials = materialsData.map(item => ({
        ...item,
        productCode: item.code // Map code to productCode
      })).sort((a, b) => (a.lastUpdated || a.createdAt)?.localeCompare(b.lastUpdated || b.createdAt) || 0);
      setMaterials(sortedMaterials);
      setMaterialsOriginal(sortedMaterials);

      // Fetch thành phẩm từ nhà cung cấp ID 5 (Kho sản xuất nội bộ)
      const productsResponse = await productService.getProductBySupplier([5]);
      const productsData = productsResponse.data || [];
      const sortedProducts = productsData.map(item => ({
        ...item,
        productCode: item.code // Map code to productCode
      })).sort((a, b) => a.createdAt?.localeCompare(b.createdAt) || 0);
      setProducts(sortedProducts);
      setProductsForSearch(sortedProducts);
    } catch (error) {
      console.log(error);
    }
  };

  const searchProducts = async (name) => {
    const search = removeVietnameseTones(name);
    try {
      setProductLoading(true);
      setProductsForSearch(products.filter((p) =>
        (p.productCode || p.code || '').toLowerCase().includes(name.toLowerCase()) ||
        removeVietnameseTones(p.productName || '').includes(search)
      ).sort((a, b) => (a.createdAt || '')?.localeCompare(b.createdAt || '') || 0));
    } catch (error) {
      console.log(error);
    } finally {
      setProductLoading(false);
    }
  }

  const searchMaterial = async (name) => {
    const search = removeVietnameseTones(name);
    try {
      setMaterialLoading(true);
      setMaterials(materialsOriginal.filter((p) =>
        (p.productCode || p.code || '').toLowerCase().includes(name.toLowerCase()) ||
        removeVietnameseTones(p.productName || '').includes(search)
      ).sort((a, b) => (a.lastUpdated || a.createdAt || '')?.localeCompare(b.lastUpdated || b.createdAt || '') || 0));
    } catch (error) {
      console.log(error);
    } finally {
      setMaterialLoading(false);
    }
  }

  const fetchEmployees = async () => {
    try {
      const body = {
        pageIndex: 1,
        pageSize: 1000,
        isActive: true
      };
      const response = await employeeService.getAllEmployees(body);
      const employeesData = response.data.items || [];
      console.log('employeesData', employeesData);
      const sortedEmployees = employeesData
        .filter((emp) => emp.isActive)
        .sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
      setEmployees(sortedEmployees);
      setEmployeesOriginal(sortedEmployees);
    } catch (error) {
      console.log(error);
    }
  };

  const searchEmployee = async (name) => {
    try {
      setEmployeeLoading(true);

      const keyword = removeVietnameseTones(name || "").toLowerCase();

      const filtered = employeesOriginal.filter(emp => {
        const fullName = removeVietnameseTones(emp.fullName || "").toLowerCase();
        return fullName.includes(keyword);
      });

      filtered.sort((a, b) =>
        (a.fullName || "").localeCompare(b.fullName || "")
      );

      setEmployees(filtered);
    }
    catch (error) {
      console.log(error);
    }
    finally {
      setEmployeeLoading(false);
    }
  };


  const handleChangeDropdown = (item, field) => {
    if (field === "cart") {
      if (item) {
        handleAddCart(item);
        setTimeout(() => {
          setSelectedProduct(null);
        }, 0);
      }
    }
    if (field === "material") {
      if (item) {
        handleChangeMaterial(item, 0);
      }
    }
    if (field === "employee") {
      if (item) {
        setSelectedEmployee(item);
      }
    }
  };

  const handleChangeMaterial = async (item, produceQuantity) => {
    const newMaterial = {
      productCode: item.productCode || item.code,
      productName: item.productName,
      productId: item.productId,
      produceQuantity: parseInt(produceQuantity),
      quantity: await getMaterialQuantity(item.productId),
      weightPerUnit: item.weightPerUnit
    };
    setSelectedMaterial(newMaterial);
  }

  const handleAddCart = async (product) => {
    const existingProduct = cart.find((p) => p.productId === product.productId);
    if (existingProduct) {
      const updatedCart = cart.map((p) =>
        p.productId === product.productId ? { ...p, produceQuantity: (p.produceQuantity || 0) + 1 } : p
      );
      setCart(updatedCart);
      return;
    }
    setLoading(true);
    const newProduct = {
      productId: product.productId,
      productCode: product.productCode || product.code,
      productName: product.productName,
      produceQuantity: 0,
      quantity: product.quantity,
      weightPerUnit: product.weightPerUnit
    };
    const updatedCart = [...cart, newProduct];
    setCart(updatedCart);
    setLoading(false);
  };

  const handleRemoveCart = (productId) => {
    const updatedCart = cart.filter((p) => p.productId !== productId);
    setCart(updatedCart);
  };

  const handleChangeCart = (id, field, value) => {
    const updatedCart = cart.map((product) =>
      product.productId === id
        ? { ...product, [field]: Number(value) || 0 }
        : product
    );
    setCart(updatedCart);
  };

  const getMaterialQuantity = async (id) => {
    try {
      const body = { productId: id };
      const response = await productionService.getProductQuantity(body);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    if (!validationEmployee() || !validationMaterial() || !validationCart()) return;

    setLoading(true);

    try {
      if (type === "create") {
        const body = {
          materialProductId: selectedMaterial.productId,
          materialQuantity: selectedMaterial.produceQuantity,
          responsibleId: selectedEmployee?.userId,
          note,
          listFinishProduct: cart.map((item) => ({
            productId: item.productId,
            quantity: item.produceQuantity || 0,
          })),
        };

        await productionService.createProduction(body);

        setModalSuccessMessage("Tạo phiếu sản xuất thành công");
        setModalSuccessOpen(true);
      }

      else if (type === "update") {
        // Employee submits data + for approval, Manager only approves status
        if (user?.roles?.includes("Employee")) {
          // Employee: Update quantities + submit for approval (status 1 -> 4)
          const body = {
            finishProductQuantities: cart
              .filter(p => p.produceQuantity > 0)
              .map(item => ({
                productId: item.productId,
                quantity: item.produceQuantity,
              })),
            note: note,
          };
          await productionEmployeeService.submitForApproval(id, body);
          setModalSuccessMessage("Đã gửi phiếu sản xuất để chờ phê duyệt");
        } else {
          // Manager: Only approve status (status 4 -> 2), data already filled by employee
          await productionService.updateProductionToFinish(id);
          setModalSuccessMessage("Phê duyệt và hoàn thành phiếu sản xuất thành công");
        }
        setModalSuccessOpen(true);
      }

    } catch (error) {
      console.log(error);

      const message =
        error?.response?.data?.error?.message ||
        "Có lỗi xảy ra khi xử lý";

      setModalFailedMessage(`Lỗi: ${message}`);
      setModalFailedOpen(true);
    }
    finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!note || note.trim() === "") {
      setModalFailedMessage("Vui lòng nhập lý do từ chối vào phần ghi chú");
      setModalFailedOpen(true);
      return;
    }

    setLoading(true);
    try {
      const body = { note };
      await productionService.updateProductionToReject(id, body);
      setModalSuccessMessage("Từ chối phiếu sản xuất thành công");
      setModalSuccessOpen(true);
    } catch (error) {
      const message = error?.response?.data?.error?.message || "Không thể từ chối phiếu";
      setModalFailedMessage(`Lỗi: ${message}`);
      setModalFailedOpen(true);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!pageReady) return;
    fetchProducts();
    if (type === "create") {
      fetchEmployees();
    }
  }, [pageReady]);

  useEffect(() => {
    if (!products) return;
    fetchProduction();
  }, [products]);

  useEffect(() => {
    if (!selectedMaterial) return
    validationCart();
  }, [cart]);

  useEffect(() => {
    validationMaterial();
  }, [selectedMaterial]);

  useEffect(() => {
    validationEmployee();
  }, [selectedEmployee]);

  const validationEmployee = () => {
    if (!pageReady) return;
    if (type === "create" && !selectedEmployee) {
      setErrors("Vui lòng chọn nhân viên phụ trách sản xuất");
      return false;
    }
    setErrors("");
    return true;
  }

  const validationMaterial = () => {
    if (!pageReady) return;
    if (!selectedMaterial || selectedMaterial.produceQuantity <= 0 || Number.isInteger(selectedMaterial.produceQuantity) === false) {
      setErrors("Nguyên liệu không được để trống và phải là số nguyên dương");
      return false
    }
    if (selectedMaterial.produceQuantity > selectedMaterial.quantity) {
      setErrors("Số lượng tiêu thụ đang lớn hơn số lượng nguyên liệu trong kho");
      return false
    }
    setErrors("")
    return true
  }

  const validationCart = () => {
    if (!pageReady) return;
    if (cart.filter((p) => p.produceQuantity < 0).length > 0) {
      setErrors("Số lượng thành phẩm không thể là số âm");
      return false
    }
    if ((cart.filter((p) => p.produceQuantity > 0).length === 0) && type === "update") {
      setErrors("Thành phẩm không được để trống");
      return false
    }
    if ((cart.length === 0) && type === "create") {
      setErrors("Thành phẩm không được để trống");
      return false
    }
    if (cart.find((p) => p.productId === selectedMaterial.productId)) {
      setErrors("Đang sản xuất ra cùng 1 loại sản phẩm")
      return false
    }
    if (cart.find((p) => Number.isInteger(p.produceQuantity) === false)) {
      setErrors("Số lượng thành phẩm phải là số nguyên");
      return false;
    }
    setErrors("")
    return true
  }

  const handleExit = () => {
    router.push("/productions");
  }
  const handleExitForEmployee = () => {
    router.push("/productions/my-productions");
  }

  // Calculate summary data
  const getSummaryData = () => {
    const totalMaterialWeight = selectedMaterial ? selectedMaterial.produceQuantity * selectedMaterial.weightPerUnit : 0;
    const totalExpectedWeight = cart.reduce((sum, p) => sum + (p.produceQuantity * p.weightPerUnit), 0);
    const totalActualWeight = cart.reduce((sum, p) => sum + (p.actualWeight || 0), 0);
    const totalProducts = cart.filter(p => p.produceQuantity > 0).length;
    const conversionRate = totalMaterialWeight > 0 ? ((totalExpectedWeight / totalMaterialWeight) * 100).toFixed(1) : 0;
    const stockUsageRate = selectedMaterial?.quantity > 0 ? ((selectedMaterial.produceQuantity / selectedMaterial.quantity) * 100).toFixed(1) : 0;

    return {
      totalMaterialWeight,
      totalExpectedWeight,
      totalActualWeight,
      totalProducts,
      conversionRate,
      stockUsageRate,
      materialRemaining: selectedMaterial ? selectedMaterial.quantity - selectedMaterial.produceQuantity : 0
    };
  }

  const handleQuickSetQuantity = (multiplier) => {
    if (!selectedMaterial) return;
    const newQuantity = Math.min(multiplier, selectedMaterial.quantity);
    handleChangeMaterial(selectedMaterial, newQuantity);
  }

  if (!pageReady) return <Loader />;
  if (dataLoading && type === "update") return <Loader />;

  const summary = getSummaryData();

  return (
    <div className="p-4 space-y-4">
      {/* ===== Summary Dashboard Cards - Temporarily Commented =====
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Nguyên liệu tiêu thụ</p>
              <p className="text-2xl font-bold">{summary.totalMaterialWeight} kg</p>
              {selectedMaterial && (
                <p className="text-xs opacity-80 mt-1">Còn lại: {summary.materialRemaining} bao</p>
              )}
            </div>
            <InventoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
          </div>
          {selectedMaterial && (
            <div className="mt-2">
              <LinearProgress 
                variant="determinate" 
                value={Math.min(parseFloat(summary.stockUsageRate), 100)} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': { backgroundColor: 'white' }
                }}
              />
              <p className="text-xs mt-1 opacity-80">Sử dụng {summary.stockUsageRate}% tồn kho</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Thành phẩm dự kiến</p>
              <p className="text-2xl font-bold">{summary.totalExpectedWeight} kg</p>
              <p className="text-xs opacity-80 mt-1">{summary.totalProducts} sản phẩm</p>
            </div>
            <FactoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
          </div>
        </div>

        {type === "update" && (
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Sản lượng thực tế</p>
                <p className="text-2xl font-bold">{Math.round(summary.totalActualWeight * 1000) / 1000} kg</p>
                <p className="text-xs opacity-80 mt-1">
                  {summary.totalExpectedWeight > 0 
                    ? `${((summary.totalActualWeight / summary.totalExpectedWeight) * 100).toFixed(1)}% so với dự kiến`
                    : 'Chưa có dữ liệu'
                  }
                </p>
              </div>
              <ScaleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </div>
          </div>
        )}

        <div className={`bg-gradient-to-br ${summary.conversionRate >= 95 ? 'from-emerald-500 to-emerald-600' : 'from-orange-500 to-orange-600'} text-white p-4 rounded-xl shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Tỷ lệ chuyển đổi</p>
              <p className="text-2xl font-bold">{summary.conversionRate}%</p>
              <p className="text-xs opacity-80 mt-1">
                {summary.conversionRate >= 95 ? 'Hiệu suất tốt' : 'Có thể cải thiện'}
              </p>
            </div>
            <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
          </div>
        </div>
      </div>
      ===== End Summary Dashboard Cards ===== */}

      {/* Validation Alert */}
      {errors && (
        <Alert severity="error" icon={<WarningIcon />} className="shadow-md">
          <strong>Lỗi:</strong> {errors}
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex gap-4">

        <div className="w-1/2 flex flex-col gap-4">
          {type === "create" && (
            <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <InfoIcon className="text-purple-600" />
                <p className="text-xl font-bold text-gray-800">Nhân viên phụ trách</p>
              </div>
              <AutocompleteCommon
                name="employeeId"
                value={selectedEmployee}
                loading={employeeLoading}
                options={employees}
                onSelect={(item) => handleChangeDropdown(item, "employee")}
                onSearch={searchEmployee}
                getOptionLabel={(option) => `${option.fullName}`}
                getOptionKey={(option) => option.userId}
              />
            </div>
          )}
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <InventoryIcon className="text-blue-600" />
              <p className="text-xl font-bold text-gray-800">Nguyên liệu sản xuất</p>
            </div>
            {!id ? (
              <AutocompleteCommon
                name="productId"
                value={selectedMaterial}
                loading={materialLoading}
                options={materials}
                onSelect={(item) => handleChangeDropdown(item, "material")}
                onSearch={searchMaterial}
                getOptionLabel={(option) => `${option.productCode || option.code} - ${option.productName}`}
                getOptionKey={(option) => option.productId}
              />
            ) : (
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                disabled
                value={selectedMaterial?.productName || ""}
              />
            )}
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            {selectedMaterial && !id && (
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Chọn nhanh số lượng:</p>
                <div className="flex gap-2">
                  {[10, 50, 100, 200].map(num => (
                    <button
                      key={num}
                      onClick={() => handleQuickSetQuantity(num)}
                      disabled={num > selectedMaterial.quantity}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${num > selectedMaterial.quantity
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                    >
                      {num} bao
                    </button>
                  ))}
                  <button
                    onClick={() => handleQuickSetQuantity(selectedMaterial.quantity)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-all"
                  >
                    Tất cả ({selectedMaterial.quantity})
                  </button>
                </div>
              </div>
            )}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow className="background-primary">
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Mã NL</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Tên nguyên liệu</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">Tồn kho</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">KL/đơn vị</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">SL tiêu thụ</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">Tổng KL</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!selectedMaterial ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <div className="py-8">
                          <InventoryIcon sx={{ fontSize: 48, color: '#9CA3AF', mb: 2 }} />
                          <p className="text-lg text-gray-500">
                            Vui lòng chọn nguyên liệu
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={selectedMaterial.productId} hover sx={{ backgroundColor: '#F9FAFB' }}>
                      <TableCell><strong>{selectedMaterial.productCode}</strong></TableCell>
                      <TableCell>{selectedMaterial.productName}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={selectedMaterial.quantity}
                          size="small"
                          color={selectedMaterial.quantity > 100 ? "success" : selectedMaterial.quantity > 50 ? "warning" : "error"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={`${selectedMaterial.weightPerUnit} kg`} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center" sx={{ width: 220 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title={type === "update" && productionData?.status !== 0 ? "Nguyên liệu chỉ sửa được khi chưa bắt đầu sản xuất" : "Giảm 1"}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleChangeMaterial(selectedMaterial, selectedMaterial.produceQuantity - 1)}
                                disabled={type === "update" && productionData?.status !== 0}
                                sx={{
                                  border: "1px solid #E5E7EB",
                                  height: "32px",
                                  width: "32px",
                                  '&:hover': { backgroundColor: type === "update" && productionData?.status !== 0 ? 'transparent' : '#F3F4F6' }
                                }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <TextField
                            type="number"
                            size="small"
                            disabled={type === "update" && productionData?.status !== 0}
                            inputProps={{
                              min: 0,
                              style: {
                                width: 60,
                                textAlign: "center",
                                height: 10,
                                fontWeight: 600,
                                color: selectedMaterial.produceQuantity < 0 || selectedMaterial.produceQuantity > selectedMaterial.quantity ? '#EF4444' : '#1F2937'
                              },
                            }}
                            value={removeLeadingZero(selectedMaterial.produceQuantity)}
                            onChange={(e) => handleChangeMaterial(selectedMaterial, e.target.value)}
                            variant="outlined"
                            error={selectedMaterial.produceQuantity < 0 || selectedMaterial.produceQuantity > selectedMaterial.quantity}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: selectedMaterial.produceQuantity < 0 || selectedMaterial.produceQuantity > selectedMaterial.quantity ? '#EF4444' : '#D1D5DB',
                                  borderWidth: 2
                                },
                              },
                              marginX: "8px",
                            }}
                          />
                          <Tooltip title={type === "update" && productionData?.status !== 0 ? "Nguyên liệu chỉ sửa được khi chưa bắt đầu sản xuất" : "Tăng 1"}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleChangeMaterial(selectedMaterial, parseInt(selectedMaterial.produceQuantity) + 1)}
                                disabled={type === "update" && productionData?.status !== 0}
                                sx={{
                                  border: "1px solid #E5E7EB",
                                  height: "32px",
                                  width: "32px",
                                  '&:hover': { backgroundColor: type === "update" && productionData?.status !== 0 ? 'transparent' : '#F3F4F6' }
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <strong className="text-blue-700">{isNaN(selectedMaterial.produceQuantity * selectedMaterial.weightPerUnit) ? 0 : (selectedMaterial.produceQuantity * selectedMaterial.weightPerUnit)} kg</strong>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          {productionWeightLog && <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <ScaleIcon className="text-purple-600" />
              <p className="text-xl font-bold text-gray-800">Chi tiết phiếu cân</p>
            </div>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow className="background-primary">
                    <TableCell sx={{ color: "white" }}>Tên sản phẩm</TableCell>
                    <TableCell sx={{ color: "white" }} align="center">Số lượng (Bao)</TableCell>
                    <TableCell sx={{ color: "white" }} align="center">Tổng khối lượng</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productionWeightLog.products.length > 0 ? productionWeightLog.products.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="center">{item.totalBags}</TableCell>
                      <TableCell align="center">{Math.round(item.totalWeight * 1000) / 1000} kg</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <p className="text-lg">
                          Chưa có dữ liệu cân thành phẩm
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>}
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <InfoIcon className="text-gray-600" />
              <h1 className="text-xl font-bold text-gray-800">Ghi chú{type === "update" && user?.roles?.includes("Manager") && <span className="text-red-600 ml-1">(*Bắt buộc nếu từ chối)</span>}</h1>
            </div>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder={type === "update" && user?.roles?.includes("Manager") ? "Nhập lý do từ chối (nếu từ chối)..." : "Nhập ghi chú cho phiếu sản xuất..."}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            {type === "update" && user?.roles?.includes("Manager") ? (
              <div className="flex gap-3">
                <button
                  className="flex-1 px-6 py-3 bg-green-500 text-white font-semibold rounded-xl transition-all transform hover:bg-green-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  onClick={handleSubmit}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircleIcon />
                    <span>Phê duyệt và hoàn thành</span>
                  </div>
                </button>
                <button
                  className="flex-1 px-6 py-3 bg-red-500 text-white font-semibold rounded-xl transition-all transform hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  onClick={handleReject}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Yêu cầu làm lại</span>
                  </div>
                </button>
              </div>
            ) : (
              <button
                className={`w-full px-6 py-3 text-white font-semibold rounded-xl transition-all transform ${errors
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'background-primary background-hovered hover:scale-[1.02] active:scale-[0.98] shadow-lg'
                  }`}
                onClick={handleSubmit}
                disabled={!!errors}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircleIcon />
                  <span>
                    {type === "update"
                      ? "Gửi phê duyệt"
                      : "Tạo phiếu sản xuất"
                    }
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>

        <div className="w-1/2 flex flex-col gap-4">
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <FactoryIcon className="text-green-600" />
              <p className="text-xl font-bold text-gray-800">Thành phẩm sản xuất</p>
              {cart.length > 0 && (
                <Chip
                  label={`${cart.length} sản phẩm`}
                  size="small"
                  color="success"
                  className="ml-auto"
                />
              )}
            </div>
            {type === "update" ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <InfoIcon className="text-blue-600" fontSize="small" />
                  <p className="text-sm text-blue-800">
                    Không thể thêm/xóa thành phẩm khi đang hoàn thành sản xuất
                  </p>
                </div>
              </div>
            ) : (
              <AutocompleteCommon
                name="productId"
                value={selectedProduct}
                loading={productLoading}
                options={productsForSearch}
                onSelect={(item) => handleChangeDropdown(item, "cart")}
                onSearch={searchProducts}
                getOptionLabel={(option) => `${option.productCode || option.code} - ${option.productName}`}
                getOptionKey={(option) => option.productId}
              />
            )}
          </div>
          <div className="max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <TableContainer component={Paper} className="shadow-md border border-gray-100">
              <Table size="small">
                <TableHead>
                  <TableRow className="background-primary">
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Mã TP</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Tên thành phẩm</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">KL/đơn vị</TableCell>
                    {type === "update" && <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">SL sản xuất</TableCell>}
                    <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <div className="py-12">
                          <FactoryIcon sx={{ fontSize: 64, color: '#9CA3AF', mb: 2 }} />
                          <p className="text-xl text-gray-500 mb-2">
                            Chưa có thành phẩm
                          </p>
                          <p className="text-sm text-gray-400">
                            Sử dụng ô tìm kiếm phía trên để thêm sản phẩm
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    cart.map((product, index) => (
                      <TableRow
                        key={product.productId}
                        hover
                        sx={{
                          backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                          '&:hover': { backgroundColor: '#F3F4F6' }
                        }}
                      >
                        <TableCell><strong>{product.productCode}</strong></TableCell>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell align="center">
                          <Chip label={`${product.weightPerUnit} kg`} size="small" variant="outlined" color="primary" />
                        </TableCell>
                        {type === "update" && <TableCell align="center" sx={{ width: 220 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Tooltip title={user?.roles?.includes("Manager") ? "Chỉ Employee mới được sửa số lượng" : "Giảm 1"}>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleChangeCart(product.productId, "produceQuantity", product.produceQuantity - 1)}
                                  disabled={user?.roles?.includes("Manager") && productionData?.status !== 5}
                                  sx={{
                                    border: "1px solid #E5E7EB",
                                    height: "32px",
                                    width: "32px",
                                    '&:hover': { backgroundColor: user?.roles?.includes("Manager") && productionData?.status !== 5 ? 'transparent' : '#FEE2E2' }
                                  }}
                                >
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <TextField
                              type="number"
                              size="small"
                              disabled={user?.roles?.includes("Manager") && productionData?.status !== 5}
                              inputProps={{
                                min: 0,
                                style: {
                                  width: 60,
                                  textAlign: "center",
                                  height: 10,
                                  fontWeight: 600,
                                  color: product.produceQuantity < 0 ? '#EF4444' : '#1F2937'
                                },
                              }}
                              value={removeLeadingZero(product.produceQuantity)}
                              onChange={(e) => handleChangeCart(product.productId, "produceQuantity", e.target.value)}
                              variant="outlined"
                              error={product.produceQuantity < 0}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': {
                                    borderColor: product.produceQuantity < 0 ? '#EF4444' : '#D1D5DB',
                                    borderWidth: 2
                                  },
                                },
                                marginX: "8px",
                              }}
                            />
                            <Tooltip title={user?.roles?.includes("Manager") ? "Chỉ Employee mới được sửa số lượng" : "Tăng 1"}>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleChangeCart(product.productId, "produceQuantity", product.produceQuantity + 1)}
                                  disabled={user?.roles?.includes("Manager") && productionData?.status !== 5}
                                  sx={{
                                    border: "1px solid #E5E7EB",
                                    height: "32px",
                                    width: "32px",
                                    '&:hover': { backgroundColor: user?.roles?.includes("Manager") && productionData?.status !== 5 ? 'transparent' : '#D1FAE5' }
                                  }}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        }
                        <TableCell align="center">
                          {type === "update" ? (
                            <Tooltip title="Không thể xóa thành phẩm khi đang hoàn thành sản xuất">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled
                                  sx={{
                                    backgroundColor: "#F3F4F6",
                                    height: "32px",
                                    width: "32px",
                                    color: "#9CA3AF",
                                    cursor: "not-allowed"
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Xóa sản phẩm">
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveCart(product.productId)}
                                sx={{
                                  backgroundColor: "#FEE2E2",
                                  height: "32px",
                                  width: "32px",
                                  color: "#EF4444",
                                  '&:hover': { backgroundColor: '#FCA5A5' }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    )))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>
      <SuccessModal
        isOpen={modalSuccessOpen}
        message={modalSuccessMessage}
        onClose={() => {
          setModalSuccessOpen(false);
          user?.roles?.includes("Manager") ? handleExit() : handleExitForEmployee();
        }}
      />
      <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
    </div >
  )
}

