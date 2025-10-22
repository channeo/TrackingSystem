import React, { useState, useRef, useEffect } from 'react';
import { Modal, Box, Button, Typography, Input, Chip, LinearProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { walletApi } from '../services/api';
import gsap from 'gsap';
import './ImportModal.css';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ open, onClose, onImportSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'json'>('csv');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // GSAP Animations
  useEffect(() => {
    if (open && modalRef.current && contentRef.current) {
      const tl = gsap.timeline();
      
      tl.fromTo(modalRef.current,
        { opacity: 0, scale: 0.8, y: -50 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
      );

      // Animate children elements safely
      const children = Array.from(contentRef.current.children);
      if (children.length > 0) {
        tl.fromTo(children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
          "-=0.3"
        );
      }
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validTypes = ['.csv', '.json', 'text/csv', 'application/json'];
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(`.${fileExtension}`) && !validTypes.includes(selectedFile.type)) {
      alert('Chỉ chấp nhận file CSV hoặc JSON');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File quá lớn. Kích thước tối đa là 5MB');
      return;
    }

    setFile(selectedFile);
    
    // Auto-detect file type
    if (fileExtension === 'json' || selectedFile.type === 'application/json') {
      setFileType('json');
    } else {
      setFileType('csv');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      await walletApi.importWallets(file, fileType);
      onImportSuccess();
      
      // Success animation
      if (modalRef.current) {
        gsap.to(modalRef.current, {
          scale: 1.05,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        });
      }
      
      setTimeout(() => {
        setFile(null);
        onClose();
      }, 1000);
      
    } catch (error) {
      alert('Import thất bại: ' + error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.8,
        y: 50,
        duration: 0.4,
        ease: "power2.in",
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <Modal open={open} onClose={handleClose} className="import-modal">
      <Box 
        ref={modalRef}
        className="modal-container"
      >
        <Typography variant="h5" gutterBottom className="modal-title">
          <CloudUploadIcon className="title-icon" />
          Import Wallets
        </Typography>
        
        <Box ref={contentRef} className="modal-content">
          {/* File Type Selection */}
          <Box className="file-type-section">
            <Typography variant="subtitle1" className="section-title">
              Chọn định dạng file
            </Typography>
            <Box className="file-type-buttons">
              <Chip
                label="CSV"
                onClick={() => setFileType('csv')}
                className={`file-type-chip ${fileType === 'csv' ? 'active' : ''}`}
                variant={fileType === 'csv' ? 'filled' : 'outlined'}
              />
              <Chip
                label="JSON"
                onClick={() => setFileType('json')}
                className={`file-type-chip ${fileType === 'json' ? 'active' : ''}`}
                variant={fileType === 'json' ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>

          {/* File Upload Area */}
          <Box className="upload-section">
            <Typography variant="subtitle1" className="section-title">
              Tải file lên
            </Typography>
            
            <Box
              className={`upload-area ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                className="file-input"
                id="file-upload"
              />
              
              {!file ? (
                <label htmlFor="file-upload" className="upload-placeholder">
                  <CloudUploadIcon className="upload-icon" />
                  <Typography variant="body1" className="upload-text">
                    Kéo thả file vào đây hoặc <span className="browse-link">chọn từ máy</span>
                  </Typography>
                  <Typography variant="caption" className="upload-hint">
                    Hỗ trợ CSV, JSON (tối đa 5MB)
                  </Typography>
                </label>
              ) : (
                <Box className="file-preview">
                  <DescriptionIcon className="file-icon" />
                  <Box className="file-info">
                    <Typography variant="body1" className="file-name">
                      {file.name}
                    </Typography>
                    <Typography variant="caption" className="file-size">
                      {(file.size / 1024).toFixed(2)} KB
                    </Typography>
                  </Box>
                  <Button 
                    size="small" 
                    onClick={removeFile}
                    className="remove-file-btn"
                  >
                    ×
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          {/* File Format Instructions */}
          <Box className="instructions-section">
            <Typography variant="subtitle2" className="instructions-title">
              Định dạng file:
            </Typography>
            <Box className="format-examples">
              <Box className="format-example">
                <Chip label="CSV" size="small" className="format-chip" />
                <Typography variant="caption" className="format-text">
                  Cột "address" là bắt buộc
                </Typography>
              </Box>
              <Box className="format-example">
                <Chip label="JSON" size="small" className="format-chip" />
                <Typography variant="caption" className="format-text">
                  Mảng các object {`{ "address": "0x..." }`}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Progress Bar */}
          {uploading && (
            <Box className="progress-section">
              <LinearProgress className="progress-bar" />
              <Typography variant="caption" className="progress-text">
                Đang xử lý file...
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          <Box className="action-buttons">
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={uploading}
              className="cancel-btn"
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={!file || uploading}
              startIcon={uploading ? <></> : <CheckCircleIcon />}
              className="import-btn"
            >
              {uploading ? 'Đang Import...' : 'Import Wallets'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ImportModal;