import React from "react";
import { motion as Motion } from "framer-motion";
import { ShoppingCart, Package } from "lucide-react";

const ProductGrid = ({ products, productVariants, onAddToCart, onAddCustomItem }) => {
  return (
    <div className="max-w-6xl mx-auto mb-16">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((item) => (
          <Motion.div
            key={item.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-3"
            variants={productVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-2">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.name}</h3>

            <ul className="text-xs text-pink-600 font-medium mb-3">
              {item.sizes.map(({ size, price }) => (
                <li key={size}>💥 {size} — LKR {price}</li>
              ))}
            </ul>

            <div className="flex flex-wrap justify-center gap-2">
              {item.sizes.map((sizeObj, index) => (
                <button
                  key={index}
                  onClick={() => onAddToCart(item, sizeObj)}
                  className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-medium px-3 py-1.5 rounded-md hover:opacity-90 transition text-sm inline-flex items-center gap-2"
                >
                  <ShoppingCart size={14} className="text-white" />
                  <span className="text-white">Add {sizeObj.size}</span>
                </button>
              ))}
            </div>
          </Motion.div>
        ))}

        <div className="mb-6 flex items-center justify-center">
          <button
            onClick={onAddCustomItem}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-700 inline-flex items-center gap-2"
          >
            <Package size={16} className="text-white" />
            <span className="text-white">Add Item</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
