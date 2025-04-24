import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import TimestampCard, { CARD_HEIGHT, CARD_WIDTH } from './TimestampCard';
import { GridItem } from '../../types';

interface GridSectionProps {
  gridItems: GridItem[];
  onDeleteGridItem: (id: string) => void;
  onGridItemPositionChange: (id: string, position: { x: number; y: number }) => void;
  handleClear: () => void;
  onGridResize: (dimensions: { width: number; height: number }) => void;
}

const GridSection: React.FC<GridSectionProps> = ({
  gridItems,
  onDeleteGridItem,
  onGridItemPositionChange,
  handleClear,
  onGridResize,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridDimensions, setGridDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const updateGridDimensions = () => {
    if (!gridRef.current) return;

    const containerWidth = gridRef.current.clientWidth;
    const containerHeight = gridRef.current.clientHeight;

    setGridDimensions({ width: containerWidth, height: containerHeight });
    if (onGridResize) {
      onGridResize({ width: containerWidth, height: containerHeight });
    }
  };

  useEffect(() => {
    updateGridDimensions();

    const handleResize = () => {
      updateGridDimensions();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragStop = (id: string, data: { x: number; y: number }) => {
    setIsDragging(false);

    const x = Math.max(0, Math.min(data.x, gridDimensions.width - CARD_WIDTH));
    const y = Math.max(0, Math.min(data.y, gridDimensions.height - CARD_HEIGHT));

    onGridItemPositionChange(id, { x, y });
  };

  return (
    <>
      <div className="section-header">
        <h2>Timestamps</h2>
        <button className="control-button" onClick={handleClear}>
          Clear
        </button>
      </div>
      <div
        className="free-position-grid"
        ref={gridRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: '400px',
          transition: 'background-color 0.2s ease',
        }}
      >
        {gridItems.map(item => {
          return (
            <Draggable
              key={item.id}
              handle=".drag-handle"
              position={item.position}
              bounds="parent"
              onStart={handleDragStart}
              onStop={(_, data) => handleDragStop(item.id, data)}
            >
              <div
                className={`free-grid-item ${isDragging ? 'dragging' : ''}`}
                style={{
                  position: 'absolute',
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  userSelect: 'none',
                  zIndex: isDragging ? 1000 : 'auto',
                }}
              >
                <div className={`timestamp-card-wrapper ${item.isNew ? 'new-timestamp' : ''}`}>
                  <TimestampCard
                    timestamp={item.timestampData.timestamp}
                    id={item.id}
                    onDelete={onDeleteGridItem}
                    draggable={true}
                  />
                </div>
              </div>
            </Draggable>
          );
        })}
      </div>
    </>
  );
};

export default GridSection;
