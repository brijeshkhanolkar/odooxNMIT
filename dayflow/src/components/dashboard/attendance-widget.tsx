'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatTime, formatHours } from '@/lib/utils';
import type { Attendance } from '@/lib/types';

interface AttendanceWidgetProps {
  attendance: Attendance | null;
  profileId: string;
}

export function AttendanceWidget({ attendance: initialAttendance, profileId }: AttendanceWidgetProps) {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const supabase = createClient();

  // Running timer
  useEffect(() => {
    if (attendance?.check_in && !attendance?.check_out) {
      const checkInTime = new Date(attendance.check_in).getTime();
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - checkInTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [attendance]);

  const formatElapsed = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');
    try {
      const now = new Date().toISOString();
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error: err } = await supabase
        .from('attendance')
        .insert({
          profile_id: profileId,
          date: today,
          check_in: now,
          status: 'present',
        })
        .select()
        .single();

      if (err) {
        if (err.code === '23505') {
          setError('You have already checked in today');
        } else {
          setError(err.message);
        }
      } else {
        setAttendance(data);
      }
    } catch {
      setError('Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!attendance) return;
    setLoading(true);
    setError('');
    try {
      const now = new Date().toISOString();

      const { data, error: err } = await supabase
        .from('attendance')
        .update({ check_out: now })
        .eq('id', attendance.id)
        .select()
        .single();

      if (err) {
        setError(err.message);
      } else {
        setAttendance(data);
      }
    } catch {
      setError('Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = attendance?.check_in && !attendance?.check_out;
  const isCompleted = attendance?.check_in && attendance?.check_out;

  return (
    <Card className="bg-gradient-to-r from-violet-600 to-violet-700 text-white border-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold opacity-90">Today&apos;s Attendance</h3>
          {isCheckedIn && (
            <div className="mt-2">
              <p className="text-3xl font-bold font-mono">{formatElapsed(elapsed)}</p>
              <p className="text-sm opacity-75 mt-1">
                Checked in at {formatTime(attendance!.check_in!)}
              </p>
            </div>
          )}
          {isCompleted && (
            <div className="mt-2">
              <p className="text-2xl font-bold">
                {formatHours(attendance!.work_hours)}
              </p>
              <p className="text-sm opacity-75 mt-1">
                {formatTime(attendance!.check_in!)} — {formatTime(attendance!.check_out!)}
              </p>
            </div>
          )}
          {!attendance && (
            <p className="text-sm opacity-75 mt-1">You haven&apos;t checked in yet today</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!attendance && (
            <Button
              onClick={handleCheckIn}
              loading={loading}
              className="bg-white text-violet-700 hover:bg-violet-50 shadow-lg"
            >
              ☀️ Check In
            </Button>
          )}
          {isCheckedIn && (
            <Button
              onClick={handleCheckOut}
              loading={loading}
              className="bg-white text-violet-700 hover:bg-violet-50 shadow-lg"
            >
              🌙 Check Out
            </Button>
          )}
          {isCompleted && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium">Day Complete</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm mt-3 bg-white/20 rounded-lg p-2 backdrop-blur-sm">{error}</p>
      )}
    </Card>
  );
}
