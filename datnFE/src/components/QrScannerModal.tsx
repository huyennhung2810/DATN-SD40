import React, { useEffect, useRef } from "react";
import { Modal } from "antd";
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
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Chỉ khởi tạo scanner khi Modal được mở
    if (open) {
      // Đợi một chút để Ant Design Modal render xong DOM (cần thẻ div có id="imei-reader")
      const timer = setTimeout(() => {
        // Cấu hình Scanner: 
        // fps: Số khung hình/giây
        // qrbox: Kích thước vùng quét (Dùng hình chữ nhật vì mã IMEI là mã vạch ngang)
        scannerRef.current = new Html5QrcodeScanner(
          "imei-reader",
          {
            fps: 10,
            qrbox: { width: 300, height: 150 },
            supportedScanTypes: [], // Để trống để hỗ trợ cả QR lẫn Barcode 1D
          },
          false // false: Tắt log debug của thư viện
        );

        scannerRef.current.render(
          (decodedText) => {
            // Khi quét thành công
            onScanSuccess(decodedText);
            
            // Nếu bạn muốn quét xong tắt camera luôn thì gọi onClose() ở đây
            // Nhưng vì mình đang check số lượng ở component cha, nên cứ để cha quyết định đóng.
          },
          (errorMessage) => {
            // Lỗi này nhảy liên tục khi khung hình chưa có mã hợp lệ -> Bỏ qua không cần log
          }
        );
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    } else {
      // Khi đóng Modal -> Dọn dẹp và tắt đèn Camera
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Lỗi khi tắt camera", error);
        });
        scannerRef.current = null;
      }
    }
  }, [open, onScanSuccess]);

  // Xử lý khi bấm nút "X" hoặc click ra ngoài Modal
  const handleCancel = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
    }
    onClose();
  };

  return (
    <Modal
      title="Quét mã IMEI bằng Camera"
      open={open}
      onCancel={handleCancel}
      footer={null} // Ẩn nút OK / Cancel mặc định
      destroyOnHidden // Hủy component khi đóng để giải phóng bộ nhớ
      width={500}
      centered
    >
      <div style={{ marginTop: 16 }}>
        {/* Thư viện html5-qrcode sẽ nhúng UI quét camera vào thẻ div này */}
        <div id="imei-reader" width="100%"></div>
        
        <div style={{ textAlign: "center", marginTop: 16, color: "#888" }}>
          Đưa mã vạch IMEI hoặc QR vào trong khung hình để tự động quét.
          <br/>
          (Vui lòng cấp quyền truy cập Camera cho trình duyệt nếu được hỏi)
        </div>
      </div>
    </Modal>
  );
};

export default QrScannerModal;