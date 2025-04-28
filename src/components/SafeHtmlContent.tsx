"use client";

import { useEffect, useState } from "react";

interface SafeHtmlContentProps {
  content: string;
  className?: string;
}

export function SafeHtmlContent({ content, className }: SafeHtmlContentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className={className} suppressHydrationWarning />;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
      suppressHydrationWarning
    />
  );
}
