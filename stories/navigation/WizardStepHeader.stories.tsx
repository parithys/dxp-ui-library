import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '../../src/components/ui/button';
import { WizardStepHeader } from '../../src/components/primitives/WizardStepHeader';
import type { WizardStep } from '../../src/lib/wizardTypes';
import { docsParameters } from '../_shared/docs';

type Props = Parameters<typeof WizardStepHeader>[0];

const step = (over: Partial<WizardStep> = {}): WizardStep => ({ key: 'sample', label: 'Sample Step', render: () => null, ...over });

/** The header as the wizard mounts it: it sits at the top of the step card, with the stepHeadingRef the wizard focuses on every step change. */
function Demo(props: Omit<Props, 'stepHeadingRef' | 'viewOpen' | 'toggleCustomerView'> & { viewOpen?: boolean; toggleCustomerView?: () => void }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [viewOpen, setViewOpen] = useState(props.viewOpen ?? false);
  return (
    <div className="card p-6 relative" style={{ maxWidth: 880 }}>
      <WizardStepHeader
        {...props}
        stepHeadingRef={ref}
        viewOpen={viewOpen}
        toggleCustomerView={() => {
          props.toggleCustomerView?.();
          setViewOpen((v) => !v);
        }}
      />
      <p className="text-secondary mt-4">Step content sits below the header.</p>
    </div>
  );
}

const meta = {
  title: 'Navigation/Wizard Step Header',
  component: WizardStepHeader,
  render: (args) => <Demo {...args} />,
  parameters: {
    ...docsParameters({
      purpose: 'The heading of a guided-journey step: optional eyebrow, the step\'s title (`headingFor(values)`, else `heading`, else the rail label), an optional subheading, and a floating strip at the top right for the step\'s own header action, the Selected Add-Ons tray and the Customer view button.',
      source: 'src/components/primitives/WizardStepHeader.tsx',
      variants: ['Title only; with `eyebrow`; with `subheading`; `headingFor` (a heading that depends on the answers so far).', '`headerAction`: a control at the top right (for example Refresh), before Customer view.', 'Customer view: shown only when `allowCustomerView` AND the host\'s `hasCustomerView(stepKey)` policy says the step offers it (the story offers it on `plan` and `number`).', '`trayAside`: the Selected Add-Ons tray where Customer view sits.'],
      states: ['Customer view closed / open (the button toggles)'],
      events: ['`toggleCustomerView()` from the Customer view button.'],
      accessibility: ['The title is an `h2` with `tabIndex={-1}` and a visible focus ring; the wizard focuses it (`stepHeadingRef`) on each step change so keyboard and screen-reader users land on the new step. Below `sm` the floating actions take their own row above the title.'],
      restrictions: ['An internal of the Guided Activation Wizard; journeys never mount it. The Customer view button opens a pop-up window for the customer, which the story does not exercise.'],
    }),
  },
  argTypes: {
    currentStep: { control: false },
    allowCustomerView: { control: 'boolean', description: 'The journey offers Customer view.' },
    viewOpen: { control: 'boolean', description: 'The customer\'s view pop-up is open (the button reads accordingly).' },
    values: { control: 'object', description: 'The journey\'s answers so far, for `headingFor` and `headerAction`.' },
    trayAside: { control: false },
    toggleCustomerView: { control: false },
    stepHeadingRef: { control: false },
    setValue: { control: false },
  },
  args: { currentStep: step(), hasCustomerView: (k: string | undefined) => k === 'plan' || k === 'number', allowCustomerView: false, viewOpen: false, toggleCustomerView: fn(), values: {}, setValue: fn() },
} satisfies Meta<typeof WizardStepHeader>;
export default meta;
type Story = StoryObj<typeof WizardStepHeader>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { level: 2, name: 'Sample Step' })).toBeVisible();
  },
};

export const WithEyebrowAndSubheading: Story = {
  args: { currentStep: step({ eyebrow: 'Configure service', heading: 'Choose a plan', subheading: 'Pick the plan the customer asked for.' }) },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Configure service')).toBeVisible();
    await expect(within(canvasElement).getByRole('heading', { name: 'Choose a plan' })).toBeVisible();
  },
};

export const HeadingFollowsTheAnswers: Story = {
  args: { currentStep: step({ heading: 'SIM Selection', headingFor: (v) => (v.multiSim ? 'Primary SIM Selection' : undefined) }), values: { multiSim: true } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { name: 'Primary SIM Selection' })).toBeVisible();
  },
};

export const WithCustomerView: Story = {
  args: { currentStep: step({ key: 'plan', label: 'Plans and Offers' }), allowCustomerView: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: /Customer view/i });
    await userEvent.click(button);
    await expect(args.toggleCustomerView).toHaveBeenCalledTimes(1);
  },
};

export const CustomerViewNotOfferedOnThisStep: Story = {
  args: { currentStep: step({ key: 'contact', label: 'Customer Verification' }), allowCustomerView: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: /Customer view/i })).toBeNull();
  },
};

export const WithHeaderAction: Story = {
  args: { currentStep: step({ key: 'number', label: 'Number Selection', headerAction: () => <Button variant="secondary" size="sm">Refresh</Button> }), allowCustomerView: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Refresh' })).toBeVisible();
  },
};

export const WithTrayAside: Story = {
  args: { trayAside: <Button variant="secondary" size="sm">3 add-ons</Button>, currentStep: step({ key: 'plan', label: 'Add-Ons' }) },
};
