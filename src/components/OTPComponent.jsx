import React, { useState, useEffect } from "react";
import { sendSMS } from "../services/smsService";
import "./OTPComponent.css";

const OTPComponent = ({ phone, onVerifySuccess, onVerifyFail }) => {
  const [otp, setOtp] = useState("");
  const [userOtp, setUserOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [otpSent, setOtpSent] = useState(false);

  // Generate random 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send OTP via SMS
  const handleSendOTP = async () => {
    if (!phone) {
      setMessage("Please provide a phone number");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const newOtp = generateOTP();
      setOtp(newOtp);

      // Send SMS
      await sendSMS(phone, `Your ReekTickets OTP is: ${newOtp}. Valid for 5 minutes.`);

      setOtpSent(true);
      setTimeLeft(300);
      setMessage("OTP sent successfully!");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      setMessage("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = () => {
    if (!userOtp) {
      setMessage("Please enter the OTP");
      return;
    }

    if (userOtp === otp) {
      setVerified(true);
      setMessage("OTP verified successfully!");
      if (onVerifySuccess) {
        onVerifySuccess();
      }
    } else {
      setMessage("Invalid OTP. Please try again.");
      if (onVerifyFail) {
        onVerifyFail();
      }
    }

    setUserOtp("");
  };

  // Timer countdown
  useEffect(() => {
    if (!otpSent || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent, timeLeft]);

  // Expire OTP when time runs out
  useEffect(() => {
    if (timeLeft === 0 && otpSent && !verified) {
      setOtpSent(false);
      setOtp("");
      setMessage("OTP expired. Please request a new one.");
    }
  }, [timeLeft, otpSent, verified]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h2>Verify Your Phone Number</h2>
        <p>Phone: {phone}</p>

        {!verified ? (
          <>
            {!otpSent ? (
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="otp-button btn-send"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            ) : (
              <div className="otp-input-group">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={userOtp}
                  onChange={(e) => setUserOtp(e.target.value.slice(0, 6))}
                  maxLength="6"
                  className="otp-input"
                />
                <button
                  onClick={handleVerifyOTP}
                  className="otp-button btn-verify"
                >
                  Verify
                </button>

                <p className="otp-timer">Time remaining: {formatTime(timeLeft)}</p>

                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="otp-link-button"
                >
                  {loading ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="otp-verified">
            <p className="verified-check">✓</p>
            <p>Phone number verified!</p>
          </div>
        )}

        {message && <p className={`otp-message ${verified ? "success" : "error"}`}>{message}</p>}
      </div>
    </div>
  );
};

export default OTPComponent;
