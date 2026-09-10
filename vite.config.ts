import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        // remarkGfm is what makes markdown pipe tables render as a real
        // <table> — without it they come out as literal text in a <p>.
        // Styling for them lives in `.article__body table` in global.css.
        remarkPlugins: [
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: "frontmatter" }],
          remarkGfm,
        ],
        providerImportSource: "@mdx-js/react",
      }),
    },
    react(),
  ],
});
