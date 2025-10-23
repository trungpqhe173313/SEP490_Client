import React from 'react';
import { Modal, Box, Typography, SvgIcon } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function FailedModal({ isOpen, message, onClose }) {
    if (!isOpen) return null;
    const handleClose = () => onClose();

    return (
        <Modal open={isOpen} aria-labelledby="modal-failed-title" aria-describedby="modal-failed-description">
            <Box
                sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '1px solid #000', boxShadow: 24, }}
                className="p-4 rounded-xl text-center "
            >
                <Typography id="modal-failed-title" variant="h5" component="h2">
                    Thất bại
                </Typography>
                <SvgIcon component={CloseIcon} sx={{ color: 'red', fontSize: 60, border: '2px solid red', borderRadius: '50%', marginY: 2 }} />
                <Typography id="modal-failed-description" variant='subtitle1'>
                    {message}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleClose()}
                    >
                        Xác nhận
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}

export default FailedModal
