// Every story renders with the library's own tokens and styles (storybook.css imports the same CSS a consumer imports) - nothing here restyles a component.
// Toolbar globals: Theme (light/dark, the `.dark` class an application toggles) and Device (web/tablet, `data-device`).
import './storybook.css';
import { useEffect } from 'react';
import type { Decorator, Preview } from '@storybook/react-vite';
import { trackInputModality } from '../src';

const withGlobals: Decorator = (Story, context) => {
  const theme = (context.globals.theme as string | undefined) ?? 'light';
  const device = (context.globals.device as string | undefined) ?? 'web';
  document.documentElement.classList.toggle('dark', theme === 'dark');
  if (device === 'tablet') document.documentElement.dataset.device = 'tablet';
  else delete document.documentElement.dataset.device;
  return <Frame><Story /></Frame>;
};

function Frame({ children }: { children: React.ReactNode }) {
  // The library's rule: a selected tab wears no focus ring after a mouse click (lib/inputModality.ts).
  useEffect(() => trackInputModality(), []);
  return <>{children}</>;
}

const preview: Preview = {
  decorators: [withGlobals],
  tags: ['autodocs'],
  globalTypes: {
    theme: { description: 'Colour theme (the `.dark` class)', toolbar: { title: 'Theme', icon: 'circlehollow', items: [{ value: 'light', title: 'Light' }, { value: 'dark', title: 'Dark' }], dynamicTitle: true } },
    device: { description: 'Device tokens: Web (pointer) or Tablet (touch, `data-device="tablet"`)', toolbar: { title: 'Device', icon: 'tablet', items: [{ value: 'web', title: 'Web' }, { value: 'tablet', title: 'Tablet' }], dynamicTitle: true } },
  },
  initialGlobals: { theme: 'light', device: 'web' },
  parameters: {
    layout: 'padded',
    controls: { expanded: true, matchers: { color: /(background|color)$/i, date: /Date$/ } },
    // The page background is the design system's own (--bg), so the canvas switch is off.
    backgrounds: { disable: true },
    viewport: {
      options: {
        desktop: { name: 'Desktop (1440 x 900)', styles: { width: '1440px', height: '900px' }, type: 'desktop' },
        tablet: { name: 'Tablet (768 x 1024)', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
        mobile: { name: 'Mobile (390 x 844)', styles: { width: '390px', height: '844px' }, type: 'mobile' },
      },
    },
    // Accessibility checks run on every story (the a11y addon's panel); violations are reported, not failed, until the todo list is empty.
    a11y: { test: 'todo' },
    docs: { toc: true },
    options: { storySort: { order: ['Introduction', 'Foundations', 'Primitives', 'Forms', 'Navigation', 'Feedback & Status'] } },
  },
};

export default preview;
