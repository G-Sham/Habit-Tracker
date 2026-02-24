import { format, isSameDay } from 'date-fns';
import { Trash2 } from 'lucide-react';

const HabitGrid = ({ habits, dates, isReadOnly, onToggle, onDelete }) => {
    const today = new Date();

    return (
        <div style={{ width: '100%', overflowX: 'auto', marginBottom: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <table className="habit-table" style={{ minWidth: '600px', margin: 0 }}>
                <thead>
                    <tr>
                        <th className="habit-name-col">Habit Name</th>
                        {dates.map(date => {
                            const isDateToday = isSameDay(date, new Date());
                            return (
                                <th
                                    key={date.toISOString()}
                                    style={{ textAlign: 'center' }}
                                    className={`${isDateToday ? 'today-badge' : ''}`}
                                >
                                    {format(date, 'dd/MM/yy')}
                                </th>
                            );
                        })}
                        <th style={{ width: '50px' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {habits.length === 0 ? (
                        <tr>
                            <td colSpan={dates.length + 2} style={{ textAlign: 'center', padding: '40px' }}>
                                {isReadOnly ? "No habits have been added to this profile yet." : 'No habits added yet. Click "Add Task" to get started!'}
                            </td>
                        </tr>
                    ) : (
                        habits.map(habit => (
                            <tr key={habit.id}>
                                <td className="habit-name-col" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {habit.name}
                                </td>
                                {dates.map(date => {
                                    const dateKey = format(date, 'yyyy-MM-dd');
                                    const isCompleted = habit.progress?.[dateKey] || false;
                                    const isDateToday = isSameDay(date, new Date());
                                    return (
                                        <td
                                            key={dateKey}
                                            className={isDateToday ? 'today-column' : ''}
                                            title={!isDateToday && !isReadOnly ? "You can only mark tasks for the current day" : ""}
                                        >
                                            <input
                                                type="checkbox"
                                                className="cell-checkbox"
                                                checked={isCompleted}
                                                disabled={isReadOnly || !isDateToday}
                                                onChange={() => onToggle(habit.id, date)}
                                            />
                                        </td>
                                    );
                                })}
                                <td style={{ textAlign: 'center' }}>
                                    {!isReadOnly && (
                                        <button
                                            onClick={() => onDelete(habit.id)}
                                            style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', padding: '5px' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default HabitGrid;
