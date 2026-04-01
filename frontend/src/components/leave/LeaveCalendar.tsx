import React, { useState } from 'react';
import { useLeave } from '../../hooks/useLeave';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const LeaveCalendar: React.FC = () => {
  const { leaves } = useLeave();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const events = leaves?.map(leave => ({
    title: `${leave.leaveTypeName} - ${leave.totalDays} days`,
    start: leave.startDate,
    end: leave.endDate,
    color: leave.status === 'approved' ? '#10B981' : 
           leave.status === 'pending' ? '#F59E0B' : '#EF4444',
    extendedProps: {
      status: leave.status,
      reason: leave.reason,
      type: leave.leaveTypeName,
    }
  })) || [];

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Leave Calendar</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            eventClick={handleEventClick}
            height="auto"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
            }}
          />
        </div>
        
        <div>
          {selectedEvent && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Leave Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Type:</span> {selectedEvent.extendedProps.type}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    selectedEvent.extendedProps.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedEvent.extendedProps.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedEvent.extendedProps.status}
                  </span>
                </p>
                <p><span className="font-medium">Start:</span> {selectedEvent.start?.toLocaleDateString()}</p>
                <p><span className="font-medium">End:</span> {selectedEvent.end?.toLocaleDateString()}</p>
                <p><span className="font-medium">Reason:</span> {selectedEvent.extendedProps.reason}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveCalendar;