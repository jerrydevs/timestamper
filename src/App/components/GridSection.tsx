import React, { useState, useEffect, useRef, JSX } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import TimestampCard, { CARD_HEIGHT, CARD_WIDTH } from './TimestampCard';
import { TimestampData } from '../../types';

interface GridItem {
  id: string;
  timestampData: TimestampData;
  gridArea: string;
  position?: { row: number; col: number };
}

interface GridSectionProps {
  gridItems: GridItem[];
  onDeleteGridItem: (id: string) => void;
  onDragEnd: (id: string, position: { row: number; col: number }) => void;
  onGridResize: (dimensions: { rows: number; cols: number }) => void;
  handleClear: () => void;
}

export const GRID_GAP = 15;

const GridSection: React.FC<GridSectionProps> = ({
  gridItems,
  onDeleteGridItem,
  handleClear,
  onGridResize,
  onDragEnd,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridDimensions, setGridDimensions] = useState({ rows: 1, cols: 1 });
  const [gridCells, setGridCells] = useState<JSX.Element[]>([]);

  const calculateGridDimensions = () => {
    if (!gridRef.current) return;

    const containerWidth = gridRef.current.clientWidth;
    const containerHeight = gridRef.current.clientHeight;

    const cols = Math.max(1, Math.floor((containerWidth - GRID_GAP) / (CARD_WIDTH + GRID_GAP)));
    const rows = Math.max(1, Math.floor((containerHeight - GRID_GAP) / (CARD_HEIGHT + GRID_GAP)));

    setGridDimensions({ rows, cols });
  };

  const generateGridCells = () => {
    const { rows, cols } = gridDimensions;
    const cells: JSX.Element[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellIdx = row * cols + col;
        cells.push(
          <div
            key={`cell-${cellIdx}`}
            className="grid-cell"
            style={{ gridRow: row + 1, gridColumn: col + 1, width: CARD_WIDTH, height: CARD_HEIGHT }}
          />
        );
      }
    }

    setGridCells(cells);
  };

  const getGridPosition = (index: number) => {
    const { cols } = gridDimensions;
    const row = Math.floor(index / cols);
    const col = index % cols;
    return { row, col };
  };

  const getGridPositionFromPoint = (x: number, y: number) => {
    if (!gridRef.current) return { row: 0, col: 0 };

    const rect = gridRef.current.getBoundingClientRect();
    const relativeX = x - rect.left;
    const relativeY = y - rect.top;

    const cellWidth = CARD_WIDTH + GRID_GAP;
    const cellHeight = CARD_HEIGHT + GRID_GAP;

    const col = Math.min(Math.floor(relativeX / cellWidth), gridDimensions.cols - 1);

    const row = Math.min(Math.floor(relativeY / cellHeight), gridDimensions.rows - 1);

    return { row: Math.max(0, row), col: Math.max(0, col) };
  };

  useEffect(() => {
    calculateGridDimensions();

    const handleResize = () => {
      calculateGridDimensions();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    generateGridCells();
  }, [gridDimensions]);

  const handleDragEndInGrid = (id: string, clientX: number, clientY: number) => {
    const position = getGridPositionFromPoint(clientX, clientY);

    const isOccupied = gridItems.some(
      item => item.id !== id && item.position.row === position.row && item.position.col === position.col
    );

    if (isOccupied) {
      const { rows, cols } = gridDimensions;
      let foundPosition = null;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const testPosition = { row, col };
          const occupied = gridItems.some(
            item => item.id !== id && item.position.row === testPosition.row && item.position.col === testPosition.col
          );

          if (!occupied) {
            foundPosition = testPosition;
            break;
          }
        }
        if (foundPosition) break;
      }

      onDragEnd(id, foundPosition || { row: 0, col: 0 });
    } else {
      onDragEnd(id, position);
    }
  };

  console.log({ gridDimensions });
  return (
    <>
      <div className="section-header">
        <h2>Memo</h2>
        <button className="control-button" onClick={handleClear}>
          Clear
        </button>
      </div>
      <Droppable droppableId="grid" type="timestamp" mode="virtual">
        {provided => (
          <div
            className="timestamp-grid"
            ref={el => {
              provided.innerRef(el);
              gridRef.current = el;
            }}
            {...provided.droppableProps}
            style={{
              gridTemplateColumns: `repeat(${gridDimensions.cols}, ${CARD_WIDTH}px)`,
              gridTemplateRows: `repeat(${gridDimensions.rows}, ${CARD_HEIGHT}px)`,
              gap: `${GRID_GAP}px`,
            }}
          >
            {gridCells}

            {gridItems.map((item, index) => {
              return (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      className={`grid-item ${snapshot.isDragging ? 'dragging' : ''}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        gridRow: item.position.row + 1,
                        gridColumn: item.position.col + 1,
                        position: 'absolute',
                        top: `${item.position.row * (CARD_HEIGHT + GRID_GAP)}px`,
                        left: `${item.position.col * (CARD_WIDTH + GRID_GAP)}px`,
                        display: snapshot.isDragging ? 'none' : 'block',
                        width: CARD_WIDTH,
                        height: CARD_HEIGHT,
                      }}
                      onDragEnd={e => {
                        if (snapshot.isDragging) {
                          handleDragEndInGrid(item.id, e.clientX, e.clientY);
                        }
                      }}
                    >
                      <TimestampCard
                        timestamp={item.timestampData.timestamp}
                        id={item.id}
                        onDelete={onDeleteGridItem}
                      />
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </>
  );
};

export default GridSection;
