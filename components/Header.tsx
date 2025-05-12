"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "./SearchBar";
import { Button } from "./ui/button";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

// import { getUserSession } from "@/app/lib/session";

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/home");
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.closest && !target.closest(".relative")) {
        setIsNavOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to log out. Please try again.");
    }
  };

// const session = await getUserSession();


  return (
    <header className="bg-white ">
      <div className="max-w-full sm:max-w-4xl md:max-w-5xl lg:max-w-6xl mx-auto flex items-center px-4 sm:px-6 md:px-8 py-4">

        <div className="text-4xl sm:text-5xl font-bold tracking-wider">LOGO</div>


        <div className="flex-1 flex justify-center mx-4 sm:mx-6 md:mx-8">
          <div className="relative w-40 sm:w-64 md:w-full">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>


        <div className="flex items-center space-x-4 sm:space-x-6 md:space-x-8">
          <button
            className="sm:hidden p-2 rounded-md bg-gray-100 hover:bg-gray-200"
            onClick={() => setIsNavOpen(!isNavOpen)}
            aria-label="Toggle navigation"
          >
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <nav
            className={`sm:flex sm:space-x-6 md:space-x-8 ${isNavOpen ? "flex" : "hidden"} flex-col sm:flex-row absolute sm:static top-16 right-4 bg-white sm:bg-transparent border items-center sm:border-none rounded-md shadow-lg sm:shadow-none p-4 sm:p-0 z-10`}
          >
            <a href="/home" className="text-base sm:text-lg font-medium text-gray-600 hover:text-gray-900 py-2 sm:py-0">
              Home
            </a>

            {session ? (
              <div className="flex items-center space-x-4 py-2 sm:py-0">
                {session.user?.image && (
                  <Link href="/profile" className="hidden sm:block">
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-indigo-100 object-cover"
                    />
                  </Link>
                )}
                <Button onClick={handleLogout}>LogOut</Button>
              </div>
            ) : (
              <Link href="/login">
                <Button>LogIn</Button>
              </Link>
            )}

          </nav>

        </div>
      </div>
    </header>
  );
}