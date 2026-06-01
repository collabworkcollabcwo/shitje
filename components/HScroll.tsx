import React, { useEffect, useRef } from 'react';
import { Platform, ScrollView, ScrollViewProps } from 'react-native';

/**
 * A horizontal ScrollView that also responds to a desktop mouse wheel on web.
 *
 * React Native Web renders a horizontal ScrollView as an `overflow-x` div, but
 * a normal (vertical) mouse wheel does NOT scroll it — so on a computer the
 * categories / carousels feel "stuck". This translates vertical wheel movement
 * into horizontal scrolling. Touch dragging on phones works natively and is
 * left completely untouched.
 */
export default function HScroll({
  children,
  ...props
}: ScrollViewProps & { children?: React.ReactNode }) {
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const sv = ref.current as any;
    const node: HTMLElement | null =
      sv && typeof sv.getScrollableNode === 'function' ? sv.getScrollableNode() : null;
    if (!node) return;

    const onWheel = (e: WheelEvent) => {
      // Nothing overflowing -> let the page scroll normally.
      if (node.scrollWidth <= node.clientWidth) return;
      // A real horizontal gesture (trackpad) already works -> don't fight it.
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      e.preventDefault();
      node.scrollLeft += e.deltaY;
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <ScrollView ref={ref} horizontal showsHorizontalScrollIndicator={false} {...props}>
      {children}
    </ScrollView>
  );
}
