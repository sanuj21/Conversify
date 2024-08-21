import { defineConfig } from "vite";
import dns from "dns";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dns.setDefaultResultOrder("verbatim");

// Load environment variables from the .env file
dotenv.config();

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT),
    watch: {
      usePolling: true,
    },
    host: true,
  },
});
