export const getExportStatus = (status) => {
    if (!status && status !== 0) return <p className="text-black">Không có trạng thái</p>
    switch (status) {
        case 1:
            return <p className="text-yellow-600">Nháp</p>
        case 2:
            return <p className="text-blue-600">Lên đơn</p>
        case 3:
            return <p className="text-yellow-600">Đang giao</p>
        case 4:
            return <p className="text-green-600">Đã giao</p>
        case 5:
            return <p className="text-red-600">Thất bại</p>
        case 6:
            return <p className="text-red-600">Hủy</p>
        default:
            return <p className="text-black">{status}: Không rõ</p>
    }
}

export const getExportStatusText = (status) => {
    if (!status && status !== 0) return "Không có trạng thái"
    switch (status) {
        case 1:
            return "Nháp"
        case 2:
            return "Lên đơn"
        case 3:
            return "Đang giao"
        case 4:
            return "Đã giao"
        case 5:
            return "Thất bại"
        case 6:
            return "Hủy"
        default:
            return `${status}: Không rõ`
    }
}

export const getImportStatus = (status) => {
    if (!status && status !== 0) return <p className="text-black">Không có trạng thái</p>
    switch (status) {
        case 1:
            return <p className="text-yellow-600">Đang kiểm</p>
        case 2:
            return <p className="text-green-600">Đã nhận hàng</p>
        case 3:
            return <p className="text-red-600">Trả hàng</p>
        default:
            return <p className="text-black">{status}: Không rõ</p>
    }
}

export const getImportStatusText = (status) => {
    if (!status && status !== 0) return "Không có trạng thái"
    switch (status) {
        case 1:
            return "Đang kiểm"
        case 2:
            return "Đã nhận hàng"
        case 3:
            return "Trả hàng"
        default:
            return `${status}: Không rõ`
    }
}

export const getInventoryStatus = (status) => {
    if (!status && status !== 0) return <p className="text-black">Không có trạng thái</p>
    switch (status) {
        case 1:
            return <p className="text-yellow-600">Nháp</p>
        case 2:
            return <p className="text-green-600">Đã giải quyết</p>
        case 3:
            return <p className="text-red-600">Đã xóa</p>
        default:
            return <p className="text-black">{status}: Không rõ</p>
    }
}

export const getInventoryStatusText = (status) => {
    if (!status && status !== 0) return "Không có trạng thái"
    switch (status) {
        case 1:
            return "Nháp"
        case 2:
            return "Đã giải quyết"
        case 3:
            return "Đã xóa"
        default:
            return `${status}: Không rõ`
    }
}

export const getProductionStatus = (status) => {
    if (!status && status !== 0) return <p className="text-black">Không có trạng thái</p>
    switch (status) {
        case 0:
            return <p className="text-blue-600">Đang chờ xử lý</p>
        case 1:
            return <p className="text-yellow-600">Đang xử lý</p>
        case 2:
            return <p className="text-green-600">Hoàn thành</p>
        case 3:
            return <p className="text-red-600">Hủy</p>
        default:
            return <p className="text-black">{status}: Không rõ</p>
    }
}

export const getProductionStatusText = (status) => {
    if (!status && status !== 0) return "Không có trạng thái"
    switch (status) {
        case 0:
            return "Đang chờ xử lý"
        case 1:
            return "Đang xử lý"
        case 2:
            return "Hoàn thành"
        case 3:
            return "Hủy"
        default:
            return `${status}: Không rõ`
    }
}

export const getTransferStatus = (status) => {
    if (!status && status !== 0) return <p className="text-black">Không có trạng thái</p>
    switch (status) {
        case 9:
            return <p className="text-yellow-600">Đang vận chuyển</p>
        case 10:
            return <p className="text-green-600">Đã vận chuyển</p>
        case 6:
            return <p className="text-red-600">Đã hủy</p>
        default:
            return <p className="text-black">{status}: Không rõ</p>
    }
}

export const getTransferStatusText = (status) => {
    if (!status && status !== 0) return "Không có trạng thái"
    switch (status) {
        case 9:
            return "Đang vận chuyển"
        case 10:
            return "Đã vận chuyển"
        case 6:
            return "Đã hủy"
        default:
            return `${status}: Không rõ`
    }
}

export const getFinancialTransactionType = (type) => {
    if (!type && type !== 0) return <p className="text-black">Không có loại</p>
    switch (type) {
        case 0:
            return <p className="text-green-600">Thu tiền khách hàng</p>
        case 1:
            return <p className="text-green-600">Thu khác</p>
        case 2:
            return <p className="text-red-600">Thanh toán lương</p>
        case 3:
            return <p className="text-red-600">Ứng lương</p>
        case 4:
            return <p className="text-red-600">Thanh toán nhận hàng</p>
        case 5:
            return <p className="text-red-600">Chi khác</p>
        default:
            return <p className="text-black">{type}: Không rõ</p>
    }
}

export const getFinancialTransactionTypeText = (type) => {
    if (!type && type !== 0) return "Không có loại"
    switch (type) {
        case 0:
            return "Thu tiền khách hàng"
        case 1:
            return "Thu khác"
        case 2:
            return "Thanh toán lương"
        case 3:
            return "Ứng lương"
        case 4:
            return "Thanh toán nhận hàng"
        case 5:
            return "Chi khác"
        default:
            return `${type}: Không rõ`
    }
}

export const getPaymentMethod = (method) => {
    if (!method && method !== 0) return 'Không có'
    switch (method) {
        case 'TienMat':
        case 'Cash':
            return "Tiền mặt"
        case 'NganHang':
        case 'Bank':
            return "Chuyển khoản"
        default:
            return `${type}: Không rõ`
    }
}