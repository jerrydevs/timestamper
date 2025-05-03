import React, { useEffect, useState, useRef } from 'react';
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
    const freePosition = findFreePosition(dimensionsRef.current.width);
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
    setGridItems([]);
  };

  const handleGridItemPositionChange = (id: string, position: { x: number; y: number }) => {
    setGridItems(prev => prev.map(item => (item.id === id ? { ...item, position } : item)));
  };

  const handleRemoveFromGrid = (id: string) => {
    setGridItems(prev => prev.filter(item => item.id !== id));
  };

  const findFreePosition = (width: number) => {
    const spacing = 20;
    const currentGridItems = gridItemsRef.current;

    if (!width) {
      return { x: 20, y: 20 }; // Default if grid not measured yet
    }

    // Calculate columns based on grid width
    const maxCol = Math.max(1, Math.floor(width / (CARD_WIDTH + spacing)));
    for (let row = 0; row < 100; row++) {
      for (let col = 0; col < maxCol; col++) {
        const x = col * (CARD_WIDTH + spacing) + spacing;
        const y = row * (CARD_HEIGHT + spacing) + spacing;

        const notOverlapping = currentGridItems.every(item => {
          const isAbove = item.position.y + CARD_HEIGHT < y;
          const isBelow = item.position.y > y + CARD_HEIGHT;
          const isLeft = item.position.x + CARD_WIDTH < x;
          const isRight = item.position.x > x + CARD_WIDTH;
          return isAbove || isBelow || isLeft || isRight;
        });

        if (notOverlapping) {
          return { x, y };
        }
      }
    }

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
