"use client";

import { motion } from "framer-motion";
import * as React from "react";

export function Reveal(props: React.PropsWithChildren<{ delay?: number; y?: number; className?: string }>) {
  const { children, delay = 0.05, y = 18, className = "" } = props;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
