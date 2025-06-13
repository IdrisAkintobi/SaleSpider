import { Label } from "@/components/ui/label";

// Helper component for form fields to reduce repetition
export const FormField = ({
  label,
  error,
  children,
}: Readonly<{
  label: string;
  error?: string;
  children: React.ReactNode;
}>) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label
        htmlFor={children && (children as React.ReactElement).props.id}
        className="text-right"
      >
        {label}
      </Label>
      <div className="col-span-3">
        {children}
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    </div>
  );
};
