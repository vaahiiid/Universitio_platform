import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";

const CANONICAL_ORIGIN = "https://universitio.com";

function normalisePath(path: string): string {
  if (path === "/" || path === "") return "/";
  return path.replace(/\/+$/, "");
}

export function CanonicalHead() {
  const [location] = useLocation();
  const canonical = `${CANONICAL_ORIGIN}${normalisePath(location)}`;

  return (
    <Helmet>
      <link rel="canonical" href={canonical} />
    </Helmet>
  );
}
