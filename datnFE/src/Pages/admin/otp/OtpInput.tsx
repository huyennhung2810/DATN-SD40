import React, { useRef, useState } from "react";
import { Input } from "antd";
import type { InputRef } from "antd";

interface OtpInputProps {
  length: number;
  onComplete: (otp: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ length, onComplete }) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(InputRef | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    // Chỉ cho phép nhập số
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Lấy ký tự cuối cùng nếu người dùng nhập đè
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Tự động nhảy sang ô tiếp theo
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Kiểm tra nếu đã nhập đủ 6 số
    const combinedOtp = newOtp.join("");
    if (combinedOtp.length === length) {
      onComplete(combinedOtp);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    // Nhấn Backspace để quay lại ô trước đó
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        marginBottom: "20px",
      }}
    >
      {otp.map((data, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          value={data}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          style={{
            width: "45px",
            height: "55px",
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "bold",
            borderRadius: "8px",
            border: "2px solid #d9d9d9",
          }}
          maxLength={1}
        />
      ))}
    </div>
  );
};

export default OtpInput;
