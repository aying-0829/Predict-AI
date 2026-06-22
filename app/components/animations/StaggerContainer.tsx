'use client'

import React from 'react'

interface StaggerContainerProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

/**
 * StaggerContainer — wraps children and automatically assigns stagger-{n} classes
 * to each direct child element for cascading fadeUp animations.
 */
export default function StaggerContainer({
  children,
  delay = 0,
  className = '',
}: StaggerContainerProps) {
  const childrenArray = React.Children.toArray(children)

  return (
    <div className={className} style={{ animationDelay: `${delay}ms` }}>
      {childrenArray.map((child, index) => {
        const staggerIndex = (index % 6) + 1
        return (
          <div key={index} className={`stagger-${staggerIndex}`}>
            {child}
          </div>
        )
      })}
    </div>
  )
}
