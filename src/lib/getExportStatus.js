export const getExportStatus = (status) => {
    if (!status) return <p className="text-black">Không có trạng thái</p>
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
    if (!status) return "Không có trạng thái"
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