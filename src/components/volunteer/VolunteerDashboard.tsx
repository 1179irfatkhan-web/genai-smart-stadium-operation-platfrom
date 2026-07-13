import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SkeletonList } from '../common/Skeletons';
import type { VolunteerTask } from '../../types';

export function VolunteerDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    const { data: volData } = await supabase.from('volunteers').select('id').eq('user_id', user.id).single();
    if (!volData) { setLoading(false); return; }

    const { data } = await supabase
      .from('volunteer_tasks')
      .select('*')
      .eq('volunteer_id', volData.id)
      .order('assigned_at', { ascending: false });

    setTasks((data as VolunteerTask[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  if (loading) return <SkeletonList count={4} />;

  const pending = tasks.filter((t) => t.status === 'pending');
  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const completed = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">My Tasks</h1>
        <p className="text-sm text-secondary mt-1">Your assigned volunteer tasks.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Clock} label="Pending" value={String(pending.length)} color="bg-blue-100 text-blue-600" />
        <StatCard icon={Activity} label="In Progress" value={String(inProgress.length)} color="bg-amber-100 text-amber-600" />
        <StatCard icon={CheckCircle} label="Completed" value={String(completed.length)} color="bg-green-100 text-green-600" />
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="card text-center py-8">
            <AlertCircle className="w-8 h-8 text-tertiary mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm text-secondary">No tasks assigned yet.</p>
          </div>
        ) : (
          tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-primary">{task.title}</h3>
                  {task.description && <p className="text-sm text-secondary mt-1">{task.description}</p>}
                  {task.location && <p className="text-xs text-tertiary mt-2">Location: {task.location}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  task.status === 'completed' ? 'bg-green-100 text-green-700' :
                  task.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                  task.status === 'cancelled' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Clock; label: string; value: string; color: string }) {
  return (
    <div className="card flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`} aria-hidden="true">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-tertiary">{label}</p>
        <p className="text-lg font-bold text-primary">{value}</p>
      </div>
    </div>
  );
}
