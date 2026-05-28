'use client';

import React from 'react';
import { useAssessmentStore } from '@/store/useAssessmentStore';

const questionTypes = [
  {
    value: 'MCQ',
    label: 'Multiple Choice',
    desc: 'Options with one correct answer',
    icon: '◉',
  },
  {
    value: 'Short Answer',
    label: 'Short Answer',
    desc: 'Brief 1-2 sentence responses',
    icon: '✎',
  },
  {
    value: 'Long Answer',
    label: 'Long Answer',
    desc: 'Detailed paragraph responses',
    icon: '📝',
  },
  {
    value: 'True/False',
    label: 'True / False',
    desc: 'Binary true or false questions',
    icon: '⊘',
  },
];

interface QuestionConfigProps {
  errors: {
    questionTypes?: string;
    numberOfQuestions?: string;
    totalMarks?: string;
  };
}

export function QuestionConfig({ errors }: QuestionConfigProps) {
  const { formData, setFormField } = useAssessmentStore();

  const toggleType = (type: string) => {
    const current = formData.questionTypes;
    if (current.includes(type)) {
      setFormField('questionTypes', current.filter((t) => t !== type));
    } else {
      setFormField('questionTypes', [...current, type]);
    }
  };

  const handleDifficultyChange = (
    level: 'easy' | 'medium' | 'hard',
    newValue: number
  ) => {
    const dist = { ...formData.difficultyDistribution };
    const oldValue = dist[level];
    const diff = newValue - oldValue;

    dist[level] = newValue;

    const otherKeys = (['easy', 'medium', 'hard'] as const).filter(
      (k) => k !== level
    );
    const otherTotal = otherKeys.reduce((sum, k) => sum + dist[k], 0);

    if (otherTotal > 0) {
      const remaining = 100 - newValue;
      otherKeys.forEach((k) => {
        dist[k] = Math.round((dist[k] / otherTotal) * remaining);
      });

      // Fix rounding errors
      const actualTotal = dist.easy + dist.medium + dist.hard;
      if (actualTotal !== 100) {
        const correction = 100 - actualTotal;
        const adjustKey = otherKeys.find((k) => dist[k] > 0) || otherKeys[0];
        dist[adjustKey] += correction;
      }
    } else {
      // If other values are zero, split remaining between them
      const remaining = 100 - newValue;
      dist[otherKeys[0]] = Math.floor(remaining / 2);
      dist[otherKeys[1]] = remaining - Math.floor(remaining / 2);
    }

    // Clamp all values
    otherKeys.forEach((k) => {
      if (dist[k] < 0) dist[k] = 0;
    });

    setFormField('difficultyDistribution', dist);
  };

  const incrementField = (
    field: 'numberOfQuestions' | 'totalMarks',
    delta: number
  ) => {
    const current = formData[field];
    const newVal = current + delta;
    if (field === 'numberOfQuestions') {
      if (newVal >= 1 && newVal <= 50) setFormField(field, newVal);
    } else {
      if (newVal >= 1) setFormField(field, newVal);
    }
  };

  return (
    <div>
      {/* Question Types */}
      <div className="form-group" style={{ marginBottom: 24 }}>
        <label className="form-label form-label-required">Question Types</label>
        <div className="question-type-grid">
          {questionTypes.map((qt) => {
            const selected = formData.questionTypes.includes(qt.value);
            return (
              <button
                key={qt.value}
                type="button"
                className={`question-type-card ${selected ? 'selected' : ''}`}
                onClick={() => toggleType(qt.value)}
              >
                <div className="question-type-card-icon">{qt.icon}</div>
                <div>
                  <div className="question-type-card-label">{qt.label}</div>
                  <div className="question-type-card-desc">{qt.desc}</div>
                </div>
                <div className="question-type-card-check">
                  {selected && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {errors.questionTypes && (
          <span className="form-error">{errors.questionTypes}</span>
        )}
      </div>

      {/* Number of Questions & Total Marks */}
      <div className="form-grid" style={{ marginBottom: 24 }}>
        <div className="form-group">
          <label className="form-label form-label-required">
            Number of Questions
          </label>
          <div className="number-input-wrapper">
            <button
              type="button"
              className="number-input-btn"
              onClick={() => incrementField('numberOfQuestions', -1)}
              aria-label="Decrease"
            >
              −
            </button>
            <input
              type="number"
              className="number-input-field"
              value={formData.numberOfQuestions}
              min={1}
              max={50}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setFormField('numberOfQuestions', val);
              }}
            />
            <button
              type="button"
              className="number-input-btn"
              onClick={() => incrementField('numberOfQuestions', 1)}
              aria-label="Increase"
            >
              +
            </button>
          </div>
          {errors.numberOfQuestions && (
            <span className="form-error">{errors.numberOfQuestions}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label form-label-required">Total Marks</label>
          <div className="number-input-wrapper">
            <button
              type="button"
              className="number-input-btn"
              onClick={() => incrementField('totalMarks', -5)}
              aria-label="Decrease"
            >
              −
            </button>
            <input
              type="number"
              className="number-input-field"
              value={formData.totalMarks}
              min={1}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setFormField('totalMarks', val);
              }}
            />
            <button
              type="button"
              className="number-input-btn"
              onClick={() => incrementField('totalMarks', 5)}
              aria-label="Increase"
            >
              +
            </button>
          </div>
          {errors.totalMarks && (
            <span className="form-error">{errors.totalMarks}</span>
          )}
        </div>
      </div>

      {/* Difficulty Distribution */}
      <div className="form-group">
        <label className="form-label">Difficulty Distribution</label>
        <div className="difficulty-dist">
          <div className="difficulty-bar-container">
            <div
              className="difficulty-bar-easy"
              style={{ width: `${formData.difficultyDistribution.easy}%` }}
            />
            <div
              className="difficulty-bar-medium"
              style={{ width: `${formData.difficultyDistribution.medium}%` }}
            />
            <div
              className="difficulty-bar-hard"
              style={{ width: `${formData.difficultyDistribution.hard}%` }}
            />
          </div>

          <div className="difficulty-sliders">
            <div className="difficulty-slider-row">
              <span className="difficulty-slider-label easy">Easy</span>
              <input
                type="range"
                className="difficulty-slider-input easy"
                min={0}
                max={100}
                value={formData.difficultyDistribution.easy}
                onChange={(e) =>
                  handleDifficultyChange('easy', parseInt(e.target.value, 10))
                }
              />
              <span className="difficulty-slider-value easy">
                {formData.difficultyDistribution.easy}%
              </span>
            </div>

            <div className="difficulty-slider-row">
              <span className="difficulty-slider-label medium">Medium</span>
              <input
                type="range"
                className="difficulty-slider-input medium"
                min={0}
                max={100}
                value={formData.difficultyDistribution.medium}
                onChange={(e) =>
                  handleDifficultyChange('medium', parseInt(e.target.value, 10))
                }
              />
              <span className="difficulty-slider-value medium">
                {formData.difficultyDistribution.medium}%
              </span>
            </div>

            <div className="difficulty-slider-row">
              <span className="difficulty-slider-label hard">Hard</span>
              <input
                type="range"
                className="difficulty-slider-input hard"
                min={0}
                max={100}
                value={formData.difficultyDistribution.hard}
                onChange={(e) =>
                  handleDifficultyChange('hard', parseInt(e.target.value, 10))
                }
              />
              <span className="difficulty-slider-value hard">
                {formData.difficultyDistribution.hard}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
