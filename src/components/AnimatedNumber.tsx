"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function AnimatedNumber({ value }: { value: number }) {
  const digits = value.toString().split("");

  return (
    <div className="flex items-center font-mono">
      <AnimatePresence mode="popLayout">
        {digits.map((digit, i) => {
          const place = digits.length - i; // Represents the 1s, 10s, 100s place securely
          return (
            <motion.div
              layout
              key={place}
              className="relative overflow-hidden inline-flex justify-center"
              style={{ width: "0.6em", height: "1.1em", lineHeight: "1.1em" }}
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={digit}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0, position: "absolute" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 flex items-center justify-center font-bold"
                >
                  {digit}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
