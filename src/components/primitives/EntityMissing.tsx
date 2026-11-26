import { Button } from '../ui/button';
import { useLink } from '../../lib/link';

/**
 * What a detail screen shows when its record is not on screen: still loading, or genuinely not found. The two are never
 * confused (a reload or deep link used to flash "not found" while the list was still arriving), and a not-found screen
 * always offers a way back (drawn with the application's link component, see LinkProvider).
 */
export function EntityMissing({
  what,
  loading,
  error,
  onRetry,
  backTo,
  backLabel,
}: {
  what: string;
  loading: boolean;
  /** The load itself failed - distinct from "not found", and offers a retry. */
  error?: boolean;
  onRetry?: () => void;
  backTo: string;
  backLabel: string;
}) {
  const Link = useLink();
  if (error) {
    return (
      <div className="p-8 space-y-3" role="alert">
        <p className="text-fg">We could not load this {what} just now.</p>
        <div className="row gap-4">
          {onRetry && (
            <Button variant="link" type="button" onClick={onRetry} className="font-medium">
              Try Again
            </Button>
          )}
          {/* oxlint-disable-next-line react/static-components -- the host's link component, fixed for the app's life (LinkProvider) */}
          <Link to={backTo} className="link font-medium">
            {backLabel}
          </Link>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="p-8 text-fg-2" role="status">
        Loading {what}…
      </div>
    );
  }
  return (
    <div className="p-8 space-y-3">
      <p className="text-fg">We could not find this {what}. It may have been removed, or the link is out of date.</p>
      {/* oxlint-disable-next-line react/static-components -- the host's link component, fixed for the app's life (LinkProvider) */}
      <Link to={backTo} className="link font-medium">
        {backLabel}
      </Link>
    </div>
  );
}
