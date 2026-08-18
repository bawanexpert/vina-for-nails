import { useRef, useState, type MouseEvent } from 'react'
import { motion } from 'framer-motion'

type TiltCardProps = {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function TiltCard({ children, className = '', onClick }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg)')

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTransform(
      `perspective(800px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg) scale3d(1.02,1.02,1.02)`,
    )
  }

  const handleLeave = () => {
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg)')
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ transform, transition: 'transform 0.15s ease-out' }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}
