"use client";

import { Suspense, useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { trackers, useConsent } from "@/lib/consent";

/** Reports page views on client-side navigation (the first view is sent by the tag itself). */
function PageViews() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useEffect(() => {
    const url = search ? `${pathname}?${search}` : pathname;
    window.gtag?.("event", "page_view", { page_path: url });
  }, [pathname, search]);
  return null;
}

/** Loads Google Analytics, Meta Pixel and the live-chat widget — only after the visitor accepts all cookies. */
export function Analytics() {
  const consent = useConsent();
  if (consent !== "all") return null;
  return (
    <>
      {trackers.ga ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${trackers.ga}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${trackers.ga}',{anonymize_ip:true});`}
          </Script>
          <Suspense fallback={null}>
            <PageViews />
          </Suspense>
        </>
      ) : null}
      {trackers.meta ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${trackers.meta}');fbq('track','PageView');`}
        </Script>
      ) : null}
      {trackers.chat ? (
        <Script id="tawk-chat" strategy="lazyOnload">
          {`var Tawk_API=Tawk_API||{};(function(){var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];s1.async=true;s1.src=${JSON.stringify(trackers.chat)};s1.charset='UTF-8';s1.setAttribute('crossorigin','*');s0.parentNode.insertBefore(s1,s0);})();`}
        </Script>
      ) : null}
    </>
  );
}
