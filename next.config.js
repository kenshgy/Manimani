/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  onDemandEntries: {
    // サーバー起動時に環境変数のロード状況を確認
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

// 環境変数の読み込み順序を確認
console.log("\n=== 環境変数の読み込み順序 ===");
console.log("1. .env.$(NODE_ENV).local");
console.log("2. .env.local");
console.log("3. .env.$(NODE_ENV)");
console.log("4. .env\n");

// 現在の環境変数の状態を確認
console.log("=== 現在の環境変数の状態 ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("読み込まれた環境変数ファイル:");
console.log({
  ".env.$(NODE_ENV).local":
    process.env.NODE_ENV === "development"
      ? ".env.development.local"
      : ".env.production.local",
  ".env.local": ".env.local",
  ".env.$(NODE_ENV)":
    process.env.NODE_ENV === "development"
      ? ".env.development"
      : ".env.production",
  ".env": ".env",
});

// 実際の環境変数の値を確認（機密情報は除く）
console.log("\n=== 環境変数の値 ===");
Object.keys(process.env).forEach((key) => {
  if (key.startsWith("NEXT_") || key === "NODE_ENV") {
    console.log(`${key}: ${process.env[key]}`);
  }
});

module.exports = nextConfig;
