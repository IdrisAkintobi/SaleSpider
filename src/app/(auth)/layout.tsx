import { Logo } from "@/components/shared/logo";
import { type PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>
      <main className="w-full max-w-md">{children}</main>
    </div>
  );
}
