import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DragDropContext } from 'react-beautiful-dnd';

import { GridItem, TimestampData } from '../types';
import '../index.css';
import IntakeSection from './components/IntakeSection';
import GridSection, { GRID_GAP } from './components/GridSection';
import { CARD_WIDTH, CARD_HEIGHT } from './components/TimestampCard';

const MAX_INTAKE_TIMESTAMPS = 20;
const NEW_TIMESTAMP_HIGHLIGHT_DURATION = 1000;

const App: React.FC = () => {
  // timestamps just found from clipboard (left panel)
  const [intakeTimestamps, setIntakeTimestamps] = useState<TimestampData[]>([]);
  // timestamps that are stored in the grid (right panel)
  const [gridItems, setGridItems] = useState<GridItem[]>([]);

  const [gridDimensions, setGridDimensions] = useState({ rows: 3, cols: 2 });

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.startMonitoring();
    }

    if (window.electronAPI) {
      window.electronAPI.onTimestamp((timestamp: TimestampData) => {
        const newTimestamp = {
          ...timestamp,
          isNew: true,
        };
        setIntakeTimestamps(prev => [newTimestamp, ...prev].slice(0, MAX_INTAKE_TIMESTAMPS));

        setTimeout(() => {
          setIntakeTimestamps(prev => prev.map(ts => ({ ...ts, isNew: false })));
        }, NEW_TIMESTAMP_HIGHLIGHT_DURATION);
      });
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.stopMonitoring();
      }
    };
  }, []);

  const clearIntakeTimestamps = () => {
    setIntakeTimestamps([]);
  };
  const clearGridTimestamps = () => {
    setGridItems([]);
  };

  const handleGridResize = (dimensions: { rows: number; cols: number }) => {
    setGridDimensions(dimensions);
  };

  const handleGridItemPositionChange = (id: string, position: { row: number; col: number }) => {
    setGridItems(prev => prev.map(item => (item.id === id ? { ...item, position } : item)));
  };

  const findEmptyCell = (mouseX: number, mouseY: number) => {
    const gridRect = document.querySelector('.grid-section')?.getBoundingClientRect();
    if (!gridRect) return { row: 0, col: 0 };

    const relativeX = mouseX - gridRect.left;
    const relativeY = mouseY - gridRect.top;

    const cellWidth = CARD_WIDTH + GRID_GAP;
    const cellHeight = CARD_HEIGHT + GRID_GAP;

    let col = Math.floor(relativeX / cellWidth);
    let row = Math.floor(relativeY / cellHeight);

    col = Math.min(Math.max(0, col), gridDimensions.cols - 1);
    row = Math.min(Math.max(0, row), gridDimensions.rows - 1);

    const isOccupied = gridItems.some(item => item.position.row === row && item.position.col === col);

    if (!isOccupied) {
      return { row, col };
    }

    for (let row = 0; row < gridDimensions.rows; row++) {
      for (let col = 0; col < gridDimensions.cols; col++) {
        const isOccupied = gridItems.some(item => item.position.row === row && item.position.col === col);
        if (!isOccupied) {
          return { row, col };
        }
      }
    }

    return { row: 0, col: 0 };
  };
  const handleRemoveFromIntake = (id: string) => {
    setIntakeTimestamps(prev => prev.filter(timestamp => timestamp.id !== id));
  };

  const handleRemoveFromGrid = (id: string) => {
    setGridItems((prev: GridItem[]) => {
      const filtered = prev.filter((item: GridItem) => item.id !== id);
      return filtered.map((item: GridItem, index: number) => ({
        ...item,
        gridArea: `area-${index}`,
      }));
    });
  };

  const handleDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }

    // moving within grid
    if (source.droppableId === 'grid' && destination.droppableId === 'grid') {
      // const reorderedGridItems = Array.from(gridItems);
      // const [movedItem] = reorderedGridItems.splice(source.index, 1);
      // reorderedGridItems.splice(destination.index, 0, movedItem);
      // const updatedGridItems = reorderedGridItems.map((item, index) => ({
      //   ...item,
      //   gridArea: `area-${index}`,
      // }));
      // setGridItems(updatedGridItems);
      // return;
    }

    // moving from intake to grid
    if (source.droppableId === 'intake' && destination.droppableId === 'grid') {
      const timestampData = intakeTimestamps[source.index];
      const dropPosition = findEmptyCell(result.clientX, result.clientY);

      const { isNew, ...cleanTimestampData } = timestampData;
      const newGridItem: GridItem = {
        id: timestampData.id,
        timestampData: cleanTimestampData,
        gridArea: `area-${gridItems.length}`,
        position: dropPosition,
      };
      setGridItems(prev => [...prev, newGridItem]);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="app-container">
        <div className="app-layout">
          <div className="left-panel">
            <IntakeSection
              timestamps={intakeTimestamps}
              onDeleteTimestamp={handleRemoveFromIntake}
              handleClear={clearIntakeTimestamps}
            />
          </div>
          <div className="right-panel">
            <GridSection
              gridItems={gridItems}
              onDeleteGridItem={handleRemoveFromGrid}
              handleClear={clearGridTimestamps}
              onGridResize={handleGridResize}
              onDragEnd={handleGridItemPositionChange}
            />
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />);

export default App;
