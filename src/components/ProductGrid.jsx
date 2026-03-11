import React, { memo, useCallback, useState } from "react";
import { motion as Motion } from "framer-motion";
import { ShoppingCart, Package, Plus, Minus, Check, SearchX } from "lucide-react";

const ProductCard = memo(({ item, productVariants, onAddToCart }) => {
  const [quantities, setQuantities] = useState({});
  const [addedSize, setAddedSize] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

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
    setQuantities(prev => ({ ...prev, [sizeObj.size]: 1 }));
    setAddedSize(sizeObj.size);
    setTimeout(() => setAddedSize(null), 1500);
  };

  return (
    <Motion.div
      className="bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all duration-300 flex flex-col group overflow-hidden card-hover"
      variants={productVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]" style={{ animation: 'shimmer 1.5s infinite' }} />
        )}
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Hover overlay with quick-view */}
        {item.description && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <p className="text-white text-[10px] sm:text-xs leading-snug line-clamp-3">
              {item.description}
            </p>
          </div>
        )}
        {/* Price badge on image */}
        {item.sizes.length === 1 && (
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-0.5 shadow-sm">
            <span className="text-[10px] sm:text-xs font-bold text-indigo-700">
              Rs.{item.sizes[0].price.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 line-clamp-1 leading-snug">{item.name}</h3>

        <div className="flex-1 flex flex-col justify-end gap-2">
          {item.sizes.map((sizeObj, index) => {
            const qty = getQty(sizeObj.size);
            const isAdded = addedSize === sizeObj.size;
            
            return (
              <div key={index}>
                {/* Size + Price row */}
                <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1.5">
                  <span className="font-medium text-gray-500">{sizeObj.size || 'Standard'}</span>
                  {item.sizes.length > 1 && (
                    <span className="text-indigo-600 font-bold">Rs.{sizeObj.price.toLocaleString()}</span>
                  )}
                </div>
                
                {/* Controls row */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100">
                    <button
                      onClick={() => handleQtyChange(sizeObj.size, -1)}
                      disabled={qty <= 1}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-l-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={10} className="text-gray-500" />
                    </button>
                    <span className="w-5 sm:w-6 text-center text-[10px] sm:text-xs font-bold text-gray-800 tabular-nums">{qty}</span>
                    <button
                      onClick={() => handleQtyChange(sizeObj.size, 1)}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-r-lg hover:bg-gray-100 transition"
                      aria-label="Increase quantity"
                    >
                      <Plus size={10} className="text-gray-500" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleAdd(sizeObj)}
                    className={`flex-1 font-semibold px-2.5 py-1.5 sm:py-2 rounded-lg transition-all text-[10px] sm:text-xs inline-flex items-center justify-center gap-1 ${
                      isAdded 
                        ? 'bg-emerald-500 text-white scale-[0.97]' 
                        : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.97]'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={11} className="text-white" />
                        <span className="text-white">Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={11} className="text-white" />
                        <span className="text-white">Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

const ProductGrid = ({ products, productVariants, onAddToCart, onAddCustomItem }) => {
  const handleAddToCart = useCallback((item, sizeObj) => {
    onAddToCart(item, sizeObj);
  }, [onAddToCart]);

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto mb-16 px-2">
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
            <SearchX size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">No products found</h3>
          <p className="text-gray-400 text-sm">Try a different search term or clear the filter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mb-12 sm:mb-16 px-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
        {products.map((item) => (
          <ProductCard
            key={`${item.id}-${item.name}`}
            item={item}
            productVariants={productVariants}
            onAddToCart={handleAddToCart}
          />
        ))}

        {/* Add Custom Item Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[240px] hover:border-indigo-300 hover:from-indigo-50 hover:to-white transition-all duration-300 cursor-pointer group"
          onClick={onAddCustomItem}
        >
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 group-hover:border-indigo-200 group-hover:shadow-md flex items-center justify-center mb-3 group-hover:scale-105 transition-all duration-300">
            <Plus size={24} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <span className="text-gray-700 font-semibold text-xs sm:text-sm text-center">Custom Item</span>
          <span className="text-gray-400 text-[10px] sm:text-xs text-center mt-0.5">Add your own entry</span>
        </div>
      </div>
    </div>
  );
};

export default memo(ProductGrid);
