import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

const backgrounds = {
  default: "bg-background",
  surface: "bg-surface",
  brand: "bg-brand-900 text-white",
} as const;

export function Section({
  children,
  background = "default",
  id,
  className = "",
}: {
  children: ReactNode;
  background?: keyof typeof backgrounds;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`py-16 md:py-24 ${backgrounds[background]} ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}
