import { useState, useEffect, useMemo } from 'react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { db } from '../services/firebase';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';

export const useHabits = (userId) => {
    const [habits, setHabits] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Habits in Real-time with userId filter
    useEffect(() => {
        if (!userId) {
            setLoading(false);
            setHabits([]);
            return;
        }

        const q = query(
            collection(db, 'habits'),
            where('userId', '==', userId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const habitsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setHabits(habitsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching habits: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    // Fetch Goals in Real-time with userId filter
    useEffect(() => {
        if (!userId) {
            setGoals([]);
            return;
        }

        const q = query(
            collection(db, 'goals'),
            where('userId', '==', userId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const goalsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setGoals(goalsData);
        }, (error) => {
            console.error("Error fetching goals: ", error);
        });

        return () => unsubscribe();
    }, [userId]);

    const dates = useMemo(() => {
        const today = startOfToday();
        return Array.from({ length: 5 }, (_, i) => addDays(today, -4 + i));
    }, []);

    const addHabit = async (name) => {
        if (!userId) return;
        try {
            await addDoc(collection(db, 'habits'), {
                name,
                userId,
                createdAt: new Date().toISOString(),
                progress: {}
            });
        } catch (error) {
            console.error("Error adding habit: ", error);
        }
    };

    const toggleHabit = async (habitId, date) => {
        if (!isSameDay(date, new Date())) {
            console.warn("Blocked toggle for non-today date");
            return;
        }
        const dateKey = format(date, 'yyyy-MM-dd');
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        try {
            const habitRef = doc(db, 'habits', habitId);
            await updateDoc(habitRef, {
                [`progress.${dateKey}`]: !habit.progress?.[dateKey]
            });
        } catch (error) {
            console.error("Error toggling habit: ", error);
        }
    };

    const deleteHabit = async (id) => {
        if (!window.confirm('Are you sure you want to delete this habit?')) return;
        try {
            await deleteDoc(doc(db, 'habits', id));
        } catch (error) {
            console.error("Error deleting habit: ", error);
        }
    };

    const addGoal = async (name, targetDays) => {
        if (!userId) return;
        try {
            await addDoc(collection(db, 'goals'), {
                name,
                targetDays,
                completedDays: 0,
                userId,
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding goal: ", error);
            alert("Failed to save goal. " + error.message);
        }
    };

    const deleteGoal = async (id) => {
        if (!window.confirm('Are you sure you want to delete this goal?')) return;
        try {
            await deleteDoc(doc(db, 'goals', id));
        } catch (error) {
            console.error("Error deleting goal: ", error);
        }
    };

    return {
        habits,
        goals,
        dates,
        addHabit,
        toggleHabit,
        deleteHabit,
        addGoal,
        deleteGoal,
        loading
    };
};
