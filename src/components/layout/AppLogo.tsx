"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface AppLogoProps {
  size?: number;
  className?: string;
  variant?: "auto" | "dark-icon" | "white-icon";
}

export default function AppLogo({
  size = 32,
  className = "",
  variant = "auto",
}: AppLogoProps) {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    if (variant !== "auto") return;

    const checkTheme = () => {
      const htmlEl = document.documentElement;
      const themeAttr = htmlEl.getAttribute("data-theme");
      const hasDarkClass = htmlEl.classList.contains("dark");
      setIsDarkTheme(themeAttr === "dark" || hasDarkClass);
    };

    checkTheme();

    const observer = new MutationObserver(() => {
      checkTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    return () => observer.disconnect();
  }, [variant]);

  let iconSrc = "/assets/images/icon_dark_bg_transparent.png";

  if (variant === "white-icon") {
    iconSrc = "/assets/images/icon_white_bg_transparent.png";
  } else if (variant === "dark-icon") {
    iconSrc = "/assets/images/icon_dark_bg_transparent.png";
  } else {
    iconSrc = isDarkTheme
      ? "/assets/images/icon_white_bg_transparent.png"
      : "/assets/images/icon_dark_bg_transparent.png";
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={iconSrc}
        alt="HitungSaham Logo"
        width={size}
        height={size}
        className="object-contain w-full h-full"
        priority
      />
    </div>
  );
}
