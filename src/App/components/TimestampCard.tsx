import React from 'react';
import { Trash2 } from 'react-feather';
import moment from 'moment-timezone';

interface TimestampCardProps {
  timestamp: string;
  id: string;
  onDelete: (id: string) => void;
  dragHandleProps?: any;
  draggableProps?: any;
  forwardRef?: React.Ref<HTMLDivElement>;
}

export const CARD_WIDTH = 395;
export const CARD_HEIGHT = 125;

const TimestampCard: React.FC<TimestampCardProps> = ({
  timestamp,
  id,
  onDelete,
  dragHandleProps,
  draggableProps,
  forwardRef,
}) => {
  const userTimezone = moment.tz.guess();

  const formatTimestamp = (timestamp: string) => {
    const timestampNumber = parseInt(timestamp, 10);
    const isInMilliseconds = timestampNumber > 10000000000; // 10 digits for seconds
    const timestampInSeconds = isInMilliseconds ? Math.floor(timestampNumber / 1000) : timestampNumber;

    const momentUtc = moment.unix(timestampInSeconds).utc();
    const momentLocal = moment.unix(timestampInSeconds).tz(userTimezone);

    const gmtFormatted = momentUtc.format('dddd, MMM D, YYYY h:mm:ss A');

    const tzName = momentLocal.format('z');
    const isDST = momentLocal.isDST() ? ' DST' : '';
    const localFormatted = `${momentLocal.format('dddd, MMM D, YYYY h:mm:ss A')} ${tzName}${isDST}`;

    const relativeTime = moment.unix(timestampInSeconds).fromNow();

    return {
      utc: `GMT: ${gmtFormatted}`,
      local: `Local: ${localFormatted}`,
      relative: `Relative: ${relativeTime}`,
    };
  };

  const formattedTime = formatTimestamp(timestamp);
  const isValid = parseInt(timestamp, 10);
  if (isNaN(isValid)) {
    return <div className="error-message">Invalid timestamp</div>;
  }

  return (
    <div className="timestamp-card" ref={forwardRef} {...dragHandleProps} {...draggableProps}>
      <div className="timestamp-card-header">
        <span className="timestamp-value">{timestamp}</span>
        <button className="delete-button" onClick={() => onDelete(id)} aria-label="Delete timestamp">
          <Trash2 size={16} />
        </button>
      </div>
      <div className="timestamp-card-body">
        <div className="timestamp-formatted">{formattedTime.utc}</div>
        <div className="timestamp-formatted">{formattedTime.local}</div>
      </div>
    </div>
  );
};

export default TimestampCard;
