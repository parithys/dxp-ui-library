import { Button } from '../ui/button';
import { Icon } from './Icon';
import { Tooltip } from './Tooltip';
import { EYE_ICON } from '../../assets/icons/index';


/** The "Customer view" toggle (and its "Visible to customer" tag while sharing): the one button every journey screen and the completion page use. */
export function CustomerViewButton({ viewOpen, onToggle }: { viewOpen: boolean; onToggle: () => void }) {
  return (
    <>
      {/* Says which content the customer can see; the container's outline says where it ends. */}
      {viewOpen && (
        <span className="tag-warm">
          <Icon path={EYE_ICON} className="size-3.5 " />
          Visible to customer
        </span>
      )}
      <Tooltip
        content={viewOpen ? 'The customer can see this section. Click to stop sharing.' : 'Show this section to the customer'}
        placement="bottom"
      >
        <Button
          variant={viewOpen ? 'default' : 'secondary'}
          size="sm"
          onClick={onToggle}
          aria-pressed={viewOpen}
          className={viewOpen ? '' : 'customer-view-btn'}
        >
          {viewOpen && (
            <span aria-hidden="true" className="relative flex size-2">
              <span className="ping-ring" />
              <span className="relative inline-flex dot bg-accent-on" />
            </span>
          )}
          <Icon path={EYE_ICON} className="size-4 " />
          {viewOpen ? 'Showing to customer' : 'Customer view'}
        </Button>
      </Tooltip>
    </>
  );
}
