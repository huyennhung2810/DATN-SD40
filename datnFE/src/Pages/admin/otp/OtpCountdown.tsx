import React, { useState } from "react";
import { Statistic, Button } from "antd";

const { Countdown } = Statistic;

const OtpCountdown = ({ onResend }: { onResend: () => void }) => {
  // Kiểm tra xem đã có deadline trong máy chưa, nếu chưa mới tạo mới
  const [deadline, setDeadline] = useState(() => {
    const saved = localStorage.getItem("otp_deadline");
    if (saved) {
      const remaining = parseInt(saved) - Date.now();
      if (remaining > 0) return parseInt(saved);
    }
    const newDeadline = Date.now() + 1000 * 300;
    localStorage.setItem("otp_deadline", newDeadline.toString());
    return newDeadline;
  });

  const [canResend, setCanResend] = useState(false);

  const onFinish = () => {
    setCanResend(true);
    localStorage.removeItem("otp_deadline"); // Xóa khi hết hạn
  };

  const handleResend = () => {
    const newDeadline = Date.now() + 1000 * 300;
    setDeadline(newDeadline);
    localStorage.setItem("otp_deadline", newDeadline.toString());
    setCanResend(false);
    onResend();
  };

  return (
    <div style={{ textAlign: "center", margin: "20px 0" }}>
      {!canResend ? (
        <Countdown
          title="Mã OTP sẽ hết hạn sau:"
          value={deadline}
          onFinish={onFinish}
          format="mm:ss"
        />
      ) : (
        <Button type="link" onClick={handleResend} danger>
          Gửi lại mã OTP
        </Button>
      )}
    </div>
  );
};

export default OtpCountdown;
