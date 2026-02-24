import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { useHabits } from './hooks/useHabits';
import HabitGrid from './components/HabitGrid';
import GoalSidebar from './components/GoalSidebar';
import Analysis from './components/Analysis';
import './index.css';


import Profile from './components/Profile';
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Tracker = () => {
  const { targetUid, targetName } = useParams();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [sharedUserName, setSharedUserName] = useState(targetName || null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Set initial view from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'profile') {
      setView('profile');
    }
  }, []);


  // Fetch shared profile owner's name if not in URL
  useEffect(() => {
    if (targetUid && !targetName) {
      const fetchOwnerName = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', targetUid));
          if (userDoc.exists()) {
            setSharedUserName(userDoc.data().displayName);
          }
        } catch (error) {
          console.error("Error fetching shared user name:", error);
        }
      };
      fetchOwnerName();
    }
  }, [targetUid, targetName]);

  // Determine which user's data to load: 
  // 1. If in a share route, use targetUid.
  // 2. Otherwise, use authenticated user's UID.
  const effectiveUid = targetUid || user?.uid;
  const isOwner = user?.uid && user.uid === effectiveUid;
  const isReadOnly = effectiveUid && !isOwner;

  const {
    habits, goals, dates,
    addHabit, toggleHabit, deleteHabit,
    addGoal, deleteGoal, loading: dataLoading
  } = useHabits(effectiveUid);

  if (authLoading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#e67e22' }}>
        <h2>Starting app...</h2>
      </div>
    );
  }

  // Redirect to landing page if not logged in AND not viewing a shared link
  if (!user && !targetUid) {
    window.location.href = "/";
    return null;
  }

  if (view === 'profile' && user && isOwner) {
    return (
      <div className="app-container" style={{ display: 'block', background: '#f5f5f5', overflowY: 'auto' }}>
        <Profile habits={habits} onBack={() => setView('dashboard')} />
      </div>
    );
  }

  if (view === 'analysis') {
    return (
      <div className="app-container" style={{ padding: '0px', background: '#f5f5f5' }}>
        <div style={{ padding: '40px', width: '100%', overflowY: 'auto' }}>
          <Analysis habits={habits} isReadOnly={isReadOnly} onBack={() => setView('dashboard')} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#e67e22', margin: 0, fontWeight: 'bold' }}>
            {isReadOnly ? `${sharedUserName || 'User'}'s Tracker` : (user?.displayName ? `${user.displayName}'s Tracker` : 'Habit Tracker')}
            {isReadOnly && <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '10px' }}>(Read-Only)</span>}
          </h1>

          {user && isOwner && (
            <button
              onClick={() => setView('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: 'none',
                color: '#e67e22',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e67e22', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
              </div>
              Profile
            </button>
          )}
        </div>

        {dataLoading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading tracker...</div>
        ) : (
          <HabitGrid
            habits={habits}
            dates={dates}
            isReadOnly={isReadOnly}
            onToggle={isReadOnly ? () => alert('Viewing shared profile in read-only mode.') : toggleHabit}
            onDelete={isReadOnly ? () => { } : deleteHabit}
          />
        )}

        {!isReadOnly && (
          <div className="actions-footer">
            <button className="btn" style={{ backgroundColor: '#e67e22' }} onClick={() => {
              const name = prompt('Enter habit name:');
              if (name) addHabit(name);
            }}>Add Task</button>
            <button className="btn" style={{ backgroundColor: '#e67e22' }} onClick={() => {
              const name = prompt('Enter goal name:');
              if (!name) return;
              const days = prompt('Enter target days:');
              if (days && !isNaN(days)) {
                addGoal(name, parseInt(days));
              }
            }}>Add Goal</button>
            <button className="btn" style={{ backgroundColor: '#e67e22' }} onClick={() => setView('analysis')}>Analysis</button>
          </div>
        )}

        {isReadOnly && (
          <div className="actions-footer" style={{ justifyContent: 'center' }}>
            <button className="btn" style={{ backgroundColor: '#e67e22' }} onClick={() => setView('analysis')}>View Detailed Analysis</button>
          </div>
        )}
      </div>

      <GoalSidebar
        goals={goals}
        isReadOnly={isReadOnly}
        onDelete={isReadOnly ? () => { } : deleteGoal}
      />
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Tracker />} />
      <Route path="/tracker.html" element={<Tracker />} />
      <Route path="/:targetUid/:targetName" element={<Tracker />} />
      <Route path="/:targetUid" element={<Tracker />} />
    </Routes>
  );
}


export default App;
