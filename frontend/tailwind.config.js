/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFC400',
          'yellow-hover': '#EAB300',
          black: '#101114',
          surface: '#191B20',
          white: '#FFFFFF',
          grey: '#F4F5F7',
          muted: '#777777',
          border: '#E5E7EB',
          green: '#16A34A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(16, 17, 20, 0.05)',
        'card-hover': '0 10px 28px rgba(16, 17, 20, 0.10)',
      },
    },
  },
  plugins: [],
};
