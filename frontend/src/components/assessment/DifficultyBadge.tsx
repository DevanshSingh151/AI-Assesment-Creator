'use client';

import React from 'react';

interface DifficultyBadgeProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const className = `difficulty-badge ${difficulty.toLowerCase()}`;

  return <span className={className}>{difficulty}</span>;
}
