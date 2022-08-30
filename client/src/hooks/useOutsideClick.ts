import React, { useEffect } from 'react';
import { intersection } from '../helpers/lodash';

function isNodeOutsideOfElement(
  event: MouseEvent,
  element: React.ReactNode,
  targetClasses: string[],
  parentClass: string,
): boolean {
  return !(
    (element as unknown as HTMLElement).contains(event.target as Node) ||
    element === event.target ||
    isClassNameInside(event.target as HTMLElement, targetClasses) ||
    isNodeInPath(event, parentClass)
  );
}

function isClassNameInside(eventTarget: HTMLElement | null, classNames: string[]): boolean {
  if (!eventTarget || !eventTarget.classList) {
    return false;
  }
  const classes = eventTarget.classList.toString().split(' ');
  return intersection(classes, classNames).length > 0;
}

function isNodeInPath(event: any, parentClass: string): boolean {
  if (parentClass.length === 0) {
    return false;
  }

  const path = event.composedPath ? event.composedPath() : event.path;
  return path
    ? path.some((item: HTMLElement) => item.classList && item.classList.contains(parentClass))
    : false;
}

function useOutsideClick(
  callback: () => void,
  targetElements: React.ReactNode[],
  targetClasses: string[] = [],
  parentClass = '',
  phase = false,
): void {
  const handleClick = (event: MouseEvent): void => {
    const isOutsideTarget = targetElements.every(
      (element) => element && isNodeOutsideOfElement(event, element, targetClasses, parentClass),
    );

    if (isOutsideTarget) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClick, phase);

    return () => {
      document.removeEventListener('click', handleClick, phase);
    };
  });
}

export default useOutsideClick;
