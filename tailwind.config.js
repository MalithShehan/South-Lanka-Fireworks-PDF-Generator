export const content = [
  "./src/**/*.{js,jsx,ts,tsx}", // Include all JavaScript/TypeScript files in the src folder
  "./public/index.html", // Include your HTML file if needed
];
export const theme = {
  extend: {
    fontSize: {
      '4x1': '2.5rem',
      'x1': '1.25rem',
    },
    fontFamily: {
      caveat: ['Caveat', 'cursive'],
      Kaushan: ['Kaushan Script', 'cursive'],
      Eater: ['Eater', 'cursive'],
    },
    screens: {
      // Change default breakpoints or add custom ones
      sm: '480px', // default 640px
      md: '768px', // default 768px
      lg: '1024px', // default 1024px
      xl: '1280px', // default 1280px
      '2xl': '1536px' // default 1536px
    },
  },
};
export const plugins = [];
