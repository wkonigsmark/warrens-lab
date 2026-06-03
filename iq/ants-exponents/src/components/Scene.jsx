import { motion } from 'framer-motion'

// One step in the scroll-down lesson. Fades + rises into view the first time
// it's scrolled to, so reading feels like turning a page.
export default function Scene({ children, className = '' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={`max-w-2xl mx-auto px-5 py-12 ${className}`}
    >
      {children}
    </motion.section>
  )
}
