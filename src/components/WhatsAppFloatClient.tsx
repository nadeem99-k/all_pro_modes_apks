"use client";

import dynamic from "next/dynamic";

// ssr: false must live inside a Client Component — cannot be used in Server Components
const WhatsAppFloat = dynamic(
  () => import("@/components/WhatsAppFloat").then((m) => m.WhatsAppFloat),
  { ssr: false }
);

export function WhatsAppFloatClient() {
  return <WhatsAppFloat />;
}
