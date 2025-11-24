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