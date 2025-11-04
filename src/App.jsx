import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Settings, Plus, Trash2, X } from 'lucide-react';
import './App.css'

const defaultStretches = [
  { id: 1, name: "Neck Rolls", body: "Neck", description: "Gently roll your head in circles" },
  { id: 2, name: "Shoulder Shrugs", body: "Shoulders", description: "Lift shoulders up to ears and release" },
  { id: 3, name: "Arm Circles", body: "Arms", description: "Extend arms and make circular motions" },
  { id: 4, name: "Chest Stretch", body: "Chest", description: "Clasp hands behind back and lift" },
  { id: 5, name: "Side Bends", body: "Core", description: "Reach one arm overhead and bend sideways" },
  { id: 6, name: "Hip Circles", body: "Hips", description: "Hands on hips, make circular motions" },
  { id: 7, name: "Quad Stretch", body: "Legs", description: "Pull foot to glutes, balance on one leg" },
  { id: 8, name: "Hamstring Stretch", body: "Legs", description: "Bend forward at hips, reach for toes" },
  { id: 9, name: "Calf Raises", body: "Calves", description: "Rise up on toes and lower slowly" },
  { id: 10, name: "Ankle Rolls", body: "Ankles", description: "Rotate each ankle in circles" }
];

export default function StretchingTimer() {
  const [allStretches, setAllStretches] = useState(defaultStretches);
  const [selectedIds, setSelectedIds] = useState(defaultStretches.map(s => s.id));
  const [showSetup, setShowSetup] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStretch, setNewStretch] = useState({ name: '', body: '', description: '' });
  const audioRef = useRef(null);

  const selectedStretches = allStretches.filter(s => selectedIds.includes(s.id));

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      
      if (currentIndex < selectedStretches.length - 1) {
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setTimeLeft(20);
        }, 1000);
      } else {
        setIsActive(false);
        setIsComplete(true);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentIndex, selectedStretches.length]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetRoutine = () => {
    setIsActive(false);
    setCurrentIndex(0);
    setTimeLeft(20);
    setIsComplete(false);
  };

  const toggleStretch = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const addCustomStretch = () => {
    if (newStretch.name && newStretch.body && newStretch.description) {
      const newId = Math.max(...allStretches.map(s => s.id)) + 1;
      setAllStretches([...allStretches, { ...newStretch, id: newId }]);
      setSelectedIds([...selectedIds, newId]);
      setNewStretch({ name: '', body: '', description: '' });
      setShowAddForm(false);
    }
  };

  const deleteStretch = (id) => {
    setAllStretches(allStretches.filter(s => s.id !== id));
    setSelectedIds(selectedIds.filter(i => i !== id));
  };

  const startRoutine = () => {
    if (selectedStretches.length > 0) {
      setShowSetup(false);
      resetRoutine();
    }
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Setup Routine</h2>
            <button
              onClick={() => setShowSetup(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={28} />
            </button>
          </div>

          <p className="text-gray-600 mb-6">Select the stretches you want to include in your routine:</p>

          {/* Stretch Selection List */}
          <div className="space-y-3 mb-6">
            {allStretches.map(stretch => (
              <div
                key={stretch.id}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  selectedIds.includes(stretch.id)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1"
                    onClick={() => toggleStretch(stretch.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(stretch.id)}
                        onChange={() => toggleStretch(stretch.id)}
                        className="w-5 h-5 text-indigo-600"
                      />
                      <div>
                        <span className="font-semibold text-gray-800">{stretch.name}</span>
                        <span className="text-sm text-indigo-600 ml-2">({stretch.body})</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">{stretch.description}</p>
                  </div>
                  {!defaultStretches.find(s => s.id === stretch.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStretch(stretch.id);
                      }}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add New Stretch Form */}
          {showAddForm ? (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Add Custom Stretch</h3>
              <input
                type="text"
                placeholder="Stretch name"
                value={newStretch.name}
                onChange={(e) => setNewStretch({ ...newStretch, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Body part (e.g., Shoulders, Legs)"
                value={newStretch.body}
                onChange={(e) => setNewStretch({ ...newStretch, body: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Description"
                value={newStretch.description}
                onChange={(e) => setNewStretch({ ...newStretch, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="2"
              />
              <div className="flex gap-2">
                <button
                  onClick={addCustomStretch}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  Add Stretch
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewStretch({ name: '', body: '', description: '' });
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 mb-6"
            >
              <Plus size={20} />
              Add Custom Stretch
            </button>
          )}

          {/* Start Button */}
          <button
            onClick={startRoutine}
            disabled={selectedStretches.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              selectedStretches.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Routine ({selectedStretches.length} stretch{selectedStretches.length !== 1 ? 'es' : ''})
          </button>
        </div>
      </div>
    );
  }

  const currentStretch = selectedStretches[currentIndex];
  const progress = ((20 - timeLeft) / 20) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7////////////////////////////////////////////////////AAAAOUxhdmM1OC4xMzQAAAAAAAAAAAAAAAAkAAAAAAAAA4T8NHu2AAAAAAAAAAAAAAAAAAAAAP/7kGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7kGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==" type="audio/mpeg" />
      </audio>
      
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {!isComplete ? (
          <>
            {/* Header with Settings */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Stretching Routine</h1>
                <p className="text-gray-500">
                  Stretch {currentIndex + 1} of {selectedStretches.length}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsActive(false);
                  setShowSetup(true);
                }}
                className="text-gray-600 hover:text-indigo-600 transition-all"
              >
                <Settings size={28} />
              </button>
            </div>

            {/* Current Stretch Info */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
              <div className="text-sm font-semibold uppercase tracking-wide mb-2 opacity-90">
                {currentStretch.body}
              </div>
              <h2 className="text-2xl font-bold mb-3">{currentStretch.name}</h2>
              <p className="text-blue-100">{currentStretch.description}</p>
            </div>

            {/* Timer Display */}
            <div className="relative mb-8">
              <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="#4f46e5"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={565.48}
                  strokeDashoffset={565.48 - (565.48 * progress) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-gray-800">{timeLeft}</div>
                  <div className="text-gray-500 text-sm mt-1">seconds</div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={toggleTimer}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-all transform hover:scale-105"
              >
                {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
              </button>
              <button
                onClick={resetRoutine}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-4 shadow-lg transition-all transform hover:scale-105"
              >
                <RotateCcw size={28} />
              </button>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mt-8 flex-wrap">
              {selectedStretches.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-8 bg-indigo-600'
                      : idx < currentIndex
                      ? 'w-2 bg-indigo-400'
                      : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          /* Completion Screen */
          <div className="text-center py-8">
            <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Great Job!</h2>
            <p className="text-gray-600 mb-8">
              You've completed all {selectedStretches.length} stretches. Your body will thank you!
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={resetRoutine}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg transition-all transform hover:scale-105"
              >
                Start Again
              </button>
              <button
                onClick={() => setShowSetup(true)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <Settings size={20} />
                Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

