import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useSalonDateTime } from "@/hooks/useSalonDateTime";
import type { Appointment } from "../../types";
import { AppointmentStatus } from "../../enum";

import "../calendar-styles.css";
import {
  appointmentToCalendarEvent,
  getAppointmentDisplayStatus,
  type CalendarEvent,
} from "../utils";

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
  const { t } = useTranslation();
  const { timezone } = useSalonDateTime();
  const events = useMemo(
    () => appointments.map((apt) => appointmentToCalendarEvent(apt)),
    [appointments],
  );

  const messages = useMemo(
    () => ({
      today: t("agenda.today"),
      previous: t("agenda.previous"),
      next: t("agenda.next"),
      month: t("agenda.month"),
      week: t("agenda.week"),
      day: t("agenda.day"),
      agenda: t("agenda.agenda"),
      date: t("agenda.date"),
      time: t("agenda.time"),
      event: t("agenda.event"),
      noEventsInRange: t("agenda.noEventsInRange"),
      showMore: (total: number) => t("agenda.showMore", { count: total }),
    }),
    [t],
  );

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const appointment = event.resource;
    const displayStatus = getAppointmentDisplayStatus(
      appointment,
      new Date(),
      timezone,
    );
    let backgroundColor = "#3174ad";

    switch (displayStatus) {
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
      case AppointmentStatus.OVERDUE:
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
  }, [timezone]);

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
        messages={messages}
        popup
      />
    </div>
  );
}
