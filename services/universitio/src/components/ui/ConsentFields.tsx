import { Link } from "wouter";

interface ConsentFieldsProps {
  marketingOptOut: boolean;
  termsAccepted: boolean;
  onMarketingOptOutChange: (v: boolean) => void;
  onTermsAcceptedChange: (v: boolean) => void;
  termsError?: string;
}

export function ConsentFields({
  marketingOptOut,
  termsAccepted,
  onMarketingOptOutChange,
  onTermsAcceptedChange,
  termsError,
}: ConsentFieldsProps) {
  return (
    <div className="space-y-3 pt-2">
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={marketingOptOut}
          onChange={e => onMarketingOptOutChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary cursor-pointer"
        />
        <span className="text-sm text-muted-foreground leading-snug">
          If you do <strong>NOT</strong> want to receive helpful updates, opportunities, and marketing emails from Universitio, please tick this box.
        </span>
      </label>

      <div className="flex flex-col gap-1">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={e => onTermsAcceptedChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary cursor-pointer"
          />
          <span className="text-sm text-muted-foreground leading-snug">
            I have read and agree to the{" "}
            <Link href="/terms-and-conditions" className="text-primary underline underline-offset-2 hover:text-primary/80">
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="text-primary underline underline-offset-2 hover:text-primary/80">
              Privacy Policy
            </Link>
            . <span className="text-red-500">*</span>
          </span>
        </label>
        {termsError && (
          <p className="text-xs text-red-500 ml-7">{termsError}</p>
        )}
      </div>
    </div>
  );
}
