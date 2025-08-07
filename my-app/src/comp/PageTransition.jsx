// PageTransition.js
import React from "react";
import { motion } from "framer-motion";

const transitionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.1, ease: "easeInOut" },
};


export default function PageTransition({ children }) {
  return <motion.div {...transitionProps}>{children}</motion.div>;
}
