"use client"

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Toaster } from "./ui/toaster"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Toaster />
    </>
  )
}
