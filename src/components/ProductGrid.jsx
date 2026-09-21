import React, { memo, useCallback, useState } from "react";
import { motion as Motion } from "framer-motion";
import { ShoppingCart, Package, Plus, Minus, Check, SearchX, Trash2, Sparkles } from "lucide-react";

const ProductCard = memo(({ item, productVariants, onAddToCart, onDeleteCustomProduct }) => {
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
      className="bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 flex flex-col group overflow-hidden card-hover shadow-xs hover:shadow-md"
      variants={productVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%]" style={{ animation: 'shimmer 1.5s infinite' }} />
        )}
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Hover quick description */}
        {item.description && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5 sm:p-3 pointer-events-none">
            <p className="text-white text-[10px] sm:text-xs leading-snug line-clamp-3 font-medium">
              {item.description}
            </p>
          </div>
        )}

        {/* Badges on image */}
        <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
          {item.isCustom && (
            <span className="bg-indigo-600 text-white backdrop-blur-sm rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles size={9} />
              Custom
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          {item.isCustom && onDeleteCustomProduct && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCustomProduct(item.id);
              }}
              className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-700 text-white backdrop-blur-sm transition shadow-sm active:scale-95"
              title="Delete custom item from database"
              aria-label="Delete custom item"
            >
              <Trash2 size={12} />
            </button>
          )}
          {item.sizes.length === 1 && (
            <div className="bg-white/95 backdrop-blur-md rounded-lg px-2 py-0.5 shadow-sm border border-slate-100">
              <span className="text-[10px] sm:text-xs font-black text-indigo-700">
                Rs. {item.sizes[0].price.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1.5 line-clamp-1 leading-snug group-hover:text-indigo-600 transition-colors" title={item.name}>
          {item.name}
        </h3>

        <div className="flex-1 flex flex-col justify-end gap-2">
          {item.sizes.map((sizeObj, index) => {
            const qty = getQty(sizeObj.size);
            const isAdded = addedSize === sizeObj.size;
            
            return (
              <div key={index} className="pt-1 first:pt-0">
                {/* Size + Price row */}
                <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1.5">
                  <span className="font-semibold text-slate-500 truncate">{sizeObj.size || 'Standard'}</span>
                  {item.sizes.length > 1 && (
                    <span className="text-indigo-600 font-extrabold tabular-nums">Rs. {sizeObj.price.toLocaleString()}</span>
                  )}
                </div>
                
                {/* Controls row */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200">
                    <button
                      onClick={() => handleQtyChange(sizeObj.size, -1)}
                      disabled={qty <= 1}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-l-xl hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition active:scale-95"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={11} className="text-slate-600" />
                    </button>
                    <span className="w-5 sm:w-6 text-center text-[11px] sm:text-xs font-bold text-slate-800 tabular-nums">
                      {qty}
                    </span>
                    <button
                      onClick={() => handleQtyChange(sizeObj.size, 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-r-xl hover:bg-slate-100 transition active:scale-95"
                      aria-label="Increase quantity"
                    >
                      <Plus size={11} className="text-slate-600" />
                    </button>
                  </div>
                  
                  {/* Add Button */}
                  <button
                    onClick={() => handleAdd(sizeObj)}
                    className={`flex-1 font-bold py-1.5 sm:py-2 px-2 rounded-xl transition-all text-[10px] sm:text-xs inline-flex items-center justify-center gap-1 active:scale-95 ${
                      isAdded 
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30' 
                        : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xs'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={12} className="text-white" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={12} className="text-white" />
                        <span>Add</span>
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

const ProductGrid = ({ products, productVariants, onAddToCart, onAddCustomItem, onDeleteCustomProduct }) => {
  const handleAddToCart = useCallback((item, sizeObj) => {
    onAddToCart(item, sizeObj);
  }, [onAddToCart]);

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto mb-16 px-2">
        <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
            <SearchX size={32} className="text-slate-300" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">No products found</h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xs mx-auto mb-4">
            Try adjusting your search query or select another category above.
          </p>
          <button
            onClick={onAddCustomItem}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700 transition active:scale-95"
          >
            <Plus size={14} />
            <span>Create Custom Entry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mb-12 sm:mb-16 px-1 sm:px-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        {products.map((item) => (
          <ProductCard
            key={`${item.id}-${item.name}`}
            item={item}
            productVariants={productVariants}
            onAddToCart={handleAddToCart}
            onDeleteCustomProduct={onDeleteCustomProduct}
          />
        ))}

        {/* Add Custom Item Card Slot */}
        <div
          className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:from-indigo-50/50 hover:to-white flex flex-col items-center justify-center min-h-[220px] sm:min-h-[260px] p-4 transition-all duration-300 cursor-pointer group card-hover"
          onClick={onAddCustomItem}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-xs border border-slate-200/80 group-hover:border-indigo-300 group-hover:shadow-md flex items-center justify-center mb-3 group-hover:scale-105 transition-all duration-300">
            <Plus size={22} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <span className="text-slate-800 font-bold text-xs sm:text-sm text-center">
            Custom Item
          </span>
          <span className="text-slate-400 text-[10px] sm:text-xs text-center mt-0.5">
            Add with photo
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(ProductGrid);
