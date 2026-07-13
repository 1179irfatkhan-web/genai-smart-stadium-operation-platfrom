import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, Clock, AlertTriangle, MapPin, Phone, Check, X, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { VolunteerTask, Volunteer, Alert } from '../../types';
import { Skeleton } from '../common/LoadingSpinner';

export function VolunteerDashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!profile?.id) return;

      try {
        const [volunteerRes, tasksRes, alertsRes] = await Promise.all([
          supabase
            .from('volunteers')
            .select('*')
            .eq('user_id', profile.id)
            .maybeSingle(),
          supabase
            .from('volunteer_tasks')
            .select('*')
            .order('assigned_at', { ascending: false }),
          supabase
            .from('alerts')
            .select('*')
            .eq('is_resolved', false)
            .in('type', ['crowd', 'medical', 'facility', 'security'])
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        if (volunteerRes.data) setVolunteer(volunteerRes.data);
        if (tasksRes.data) setTasks(tasksRes.data);
        if (alertsRes.data) setAlerts(alertsRes.data);
      } catch (error) {
        console.error('Error fetching volunteer data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [profile?.id]);

  const handleTaskStatus = async (taskId: string, newStatus: 'completed' | 'cancelled') => {
    const { error } = await supabase
      .from('volunteer_tasks')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', taskId);

    if (!error) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus, completed_at: new Date().toISOString() }
            : t
        )
      );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const assignedZones = volunteer?.assigned_zones || ['Gate Area', 'Section 100N', 'Main Concourse'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Volunteer Dashboard</h1>
          <p className="text-secondary mt-1">
            Welcome, {profile?.full_name?.split(' ')[0] || 'Volunteer'}!
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
          volunteer?.status === 'active' ? 'bg-green-100 text-green-700' :
          volunteer?.status === 'break' ? 'bg-amber-100 text-amber-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {volunteer?.status || 'Active'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-secondary">Pending Tasks</p>
              <p className="text-2xl font-bold text-primary">{pendingTasks.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="text-sm text-secondary">Completed</p>
              <p className="text-2xl font-bold text-primary">{completedTasks.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-secondary">Active Alerts</p>
              <p className="text-2xl font-bold text-primary">{alerts.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-primary mb-4">Assigned Zones</h2>
        <div className="flex flex-wrap gap-2">
          {assignedZones.map((zone) => (
            <span
              key={zone}
              className="px-4 py-2 rounded-lg bg-primary-100 text-primary-700 text-sm font-medium flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {zone}
            </span>
          ))}
        </div>
        {volunteer?.shift_start && volunteer?.shift_end && (
          <div className="mt-4 pt-4 border-t border-default flex items-center gap-2 text-sm text-secondary">
            <Clock className="w-4 h-4" />
            Shift: {new Date(volunteer.shift_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(volunteer.shift_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">My Tasks</h2>
          </div>
          <div className="space-y-3">
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-lg bg-secondary border border-default"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-primary">{task.title}</h3>
                      <p className="text-sm text-secondary mt-1">{task.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.location && (
                    <div className="flex items-center gap-2 text-sm text-tertiary mb-3">
                      <MapPin className="w-4 h-4" />
                      {task.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTaskStatus(task.id, 'completed')}
                      className="flex-1 py-2 px-4 rounded-lg bg-accent-100 text-accent-700 font-medium text-sm hover:bg-accent-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Complete
                    </button>
                    <button
                      onClick={() => handleTaskStatus(task.id, 'cancelled')}
                      className="py-2 px-4 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-secondary">
                <CheckCircle className="w-12 h-12 mx-auto text-accent-500 mb-3" />
                <p>All tasks completed!</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Active Alerts in Your Area</h2>
          </div>
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'emergency' || alert.severity === 'critical'
                      ? 'bg-red-50 border-red-500'
                      : alert.severity === 'warning'
                      ? 'bg-amber-50 border-amber-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 ${
                      alert.severity === 'emergency' || alert.severity === 'critical'
                        ? 'text-red-600'
                        : alert.severity === 'warning'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                    }`} />
                    <div>
                      <h3 className="font-medium text-primary">{alert.title}</h3>
                      <p className="text-sm text-secondary mt-1">{alert.message}</p>
                      {alert.location && (
                        <div className="flex items-center gap-2 text-sm text-tertiary mt-2">
                          <MapPin className="w-4 h-4" />
                          {alert.location}
                        </div>
                      )}
                      {alert.action_required && (
                        <div className="mt-2 pt-2 border-t border-default text-sm text-primary">
                          <strong>Action:</strong> {alert.action_required}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-secondary">
                <CheckCircle className="w-12 h-12 mx-auto text-accent-500 mb-3" />
                <p>No active alerts in your zones</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-primary-50 border border-primary-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary">Need Assistance?</h3>
            <p className="text-sm text-secondary mt-1">
              Contact command center for support or report an incident.
            </p>
            <div className="flex gap-3 mt-3">
              <button className="btn-primary flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4" />
                Call Command
              </button>
              <button className="btn-secondary flex items-center gap-2 text-sm">
                <Send className="w-4 h-4" />
                Report Incident
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
