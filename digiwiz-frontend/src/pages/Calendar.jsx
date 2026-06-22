import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; 
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const initialEvents = [
  { id: 1, day: 6, month: 5, year: 2026, platform: 'IG', type: 'IG Reel:', title: 'Workspace Tour', category: 'Video', status: 'Scheduled', time: '10:00 AM', colorClass: 'event--orange' },
  { id: 2, day: 7, month: 5, year: 2026, platform: 'LI', type: 'LI Article:', title: 'Productivity Hacks', category: 'Video', status: 'Scheduled', time: '10:00 AM', colorClass: 'event--blue' },
  { id: 3, day: 10, month: 5, year: 2026, platform: 'IG', type: 'IG Reel:', title: 'Workspace Tour', category: 'Video', status: 'Scheduled', time: '10:00 AM', colorClass: 'event--pink' },
  { id: 4, day: 11, month: 5, year: 2026, platform: 'LI', type: 'LI Article:', title: 'Productivity Hacks', category: 'Blog', status: 'Writing', time: '2:00 PM', colorClass: 'event--blue' },
  { id: 5, day: 12, month: 5, year: 2026, platform: 'FB', type: 'FB Post:', title: 'Event Recap', category: 'Image', status: 'Draft', time: '11:30 AM', colorClass: 'event--indigo', captions: "Graphics workspace tour..", tags: ["Captions", "Tags"] },
  { id: 6, day: 13, month: 5, year: 2026, platform: 'FB', type: 'FB Post:', title: 'Event Recap', category: 'Image', status: 'Published', time: '11:30 AM', colorClass: 'event--emerald' },
  { id: 7, day: 14, month: 5, year: 2026, platform: 'IG', type: 'IG Reel:', title: 'Workspace Tour', category: 'Video', status: 'Review', time: '10:00 AM', colorClass: 'event--yellow' }
];

const Calendar = () => {
  const today = new Date();
  const [current, setCurrent] = useState({ month: today.getMonth(), year: today.getFullYear() });
  const [selectedEvent, setSelectedEvent] = useState(initialEvents[4]);

  let firstDay = new Date(current.year, current.month, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1; 
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const prev = () => {
    setCurrent((c) => {
      const m = c.month === 0 ? 11 : c.month - 1;
      const y = c.month === 0 ? c.year - 1 : c.year;
      return { month: m, year: y };
    });
  };

  const next = () => {
    setCurrent((c) => {
      const m = c.month === 11 ? 0 : c.month + 1;
      const y = c.month === 11 ? c.year + 1 : c.year;
      return { month: m, year: y };
    });
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="calendar-view-container">
      
      {/* Calendar View Body Grid Core */}
      <div className="calendar-main-body">
        <div className="calendar-nav">
          <div className="nav-wrapper">
            <h2 className="calendar-month">{MONTHS[current.month]} {current.year}</h2>
            <div className="nav-buttons">
              <button onClick={prev} className="icon-btn"><ChevronLeft size={16} /></button>
              <button onClick={next} className="icon-btn"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        <div className="calendar-grid">
          {DAYS.map((d) => (
            <div key={d} className="calendar-day-header">{d.toUpperCase()}</div>
          ))}
          
          {cells.map((d, i) => {
            const isToday = d === today.getDate() && current.month === today.getMonth() && current.year === today.getFullYear();
            const dayEvents = initialEvents.filter(e => e.day === d && e.month === current.month && e.year === current.year);

            return (
              <div
                key={i}
                className={`calendar-cell ${isToday ? "calendar-cell--today" : ""} ${!d ? "calendar-cell--empty" : ""}`}
              >
                {d && (
                  <div className="cell-header">
                    <span className="cell-number">{d}</span>
                    {isToday && <span className="today-badge">Today</span>}
                  </div>
                )}

                <div className="cell-events-list">
                  {d && dayEvents.map(event => (
                    <div 
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`event-mini-card ${event.colorClass} ${selectedEvent?.id === event.id ? 'event-mini-card--selected' : ''}`}
                    >
                      <div className="event-title-line">
                        <span className="event-type-prefix">{event.type}</span>{event.title}
                      </div>
                      <div className="event-badges-row">
                        <span className="badge-item">{event.category}</span>
                        <span className="badge-item font-semibold">{event.status}</span>
                      </div>
                      <div className="event-time-stamp">{event.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Side Drawer panel component view */}
      {selectedEvent && (
        <div className="calendar-side-drawer">
          <div className="drawer-top">
            <h3 className="drawer-title">{MONTHS[selectedEvent.month]} {selectedEvent.day} Details</h3>
            <button onClick={() => setSelectedEvent(null)} className="close-btn"><X size={16} /></button>
          </div>

          <div className="drawer-body">
            <div className={`drawer-preview-card ${selectedEvent.colorClass}`}>
              <div className="preview-title">{selectedEvent.type} {selectedEvent.title}</div>
              <div className="preview-meta">
                <span className="badge-item">{selectedEvent.category}</span>
                <span className="badge-item font-bold">{selectedEvent.status}</span>
              </div>
              <div className="preview-time">{selectedEvent.time}</div>
            </div>

            <div className="drawer-field">
              <label className="field-label">Platform</label>
              <div className="platform-row">
                {['f', '📷', 'in', '🎵'].map((p, idx) => (
                  <span key={idx} className={`platform-icon ${idx === 0 ? 'platform-icon--active' : ''}`}>{p}</span>
                ))}
              </div>
            </div>

            <div className="drawer-field">
              <label className="field-label">Captions</label>
              <textarea className="field-textarea" rows="2" defaultValue={selectedEvent.captions || "Graphics workspace tour.."} />
            </div>

            <div className="drawer-field">
              <label className="field-label">Tags</label>
              <div className="tags-row">
                {(selectedEvent.tags || ["Captions", "Tags"]).map(tag => (
                  <span key={tag} className="tag-element">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="drawer-footer-comments">
            <div className="comments-header">
              <label className="field-label">Team Comments</label>
              <button className="view-all-btn">View all</button>
            </div>
            <div className="comment-bubble">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" alt="Avatar" className="comment-avatar" />
              <div>
                <div className="comment-author">Aisha</div>
                <div className="comment-text">Graphic looks good!</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;