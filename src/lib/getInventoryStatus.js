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