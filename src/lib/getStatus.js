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
        case 1:
            return <p className="text-yellow-600">Đang vận chuyển</p>
        case 2:
            return <p className="text-green-600">Đã vận chuyển</p>
        case 3:
            return <p className="text-red-600">Đã hủy</p>
        default:
            return <p className="text-black">{status}: Không rõ</p>
    }
}

export const getTransferStatusText = (status) => {
    if (!status && status !== 0) return "Không có trạng thái"
    switch (status) {
        case 1:
            return "Đang vận chuyển"
        case 2:
            return "Đã vận chuyển"
        case 3:
            return "Đã hủy"
        default:
            return `${status}: Không rõ`
    }
}