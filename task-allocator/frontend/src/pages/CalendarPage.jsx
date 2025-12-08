import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function CalendarPage({ onLogout }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeSlot, setTimeSlot] = useState({
    startTime: '09:00',
    endTime: '17:00',
    available: true
  });

  useEffect(() => {
    fetchAvailabilities();
    fetchTasks();
  }, []);

  const fetchAvailabilities = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${API_URL}/users/${user.id}/availability`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailabilities(response.data || []);
    } catch (error) {
      console.error('Error fetching availabilities:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getAvailabilityForDate = (date) => {
    if (!date) return null;
    const dateStr = date.toISOString().split('T')[0];
    return availabilities.find(a => 
      new Date(a.date).toISOString().split('T')[0] === dateStr
    );
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    const existing = getAvailabilityForDate(date);
    if (existing) {
      setTimeSlot({
        startTime: existing.startTime,
        endTime: existing.endTime,
        available: existing.available
      });
    } else {
      setTimeSlot({
        startTime: '09:00',
        endTime: '17:00',
        available: true
      });
    }
    setShowTimeModal(true);
  };

  const handleSaveAvailability = async () => {
    if (!selectedDate) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/users/availability`, {
        date: selectedDate.toISOString(),
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        available: timeSlot.available
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchAvailabilities();
      setShowTimeModal(false);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Failed to save availability');
    }
  };

  const handleDeleteAvailability = async () => {
    if (!selectedDate) return;

    try {
      const token = localStorage.getItem('token');
      const dateStr = selectedDate.toISOString();
      await axios.delete(`${API_URL}/users/availability?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchAvailabilities();
      setShowTimeModal(false);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error deleting availability:', error);
      alert('Failed to delete availability');
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '30px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem' }}>📅 Availability Calendar</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          Set your available hours and view all your tasks
        </p>
      </div>

      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <button
            onClick={previousMonth}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            ← Previous
          </button>
          <h2 style={{ margin: 0, color: '#1f2937' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={nextMonth}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Next →
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '10px',
          marginBottom: '10px'
        }}>
          {dayNames.map(day => (
            <div key={day} style={{
              textAlign: 'center',
              fontWeight: '600',
              color: '#6b7280',
              padding: '10px'
            }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '10px'
        }}>
          {days.map((date, index) => {
            const availability = date ? getAvailabilityForDate(date) : null;
            const dayTasks = date ? getTasksForDate(date) : [];
            const isToday = date && 
              date.toDateString() === new Date().toDateString();
            const isPast = date && date < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div
                key={index}
                onClick={() => !isPast && handleDateClick(date)}
                style={{
                  minHeight: '100px',
                  padding: '10px',
                  borderRadius: '8px',
                  cursor: date && !isPast ? 'pointer' : 'default',
                  background: date ? (
                    availability ? (
                      availability.available ? '#d1fae5' : '#fee2e2'
                    ) : '#f9fafb'
                  ) : 'transparent',
                  border: isToday ? '2px solid #667eea' : '1px solid #e5e7eb',
                  opacity: isPast ? 0.5 : 1,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (date && !isPast) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {date && (
                  <>
                    <div style={{
                      fontWeight: '600',
                      color: isPast ? '#9ca3af' : '#1f2937',
                      marginBottom: '5px'
                    }}>
                      {date.getDate()}
                    </div>
                    {availability && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginTop: '5px',
                        marginBottom: '5px'
                      }}>
                        {availability.available ? (
                          <>
                            ✓ {availability.startTime} - {availability.endTime}
                          </>
                        ) : (
                          '✗ Unavailable'
                        )}
                      </div>
                    )}
                    {dayTasks.map(task => (
                      <div key={task._id} style={{
                        fontSize: '0.7rem',
                        background: task.status === 'Completed' ? '#d1fae5' : task.status === 'In Progress' ? '#dbeafe' : '#fef3c7',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        marginTop: '3px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        border: '1px solid ' + (task.status === 'Completed' ? '#10b981' : task.status === 'In Progress' ? '#3b82f6' : '#f59e0b')
                      }} title={task.title}>
                        📋 {task.title}
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginTop: '25px',
          padding: '15px',
          background: '#f9fafb',
          borderRadius: '8px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              background: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '4px'
            }}></div>
            <span style={{ fontSize: '0.9rem' }}>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              background: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '4px'
            }}></div>
            <span style={{ fontSize: '0.9rem' }}>Unavailable</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '4px'
            }}></div>
            <span style={{ fontSize: '0.9rem' }}>Not Set</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '4px'
            }}></div>
            <span style={{ fontSize: '0.9rem' }}>Pending Tasks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              background: '#dbeafe',
              border: '1px solid #3b82f6',
              borderRadius: '4px'
            }}></div>
            <span style={{ fontSize: '0.9rem' }}>In Progress Tasks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              background: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '4px'
            }}></div>
            <span style={{ fontSize: '0.9rem' }}>Completed Tasks</span>
          </div>
        </div>
      </div>

      {/* Time Slot Modal */}
      {showTimeModal && selectedDate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0 }}>
              Set Availability for {selectedDate.toLocaleDateString()}
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '15px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={timeSlot.available}
                  onChange={(e) => setTimeSlot({ ...timeSlot, available: e.target.checked })}
                  style={{ width: '20px', height: '20px' }}
                />
                <span style={{ fontSize: '1rem', fontWeight: '600' }}>I am available</span>
              </label>

              {timeSlot.available && (
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={timeSlot.startTime}
                      onChange={(e) => setTimeSlot({ ...timeSlot, startTime: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                      End Time
                    </label>
                    <input
                      type="time"
                      value={timeSlot.endTime}
                      onChange={(e) => setTimeSlot({ ...timeSlot, endTime: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <button
                onClick={handleSaveAvailability}
                style={{
                  flex: 1,
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Save
              </button>
              {getAvailabilityForDate(selectedDate) && (
                <button
                  onClick={handleDeleteAvailability}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => {
                  setShowTimeModal(false);
                  setSelectedDate(null);
                }}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}