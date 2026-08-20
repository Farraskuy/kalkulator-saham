"use client";

import React, { useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

export interface AdminCrudNoticeProps {
  type: "success" | "error";
  children: React.ReactNode;
  onClose?: () => void;
}

export function AdminCrudNotice({
  type,
  children,
  onClose,
}: AdminCrudNoticeProps) {
  const { showToast } = useToast();

  useEffect(() => {
    if (children) {
      showToast(children, type);
      if (onClose) onClose();
    }
  }, [children, type, showToast, onClose]);

  return null;
}
