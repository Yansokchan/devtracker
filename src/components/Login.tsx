import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const handleLogin = (provider: "google" | "github") => {
    supabase.auth.signInWithOAuth({ provider });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f5f0] to-[#f3e7d9]">
      <div className="bg-white mx-5 rounded-2xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center border border-[#ecd7b6]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#B45309] mb-2 tracking-tight">
            DevTracker <span className="text-gray-900">PRO</span>
          </h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Hello, coder! 👋
          </h2>
          <p className="text-gray-500 text-sm">
            Welcome to your productivity dashboard.
            <br />
            Sign in to manage your tasks and boost your workflow!
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={() => handleLogin("google")}
            className="w-full py-2 rounded bg-[#B45309] text-white font-medium text-lg shadow hover:bg-[#a05a13] transition flex items-center justify-center gap-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <path
                  d="M44.5 20H24V28.5H36.9C35.5 33.1 31.2 36.5 24 36.5C16.3 36.5 10 30.2 10 22.5C10 14.8 16.3 8.5 24 8.5C27.3 8.5 30.2 9.7 32.4 11.7L38.1 6C34.4 2.7 29.5 0.5 24 0.5C11.8 0.5 2 10.3 2 22.5C2 34.7 11.8 44.5 24 44.5C36.2 44.5 46 34.7 46 22.5C46 21.2 45.8 20.6 45.5 20Z"
                  fill="#FFC107"
                />
                <path
                  d="M6.3 14.7L13.1 19.2C14.9 15.2 19.1 12.5 24 12.5C26.7 12.5 29.1 13.4 31 14.9L37.1 9.1C33.7 6.2 29.1 4.5 24 4.5C16.3 4.5 10 10.8 10 18.5C10 20.1 10.3 21.6 10.8 23L6.3 14.7Z"
                  fill="#FF3D00"
                />
                <path
                  d="M24 44.5C31.2 44.5 36.5 40.1 38.9 34.9L32.5 29.7C30.7 31.1 28.5 32 24 32C19.1 32 14.9 29.3 13.1 25.3L6.3 29.8C10.3 37.2 16.3 44.5 24 44.5Z"
                  fill="#4CAF50"
                />
                <path
                  d="M44.5 20H24V28.5H36.9C36.2 31.1 34.5 33.1 32.5 34.9L38.9 40.1C42.2 36.9 44.5 31.7 44.5 26.5C44.5 24.7 44.3 22.9 44.5 20Z"
                  fill="#1976D2"
                />
              </g>
            </svg>
            Continue with Google
          </button>
          <button
            onClick={() => handleLogin("github")}
            className="w-full py-2 rounded bg-gray-800 text-white font-medium text-lg shadow hover:bg-gray-900 transition flex items-center justify-center gap-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0.297C5.373 0.297 0 5.67 0 12.297C0 17.617 3.438 22.092 8.205 23.682C8.805 23.797 9.025 23.422 9.025 23.092C9.025 22.797 9.015 22.067 9.01 21.092C5.672 21.797 4.968 19.417 4.968 19.417C4.422 17.997 3.633 17.617 3.633 17.617C2.547 16.797 3.722 16.812 3.722 16.812C4.922 16.902 5.555 18.067 5.555 18.067C6.633 19.997 8.422 19.497 9.205 19.197C9.32 18.417 9.633 17.897 9.985 17.597C7.255 17.297 4.422 16.247 4.422 11.597C4.422 10.297 4.872 9.247 5.633 8.417C5.505 8.117 5.105 6.847 5.755 5.247C5.755 5.247 6.755 4.917 9.005 6.417C9.965 6.147 10.985 6.017 12.005 6.012C13.025 6.017 14.045 6.147 15.005 6.417C17.255 4.917 18.255 5.247 18.255 5.247C18.905 6.847 18.505 8.117 18.375 8.417C19.135 9.247 19.585 10.297 19.585 11.597C19.585 16.257 16.745 17.292 14.015 17.587C14.465 17.967 14.865 18.697 14.865 19.797C14.865 21.397 14.855 22.697 14.855 23.092C14.855 23.422 15.075 23.802 15.685 23.682C20.455 22.092 23.895 17.617 23.895 12.297C23.895 5.67 18.523 0.297 12 0.297Z" />
            </svg>
            Continue with GitHub
          </button>
        </div>
        <div className="mt-8 text-xs text-gray-400 text-center">
          <span>
            By signing in, you agree to our{" "}
            <a href="#" className="underline hover:text-[#B45309]">
              Terms of Service
            </a>
            .
          </span>
        </div>
      </div>
    </div>
  );
}
