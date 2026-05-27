'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  motion,
  AnimatePresence,
  type Transition,
  type VariantLabels,
  type Target,
  type TargetAndTransition,
} from 'framer-motion';

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

export interface RotatingTextProps {
  texts: string[];
  transition?: Transition;
  initial?: boolean | Target | VariantLabels;
  animate?: boolean | TargetAndTransition | VariantLabels;
  exit?: Target | VariantLabels;
  animatePresenceMode?: 'wait' | 'sync' | 'popLayout';
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: 'first' | 'last' | 'center' | 'random' | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
  className?: string;
  style?: React.CSSProperties;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      transition = { type: 'spring', damping: 25, stiffness: 300 },
      initial = { y: '100%', opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: '-120%', opacity: 0 },
      animatePresenceMode = 'popLayout',
      animatePresenceInitial = false,
      rotationInterval = 2000,
      staggerDuration = 0,
      staggerFrom = 'first',
      loop = true,
      auto = true,
      splitBy = 'characters',
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
      className,
      style,
    },
    ref
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
    const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);
    const probeRef = useRef<HTMLSpanElement>(null);

    const splitIntoCharacters = (text: string): string[] => {
      if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
        return Array.from(segmenter.segment(text), (seg) => seg.segment);
      }
      return Array.from(text);
    };

    const elements = useMemo(() => {
      const currentText = texts[currentTextIndex] ?? '';
      if (splitBy === 'characters') {
        const words = currentText.split(' ');
        return words.map((word: string, i: number) => ({
          characters: splitIntoCharacters(word),
          needsSpace: i !== words.length - 1,
        }));
      }
      if (splitBy === 'words') {
        return currentText.split(' ').map((word: string, i: number, arr: string[]) => ({
          characters: [word],
          needsSpace: i !== arr.length - 1,
        }));
      }
      if (splitBy === 'lines') {
        return currentText.split('\n').map((line: string, i: number, arr: string[]) => ({
          characters: [line],
          needsSpace: i !== arr.length - 1,
        }));
      }
      return currentText.split(splitBy).map((part: string, i: number, arr: string[]) => ({
        characters: [part],
        needsSpace: i !== arr.length - 1,
      }));
    }, [texts, currentTextIndex, splitBy]);

    useLayoutEffect(() => {
      if (probeRef.current) {
        setContainerWidth(Math.ceil(probeRef.current.getBoundingClientRect().width) + 4);
      }
    }, [currentTextIndex]);

    const getStaggerDelay = useCallback(
      (index: number, totalChars: number): number => {
        if (staggerFrom === 'first') return index * staggerDuration;
        if (staggerFrom === 'last') return (totalChars - 1 - index) * staggerDuration;
        if (staggerFrom === 'center') {
          const center = Math.floor(totalChars / 2);
          return Math.abs(center - index) * staggerDuration;
        }
        if (staggerFrom === 'random') {
          const randomIndex = Math.floor(Math.random() * totalChars);
          return Math.abs(randomIndex - index) * staggerDuration;
        }
        return Math.abs((staggerFrom as number) - index) * staggerDuration;
      },
      [staggerFrom, staggerDuration]
    );

    const handleIndexChange = useCallback(
      (newIndex: number) => {
        setCurrentTextIndex(newIndex);
        if (onNext) onNext(newIndex);
      },
      [onNext]
    );

    const next = useCallback(() => {
      const nextIndex =
        currentTextIndex === texts.length - 1
          ? loop ? 0 : currentTextIndex
          : currentTextIndex + 1;
      if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const previous = useCallback(() => {
      const prevIndex =
        currentTextIndex === 0
          ? loop ? texts.length - 1 : currentTextIndex
          : currentTextIndex - 1;
      if (prevIndex !== currentTextIndex) handleIndexChange(prevIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        if (validIndex !== currentTextIndex) handleIndexChange(validIndex);
      },
      [texts.length, currentTextIndex, handleIndexChange]
    );

    const reset = useCallback(() => {
      if (currentTextIndex !== 0) handleIndexChange(0);
    }, [currentTextIndex, handleIndexChange]);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [
      next, previous, jumpTo, reset,
    ]);

    useEffect(() => {
      if (!auto) return;
      const intervalId = setInterval(next, rotationInterval);
      return () => clearInterval(intervalId);
    }, [next, rotationInterval, auto]);

    const totalCharsInCurrent = elements.reduce(
      (sum: number, w: { characters: string[] }) => sum + w.characters.length,
      0
    );

    return (
      <span
        className={cn('relative inline-flex items-center justify-center', className)}
        style={style}
      >
        <span
          ref={probeRef}
          aria-hidden="true"
          className={cn(mainClassName)}
          style={{
            position: 'fixed',
            visibility: 'hidden',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            left: '-9999px',
          }}
        >
          {texts[currentTextIndex]}
        </span>

        <motion.span
          animate={{ width: containerWidth }}
          transition={transition}
          className={cn(
            'relative inline-flex overflow-hidden items-center justify-center whitespace-nowrap',
            mainClassName
          )}
        >
          <span className="sr-only">{texts[currentTextIndex]}</span>
          <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
            <motion.span
              key={currentTextIndex}
              className={cn(
                'flex flex-nowrap items-center justify-center',
                splitBy === 'lines' ? 'flex-col w-full' : ''
              )}
              aria-hidden="true"
            >
              {elements.map(
                (
                  wordObj: { characters: string[]; needsSpace: boolean },
                  wordIndex: number,
                  array: { characters: string[]; needsSpace: boolean }[]
                ) => {
                  const previousCharsCount = array
                    .slice(0, wordIndex)
                    .reduce(
                      (sum: number, w: { characters: string[] }) => sum + w.characters.length,
                      0
                    );
                  return (
                    <span
                      key={wordIndex}
                      className={cn('inline-flex flex-nowrap whitespace-nowrap', splitLevelClassName)}
                    >
                      {wordObj.characters.map((char: string, charIndex: number) => (
                        <motion.span
                          key={charIndex}
                          initial={initial}
                          animate={animate}
                          exit={exit}
                          transition={{
                            ...transition,
                            delay: getStaggerDelay(
                              previousCharsCount + charIndex,
                              totalCharsInCurrent
                            ),
                          }}
                          className={cn('inline-block', elementLevelClassName)}
                        >
                          {char}
                        </motion.span>
                      ))}
                      {wordObj.needsSpace && <span className="inline-block">&nbsp;</span>}
                    </span>
                  );
                }
              )}
            </motion.span>
          </AnimatePresence>
        </motion.span>
      </span>
    );
  }
);

RotatingText.displayName = 'RotatingText';
export default RotatingText;
