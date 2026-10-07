"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import OtpInput from "@/modules/auth/components/OTPInput";
import { Button } from "@/components/ui";
import { useAppDispatch } from "@/store/hooks";
import {
  forgotPasswordSendOTP,
  loginUser,
  verifyOTP,
} from "@/modules/auth/store/authSlice";
import { notify } from "@/lib/toast";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const isForgotPasswordFlow =
    searchParams.get("type") === "forgot-password";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  }, [timeLeft]);

  const handleResendOtp = async () => {
    if (timeLeft > 0 || resending) return;

    const forgotEmail = sessionStorage.getItem("forgotPasswordEmail");
    const loginEmail = sessionStorage.getItem("pendingLoginEmail");
    const loginPassword = sessionStorage.getItem("pendingLoginPassword");

    // Forgot password flow
    if (isForgotPasswordFlow) {
      if (!forgotEmail) {
        notify.error(
          "Password recovery session expired. Please start again."
        );
        router.replace("/forgot-password");
        return;
      }

      try {
        setResending(true);

        const result = await dispatch(
          forgotPasswordSendOTP({
            email: forgotEmail,
          })
        );

        if (forgotPasswordSendOTP.fulfilled.match(result)) {
          setOtp(Array(6).fill(""));
          setTimeLeft(60);
          notify.success("OTP resent successfully.");
          return;
        }

        notify.error(
          result.payload || "Failed to resend OTP."
        );
      } catch {
        notify.error("Failed to resend OTP.");
      } finally {
        setResending(false);
      }

      return;
    }

    // Login OTP flow
    if (!loginEmail || !loginPassword) {
      notify.error("OTP session is missing. Please log in again.");
      router.replace("/login");
      return;
    }

    try {
      setResending(true);

      const result = await dispatch(
        loginUser({
          email: loginEmail,
          password: loginPassword,
        })
      );

      if (loginUser.fulfilled.match(result)) {
        setOtp(Array(6).fill(""));
        setTimeLeft(60);
        notify.success("OTP resent successfully.");
        return;
      }

      notify.error(
        result.payload || "Failed to resend OTP."
      );
    } catch {
      notify.error("Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      notify.error("Please enter a valid OTP");
      return;
    }

    // Forgot password flow
    if (isForgotPasswordFlow) {
      const forgotEmail =
        sessionStorage.getItem("forgotPasswordEmail");

      if (!forgotEmail) {
        notify.error(
          "Password recovery session expired. Please start again."
        );

        router.replace("/forgot-password");
        return;
      }

      sessionStorage.setItem(
        "forgotPasswordOtp",
        enteredOtp
      );

      router.push(
        "/reset-password"
      );

      return;
    }

    // Login OTP flow
    const loginEmail =
      sessionStorage.getItem("pendingLoginEmail");

    const registerData =
      sessionStorage.getItem("registerData");

    if (!loginEmail && !registerData) {
      router.replace("/login");
      return;
    }

    try {
      setSubmitting(true);

      if (loginEmail) {
        const result = await dispatch(
          verifyOTP({
            email: loginEmail,
            otp: enteredOtp,
          })
        );

        if (verifyOTP.fulfilled.match(result)) {
          sessionStorage.removeItem(
            "pendingLoginEmail"
          );

          sessionStorage.removeItem(
            "pendingLoginPassword"
          );
          return;
        }

        notify.error(
          result.payload || "OTP verification failed"
        );

        return;
      }

      router.push("/reset-password");
    } catch {
      notify.error("OTP verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <OtpInput
        value={otp}
        onChange={setOtp}
      />

      <div className="text-center text-sm text-gray-500">
        {isForgotPasswordFlow
          ? "Enter the OTP sent to your email or phone to reset your password."
          : "Enter the OTP sent to your email or phone to complete login."}

        <div className="mt-2 font-semibold text-primary">
          {formattedTime}
        </div>
      </div>

      <div className="space-y-3">
        <Button
          className="w-full"
          onClick={handleVerify}
          disabled={submitting}
        >
          {submitting ? "Verifying..." : "Verify OTP"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full bg-gray-200"
          onClick={handleResendOtp}
          disabled={timeLeft > 0 || resending}
        >
          {resending ? "Resending..." : "Resend OTP"}
        </Button>
      </div>
    </div>
  );
}

function VerifyOtpLoading() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="text-sm text-gray-500">
        Loading OTP verification...
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<VerifyOtpLoading />}>
      <VerifyOtpContent />
    </Suspense>
  );
}
