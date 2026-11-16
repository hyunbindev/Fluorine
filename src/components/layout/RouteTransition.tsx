import { motion, useReducedMotion } from 'motion/react'
import { Outlet, useLocation } from 'react-router'

export default function RouteTransition() {
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      key={pathname}
      className="h-full min-h-0 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
    >
      <Outlet />
    </motion.div>
  )
}
