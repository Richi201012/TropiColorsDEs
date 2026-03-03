import { useState, useEffect } from "react";

/**
 * Hook to detect if user prefers reduced motion
 * Useful for disabling heavy animations on devices that prefer reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to detect if device is mobile
 * Useful for disabling heavy effects on mobile devices
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

/**
 * Hook to detect connection speed (slow connections)
 * Useful for reducing quality/effects on slow connections
 */
export function useNetworkSpeed(): "slow" | "fast" {
  const [networkSpeed, setNetworkSpeed] = useState<"slow" | "fast">("fast");

  useEffect(() => {
    // @ts-ignore - navigator.connection is not in all TypeScript definitions
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      const checkSpeed = () => {
        const effectiveType = connection.effectiveType;
        setNetworkSpeed(effectiveType === "4g" || effectiveType === "3g" ? "fast" : "slow");
      };

      checkSpeed();
      connection.addEventListener("change", checkSpeed);
      return () => connection.removeEventListener("change", checkSpeed);
    }

    // Default to fast if API not available
    setNetworkSpeed("fast");
  }, []);

  return networkSpeed;
}

/**
 * Hook to get performance-optimized animation settings
 */
export function useOptimizedAnimations() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const networkSpeed = useNetworkSpeed();

  return {
    // Whether to enable particle effects
    enableParticles: !prefersReducedMotion && !isMobile && networkSpeed === "fast",
    // Number of particles to show
    particleCount: isMobile ? 5 : networkSpeed === "slow" ? 8 : 20,
    // Whether to enable floating blobs
    enableBlobs: !prefersReducedMotion,
    // Animation duration multiplier (slower on mobile)
    animationSpeed: isMobile ? 1.5 : 1,
    // Whether to enable scroll animations
    enableScrollAnimations: !prefersReducedMotion,
    // Image quality (lower on slow connections)
    imageQuality: networkSpeed === "slow" ? 70 : 90,
  };
}
