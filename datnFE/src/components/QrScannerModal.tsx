import React, { useEffect, useState } from "react";
import { Modal, message } from "antd";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QrScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

const QrScannerModal: React.FC<QrScannerModalProps> = ({
  open,
  onClose,
  onScanSuccess,
}) => {
  const [scannerStarted, setScannerStarted] = useState(false);

  useEffect(() => {
    if (open) {
      if (scannerStarted) return;
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false,
      );

      scanner.render(
        (decodedText) => {
          scanner.clear().catch(console.error);
          setScannerStarted(false);
          onScanSuccess(decodedText);
          onClose();
        },
        (error) => {
          // You receive errors frame by frame when no code is detected. Do not log.
        },
      );
      setScannerStarted(true);

      return () => {
        scanner.clear().catch(console.error);
        setScannerStarted(false);
      };
    }
  }, [open, onClose, onScanSuccess, scannerStarted]);

  return (
    <Modal
      title="Quét mã QR sản phẩm"
      open={open}
      onCancel={() => {
        onClose();
      }}
      footer={null}
      destroyOnClose
    >
      <div id="qr-reader" style={{ width: "100%" }}></div>
    </Modal>
  );
};

export default QrScannerModal;
