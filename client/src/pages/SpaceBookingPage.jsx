import React, { useState } from 'react';

const SPACES = [
  { id: 'quiet-pod-1', name: 'Quiet Study Pod A (1 Person)', capacity: 1 },
  { id: 'quiet-pod-2', name: 'Quiet Study Pod B (1 Person)', capacity: 1 },
  { id: 'collab-room-1', name: 'Group Discussion Room 1 (4-6 People)', capacity: 6 },
  { id: 'collab-room-2', name: 'Group Discussion Room 2 (6-8 People)', capacity: 8 },
  { id: 'media-lab', name: 'Digital Media & Audio Station (2 People)', capacity: 2 },
  { id: 'conference-hall', name: 'Library Seminar Room (Up to 20 People)', capacity: 20 },
];

export default function SpaceBookingPage() {
  const [space, setSpace] = useState(SPACES[0].id);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [submittedBooking, setSubmittedBooking] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!space || !date || !startTime || !endTime) {
      setError('Please fill in all required fields.');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time.');
      return;
    }

    const selectedSpaceObj = SPACES.find((s) => s.id === space);

    const bookingRecord = {
      id: `booking-${Date.now()}`,
      space: selectedSpaceObj ? selectedSpaceObj.name : space,
      spaceId: space,
      date,
      startTime,
      endTime,
      purpose: purpose.trim() || 'General Study',
      bookedAt: new Date().toISOString(),
    };

    // Store in localStorage for user's session
    try {
      const existing = JSON.parse(localStorage.getItem('spaceBookings') || '[]');
      localStorage.setItem('spaceBookings', JSON.stringify([bookingRecord, ...existing]));
    } catch (err) {
      console.warn('Could not persist booking to localStorage:', err);
    }

    setSubmittedBooking(bookingRecord);
  };

  const handleReset = () => {
    setSubmittedBooking(null);
    setDate('');
    setStartTime('');
    setEndTime('');
    setPurpose('');
    setError(null);
  };

  return (
    <div className="space-booking-page">
      <div className="booking-card">
        <header className="booking-header">
          <span className="booking-icon" aria-hidden="true">&#128197;</span>
          <h1 className="booking-title">Reserve a Study Space</h1>
          <p className="booking-subtitle">
            Book private study pods, group meeting rooms, or multimedia labs.
          </p>
        </header>

        {error && (
          <div className="auth-error-alert" role="alert">
            <span aria-hidden="true">&#9888;&#65039;</span> {error}
          </div>
        )}

        {submittedBooking ? (
          <div className="booking-success-box" role="status">
            <div className="success-icon" aria-hidden="true">&#9989;</div>
            <h2>Reservation Confirmed!</h2>
            <p className="success-lead">
              Your study space has been successfully reserved.
            </p>

            <div className="booking-details-summary">
              <div className="summary-row">
                <span className="summary-label">Space:</span>
                <span className="summary-val">{submittedBooking.space}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Date:</span>
                <span className="summary-val">{submittedBooking.date}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Time:</span>
                <span className="summary-val">
                  {submittedBooking.startTime} - {submittedBooking.endTime}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Purpose:</span>
                <span className="summary-val">{submittedBooking.purpose}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Booking Reference:</span>
                <span className="summary-val ref-code">#{submittedBooking.id}</span>
              </div>
            </div>

            <button
              type="button"
              className="retry-button"
              onClick={handleReset}
            >
              Book Another Space
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="booking-form">
            {/* Space Dropdown */}
            <div className="form-group">
              <label htmlFor="space-select">Select Space</label>
              <select
                id="space-select"
                className="form-select"
                value={space}
                onChange={(e) => setSpace(e.target.value)}
                required
              >
                {SPACES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div className="form-group">
              <label htmlFor="booking-date">Reservation Date</label>
              <input
                id="booking-date"
                type="date"
                className="form-input"
                required
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Time Slot Inputs */}
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="start-time">Start Time</label>
                <input
                  id="start-time"
                  type="time"
                  className="form-input"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="end-time">End Time</label>
                <input
                  id="end-time"
                  type="time"
                  className="form-input"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Optional Purpose */}
            <div className="form-group">
              <label htmlFor="booking-purpose">Purpose (Optional)</label>
              <input
                id="booking-purpose"
                type="text"
                className="form-input"
                placeholder="e.g., Thesis research, team presentation"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <button type="submit" className="auth-submit-btn">
              Confirm Reservation
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
