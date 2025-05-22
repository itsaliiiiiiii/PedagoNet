import Link from "next/link"
import Image from "next/image"
import PasswordForm from "@/components/auth/passwordForm"
export default function PasswordPage() {
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
                Create your account to join your school community
              </p>
            </div>

            <div className="card-animation">
              <PasswordForm />
            </div>
          </div>
        </div>

        {/* Right column - Logo Design */}
        <div className="hidden md:flex w-1/2 bg-blue-50 dark:bg-gray-800 items-center justify-center p-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Large school icon */}
              <div className="flex h-64 w-64 items-center justify-center rounded-full bg-blue-100 shadow-inner dark:bg-gray-700">
                <Image
                  src="/logo.png"
                  alt="My Logo"
                  width={210}
                  height={210}
                  className="rounded-full z-10" />
              </div>
              {/* Decorative circles */}
              <div className="absolute -top-1 -left-3 h-12 w-12 rounded-full bg-blue-200 opacity-40"></div>
              <div className="absolute -bottom-4 -right-7 h-16 w-16 rounded-full bg-red-500 opacity-20"></div>
            </div>

            <h2 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">Join Our Community</h2>
            <p className="mt-4 max-w-md text-center text-gray-600 dark:text-gray-300">
              Create an account to connect with your school, access resources, and collaborate with peers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
