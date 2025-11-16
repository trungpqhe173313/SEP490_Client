import React from 'react'

export default function ModifyPriceList({ params }) {
    const { id } = React.use(params);
    return (
        <div>{ id ? "ModifyPriceList " + id : "NoObject" }</div>
    )
}

