/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Sosapient purple brand scale (primary #5727B2, hover #472096, active #391778).
        brand: { 50:'#F3EEFF',100:'#E8DEFF',200:'#D4C4FF',300:'#BFA6FF',400:'#9B7BF5',500:'#7446E3',600:'#5727B2',700:'#472096',800:'#391778',900:'#2A1159',950:'#1A0B38' },
        success: { 50:'#F0FDF4',100:'#DCFCE7',600:'#16A34A',700:'#15803D',900:'#14532D',950:'#052E16' },
        warning: { 50:'#FFFBEB',100:'#FEF3C7',600:'#D97706',700:'#B45309',900:'#78350F',950:'#451A03' },
        info: { 50:'#EFF6FF',100:'#DBEAFE',600:'#2563EB',700:'#1D4ED8',900:'#1E3A8A',950:'#172554' },
      },
    },
  },
  plugins: [],
};
