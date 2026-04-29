import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default function middleware(req) {
  const url = req.nextUrl;

  let hostname = req.headers.get("host") || "";
  const path = url.pathname;

  // Local testing adjustment: remove port
  const hostnameWithoutPort = hostname.split(':')[0];

  // List of domains that serve the main app
  const mainDomains = [
    "localhost",
    "127.0.0.1",
    "instantsite.ai",
    "www.instantsite.ai"
  ];
  
  // Include vercel generated domains as main domain
  if (hostnameWithoutPort.endsWith(".vercel.app")) {
     return NextResponse.next();
  }

  const isMainDomain = mainDomains.includes(hostnameWithoutPort);

  if (isMainDomain) {
    return NextResponse.next();
  }

  // It's a custom domain or subdomain
  let domain = hostnameWithoutPort;
  
  // We can pass the full domain text as-is to the backend. But if we want to ensure
  // 'royalfood.instantsite.ai' just passes 'royalfood' to the backend, we can strip it.
  // Because in our controller we look for exact match in subdomain OR customDomain, 
  // keeping the full hostname string is fine too. However, since we save 'royalfood' as subdomain,
  // we MUST strip the `.instantsite.ai`.
  if (domain.endsWith(".instantsite.ai")) {
    domain = domain.replace(".instantsite.ai", "");
  }

  // Rewrite to our dynamic route for domain resolving
  return NextResponse.rewrite(new URL(`/_domain/${domain}${path}`, req.url));
}
