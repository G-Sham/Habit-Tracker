import React, { useEffect } from 'react';
import { differenceInCalendarDays, parseISO, startOfToday } from 'date-fns';
import { Trash2, AlertTriangle } from 'lucide-react';

const GoalSidebar = ({ goals, isReadOnly, onDelete }) => {
    const today = startOfToday();

    // Handle auto-vanishing sticky notes
    useEffect(() => {
        if (isReadOnly) return;

        goals.forEach(goal => {
            const daysElapsed = differenceInCalendarDays(today, parseISO(goal.createdAt || new Date().toISOString()));
            const daysRemaining = goal.targetDays - daysElapsed;

            if (daysRemaining <= 0) {
                alert(`Time completed for this goal: ${goal.name}. It will now be removed.`);
                onDelete(goal.id);
            }
        });
    }, [goals, today, isReadOnly, onDelete]);

    // Sort goals by days remaining (ascending)
    const sortedGoals = [...goals].sort((a, b) => {
        const aElapsed = differenceInCalendarDays(today, parseISO(a.createdAt || new Date().toISOString()));
        const bElapsed = differenceInCalendarDays(today, parseISO(b.createdAt || new Date().toISOString()));
        const aRem = a.targetDays - aElapsed;
        const bRem = b.targetDays - bElapsed;
        return aRem - bRem;
    });

    return (
        <div className="sidebar">
            <h2 style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>Goals</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {sortedGoals.length === 0 ? (
                    <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                        {isReadOnly ? "No goals set yet." : "No goals set yet. Use the button to set your first goal!"}
                    </p>
                ) : (
                    sortedGoals.map(goal => {
                        const daysElapsed = differenceInCalendarDays(today, parseISO(goal.createdAt || new Date().toISOString()));
                        const daysRemaining = Math.max(0, goal.targetDays - daysElapsed);
                        const progressPercent = Math.min((daysElapsed / goal.targetDays) * 100, 100);
                        const isEmergency = daysRemaining < 3 && daysRemaining > 0;

                        return (
                            <div key={goal.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {isEmergency && <AlertTriangle size={16} color="#e67e22" />}
                                        <span style={{ fontWeight: '500' }}>{goal.name}</span>
                                    </div>
                                    {!isReadOnly && (
                                        <button
                                            onClick={() => onDelete(goal.id)}
                                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '0px' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            width: '100%',
                                            height: '14px',
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            position: 'relative',
                                            borderRadius: '2px'
                                        }}>
                                            <div style={{
                                                width: `${progressPercent}%`,
                                                height: '100%',
                                                backgroundColor: '#e67e22',
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                    </div>
                                    <div style={{
                                        minWidth: '70px',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        backgroundColor: isEmergency ? 'rgba(230, 126, 34, 0.2)' : 'rgba(255,255,255,0.05)',
                                        color: isEmergency ? '#e67e22' : 'white',
                                        padding: '2px 5px',
                                        borderRadius: '2px',
                                        fontWeight: isEmergency ? 'bold' : 'normal'
                                    }}>
                                        {daysRemaining}d rem
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', opacity: 0.8 }}>
                                    <span>{daysElapsed} / {goal.targetDays} days passed</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default GoalSidebar;
