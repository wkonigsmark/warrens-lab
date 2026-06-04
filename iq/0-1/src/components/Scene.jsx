import { motion } from 'framer-motion'

// One step in the scroll-down lesson. Fades + rises into view the first time
// it's scrolled to, so reading feels like turning a page. (Same as the rest
// of the family.)
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

// Big friendly headline + supporting line, used at the top of most scenes.
export function Words({ title, children }) {
  return (
    <div className="text-center mb-7">
      {title && <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-3">{title}</h2>}
      {children && <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">{children}</p>}
    </div>
  )
}
