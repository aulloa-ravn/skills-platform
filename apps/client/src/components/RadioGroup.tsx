import React, { useRef, KeyboardEvent } from 'react';

export interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  disabled?: boolean;
  layout?: 'vertical' | 'horizontal';
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  layout = 'vertical',
}) => {
  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (disabled) return;

    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % options.length;
        onChange(options[nextIndex].value);
        // Focus the next radio button
        setTimeout(() => {
          const nextRadio = groupRef.current?.querySelectorAll('input[type="radio"]')[nextIndex] as HTMLInputElement;
          nextRadio?.focus();
        }, 0);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1;
        onChange(options[nextIndex].value);
        // Focus the previous radio button
        setTimeout(() => {
          const prevRadio = groupRef.current?.querySelectorAll('input[type="radio"]')[nextIndex] as HTMLInputElement;
          prevRadio?.focus();
        }, 0);
        break;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby={`${label}-label`}
        className={`flex ${layout === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-3'}`}
      >
        {options.map((option, index) => {
          const isSelected = value === option.value;
          const inputId = `radio-${label}-${option.value}`;

          return (
            <div key={option.value} className="flex items-center">
              <input
                type="radio"
                id={inputId}
                name={label}
                value={option.value}
                checked={isSelected}
                onChange={() => !disabled && onChange(option.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={disabled}
                className="sr-only peer"
                aria-label={option.label}
              />
              <label
                htmlFor={inputId}
                className={`
                  flex items-center cursor-pointer select-none
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700/30'}
                  transition-all duration-200 rounded-lg px-3 py-2
                `}
              >
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                    transition-all duration-200
                    ${isSelected
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-500 bg-transparent'
                    }
                    ${!disabled && 'peer-focus:ring-2 peer-focus:ring-purple-500/50 peer-focus:ring-offset-2 peer-focus:ring-offset-gray-900'}
                  `}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  )}
                </div>
                <span className={`text-sm ${isSelected ? 'text-purple-300 font-medium' : 'text-gray-300'}`}>
                  {option.label}
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RadioGroup;
