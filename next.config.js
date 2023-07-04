const tailwindcss = require("tailwindcss");

module.exports = {
  reactStrictMode: true,
  swcMinify: false,
  plugins: ["postcss-preset-env", tailwindcss],

  webpack: (config, { isServer }) => {
    config.experiments = { asyncWebAssembly: true };
    if (isServer) {
      config.output.webassemblyModuleFilename =
        "./../static/wasm/[modulehash].wasm";
    } else {
      config.output.webassemblyModuleFilename = "static/wasm/[modulehash].wasm";
    }
    return config;
  },

  async rewrites() {
    return [
      {
        source: "/fonts/font1.ttf",
        destination: "/_next/static/fonts/font1.ttf",
      },
    ];
  },
};
