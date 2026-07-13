import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Filter, Search, Layers, Accessibility, Utensils, Coffee, Heart, Droplets, Recycle, Info, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Facility, Gate } from '../../types';
import { Skeleton } from '../common/LoadingSpinner';

type FilterType = 'all' | 'restroom' | 'food_stall' | 'beverage' | 'medical_center' | 'water_refill' | 'recycling_bin' | 'prayer_room' | 'accessible';

const facilityIcons: Record<string, typeof MapPin> = {
  restroom: MapPin,
  food_stall: Utensils,
  beverage: Coffee,
  medical_center: Heart,
  water_refill: Droplets,
  recycling_bin: Recycle,
  prayer_room: MapPin,
  information: Info,
  merchandise: MapPin,
  accessible_seating: Accessibility,
  first_aid: Heart,
  other: MapPin,
};

export function StadiumMap() {
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedItem, setSelectedItem] = useState<Facility | Gate | null>(null);
  const [showAccessible, setShowAccessible] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [facilitiesRes, gatesRes] = await Promise.all([
          supabase.from('facilities').select('*'),
          supabase.from('gates').select('*'),
        ]);

        if (facilitiesRes.data) setFacilities(facilitiesRes.data);
        if (gatesRes.data) setGates(gatesRes.data);
      } catch (error) {
        console.error('Error fetching map data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredFacilities = facilities.filter((f) => {
    if (filter === 'all') return true;
    if (filter === 'accessible') return f.is_accessible;
    return f.type === filter;
  }).filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGates = gates.filter((g) => {
    if (showAccessible && !g.is_accessible) return false;
    return g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid lg:grid-cols-4 gap-6">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="lg:col-span-3 h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gates, facilities, sections..."
            className="input-field pl-12"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAccessible(!showAccessible)}
            className={`btn-secondary flex items-center gap-2 ${showAccessible ? 'bg-primary-100 border-primary-300' : ''}`}
          >
            <Accessibility className="w-4 h-4" />
            Accessible
          </button>
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="input-field pr-10 appearance-none"
            >
              <option value="all">All Types</option>
              <option value="restroom">Restrooms</option>
              <option value="food_stall">Food</option>
              <option value="beverage">Beverages</option>
              <option value="medical_center">Medical</option>
              <option value="water_refill">Water Refill</option>
              <option value="recycling_bin">Recycling</option>
              <option value="prayer_room">Prayer Room</option>
              <option value="accessible">Accessible Only</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Quick Filters
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'restroom', icon: MapPin, label: 'Restrooms' },
                { type: 'food_stall', icon: Utensils, label: 'Food' },
                { type: 'medical_center', icon: Heart, label: 'Medical' },
                { type: 'water_refill', icon: Droplets, label: 'Water' },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setFilter(type as FilterType)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    filter === type ? 'bg-primary-100 text-primary-700' : 'bg-tertiary text-secondary hover:bg-primary-50'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="card max-h-96 overflow-y-auto scrollbar-thin">
            <h3 className="font-semibold text-primary mb-3">Gates ({filteredGates.length})</h3>
            <div className="space-y-2">
              {filteredGates.map((gate) => (
                <button
                  key={gate.id}
                  onClick={() => setSelectedItem(gate)}
                  className={`w-full p-3 rounded-lg text-left hover:bg-tertiary transition-colors ${
                    selectedItem?.id === gate.id ? 'bg-primary-50 border border-primary-200' : 'bg-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-primary text-sm">{gate.name}</p>
                      <p className="text-xs text-tertiary">{gate.code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {gate.is_accessible && (
                        <Accessibility className="w-4 h-4 text-accent-500" />
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        gate.status === 'open' ? 'bg-green-100 text-green-700' :
                        gate.status === 'restricted' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {gate.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-secondary">
                    <span>Queue: {gate.current_queue}</span>
                    <span className={gate.current_queue > 200 ? 'text-amber-600' : 'text-accent-600'}>
                      {gate.current_queue > 200 ? 'High' : 'Low'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card max-h-64 overflow-y-auto scrollbar-thin">
            <h3 className="font-semibold text-primary mb-3">Facilities ({filteredFacilities.length})</h3>
            <div className="space-y-2">
              {filteredFacilities.slice(0, 10).map((facility) => {
                const Icon = facilityIcons[facility.type] || MapPin;
                return (
                  <button
                    key={facility.id}
                    onClick={() => setSelectedItem(facility)}
                    className={`w-full p-3 rounded-lg text-left hover:bg-tertiary transition-colors ${
                      selectedItem?.id === facility.id ? 'bg-primary-50 border border-primary-200' : 'bg-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-tertiary flex items-center justify-center">
                        <Icon className="w-4 h-4 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary text-sm truncate">{facility.name}</p>
                        <p className="text-xs text-tertiary truncate">{facility.location}</p>
                      </div>
                      {facility.is_accessible && (
                        <Accessibility className="w-4 h-4 text-accent-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card h-full min-h-[500px] relative overflow-hidden bg-tertiary">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-full h-full relative">
                  <div className="absolute inset-4 bg-secondary rounded-2xl border-4 border-primary-200 shadow-inner overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary-100 rounded-b-lg">
                      <span className="text-sm font-medium text-primary-700">NORTH</span>
                    </div>

                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary-100 rounded-t-lg">
                      <span className="text-sm font-medium text-primary-700">SOUTH</span>
                    </div>

                    <div className="absolute left-0 top-1/2 -translate-y-1/2 py-6 px-2 bg-primary-100 rounded-r-lg">
                      <span className="text-sm font-medium text-primary-700">W</span>
                    </div>

                    <div className="absolute right-0 top-1/2 -translate-y-1/2 py-6 px-2 bg-primary-100 rounded-l-lg">
                      <span className="text-sm font-medium text-primary-700">E</span>
                    </div>

                    <div className="absolute top-8 left-4 space-y-4">
                      {gates.slice(0, 2).map((gate) => (
                        <button
                          key={gate.id}
                          onClick={() => setSelectedItem(gate)}
                          className={`relative group ${selectedItem?.id === gate.id ? 'z-20' : 'z-10'}`}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                              gate.is_accessible ? 'bg-accent-500' : 'bg-primary-500'
                            } ${selectedItem?.id === gate.id ? 'ring-4 ring-primary-300' : ''}`}
                          >
                            <span className="text-white font-bold text-xs">{gate.code}</span>
                          </motion.div>
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {gate.name}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="absolute top-8 right-4 space-y-4">
                      {gates.slice(2, 4).map((gate) => (
                        <button
                          key={gate.id}
                          onClick={() => setSelectedItem(gate)}
                          className={`relative group ${selectedItem?.id === gate.id ? 'z-20' : 'z-10'}`}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                              gate.is_accessible ? 'bg-accent-500' : 'bg-primary-500'
                            } ${selectedItem?.id === gate.id ? 'ring-4 ring-primary-300' : ''}`}
                          >
                            <span className="text-white font-bold text-xs">{gate.code}</span>
                          </motion.div>
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {gate.name}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
                      <div className="w-32 h-48 bg-primary-600 rounded-t-full flex flex-col items-center justify-end px-4 py-8 text-white text-center">
                        <span className="text-xs font-medium opacity-80">FIELD</span>
                      </div>
                    </div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="grid grid-cols-2 gap-8">
                        {facilities.slice(0, 4).map((facility) => {
                          const Icon = facilityIcons[facility.type] || MapPin;
                          return (
                            <button
                              key={facility.id}
                              onClick={() => setSelectedItem(facility)}
                              className={`relative group ${selectedItem?.id === facility.id ? 'z-20' : 'z-10'}`}
                            >
                              <motion.div
                                whileHover={{ scale: 1.15 }}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                                  facility.type === 'restroom' ? 'bg-blue-500' :
                                  facility.type === 'food_stall' ? 'bg-amber-500' :
                                  facility.type === 'medical_center' ? 'bg-red-500' :
                                  facility.type === 'water_refill' ? 'bg-cyan-500' :
                                  'bg-secondary'
                                } ${selectedItem?.id === facility.id ? 'ring-4 ring-primary-300 shadow-lg' : ''}`}
                              >
                                <Icon className="w-5 h-5 text-white" />
                              </motion.div>
                              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                {facility.name}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedItem && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border-l-4 border-l-primary-500"
        >
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-primary">
                  {selectedItem.name}
                </h3>
                {('is_accessible' in selectedItem) && selectedItem.is_accessible && (
                  <span className="px-2 py-0.5 rounded bg-accent-100 text-accent-700 text-xs font-medium">
                    Accessible
                  </span>
                )}
              </div>
              <p className="text-secondary text-sm">
                {'location' in selectedItem ? selectedItem.location : `Code: ${selectedItem.code}`}
              </p>
              {'current_queue' in selectedItem && (
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="text-secondary">Current Queue: <strong className="text-primary">{selectedItem.current_queue}</strong></span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    selectedItem.current_queue > 200 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {selectedItem.current_queue > 200 ? 'High Traffic' : 'Normal'}
                  </span>
                </div>
              )}
              {'status' in selectedItem && (
                <p className="text-sm text-secondary mt-1">Status: {selectedItem.status}</p>
              )}
              {'type' in selectedItem && (
                <p className="text-sm text-secondary mt-1">Type: {(selectedItem.type as string).replace('_', ' ')}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="p-2 rounded-lg hover:bg-tertiary"
              aria-label="Close details"
            >
              <X className="w-5 h-5 text-secondary" />
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-default flex gap-3">
            <button className="btn-primary flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Get Directions
            </button>
            <button className="btn-secondary">
              Add to Route
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
