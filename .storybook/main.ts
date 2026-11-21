// Storybook for the DXP UI library (@vfq/dxp-ui): the component catalogue and design-system reference.
//
// A separate tool chain - `npm run storybook` / `npm run build-storybook` - that takes no part in the package build (`vite build`, `tsc -p tsconfig.build.json`).
// It consumes the library's own source (src/), its tokens and styles (src/styles), nothing is copied. Application-specific components live in the
// prototype's own Storybook, which imports this package.
import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

const storybookTsconfig = fileURLToPath(new URL('../tsconfig.json', import.meta.url));

const config: StorybookConfig = {
  framework: { name: '@storybook/react-vite', options: {} },
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  typescript: {
    // Props tables come from the components' own TypeScript types and JSDoc.
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      tsconfigPath: storybookTsconfig,
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  core: { disableTelemetry: true },
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import('vite');
    return mergeConfig(viteConfig, {
      // Tailwind v4 through its Vite plugin. The React plugin is NOT added: @storybook/react-vite already includes it (a second copy blanks the preview).
      plugins: [tailwindcss()],
      css: { postcss: { plugins: [] } },
      resolve: { dedupe: ['react', 'react-dom'] },
      define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development') },
      optimizeDeps: { include: ['react', 'react-dom', 'radix-ui', 'lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'] },
    });
  },
};

export default config;
