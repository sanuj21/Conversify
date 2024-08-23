// Importing necessary components and hooks
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
// Component for the Login page
const Login = () => {
  // State to manage input data (username and password)

  const [data, setData] = useState({
    username: "",
    password: "",
  });

  // Accessing the login function from the AuthContext
  const { login } = useAuth();

  // Function to update state when input data changes
  const handleDataChange =
    (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setData({
        ...data,
        [name]: e.target.value,
      });
    };

  // Function to handle the login process
  const handleLogin = async () => {
    if (data.username === "" || data.password === "") {
      alert("Please enter username and password");
      return;
    }
    await login(data);
  };

  const handleGoogleLogin = async () => {
    window.location.href = `${import.meta.env.VITE_SERVER_URI}/users/google`;
  };

  return (
    <main className="bg-dark-100">
      <header className="lg:px-20 px-6 bg-white lg:py-4 py-2 shadow-lg flex align-middle justify-between mb-[2px]">
        <div>
          <img src="logo.png" className="lg:h-10 h-7" />
        </div>
        <div className="text-black lg:text-lg text-sm font-light uppercase self-center">
          <Link to="https://linkedin.com/in/sanuj21">About Me</Link>
        </div>
      </header>
      <div className="min-h-screen  text-gray-900 flex justify-center">
        <div className="max-w-screen-xl m-0 sm:m-10 flex justify-center flex-1">
          <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 bg-slate-100 shadow sm:rounded-lg ">
            <div className="mt-12 flex flex-col items-center">
              <h1 className="text-2xl xl:text-3xl font-extrabold">Sign In</h1>
              <div className="w-full flex-1 mt-8">
                <div className="mx-auto max-w-xs">
                  <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-200 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    type="email"
                    placeholder="Username"
                    value={data.username}
                    onChange={handleDataChange("username")}
                  />
                  <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-200 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                    type="password"
                    placeholder="Password"
                    value={data.password}
                    onChange={handleDataChange("password")}
                  />
                  <button
                    className="mt-5 tracking-wide font-semibold bg-green-500 text-gray-100 w-full py-4 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    onClick={handleLogin}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                      />
                    </svg>
                    <span className="ml-3">Sign In</span>
                  </button>
                </div>
                <div className="my-12 border-b text-center">
                  <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium  transform translate-y-1/2">
                    Or sign In with Google
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-green-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline"
                    onClick={handleGoogleLogin}
                  >
                    <div className="bg-white p-2 rounded-full">
                      <svg className="w-4" viewBox="0 0 533.5 544.3">
                        <path
                          d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"
                          fill="#4285f4"
                        />
                        <path
                          d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"
                          fill="#34a853"
                        />
                        <path
                          d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"
                          fill="#fbbc04"
                        />
                        <path
                          d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"
                          fill="#ea4335"
                        />
                      </svg>
                    </div>
                    <span className="ml-4">Sign In with Google</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
