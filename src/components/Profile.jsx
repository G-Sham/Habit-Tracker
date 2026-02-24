import React, { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, startOfToday, startOfDay, isSameDay, parseISO } from 'date-fns';
import { User, Mail, Link2, Copy, Trash2, ArrowLeft } from 'lucide-react';
import { auth } from '../services/firebase';

const Profile = ({ habits, onBack }) => {
    const user = auth.currentUser;

    // Generate share link in the format: origin/uid/username
    const shareLink = `${window.location.origin}/${user?.uid}/${encodeURIComponent(user?.displayName || 'User')}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        alert('Link copied to clipboard!');
    };

    // Generate heatmap data starting from the account creation date
    const heatmapData = useMemo(() => {
        const joinDate = user?.metadata?.creationTime ? startOfDay(new Date(user.metadata.creationTime)) : startOfToday();
        const today = startOfToday();

        // Ensure we show at least a few weeks even if the user just joined
        // and show up to today.
        const interval = eachDayOfInterval({
            start: joinDate,
            end: today
        });

        return interval.map(date => {
            const dateKey = format(date, 'yyyy-MM-dd');
            let completedCount = 0;
            habits.forEach(habit => {
                if (habit.progress?.[dateKey]) completedCount++;
            });
            return {
                date: dateKey,
                count: completedCount,
                dayOfWeek: date.getDay()
            };
        });
    }, [habits, user]);

    const getColor = (count) => {
        if (count === 0) return '#ebedf0';
        if (count === 1) return '#9be9a8';
        if (count === 2) return '#40c463';
        if (count === 3) return '#30a14e';
        return '#216e39';
    };

    const totalCompletions = useMemo(() => {
        return habits.reduce((acc, habit) => {
            return acc + Object.values(habit.progress || {}).filter(Boolean).length;
        }, 0);
    }, [habits]);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px' }}>
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#e67e22', fontWeight: '600', cursor: 'pointer', marginBottom: '30px' }}>
                <ArrowLeft size={18} /> Back to Tracker
            </button>

            <div style={{ display: 'flex', gap: '40px', marginBottom: '50px' }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: '#e67e22',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '3rem',
                    fontWeight: 'bold'
                }}>
                    {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
                    <h1 style={{ margin: 0, color: '#e67e22' }}>{user?.displayName || 'User'}</h1>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666' }}>
                            <Mail size={16} /> <span>{user?.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666' }}>
                            <User size={16} /> <span style={{ fontFamily: 'monospace' }}>UID: {user?.uid}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 15px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            color: '#333',
                            flex: 1
                        }}>
                            <Link2 size={16} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shareLink}</span>
                        </div>
                        <button
                            onClick={copyToClipboard}
                            style={{
                                padding: '10px 15px',
                                backgroundColor: '#e67e22',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Copy size={16} /> Copy
                        </button>
                    </div>
                </div>
            </div>

            <div style={{
                backgroundColor: '#1a1a1a',
                padding: '30px',
                borderRadius: '12px',
                color: 'white',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                    <div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Discipline History</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#888' }}>
                        Joined: <span style={{ color: 'white' }}>{user?.metadata?.creationTime ? format(new Date(user.metadata.creationTime), 'MMM dd, yyyy') : 'Recently'}</span>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                    height: '105px', // 7 days * (12px + 3px gap)
                    gap: '3px',
                    padding: '10px 0',
                    overflowX: 'auto'
                }}>
                    {heatmapData.map((day, i) => (
                        <div
                            key={day.date}
                            title={`${day.date}: ${day.count} completions`}
                            style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: getColor(day.count),
                                borderRadius: '2px',
                                flexShrink: 0
                            }}
                        />
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.8rem', color: '#888' }}>
                    <div />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>Less</span>
                        <div style={{ display: 'flex', gap: '3px' }}>
                            <div style={{ width: '10px', height: '10px', backgroundColor: '#ebedf0', borderRadius: '1px' }}></div>
                            <div style={{ width: '10px', height: '10px', backgroundColor: '#9be9a8', borderRadius: '1px' }}></div>
                            <div style={{ width: '10px', height: '10px', backgroundColor: '#40c463', borderRadius: '1px' }}></div>
                            <div style={{ width: '10px', height: '10px', backgroundColor: '#30a14e', borderRadius: '1px' }}></div>
                            <div style={{ width: '10px', height: '10px', backgroundColor: '#216e39', borderRadius: '1px' }}></div>
                        </div>
                        <span>More</span>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button
                    onClick={() => auth.signOut()}
                    style={{ padding: '8px 20px', background: 'none', border: '1px solid #c0392b', color: '#c0392b', borderRadius: '6px', cursor: 'pointer' }}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Profile;
