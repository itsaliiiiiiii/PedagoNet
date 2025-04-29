import Link from "next/link"
import Image from 'next/image';
import OtpForm from "@/components/auth/OTPFrom";
export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full">
      {/* Two-column layout */}
      <div className="flex min-h-screen flex-col md:flex-row">
        {/* Left column - Form */}
        <div className="flex w-full flex-1 items-center justify-center p-4 md:w-1/2 md:p-8">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">School Connect</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Sign in to your account to connect with your school community
              </p>
            </div>

            <div className="card-animation">
              <OtpForm />
            </div>
          </div>
        </div>

        {/* Right column - Logo Design */}
        <div className="hidden md:flex w-1/2 bg-blue-50 dark:bg-gray-800 items-center justify-center p-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="flex h-64 w-64 items-center justify-center rounded-full dark:bg-white-100 bg-slate-200 shadow-inner dark:bg-gray-700">
              <Image
              src="/logo.png"    
              alt="My Logo"
              width={210}
              height={210}
              className="rounded-full" />           
              </div>
              <div className="absolute -top-1 -left-3 h-12 w-12 rounded-full bg-blue-200 opacity-40"></div>
              <div className="absolute -bottom-4 -right-7 h-16 w-16 rounded-full bg-red-500 opacity-20"></div>
            </div>
            <h2 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">Welcome Back!</h2>
            <p className="mt-4 max-w-md text-center text-gray-600 dark:text-gray-300">
              Connect with classmates, access your courses, and stay updated with school events.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
