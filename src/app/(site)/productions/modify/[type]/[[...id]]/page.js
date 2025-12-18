"use client";
import React, { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import { productionService } from "@/services/production.service";
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
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import { useLogin } from "@/context/LoginContext";
import Loader from "@/components/Loader/loader";
import { removeLeadingZero } from "@/lib/formattingLib";

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
  const [materialLoading, setMaterialLoading] = useState(false);

  const [productionData, setProductionData] = useState(null);

  const [cart, setCart] = useState([]);
  const [note, setNote] = useState("");

  const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
  const [modalSuccessMessage, setModalSuccessMessage] = useState("");
  const [modalFailedOpen, setModalFailedOpen] = useState(false);
  const [modalFailedMessage, setModalFailedMessage] = useState("");
  const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

  const [errors, setErrors] = useState("");
  const [pageReady, setPageReady] = useState(false);
  const pageRole = ["Manager"];

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

  const fetchProduction = async () => {
    setLoading(true);
    try {
      if (!id) return;
      const response = await productionService.getProductionDetail(id);
      setProductionData(response.data);
      const cart = response.data.finishProducts.map((item) => ({
        productCode: item.productCode,
        productName: item.productName,
        productId: item.productId,
        produceQuantity: item.quantity,
        quantity: getQuantity(item.productId),
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
      setSelectedMaterial(material[0]);
      setNote(response.data.note);
    } catch (error) {
      setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
      setModalFailedOpen(true);
    } finally {
      setLoading(false);
    }
  }

  const fetchProducts = async () => {
    const body = { pageIndex: 1, pageSize: 1000, productName: "", categoryId: 9 };
    await productService.getProductAvailable(body)
      .then((response) => {
        setProducts(response.data.items);
        setProductsForSearch(response.data.items.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
        setMaterials(response.data.items
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const searchProducts = async (name) => {
    try {
      setProductLoading(true);
      setProductsForSearch(products.filter((p) =>
        p.productCode.toLowerCase().includes(name.toLowerCase()) ||
        p.productName.toLowerCase().includes(name.toLowerCase())
      ).sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
    } catch (error) {
      console.log(error);
    } finally {
      setProductLoading(false);
    }
  }

  const searchMaterial = async (name) => {
    try {
      setMaterialLoading(true);
      setMaterials(products.filter((p) =>
        p.productCode.toLowerCase().includes(name.toLowerCase()) ||
        p.productName.toLowerCase().includes(name.toLowerCase())
      ).sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
    } catch (error) {
      console.log(error);
    } finally {
      setMaterialLoading(false);
    }
  }

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
  };

  const handleChangeMaterial = async (item, produceQuantity) => {
    const newMaterial = {
      productCode: item.productCode,
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
      productCode: product.productCode,
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

  const getQuantity = (id) => {
    const product = products.find((p) => p.productId === id);
    return product ? product.quantity : 5;
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
    if (!validation()) return;
    setLoading(true);
    if (type === "create") {
      const body = {
        materialProductId: selectedMaterial.productId,
        materialQuantity: selectedMaterial.produceQuantity,
        note: note,
        listFinishProduct: cart.filter((p) => p.produceQuantity > 0).map((item) => ({
          productId: item.productId,
          quantity: item.produceQuantity,
        })),
      }
      await productionService.createProduction(body)
        .then((response) => {
          setModalSuccessMessage(`Tạo phiếu sản xuất thành công`);
          setModalSuccessOpen(true);
        })
        .catch((error) => {
          setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
          setModalFailedOpen(true);
        });
    } else if (type === "update") {
      const body = {
        finishProductQuantities: cart.filter((p) => p.produceQuantity > 0).map((item) => ({
          productId: item.productId,
          quantity: item.produceQuantity
        }))
      }
      await productionService.updateProductionToFinish(id, body)
        .then((response) => {
          setModalSuccessMessage(`Cập nhật phiếu sản xuất thành công`);
          setModalSuccessOpen(true);
        })
        .catch((error) => {
          setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
          setModalFailedOpen(true);
        });
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!pageReady) return;
    fetchProducts();
  }, [pageReady]);

  useEffect(() => {
    if (!products) return;
    fetchProduction();
  }, [products]);

  useEffect(() => {
    validation()
  }, [cart, selectedMaterial]);

  const validation = () => {
    if (!pageReady) return;
    if (cart.filter((p) => p.produceQuantity < 0).length > 0) {
      setErrors("Số lượng thành phẩm không thể là số âm");
      return false
    }
    if (cart.filter((p) => p.produceQuantity > 0).length === 0) {
      setErrors("Thành phẩm không được để trống");
      return false
    }
    if (!selectedMaterial || selectedMaterial.produceQuantity <= 0 || Number.isInteger(selectedMaterial.produceQuantity) === false) {
      setErrors("Nguyên liệu không được để trống và phải là số nguyên dương");
      return false
    }
    if (selectedMaterial.produceQuantity > selectedMaterial.quantity) {
      setErrors("Số lượng tiêu thụ đang lớn hơn số lượng nguyên liệu trong kho");
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

  if (!pageReady) return <Loader />;

  return (
    <div className="flex gap-4 p-4">

      <div className="w-1/2 flex flex-col gap-4">
        <div className="p-4 bg-white rounded-xl">
          <p className="text-xl font-bold">Tìm kiếm nguyên liệu</p>
          {!id ? (
            <AutocompleteCommon
              name="productId"
              value={selectedMaterial}
              loading={materialLoading}
              options={materials}
              onSelect={(item) => handleChangeDropdown(item, "material")}
              onSearch={searchMaterial}
              getOptionLabel={(option) => `${option.productCode} - ${option.productName}`}
              getOptionKey={(option) => option.productId}
            />
          ) : (
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled
              value={selectedMaterial?.productName || ""}
            />
          )}
        </div>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow className="background-primary">
                <TableCell sx={{ color: "white" }}>Mã nguyên liệu</TableCell>
                <TableCell sx={{ color: "white" }}>Tên nguyên liệu</TableCell>
                <TableCell sx={{ color: "white" }} align="center">Tồn kho</TableCell>
                <TableCell sx={{ color: "white" }} align="center">Khối lượng</TableCell>
                <TableCell sx={{ color: "white" }} align="center">Số lượng tiêu thụ</TableCell>
                <TableCell sx={{ color: "white" }} align="center">Tổng khối lượng tiêu thụ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!selectedMaterial ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <p className="text-lg">
                      Chưa có nguyên liệu
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={selectedMaterial.productId} hover>
                  <TableCell>{selectedMaterial.productCode}</TableCell>
                  <TableCell>{selectedMaterial.productName}</TableCell>
                  <TableCell align="center">{selectedMaterial.quantity}</TableCell>
                  <TableCell align="center">{selectedMaterial.weightPerUnit}</TableCell>
                  <TableCell align="center" sx={{ width: 200 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleChangeMaterial(selectedMaterial, selectedMaterial.produceQuantity - 1)}
                      sx={{ border: "1px solid #ccc", height: "28px" }}
                    // disabled={type === 'update'}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <TextField
                      type="number"
                      size="small"
                      inputProps={{
                        min: 0,
                        style: {
                          width: 50,
                          textAlign: "center",
                          height: 10,
                          color: selectedMaterial.produceQuantity < 0 || selectedMaterial.produceQuantity > selectedMaterial.quantity ? 'red' : 'inherit'
                        },
                      }}
                      value={removeLeadingZero(selectedMaterial.produceQuantity)}
                      onChange={(e) => handleChangeMaterial(selectedMaterial, e.target.value)}
                      variant="outlined"
                      error={selectedMaterial.produceQuantity < 0}
                      //disabled={type === 'update'}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: selectedMaterial.produceQuantity < 0 || selectedMaterial.produceQuantity > selectedMaterial.quantity ? 'red' : 'inherit',
                          },
                        },
                        marginX: "5px",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleChangeMaterial(selectedMaterial, parseInt(selectedMaterial.produceQuantity) + 1)}
                      sx={{ border: "1px solid #ccc", height: "28px" }}
                    //disabled={type === 'update'}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">{selectedMaterial.produceQuantity * selectedMaterial.weightPerUnit} kg</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <div className="p-4 bg-white rounded-xl">
          <h1 className="text-xl font-bold">Ghi chú</h1>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {errors && <p className="text-red-500 mb-4">{errors}</p>}
          <button className="background-primary background-hovered px-4 py-2 text-white rounded-xl"
            onClick={handleSubmit}
          >
            Hoàn thành
          </button>
        </div>
      </div>

      <div className="w-1/2 flex flex-col gap-4">
        <div className="p-4 bg-white rounded-xl">
          <p className="text-xl font-bold">Tìm kiếm sản phẩm</p>
          <AutocompleteCommon
            name="productId"
            value={selectedProduct}
            loading={productLoading}
            options={productsForSearch}
            onSelect={(item) => handleChangeDropdown(item, "cart")}
            onSearch={searchProducts}
            getOptionLabel={(option) => `${option.productCode} - ${option.productName}`}
            getOptionKey={(option) => option.productId}
          />
        </div>
        <div className="max-h-[80vh] overflow-y-scroll scrollbar-hidden">
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow className="background-primary">
                  <TableCell sx={{ color: "white" }}>Mã thành phẩm</TableCell>
                  <TableCell sx={{ color: "white" }}>Tên thành phẩm</TableCell>
                  <TableCell sx={{ color: "white" }} align="center">Khối lượng</TableCell>
                  <TableCell sx={{ color: "white" }} align="center">Số lượng sản xuất</TableCell>
                  <TableCell sx={{ color: "white" }} align="center">{type === 'update' ? 'Sản lượng thực tế' : 'Sản lượng dự kiến'}</TableCell>
                  <TableCell sx={{ color: "white" }} align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <p className="my-10 text-xl">
                        Chưa có sản phẩm
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  cart.map((product) => (
                    <TableRow key={product.productId} hover>
                      <TableCell>{product.productCode}</TableCell>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell align="center">{product.weightPerUnit}</TableCell>
                      <TableCell align="center" sx={{ width: 200 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleChangeCart(product.productId, "produceQuantity", product.produceQuantity - 1)}
                          sx={{ border: "1px solid #ccc", height: "28px" }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          type="number"
                          size="small"
                          inputProps={{
                            min: 0,
                            style: {
                              width: 50,
                              textAlign: "center",
                              height: 10,
                              color: product.produceQuantity < 0 ? 'red' : 'inherit'
                            },
                          }}
                          value={removeLeadingZero(product.produceQuantity)}
                          onChange={(e) => handleChangeCart(product.productId, "produceQuantity", e.target.value)}
                          variant="outlined"
                          error={product.produceQuantity < 0}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: product.produceQuantity < 0 ? 'red' : 'inherit',
                              },
                            },
                            marginX: "5px",
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleChangeCart(product.productId, "produceQuantity", product.produceQuantity + 1)}
                          sx={{ border: "1px solid #ccc", height: "28px" }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">{product.produceQuantity * product.weightPerUnit} kg</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveCart(product.productId)}
                          sx={{ backgroundColor: "red", height: "28px", color: "white" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
      <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => { setModalSuccessOpen(false), handleExit() }} />
      <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
    </div >
  )
}

