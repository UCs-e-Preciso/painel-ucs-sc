import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  badge?: string;
  count?: number;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: (SelectOption | string)[];
  placeholder?: string;
  label?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  align?: 'left' | 'right';
  direction?: 'auto' | 'down' | 'up';
  showClear?: boolean;
  prefix?: React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  label,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
  size = 'sm',
  align = 'left',
  direction = 'auto',
  showClear = false,
  prefix,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to SelectOption objects
  const normalizedOptions: SelectOption[] = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      if (direction === 'up') {
        setOpenUpward(true);
      } else if (direction === 'down') {
        setOpenUpward(false);
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        if (spaceBelow < 220 && rect.top > 220) {
          setOpenUpward(true);
        } else {
          setOpenUpward(false);
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, direction]);

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const isSelected = Boolean(value !== '' && value !== undefined && value !== null);

  const paddingY = size === 'sm' ? 'py-2 px-3' : 'py-2.5 px-3.5';
  const fontSize = size === 'sm' ? 'text-xs' : 'text-xs sm:text-sm';

  return (
    <div className={`relative ${isOpen ? 'z-[60]' : 'z-10'} ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 rounded-xl font-medium border text-left transition-all duration-200 focus:outline-none select-none ${paddingY} ${fontSize} ${
          isOpen
            ? 'border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 bg-white dark:bg-slate-800 shadow-md'
            : isSelected && value !== ''
            ? 'border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 shadow-sm'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {prefix && <span className="shrink-0 text-slate-400">{prefix}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span
            className={`truncate ${
              !selectedOption || selectedOption.value === ''
                ? 'text-slate-600 dark:text-slate-300 font-medium'
                : 'text-slate-900 dark:text-white font-semibold'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {showClear && isSelected && value !== '' && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              title="Limpar seleção"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
            }`}
          />
        </div>
      </button>

      {/* Floating Menu with Smooth Slide-in Animation */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute z-[100] max-h-64 w-full min-w-[190px] overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 shadow-2xl ring-1 ring-black/10 ${
            openUpward
              ? 'bottom-full mb-1.5 animate-dropdownOpenUp origin-bottom'
              : 'top-full mt-1.5 animate-dropdownOpen origin-top'
          } ${align === 'right' ? 'right-0' : 'left-0'} ${menuClassName}`}
        >
          {normalizedOptions.length === 0 ? (
            <div className="py-2.5 px-3 text-xs text-slate-400 text-center">Nenhuma opção</div>
          ) : (
            normalizedOptions.map((option) => {
              const active = String(option.value) === String(value);
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-lg transition-all duration-150 text-left font-medium select-none ${
                    active
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <span className="truncate">{option.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {option.count !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-normal">
                        {option.count}
                      </span>
                    )}
                    {option.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium">
                        {option.badge}
                      </span>
                    )}
                    {active && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
