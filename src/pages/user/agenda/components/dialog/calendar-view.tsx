import { useMemo, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { Appointment } from "@/types/entities";
import { AppointmentStatus } from "@/types/entities";

import "../calendar-styles.css";
import { appointmentToCalendarEvent, type CalendarEvent } from "../../utils";

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  appointments: Appointment[];
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export function CalendarView({
  appointments,
  onSelectSlot,
  onSelectEvent,
}: CalendarViewProps) {
  const events = useMemo(
    () => appointments.map((apt) => appointmentToCalendarEvent(apt)),
    [appointments],
  );

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const appointment = event.resource;
    let backgroundColor = "#3174ad";

    switch (appointment.status) {
      case AppointmentStatus.CONFIRMED:
        backgroundColor = "#22c55e";
        break;
      case AppointmentStatus.PENDING:
        backgroundColor = "#f59e0b";
        break;
      case AppointmentStatus.IN_PROGRESS:
        backgroundColor = "#3b82f6";
        break;
      case AppointmentStatus.COMPLETED:
        backgroundColor = "#6b7280";
        break;
      case AppointmentStatus.CANCELLED:
        backgroundColor = "#ef4444";
        break;
      case AppointmentStatus.NO_SHOW:
        backgroundColor = "#dc2626";
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
        padding: "4px 8px",
        fontSize: "13px",
        fontWeight: "500",
      },
    };
  }, []);

  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "calc(100vh - 250px)", minHeight: "500px" }}
        defaultView="week"
        views={["month", "week", "day", "agenda"]}
        step={30}
        timeslots={1}
        min={new Date(2024, 0, 1, 9, 0, 0)}
        max={new Date(2024, 0, 1, 19, 0, 0)}
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        selectable
        eventPropGetter={eventStyleGetter}
        popup
      />
    </div>
  );
}
