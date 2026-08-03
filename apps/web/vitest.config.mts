import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
    /*
     * CSS Modules are processed rather than stubbed, with class names left
     * unhashed, so `styles.foo` resolves to "foo" in tests. Without this every
     * lookup is undefined and assertions about state-carrying classes silently
     * pass against nothing.
     */
    css: {
      modules: { classNameStrategy: "non-scoped" },
    },
    /*
     * Radix and its transitive helpers (react-remove-scroll, aria-hidden,
     * use-sidecar, @floating-ui …) ship CJS. Left external they `require`
     * React and get a different module instance from the ESM copy Vite hands
     * the component under test — two Reacts, so every hook inside a primitive
     * throws "Invalid hook call".
     *
     * Listing them individually meant discovering each one via a new failure,
     * so everything is inlined and passed through the same transform. Next's
     * bundler already does the equivalent, which is why this only bites here.
     */
    server: {
      deps: { inline: [/radix-ui/, /@radix-ui\//, /@floating-ui\//] },
    },
  },
  resolve: {
    // import.meta.dirname, not __dirname: Vite's native config loader does not
    // provide the CJS globals and warns that it will become the default.
    alias: { "@": import.meta.dirname },
    /*
     * pnpm gives Radix its own hoisted React at the workspace root, so without
     * this a component rendered in a test sees a second copy and every hook
     * call fails with "Invalid hook call". Next's own bundler dedupes these
     * already, which is why it only bites under Vitest.
     */
    dedupe: ["react", "react-dom"],
  },
})
