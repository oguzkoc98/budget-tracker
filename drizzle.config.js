import { config } from "dotenv";

// .env.local dosyasını yükle
config({ path: ".env.local" });

/** @type {import("drizzle-kit").Config} */
export default {
  schema: "./utils/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
