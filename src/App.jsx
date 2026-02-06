import React, { Suspense, lazy } from "react";

const Products = lazy(() => import("./components/Products.jsx"));

const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-pink-50">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-indigo-600 font-medium">Loading...</p>
        </div>
    </div>
);

export default function App(){
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Products />
        </Suspense>
    )
};