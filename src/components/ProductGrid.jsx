import React, { memo, useCallback, useState } from "react";
import { motion as Motion } from "framer-motion";
import { ShoppingCart, Package, Plus, Minus, Check } from "lucide-react";

const ProductCard = memo(({ item, productVariants, onAddToCart }) => {
  const [quantities, setQuantities] = useState({});
  const [addedSize, setAddedSize] = useState(null);

  const getQty = (size) => quantities[size] || 1;

  const handleQtyChange = (size, delta) => {
    setQuantities(prev => ({
      ...prev,
      [size]: Math.max(1, (prev[size] || 1) + delta)
    }));
  };

  const handleAdd = (sizeObj) => {
    const qty = getQty(sizeObj.size);
    for (let i = 0; i < qty; i++) {
      onAddToCart(item, sizeObj);
    }
    // Reset quantity after adding
    setQuantities(prev => ({ ...prev, [sizeObj.size]: 1 }));
    // Show success feedback
    setAddedSize(sizeObj.size);
    setTimeout(() => setAddedSize(null), 1500);
  };

  return (
    <Motion.div
      className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-3 flex flex-col"
      variants={productVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-2">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 line-clamp-2">{item.name}</h3>

      <div className="flex-1 flex flex-col justify-end">
        {item.sizes.map((sizeObj, index) => {
          const qty = getQty(sizeObj.size);
          const isAdded = addedSize === sizeObj.size;
          
          return (
            <div key={index} className="mb-2 last:mb-0">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                <span className="font-medium">{sizeObj.size || 'Standard'}</span>
                <span className="text-pink-600 font-semibold">Rs.{sizeObj.price.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {/* Quantity Controls */}
                <div className="flex items-center bg-gray-100 rounded-lg">
                  <button
                    onClick={() => handleQtyChange(sizeObj.size, -1)}
                    disabled={qty <= 1}
                    className="w-7 h-7 flex items-center justify-center rounded-l-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={12} className="text-gray-600" />
                  </button>
                  <span className="w-6 text-center text-xs font-semibold text-gray-700">{qty}</span>
                  <button
                    onClick={() => handleQtyChange(sizeObj.size, 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-r-lg hover:bg-gray-200 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus size={12} className="text-gray-600" />
                  </button>
                </div>
                
                {/* Add Button */}
                <button
                  onClick={() => handleAdd(sizeObj)}
                  className={`flex-1 font-medium px-2 py-1.5 rounded-lg transition text-xs inline-flex items-center justify-center gap-1 ${
                    isAdded 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:opacity-90'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={12} className="text-white" />
                      <span className="text-white">Added!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={12} className="text-white" />
                      <span className="text-white hidden sm:inline">Add</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

const ProductGrid = ({ products, productVariants, onAddToCart, onAddCustomItem }) => {
  const handleAddToCart = useCallback((item, sizeObj) => {
    onAddToCart(item, sizeObj);
  }, [onAddToCart]);

  return (
    <div className="max-w-6xl mx-auto mb-16">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {products.map((item) => (
          <ProductCard
            key={`${item.id}-${item.name}`}
            item={item}
            productVariants={productVariants}
            onAddToCart={handleAddToCart}
          />
        ))}

        {/* Add Custom Item Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-pink-50 rounded-xl border-2 border-dashed border-indigo-300 p-4 flex flex-col items-center justify-center min-h-[200px] hover:border-indigo-500 hover:shadow-md transition cursor-pointer group"
          onClick={onAddCustomItem}
        >
          <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Package size={24} className="text-indigo-600" />
          </div>
          <span className="text-indigo-700 font-semibold text-sm text-center">Add Custom Item</span>
          <span className="text-gray-500 text-xs text-center mt-1">Create your own entry</span>
        </div>
      </div>
    </div>
  );
};

export default memo(ProductGrid);
