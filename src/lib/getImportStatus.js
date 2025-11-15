export const getImportStatus = (status) => {
    if (!status) return <p className="text-black">Không có trạng thái</p>
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
    if (!status) return "Không có trạng thái"
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