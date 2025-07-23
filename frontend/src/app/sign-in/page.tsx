/**
 * SIGN IN PAGE
 *
 * Authentication page with all three signin methods
 * Styled to match the CarePulse design system
 */

"use client";

import { useAuth } from "@/hooks/use-auth";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut, Heart, ArrowRight } from "lucide-react";
import { NavigationBar } from "@/components/navigation-bar";

export default function SignInPage() {
  const { user, isAuthenticated, signOut, isSigningOut } = useAuth();
  const router = useRouter();

  // Redirect to home page if already authenticated
  const handleAuthSuccess = () => {
    console.log("Authentication successful! Redirecting to home page...");
    router.push("/");
  };

  // Handle signout
  const handleSignOut = async () => {
    await signOut();
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F8FBF7' }}>
        {/* Navigation Bar */}
        <NavigationBar />
        
        <div className="p-6 flex items-center justify-center">
          <div className="border rounded-sm p-8 max-w-md w-full" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-sm flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#6B9A65' }}>
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900 mb-2">
                Welcome back!
              </h1>
              <p className="text-sm text-gray-600">
                You are successfully signed in to CarePulse
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#E0ECDB' }}>
                <span className="text-xs text-gray-500">Name</span>
                <span className="text-sm font-medium text-gray-900">{user.name || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#E0ECDB' }}>
                <span className="text-xs text-gray-500">Email</span>
                <span className="text-sm font-medium text-gray-900">{user.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#E0ECDB' }}>
                <span className="text-xs text-gray-500">Role</span>
                <span className="text-sm font-medium text-gray-900">{user.role}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-gray-500">Phone</span>
                <span className="text-sm font-medium text-gray-900">{user.phoneNumber || 'Not provided'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => router.push("/")} 
                className="w-full text-white transition-colors"
                style={{ backgroundColor: '#6B9A65', borderColor: '#6B9A65' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4A7A44'; e.currentTarget.style.borderColor = '#4A7A44'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#6B9A65'; e.currentTarget.style.borderColor = '#6B9A65'; }}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
              <Button
                onClick={handleSignOut}
                disabled={isSigningOut}
                variant="outline"
                className="w-full transition-colors"
                style={{ borderColor: '#E0ECDB', backgroundColor: 'transparent', color: '#2D5A29' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FBF7'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isSigningOut ? "Signing out..." : "Sign out"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <NavigationBar />
      
      <div className="p-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-500 rounded-sm flex items-center justify-center mx-auto mb-4">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Sign in to CarePulse
            </h1>
            <p className="text-sm text-gray-600">
              Access your healthcare management dashboard
            </p>
          </div>

          {/* Auth Form */}
          <AuthForm mode="signup" onSuccess={handleAuthSuccess} />

          {/* Help Section */}
          <div className="mt-8 border rounded-sm p-4" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Authentication Methods
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <p>
                <strong>Email:</strong> Sign up with email and password (8+ characters)
              </p>
              <p>
                <strong>Phone:</strong> Use Singapore phone number (+65) with SMS verification
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}