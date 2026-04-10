import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
  stories: ["../**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  webpackFinal: async (webpackConfig) => {
    const path = require("path") as typeof import("path");

    webpackConfig.module ??= { rules: [] };
    webpackConfig.module.rules ??= [];

    // Tailwind v4는 PostCSS를 통해 globals.css의 `@import "tailwindcss"`를 처리해야 함
    // Storybook 기본 CSS rule(implicit loaders)에 postcss-loader만 주입한다.
    const rules = webpackConfig.module.rules as any[];
    for (const rule of rules) {
      const testStr = rule?.test?.toString?.() ?? "";
      if (!testStr.includes("css")) continue;
      if (!Array.isArray(rule.use)) continue;

      const hasCssLoader = rule.use.some((u: any) => {
        const loader = typeof u === "string" ? u : u?.loader;
        return typeof loader === "string" && loader.includes("css-loader");
      });
      if (!hasCssLoader) continue;

      const hasPostcss = rule.use.some((u: any) => {
        const loader = typeof u === "string" ? u : u?.loader;
        return typeof loader === "string" && loader.includes("postcss-loader");
      });
      if (hasPostcss) continue;

      rule.use.push({
        loader: require.resolve("postcss-loader"),
        options: {
          postcssOptions: {
            config: path.resolve(__dirname, "..", "postcss.config.mjs"),
          },
        },
      });
    }

    webpackConfig.module.rules.push({
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve("babel-loader"),
          options: {
            presets: [require.resolve("next/babel")],
          },
        },
      ],
    });

    webpackConfig.resolve ??= {};
    webpackConfig.resolve.alias ??= {};
    // tsconfig paths: "@/*" -> project root
    webpackConfig.resolve.alias["@"] = path.resolve(__dirname, "..");
    // Storybook 환경에서 Next 전용 모듈을 mock으로 치환
    webpackConfig.resolve.alias["next/image"] = path.resolve(
      __dirname,
      "mocks/next-image.tsx",
    );
    webpackConfig.resolve.alias["next/link"] = path.resolve(
      __dirname,
      "mocks/next-link.tsx",
    );
    webpackConfig.resolve.extensions ??= [".js", ".jsx", ".ts", ".tsx"];
    if (!webpackConfig.resolve.extensions.includes(".ts")) {
      webpackConfig.resolve.extensions.push(".ts");
    }
    if (!webpackConfig.resolve.extensions.includes(".tsx")) {
      webpackConfig.resolve.extensions.push(".tsx");
    }

    return webpackConfig;
  },
};

export default config;
