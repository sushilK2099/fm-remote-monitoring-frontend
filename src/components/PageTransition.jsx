'use client';
import { motion } from 'motion/react';

export const sectionVariant = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '28px' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
