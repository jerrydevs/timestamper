import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import TimestampCard from './TimestampCard';
import { TimestampData } from '../../types';

interface IntakeSectionProps {
  timestamps: TimestampData[];
  onDeleteTimestamp: (id: string) => void;
  handleClear: () => void;
}

const IntakeSection: React.FC<IntakeSectionProps> = ({ timestamps, onDeleteTimestamp, handleClear }) => {
  return (
    <>
      <div className="section-header">
        <h2>Intake</h2>
        <button className="control-button" onClick={handleClear}>
          Clear
        </button>
      </div>
      <Droppable droppableId="intake" type="timestamp">
        {provided => (
          <div className="timestamp-intake" ref={provided.innerRef} {...provided.droppableProps}>
            {timestamps.length === 0 ? (
              <div>Waiting for timestamps...</div>
            ) : (
              timestamps.map((timestamp, index) => (
                <Draggable key={timestamp.id} draggableId={timestamp.id} index={index}>
                  {provided => (
                    <div className={`timestamp-card-wrapper ${timestamp.isNew ? 'new-timestamp' : ''}`}>
                      <TimestampCard
                        timestamp={timestamp.timestamp}
                        id={timestamp.id}
                        onDelete={onDeleteTimestamp}
                        forwardRef={provided.innerRef}
                        draggableProps={provided.draggableProps}
                        dragHandleProps={provided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </>
  );
};

export default IntakeSection;
