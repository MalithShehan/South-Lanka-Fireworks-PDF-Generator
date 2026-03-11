import React, { Suspense, lazy } from "react";

const Products = lazy(() => import("./components/Products.jsx"));

const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm font-medium">Loading...</p>
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