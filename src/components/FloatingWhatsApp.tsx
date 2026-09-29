import { site } from "@/config/site";
import { IconWhatsApp } from "./icons";

export function FloatingWhatsApp() {
  return (
    <a
      href={site.whatsappHref}
      target="_blank"
      rel="noreferrer"
      aria-label="Message DRP Holiday Homes on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white shadow-lift transition-transform hover:scale-105"
    >
      <IconWhatsApp className="h-5 w-5" />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}
