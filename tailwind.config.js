/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"  // 这里指定需要处理的文件
  ],
  important: true,
  theme: {
    extend: {},
  },
  plugins: [],
}