import React, { useState } from 'react';
import { Modal, Box, Typography, SvgIcon, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

function SuccessModal({ isOpen, message, onClose }) {
    if (!isOpen) return null;
    const handleClose = () => onClose();

    return (
        <Modal open={isOpen} aria-labelledby="modal-success-title" aria-describedby="modal-success-description">
            <Box
                sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '1px solid #000', boxShadow: 24, }}
                className="p-4 rounded-xl text-center "
            >
                <Typography id="modal-success-title" variant="h5" component="h2">
                    Thành công
                </Typography>
                <SvgIcon component={CheckIcon} sx={{ color: 'green', fontSize: 60, border: '2px solid green', borderRadius: '50%', marginY: 2 }} />
                <Typography id="modal-success-description" variant='subtitle1'>
                    {message}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleClose()}
                    >
                        Xác nhận
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}

export default SuccessModal