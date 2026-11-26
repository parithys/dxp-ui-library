import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { OsmEmbed } from '../../src/components/primitives/OsmEmbed';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Primitives/Map Embed',
  component: OsmEmbed,
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
  parameters: {
    ...docsParameters({
      purpose: 'A free OpenStreetMap embed (no key, no package) for an address\'s location. A pin is drawn only when real coordinates are given; otherwise the map is centred on Doha - the one location the data supports - and a note says so.',
      source: 'src/components/primitives/OsmEmbed.tsx',
      variants: ['With `latitude` and `longitude`: a close view (about 0.5 km) with a marker.', 'Without coordinates: a wide view of Doha, no marker, and "No coordinates are on file for this address, so the map shows Doha."', '`fill`: takes the height of its flex-column parent instead of `heightClassName` (default `h-64`).'],
      states: ['With pin', 'Without coordinates (Doha)', 'Fill parent'],
      accessibility: ['The frame is an `iframe` named by the required `title` prop; give it a title that names the address. The no-coordinates note is plain text under the map.'],
      restrictions: ['The map tiles load from openstreetmap.org, so Storybook needs network access to draw them; offline the frame stays blank (the component, its title and the Doha note still render).', 'The iframe is `loading="lazy"` with `referrerPolicy="no-referrer"`; the map itself is third-party content and is not keyboard-tested here.'],
    }),
  },
  argTypes: {
    latitude: { control: 'number', description: 'Pin latitude; both coordinates are needed for a pin.' },
    longitude: { control: 'number', description: 'Pin longitude.' },
    title: { control: 'text', description: 'Accessible title of the map frame.' },
    fill: { control: 'boolean', description: 'Fill the height of the parent (a flex column).' },
    heightClassName: { control: 'text', description: 'Tailwind height class when not filling.' },
    className: { control: 'text', description: 'Extra classes on the wrapper.' },
  },
  args: { title: 'Map of the service address', latitude: 25.3548, longitude: 51.4778 },
} satisfies Meta<typeof OsmEmbed>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const frame = within(canvasElement).getByTitle('Map of the service address') as HTMLIFrameElement;
    await expect(frame.src).toContain('marker=25.3548,51.4778');
  },
};

export const WithoutCoordinates: Story = {
  args: { latitude: undefined, longitude: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/No coordinates are on file/)).toBeVisible();
    const frame = within(canvasElement).getByTitle('Map of the service address') as HTMLIFrameElement;
    await expect(frame.src).not.toContain('marker=');
  },
};

export const FillsItsParent: Story = {
  decorators: [(Story) => <div className="flex flex-col" style={{ height: 360, maxWidth: 640 }}><Story /></div>],
  args: { fill: true },
};
