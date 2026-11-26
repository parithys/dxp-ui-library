import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../../src/components/ui/button';
import { ErrorBoundary } from '../../src/components/primitives/ErrorBoundary';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Feedback & Status/Error Boundary',
  component: ErrorBoundary,
  parameters: {
    ...docsParameters({
      purpose: 'Guards one routed subtree so a crash in one screen does not white-screen the persistent shell. Shows a "Something Went Wrong" page with Try again, Reload page and a Back to Home link, or a caller-supplied `fallback`.',
      source: 'src/components/primitives/ErrorBoundary.tsx',
      variants: ['Default fallback page; custom `fallback` node.'],
      states: ['Healthy (renders children)', 'Caught an error (fallback)', 'Reset by "Try again" or by a changed `resetKey` (e.g. the route path)'],
      events: ['"Try again" clears the error and re-renders the children; "Reload page" reloads the window.'],
      accessibility: ['The fallback is a page with an `h1` heading and real buttons/link; it does not use a live region, so it is not announced on appearance.'],
      restrictions: ['It logs the caught error with `console.error` by design; the throwing story prints it in the browser console.', '"Reload page" is shown but not clicked in tests (it would reload the preview).'],
    }),
  },
  argTypes: { resetKey: { control: 'text', description: 'When this changes, a boundary holding an error clears it and re-renders the children.' }, children: { control: false }, fallback: { control: false } },
  args: { children: <p className="body-text">This subtree rendered normally.</p> },
} satisfies Meta<typeof ErrorBoundary>;
export default meta;
type Story = StoryObj<typeof meta>;

function Bomb({ armed }: { armed: boolean }) {
  if (armed) throw new Error('Sample failure thrown by the story');
  return <p className="body-text">Recovered: the child rendered again.</p>;
}

export const Default: Story = {};

export const CaughtError: Story = {
  render: () => (
    <ErrorBoundary>
      <Bomb armed />
    </ErrorBoundary>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: 'Something Went Wrong' })).toBeVisible();
    await expect(c.getByRole('button', { name: 'Try again' })).toBeVisible();
    await expect(c.getByRole('button', { name: 'Reload page' })).toBeVisible();
    await expect(c.getByRole('link', { name: 'Back to Home' })).toBeVisible();
  },
};

export const CustomFallback: Story = {
  render: () => (
    <ErrorBoundary fallback={<p role="alert" className="notice-danger pad-row">This panel is unavailable.</p>}>
      <Bomb armed />
    </ErrorBoundary>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent('This panel is unavailable.');
  },
};

function RecoverDemo() {
  const [armed, setArmed] = useState(true);
  return (
    <>
      <Button variant="secondary" onClick={() => setArmed(false)}>
        Fix the cause
      </Button>
      <ErrorBoundary>
        <Bomb armed={armed} />
      </ErrorBoundary>
    </>
  );
}

export const TryAgainRecovers: Story = {
  render: () => <RecoverDemo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: 'Something Went Wrong' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Fix the cause' }));
    await userEvent.click(c.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(c.getByText(/Recovered/)).toBeVisible());
  },
};

function ResetKeyDemo() {
  const [route, setRoute] = useState('/broken');
  return (
    <>
      <Button variant="secondary" onClick={() => setRoute('/ok')}>
        Navigate to another route
      </Button>
      <ErrorBoundary resetKey={route}>
        <Bomb armed={route === '/broken'} />
      </ErrorBoundary>
    </>
  );
}

export const ResetKeyClearsError: Story = {
  render: () => <ResetKeyDemo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: 'Something Went Wrong' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Navigate to another route' }));
    await waitFor(() => expect(c.getByText(/Recovered/)).toBeVisible());
  },
};
