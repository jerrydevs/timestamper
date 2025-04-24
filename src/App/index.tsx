import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import { GridItem, TimestampData } from '../types';
import '../index.css';
import GridSection from './components/GridSection';
import { CARD_WIDTH, CARD_HEIGHT } from './components/TimestampCard';

const NEW_TIMESTAMP_HIGHLIGHT_DURATION = 1000;

const App: React.FC = () => {
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [gridDimensions, setGridDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.startMonitoring();
    }

    if (window.electronAPI) {
      window.electronAPI.onTimestamp((timestamp: TimestampData) => {
        const freePosition = findFreePosition();
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
      });
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.stopMonitoring();
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (gridDimensions.width !== 0) {
        setGridDimensions({ width: gridDimensions.width, height: gridDimensions.height });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [gridDimensions.width, gridDimensions.height]);

  const clearGridTimestamps = () => {
    setGridItems([]);
  };

  const handleGridResize = (dimensions: { width: number; height: number }) => {
    setGridDimensions(dimensions);
  };

  const handleGridItemPositionChange = (id: string, position: { x: number; y: number }) => {
    setGridItems(prev => prev.map(item => (item.id === id ? { ...item, position } : item)));
  };

  const handleRemoveFromGrid = (id: string) => {
    setGridItems(prev => prev.filter(item => item.id !== id));
  };

  const findFreePosition = () => {
    // Define grid positions with spacing
    const spacing = 20;
    const { width } = gridDimensions;

    if (!width) {
      return { x: 20, y: 20 }; // Default if grid not measured yet
    }

    // Calculate columns based on grid width
    const maxCol = Math.max(1, Math.floor((width - CARD_WIDTH) / (CARD_WIDTH + spacing)));

    // Try to find an empty space in a grid-like pattern
    for (let row = 0; row < 100; row++) {
      // Limit rows to prevent infinite loop
      for (let col = 0; col < maxCol; col++) {
        const x = col * (CARD_WIDTH + spacing) + spacing;
        const y = row * (CARD_HEIGHT + spacing) + spacing;

        // Check if this position overlaps with any existing card
        const isOverlapping = gridItems.some(item => {
          return Math.abs(item.position.x - x) < CARD_WIDTH && Math.abs(item.position.y - y) < CARD_HEIGHT;
        });

        if (!isOverlapping) {
          return { x, y };
        }
      }
    }

    // Fallback - place slightly offset from last card
    const lastItem = gridItems[gridItems.length - 1];
    if (lastItem) {
      return {
        x: (lastItem.position.x + 30) % (width - CARD_WIDTH),
        y: lastItem.position.y + 30,
      };
    }

    // Default position for first card
    return { x: 20, y: 20 };
  };

  return (
    <div className="app-container">
      <div className="app-layout">
        <div className="right-panel">
          <GridSection
            gridItems={gridItems}
            onDeleteGridItem={handleRemoveFromGrid}
            onGridItemPositionChange={handleGridItemPositionChange}
            handleClear={clearGridTimestamps}
            onGridResize={handleGridResize}
          />
        </div>
      </div>
    </div>
  );
};
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />);

export default App;
