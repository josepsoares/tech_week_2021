import React, { useRef, useCallback } from 'react';
import { useGesture } from 'react-use-gesture';
import { useSprings, a } from '@react-spring/web';

const styles = {
  container: { position: 'relative' as any, height: '100%', width: '100%' },
  item: {
    position: 'absolute' as any,
    height: '100%',
    willChange: 'transform' as any,
  },
};

/**
 * Calculates a spring-physics driven infinite slider
 *
 * @param {Array} items - display items
 * @param {Function} children - render child
 * @param {number} width - fixed item with
 * @param {number} visible - number of items that muste be visible on screen
 */

const InfiniteSlider: React.FC<{
  items: {
    css: string;
    height: number;
  }[];
  width: number;
  visible: number;
  renderChildren: Function;
}> = ({ items, width = 600, visible = 4, renderChildren }) => {
  const idx = useCallback(
    (x, l = items.length) => (x < 0 ? x + l : x) % l,
    [items],
  );
  const getPos = useCallback(
    (i, firstVis, firstVisIdx) => idx(i - firstVis + firstVisIdx),
    [idx],
  );
  const [springs, api] = useSprings(items.length, (i) => ({
    x: (i < items.length - 1 ? i : -1) * width,
  }));
  const prev = useRef([0, 1]);

  const runSprings = useCallback(
    (y, vy) => {
      const firstVis = idx(Math.floor(y / width) % items.length);
      const firstVisIdx = vy < 0 ? items.length - visible - 1 : 1;
      api.start((i) => {
        const position = getPos(i, firstVis, firstVisIdx);
        const prevPosition = getPos(i, prev.current[0], prev.current[1]);
        const rank =
          firstVis - (y < 0 ? items.length : 0) + position - firstVisIdx;
        const configPos = vy > 0 ? position : items.length - position;
        return {
          x: (-y % (width * items.length)) + width * rank,
          immediate: vy < 0 ? prevPosition > position : prevPosition < position,
          config: {
            tension: (1 + items.length - configPos) * 100,
            friction: 30 + configPos * 40,
          },
        };
      });
      prev.current = [firstVis, firstVisIdx];
    },
    [idx, getPos, width, visible, api, items.length],
  );

  const wheelOffset = useRef(0);
  const dragOffset = useRef(0);
  const bind = useGesture({
    onDrag: ({ offset: [x], vxvy: [vx] }) =>
      vx &&
      ((dragOffset.current = -x), runSprings(wheelOffset.current + -x, -vx)),
    onWheel: ({ offset: [, y], vxvy: [, vy] }) =>
      vy && ((wheelOffset.current = y), runSprings(dragOffset.current + y, vy)),
  });

  return (
    <div {...bind()} style={{ ...styles.container, cursor: 'grab' }}>
      {springs.map(({ x }, i) => (
        <a.div
          key={i}
          style={{ ...styles.item, width, x }}
          children={renderChildren(items[i], i)}
        />
      ))}
    </div>
  );
};

export default InfiniteSlider;
