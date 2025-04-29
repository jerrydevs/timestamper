import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

import { GridItem, TimestampData } from '../types';
import '../index.css';
import GridSection from './components/GridSection';
import { CARD_WIDTH, CARD_HEIGHT } from './components/TimestampCard';

const NEW_TIMESTAMP_HIGHLIGHT_DURATION = 1000;

const App: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridItems, setGridItems] = useState<GridItem[]>([]);

  const { width, height } = gridRef.current?.getBoundingClientRect() || { width: 0, height: 0 };
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const gridItemsRef = useRef<GridItem[]>(gridItems);

  useEffect(() => {
    dimensionsRef.current = { width, height };
  }, [width, height]);

  useEffect(() => {
    gridItemsRef.current = gridItems;
  }, [gridItems]);

  const handleNewTimestamp = (timestamp: TimestampData) => {
    const freePosition = findFreePosition(dimensionsRef.current.width, dimensionsRef.current.height);
    console.log({ freePosition });
    const newGridItem: GridItem = {
      id: timestamp.id,
      timestampData: timestamp,
      position: freePosition,
      isNew: true,
    };
    setGridItems(prev => [...prev, newGridItem]);
    setTimeout(() => {
      setGridItems(prev =>
        prev.map(item => {
          if (item.id === newGridItem.id) {
            return { ...item, isNew: false };
          }
          return item;
        })
      );
    }, NEW_TIMESTAMP_HIGHLIGHT_DURATION);
  };

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.startMonitoring();
      window.electronAPI.onTimestamp(handleNewTimestamp);
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.stopMonitoring();
      }
    };
  }, []);

  const clearGridTimestamps = () => {
    console.log('Clearing all grid timestamps');
    setGridItems([]);
  };

  const handleGridItemPositionChange = (id: string, position: { x: number; y: number }) => {
    setGridItems(prev => prev.map(item => (item.id === id ? { ...item, position } : item)));
  };

  const handleRemoveFromGrid = (id: string) => {
    setGridItems(prev => prev.filter(item => item.id !== id));
  };

  // const findFreePosition = (width: number, height: number) => {
  //   const spacing = 20;
  //   console.log('findFreePosition', { width, height });
  //   if (!width) {
  //     console.log('Grid not measured yet, returning default position');
  //     return { x: 20, y: 20 }; // Default if grid not measured yet
  //   }

  //   // Calculate columns based on grid width
  //   const maxCol = Math.max(1, Math.floor(width / (CARD_WIDTH + spacing)));
  //   console.log({ maxCol });
  //   for (let row = 0; row < 100; row++) {
  //     for (let col = 0; col < maxCol; col++) {
  //       const x = col * (CARD_WIDTH + spacing) + spacing;
  //       const y = row * (CARD_HEIGHT + spacing) + spacing;

  //       // const isOverlapping = gridItems.some(item => {
  //       //   return Math.abs(item.position.x - x) <= CARD_WIDTH && Math.abs(item.position.y - y) <= CARD_HEIGHT;
  //       // });
  //       const notOverlapping = gridItems.every(item => {
  //         console.log({item, x, y})
  //         const isAbove = item.position.y + CARD_HEIGHT < y;
  //         const isBelow = item.position.y > y + CARD_HEIGHT;
  //         const isLeft = item.position.x + CARD_WIDTH < x;
  //         const isRight = item.position.x > x + CARD_WIDTH;
  //         console.log({ isAbove, isBelow, isLeft, isRight });
  //         return (
  //           isAbove ||
  //           isBelow ||
  //           isLeft ||
  //           isRight
  //         );
  //       });
  //       console.log('Checking position:', { x, y, notOverlapping });

  //       if (notOverlapping) {
  //         console.log('Found free position:', { x, y });
  //         return { x, y };
  //       }
  //     }
  //   }

  //   console.log("Didn't find free position, returning last item position");

  //   const lastItem = gridItems[gridItems.length - 1];
  //   if (lastItem) {
  //     return {
  //       x: (lastItem.position.x + 20) % (width - CARD_WIDTH),
  //       y: lastItem.position.y + 20,
  //     };
  //   }

  //   return { x: 20, y: 20 };
  // };

  const findFreePosition = (width: number, height: number) => {
    const spacing = 20;
    const currentGridItems = gridItemsRef.current;
    console.log('findFreePosition', { width, height, currentGridItems });

    if (!width) {
      console.log('Grid not measured yet, returning default position');
      return { x: 20, y: 20 }; // Default if grid not measured yet
    }

    // Calculate columns based on grid width
    const maxCol = Math.max(1, Math.floor(width / (CARD_WIDTH + spacing)));
    console.log({ maxCol });
    for (let row = 0; row < 100; row++) {
      for (let col = 0; col < maxCol; col++) {
        const x = col * (CARD_WIDTH + spacing) + spacing;
        const y = row * (CARD_HEIGHT + spacing) + spacing;

        // const isOverlapping = gridItems.some(item => {
        //   return Math.abs(item.position.x - x) <= CARD_WIDTH && Math.abs(item.position.y - y) <= CARD_HEIGHT;
        // });
        const notOverlapping = currentGridItems.every(item => {
          console.log({ item, x, y });
          const isAbove = item.position.y + CARD_HEIGHT < y;
          const isBelow = item.position.y > y + CARD_HEIGHT;
          const isLeft = item.position.x + CARD_WIDTH < x;
          const isRight = item.position.x > x + CARD_WIDTH;
          console.log({ isAbove, isBelow, isLeft, isRight });
          return isAbove || isBelow || isLeft || isRight;
        });
        console.log('Checking position:', { x, y, notOverlapping });

        if (notOverlapping) {
          console.log('Found free position:', { x, y });
          return { x, y };
        }
      }
    }

    console.log("Didn't find free position, returning last item position");

    const lastItem = currentGridItems[currentGridItems.length - 1];
    if (lastItem) {
      return {
        x: (lastItem.position.x + 20) % (width - CARD_WIDTH),
        y: lastItem.position.y + 20,
      };
    }

    return { x: 20, y: 20 };
  };

  return (
    <div className="app-container">
      <GridSection
        gridItems={gridItems}
        gridRef={gridRef}
        onDeleteGridItem={handleRemoveFromGrid}
        onGridItemPositionChange={handleGridItemPositionChange}
        handleClear={clearGridTimestamps}
        gridDimensions={{ width, height }}
      />
    </div>
  );
};
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />);

export default App;
