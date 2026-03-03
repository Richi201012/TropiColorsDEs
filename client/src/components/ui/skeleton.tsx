import { useState, useEffect, useRef, type ImgHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Original Skeleton component for backward compatibility
 */
const skeletonVariants = cva(
  "animate-pulse rounded-md bg-muted",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export function Skeleton({
  className,
  variant,
  size,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

/**
 * LazyImage - Image component with lazy loading and blur placeholder
 * Improves perceived performance by showing a blur effect while loading
 */
export function LazyImage({
  src,
  alt,
  className = "",
  placeholderClassName = "",
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "className">) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${placeholderClassName}`}>
      {/* Placeholder blur effect */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 bg-gradient-to-br from-muted to-muted/50 animate-pulse ${placeholderClassName}`}
        />
      )}
      
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
}

/**
 * SkeletonCard - Loading placeholder for cards
 */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border bg-card p-6 ${className}`}>
      <div className="space-y-3">
        <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
        <div className="h-3 w-full rounded bg-muted animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-20 rounded bg-muted animate-pulse" />
          <div className="h-8 w-20 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonProductGrid - Loading placeholder for product grid
 */
export function SkeletonProductGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * SkeletonText - Loading placeholder for text
 */
export function SkeletonText({
  lines = 3,
  className = ""
}: {
  lines?: number;
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded bg-muted animate-pulse ${
            i === lines - 1 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}
