import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: '@vfq/dxp-ui - Design System',
    brandUrl: '/',
    colorPrimary: '#e60000',
    colorSecondary: '#e60000',
    fontBase: '"Figtree", system-ui, sans-serif',
  }),
  sidebar: { showRoots: true },
});
