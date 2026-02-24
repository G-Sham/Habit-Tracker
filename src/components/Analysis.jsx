import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { format, subDays, eachDayOfInterval, differenceInDays, parseISO, startOfDay, min } from 'date-fns';
import { RefreshCw } from 'lucide-react';

const Analysis = ({ habits, isReadOnly, onBack }) => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Generate data for the last 7 days
    const last7Days = useMemo(() => eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date()
    }), [refreshKey]);

    const getDiscipline = (percent) => {
        if (percent >= 90) return { label: 'Elite', color: '#27ae60' };
        if (percent >= 70) return { label: 'Consistent', color: '#2980b9' };
        if (percent >= 50) return { label: 'Good', color: '#f1c40f' };
        if (percent >= 30) return { label: 'Trying', color: '#e67e22' };
        return { label: 'Slacking', color: '#c0392b' };
    };

    // Colors for different habits
    const colors = ['#e67e22', '#1a4f6d', '#27ae60', '#2980b9', '#8e44ad', '#c0392b', '#16a085', '#2c3e50'];

    // Prepare consolidated data for the single point graph
    const consolidatedChartData = useMemo(() => {
        return last7Days.map(date => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const displayDate = format(date, 'MMM dd');
            const row = { name: displayDate };

            habits.forEach((habit, index) => {
                row[habit.name] = habit.progress?.[dateKey] ? 1 : 0;
            });

            return row;
        });
    }, [habits, last7Days]);

    const aggregateBarData = last7Days.map(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const displayDate = format(date, 'MMM dd');
        let completedCount = 0;
        habits.forEach(habit => {
            if (habit.progress?.[dateKey]) completedCount++;
        });

        return {
            name: displayDate,
            completions: completedCount
        };
    });

    return (
        <div key={refreshKey} style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h1 style={{ color: '#e67e22', margin: 0, fontWeight: 'bold' }}>Analysis Dashboard</h1>
                    <button
                        onClick={handleRefresh}
                        style={{ background: 'none', border: 'none', color: '#e67e22', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Refresh Analytics"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
                {!isReadOnly && <button className="btn" onClick={onBack}>Back to Tracker</button>}
            </div>

            <h2 style={{ color: '#1a4f6d', marginBottom: '20px', fontSize: '1.2rem' }}>Task Status (Done/Missed)</h2>

            <div style={{
                height: '400px',
                background: '#f9f9f9',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #eee',
                marginBottom: '40px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={consolidatedChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 1.2]}
                            ticks={[0, 1]}
                            tickFormatter={(val) => val === 1 ? 'Done' : val === 0 ? 'Missed' : ''}
                            tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value, name) => [value === 1 ? 'Completed' : 'Missed', name]}
                        />
                        {habits.map((habit, index) => (
                            <Line
                                key={habit.id}
                                type="monotone"
                                dataKey={habit.name}
                                stroke={colors[index % colors.length]}
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: colors[index % colors.length] }}
                                activeDot={{ r: 6 }}
                                name={habit.name}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto 40px auto' }}>
                <div style={{ height: '350px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#666' }}>Total Daily Completions</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={aggregateBarData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                            <Bar dataKey="completions" fill="#1a4f6d" radius={[4, 4, 0, 0]} barSize={40} name="Habits Done" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Summary Table */}
            <div style={{ marginTop: '40px', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#1a4f6d', color: 'white', textAlign: 'left' }}>
                            <th style={{ padding: '15px' }}>Habit</th>
                            <th style={{ padding: '15px' }}>Started</th>
                            <th style={{ padding: '15px' }}>Finished</th>
                            <th style={{ padding: '15px' }}>Percentage</th>
                            <th style={{ padding: '15px' }}>Missed</th>
                            <th style={{ padding: '15px' }}>Discipline</th>
                        </tr>
                    </thead>
                    <tbody>
                        {habits.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center' }}>No tasks found.</td></tr>
                        ) : habits.map(habit => {
                            const logs = Object.keys(habit.progress || {}).filter(k => habit.progress[k]);

                            // Effective start date is the earliest between createdAt and the first log entry
                            const creationDate = habit.createdAt ? parseISO(habit.createdAt) : new Date();
                            const earliestLog = logs.length > 0 ? logs.map(l => parseISO(l)).reduce((a, b) => a < b ? a : b) : creationDate;
                            const effectiveStart = min([creationDate, earliestLog]);

                            const totalDaysSinceStart = Math.max(differenceInDays(startOfDay(new Date()), startOfDay(effectiveStart)) + 1, 1);
                            const completions = logs.length;
                            const percent = Math.min(Math.round((completions / totalDaysSinceStart) * 100), 100); // Guard against > 100
                            const missed = Math.max(totalDaysSinceStart - completions, 0);
                            const discipline = getDiscipline(percent);

                            return (
                                <tr key={habit.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{habit.name}</td>
                                    <td style={{ padding: '15px', color: '#666' }}>{format(effectiveStart, 'MMM dd, yyyy')}</td>
                                    <td style={{ padding: '15px' }}>{completions} days</td>
                                    <td style={{ padding: '15px' }}>{percent}%</td>
                                    <td style={{ padding: '15px', color: missed > 0 ? '#c0392b' : '#666' }}>{missed} days</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            backgroundColor: discipline.color + '22',
                                            color: discipline.color,
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}>
                                            {discipline.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Analysis;
