/**
 * AUTHENTICATION FORM COMPONENT
 *
 * Clean authentication interface with email/password and phone/OTP methods
 * Styled to match the CarePulse design system
 */

"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface AuthFormProps {
  mode?: "signin" | "signup";
  onSuccess?: () => void;
  defaultTab?: "email" | "phone";
}

export const AuthForm = ({
  mode = "signin",
  onSuccess,
  defaultTab = "email",
}: AuthFormProps) => {
  // Authentication hook
  const {
    signInWithEmail,
    signUpWithEmail,
    sendPhoneOTP,
    verifyPhoneOTP,
    isSigningIn,
    isSigningUp,
    isSendingOTP,
    isVerifyingPhone,
  } = useAuth();

  // Form state
  const [authMethod, setAuthMethod] = useState<"email" | "phone">(defaultTab);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phoneNumber: "",
    otpCode: "",
  });
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+65\s?[689]\d{3}\s?\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validateOTP = (code: string): boolean => {
    return /^\d{6}$/.test(code);
  };

  // Handlers
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (mode === "signup" && !formData.name.trim()) {
      newErrors.name = "Please enter your name";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    const authFunction = mode === "signup" ? signUpWithEmail : signInWithEmail;
    const result = await authFunction({
      email: formData.email,
      password: formData.password,
      name: formData.name,
    });

    if (result.success) {
      onSuccess?.();
    }
  };

  const handlePhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!showOTPInput) {
      // Send OTP
      if (!validatePhoneNumber(formData.phoneNumber)) {
        setErrors({
          phoneNumber: "Please enter a valid Singapore phone number (+65)",
        });
        return;
      }

      const result = await sendPhoneOTP(formData.phoneNumber);
      if (result.success) {
        setShowOTPInput(true);
      }
    } else {
      // Verify OTP
      if (!validateOTP(formData.otpCode)) {
        setErrors({ otpCode: "Please enter a valid 6-digit code" });
        return;
      }

      const result = await verifyPhoneOTP({
        phoneNumber: formData.phoneNumber,
        code: formData.otpCode,
        createSession: true,
      });

      if (result.success) {
        onSuccess?.();
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const isLoading =
    isSigningIn || isSigningUp || isSendingOTP || isVerifyingPhone;

  return (
    <div className="w-full">
      {/* Auth Method Toggle */}
      <div className="bg-white border border-gray-200 rounded-sm mb-6" role="tablist" aria-label="Authentication method selection">
        <div className="grid grid-cols-2">
          <button
            type="button"
            role="tab"
            aria-selected={authMethod === "email"}
            aria-controls="email-auth-panel"
            id="email-tab"
            onClick={() => {
              setAuthMethod("email");
              setShowOTPInput(false);
              setErrors({});
            }}
            className={`px-4 py-3 text-sm font-medium border-r border-gray-200 rounded-l-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
              authMethod === "email"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={authMethod === "phone"}
            aria-controls="phone-auth-panel"
            id="phone-tab"
            onClick={() => {
              setAuthMethod("phone");
              setShowOTPInput(false);
              setErrors({});
            }}
            className={`px-4 py-3 text-sm font-medium rounded-r-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
              authMethod === "phone"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Phone
          </button>
        </div>
      </div>

      {/* Email Authentication */}
      {authMethod === "email" && (
        <div 
          id="email-auth-panel" 
          role="tabpanel" 
          aria-labelledby="email-tab"
          className="bg-white border border-gray-200 rounded-sm p-6"
        >
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="name-input" className="block text-xs font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="name-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-xs text-red-600 mt-1" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email-input" className="block text-xs font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email-input"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                placeholder="Enter your email"
                disabled={isLoading}
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-red-600 mt-1" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password-input" className="block text-xs font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                id="password-input"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                placeholder="Enter your password"
                disabled={isLoading}
                aria-required="true"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <p id="password-error" className="text-xs text-red-600 mt-1" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading
                ? mode === "signup"
                  ? "Creating Account..."
                  : "Signing In..."
                : mode === "signup"
                ? "Create Account"
                : "Sign In"}
            </Button>
          </form>
        </div>
      )}

      {/* Phone Authentication */}
      {authMethod === "phone" && (
        <div 
          id="phone-auth-panel" 
          role="tabpanel" 
          aria-labelledby="phone-tab"
          className="bg-white border border-gray-200 rounded-sm p-6"
        >
          <form onSubmit={handlePhoneOTP} className="space-y-4">
            <div>
              <label htmlFor="phone-input" className="block text-xs font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                id="phone-input"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                placeholder="+65 9123 4567"
                disabled={isLoading || showOTPInput}
                aria-required="true"
                aria-invalid={!!errors.phoneNumber}
                aria-describedby={errors.phoneNumber ? "phone-error" : undefined}
              />
              {errors.phoneNumber && (
                <p id="phone-error" className="text-xs text-red-600 mt-1" role="alert">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {showOTPInput && (
              <div>
                <label htmlFor="otp-input" className="block text-xs font-medium text-gray-700 mb-2">
                  Verification Code *
                </label>
                <input
                  id="otp-input"
                  type="text"
                  value={formData.otpCode}
                  onChange={(e) => handleInputChange("otpCode", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  disabled={isLoading}
                  aria-required="true"
                  aria-invalid={!!errors.otpCode}
                  aria-describedby="otp-help otp-error"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                {errors.otpCode && (
                  <p id="otp-error" className="text-xs text-red-600 mt-1" role="alert">
                    {errors.otpCode}
                  </p>
                )}
                <p id="otp-help" className="text-xs text-gray-500 mt-1">
                  Check your SMS for the verification code
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading
                ? showOTPInput
                  ? "Verifying..."
                  : "Sending Code..."
                : showOTPInput
                ? "Verify Code"
                : "Send Verification Code"}
            </Button>

            {showOTPInput && (
              <button
                type="button"
                onClick={() => {
                  setShowOTPInput(false);
                  setFormData((prev) => ({ ...prev, otpCode: "" }));
                  setErrors({});
                }}
                className="w-full text-xs text-gray-600 hover:text-gray-900 py-2"
                disabled={isLoading}
              >
                Use different phone number
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
