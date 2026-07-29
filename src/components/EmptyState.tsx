import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="text-5xl mb-6 opacity-70"
      >
        {icon}
      </motion.div>
      <h3 className="font-display text-xl font-semibold text-noir-200 mb-2">{title}</h3>
      <p className="text-noir-400 max-w-sm mb-8 leading-relaxed">{description}</p>
      {action}
    </motion.div>
  );
}
