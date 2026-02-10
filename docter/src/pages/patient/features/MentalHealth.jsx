// pages/MentalHealth.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaBrain, FaSmile, FaFrown, FaMeh, FaHeart, 
  FaHeadphones, FaCalendarAlt, FaUserMd, FaChartLine,
  FaPlayCircle, FaPauseCircle, FaVolumeUp, FaLeaf,
  FaUsers, FaCommentMedical, FaMoon, FaSun,
  FaCloud, FaCloudRain, FaStar, FaCheckCircle
} from 'react-icons/fa';

const MentalHealth = () => {
  const [mood, setMood] = useState('neutral');
  const [moodLog, setMoodLog] = useState([
    { date: '2024-12-15', mood: 'happy', notes: 'Had a productive day', energy: 8 },
    { date: '2024-12-14', mood: 'neutral', notes: 'Regular day', energy: 5 },
    { date: '2024-12-13', mood: 'sad', notes: 'Feeling tired', energy: 3 },
    { date: '2024-12-12', mood: 'happy', notes: 'Met friends', energy: 7 },
    { date: '2024-12-11', mood: 'neutral', notes: 'Work from home', energy: 6 }
  ]);

  const [stressLevel, setStressLevel] = useState(4);
  const [anxietyScore, setAnxietyScore] = useState(5);
  const [depressionScore, setDepressionScore] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(7);

  const [meditationProgress, setMeditationProgress] = useState(0);
  const [isMeditating, setIsMeditating] = useState(false);
  const [meditationTime, setMeditationTime] = useState(0);

  const [therapists, setTherapists] = useState([
    { id: 1, name: 'Dr. Priya Sharma', specialty: 'Anxiety & Depression', rating: 4.8, available: true, sessions: 245 },
    { id: 2, name: 'Dr. Raj Kumar', specialty: 'Stress Management', rating: 4.7, available: true, sessions: 189 },
    { id: 3, name: 'Dr. Ananya Patel', specialty: 'Cognitive Behavioral Therapy', rating: 4.9, available: false, sessions: 312 },
    { id: 4, name: 'Dr. Michael Chen', specialty: 'Mindfulness & Meditation', rating: 4.6, available: true, sessions: 156 }
  ]);

  const [meditations, setMeditations] = useState([
    { id: 1, title: 'Morning Calm', duration: '10 min', type: 'Mindfulness', completed: true },
    { id: 2, title: 'Stress Relief', duration: '15 min', type: 'Breathing', completed: false },
    { id: 3, title: 'Sleep Meditation', duration: '20 min', type: 'Guided', completed: true },
    { id: 4, title: 'Anxiety Reduction', duration: '12 min', type: 'Focus', completed: false }
  ]);

  const [breathingExercise, setBreathingExercise] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathCount, setBreathCount] = useState(0);

  // Mood tracking
  const logMood = (selectedMood) => {
    setMood(selectedMood);
    const newLog = {
      date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      notes: '',
      energy: Math.floor(Math.random() * 10) + 1
    };
    setMoodLog([newLog, ...moodLog]);
    alert(`Mood logged as ${selectedMood}`);
  };

  // Meditation timer
  useEffect(() => {
    let interval;
    if (isMeditating) {
      interval = setInterval(() => {
        setMeditationTime(prev => prev + 1);
        setMeditationProgress(prev => Math.min(prev + 0.83, 100)); // 2 minutes = 100%
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMeditating]);

  const startMeditation = () => {
    setIsMeditating(true);
  };

  const stopMeditation = () => {
    setIsMeditating(false);
    if (meditationTime >= 120) { // 2 minutes
      alert('Great job! You completed your meditation session.');
    }
  };

  // Breathing exercise
  useEffect(() => {
    if (breathingExercise) {
      const phases = ['inhale', 'hold', 'exhale', 'hold'];
      let phaseIndex = 0;
      
      const interval = setInterval(() => {
        setBreathPhase(phases[phaseIndex]);
        phaseIndex = (phaseIndex + 1) % phases.length;
        
        if (phaseIndex === 0) {
          setBreathCount(prev => prev + 1);
        }
      }, 4000); // 4 seconds per phase

      return () => clearInterval(interval);
    }
  }, [breathingExercise]);

  const startBreathingExercise = () => {
    setBreathingExercise(true);
    setBreathCount(0);
  };

  const stopBreathingExercise = () => {
    setBreathingExercise(false);
  };

  // Mood icons
  const getMoodIcon = (moodType) => {
    switch(moodType) {
      case 'happy': return <FaSmile className="text-3xl text-yellow-500" />;
      case 'sad': return <FaFrown className="text-3xl text-blue-500" />;
      case 'neutral': return <FaMeh className="text-3xl text-gray-500" />;
      case 'energetic': return <FaSun className="text-3xl text-orange-500" />;
      case 'calm': return <FaLeaf className="text-3xl text-green-500" />;
      default: return <FaSmile className="text-3xl text-gray-400" />;
    }
  };

  const getMoodColor = (moodType) => {
    switch(moodType) {
      case 'happy': return 'bg-yellow-100 border-yellow-200';
      case 'sad': return 'bg-blue-100 border-blue-200';
      case 'neutral': return 'bg-gray-100 border-gray-200';
      case 'energetic': return 'bg-orange-100 border-orange-200';
      case 'calm': return 'bg-green-100 border-green-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <FaBrain className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mental Health & Wellness</h1>
            <p className="text-gray-600">Take care of your mind, body, and soul</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Mood & Assessment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mood Tracker */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <FaSmile className="text-yellow-500" />
                <span>Today's Mood Tracker</span>
              </h2>
              <div className="text-sm text-gray-600">
                Current mood: <span className="font-bold capitalize">{mood}</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">How are you feeling today?</p>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { type: 'sad', label: 'Sad', icon: <FaFrown className="text-4xl text-blue-500" /> },
                  { type: 'neutral', label: 'Neutral', icon: <FaMeh className="text-4xl text-gray-500" /> },
                  { type: 'happy', label: 'Happy', icon: <FaSmile className="text-4xl text-yellow-500" /> },
                  { type: 'energetic', label: 'Energetic', icon: <FaSun className="text-4xl text-orange-500" /> },
                  { type: 'calm', label: 'Calm', icon: <FaLeaf className="text-4xl text-green-500" /> }
                ].map((moodItem) => (
                  <button
                    key={moodItem.type}
                    onClick={() => logMood(moodItem.type)}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      mood === moodItem.type 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    {moodItem.icon}
                    <span className="mt-2 font-medium">{moodItem.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood History */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Mood History (Last 5 days)</h3>
              <div className="space-y-3">
                {moodLog.slice(0, 5).map((log, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg ${getMoodColor(log.mood)}`}
                  >
                    <div className="flex items-center space-x-3">
                      {getMoodIcon(log.mood)}
                      <div>
                        <div className="font-medium capitalize">{log.mood}</div>
                        <div className="text-sm text-gray-600">{log.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">Energy: {log.energy}/10</div>
                      <div className="text-sm text-gray-600">{log.notes}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mental Health Assessment */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <FaChartLine className="text-teal-600" />
              <span>Mental Health Assessment</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Stress Level */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-900">Stress Level</span>
                  <span className={`font-bold ${
                    stressLevel <= 3 ? 'text-green-600' :
                    stressLevel <= 7 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {stressLevel}/10
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full rounded-full ${
                      stressLevel <= 3 ? 'bg-green-500' :
                      stressLevel <= 7 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${stressLevel * 10}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Low</span>
                  <span>Moderate</span>
                  <span>High</span>
                </div>
                <button className="w-full mt-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200">
                  Take Stress Test
                </button>
              </div>

              {/* Anxiety Score */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-900">Anxiety Score</span>
                  <span className={`font-bold ${
                    anxietyScore <= 3 ? 'text-green-600' :
                    anxietyScore <= 7 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {anxietyScore}/10
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full rounded-full ${
                      anxietyScore <= 3 ? 'bg-green-500' :
                      anxietyScore <= 7 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${anxietyScore * 10}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {anxietyScore <= 3 ? 'Mild anxiety' : 
                   anxietyScore <= 7 ? 'Moderate anxiety' : 'Severe anxiety'}
                </div>
                <button className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                  Anxiety Screening
                </button>
              </div>

              {/* Depression Score */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-900">Depression Score</span>
                  <span className={`font-bold ${
                    depressionScore <= 3 ? 'text-green-600' :
                    depressionScore <= 7 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {depressionScore}/10
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full rounded-full ${
                      depressionScore <= 3 ? 'bg-green-500' :
                      depressionScore <= 7 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${depressionScore * 10}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {depressionScore <= 3 ? 'Minimal depression' : 
                   depressionScore <= 7 ? 'Mild depression' : 'Moderate depression'}
                </div>
                <button className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
                  PHQ-9 Assessment
                </button>
              </div>

              {/* Sleep Quality */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-900">Sleep Quality</span>
                  <span className={`font-bold ${
                    sleepQuality >= 7 ? 'text-green-600' :
                    sleepQuality >= 4 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {sleepQuality}/10
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full rounded-full ${
                      sleepQuality >= 7 ? 'bg-green-500' :
                      sleepQuality >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${sleepQuality * 10}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {sleepQuality >= 7 ? 'Good sleep' : 
                   sleepQuality >= 4 ? 'Average sleep' : 'Poor sleep'}
                </div>
                <button className="w-full py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200">
                  Sleep Tracker
                </button>
              </div>
            </div>
          </div>

          {/* Breathing Exercise */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Breathing Exercise</h2>
                <p className="opacity-90">Calm your mind with guided breathing</p>
              </div>
              <div className="text-3xl font-bold">
                {breathingExercise ? `${breathCount} breaths` : 'Ready'}
              </div>
            </div>

            {breathingExercise ? (
              <div className="text-center py-8">
                <div className="text-6xl font-bold mb-4 animate-pulse">
                  {breathPhase === 'inhale' && '🌬️'}
                  {breathPhase === 'hold' && '⏸️'}
                  {breathPhase === 'exhale' && '💨'}
                </div>
                <div className="text-3xl font-bold mb-2 capitalize">{breathPhase}</div>
                <div className="text-lg opacity-90 mb-6">
                  {breathPhase === 'inhale' && 'Breathe in slowly... (4 seconds)'}
                  {breathPhase === 'hold' && 'Hold your breath... (4 seconds)'}
                  {breathPhase === 'exhale' && 'Breathe out slowly... (4 seconds)'}
                </div>
                <button
                  onClick={stopBreathingExercise}
                  className="px-6 py-3 bg-white text-teal-600 rounded-lg font-bold hover:bg-gray-100"
                >
                  Stop Exercise
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-6">🧘‍♀️</div>
                <p className="text-lg mb-6 opacity-90">
                  4-4-4 breathing technique: Inhale (4s), Hold (4s), Exhale (4s)
                </p>
                <button
                  onClick={startBreathingExercise}
                  className="px-6 py-3 bg-white text-teal-600 rounded-lg font-bold hover:bg-gray-100"
                >
                  Start Breathing Exercise
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Meditation & Therapists */}
        <div className="space-y-6">
          {/* Meditation Guide */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <FaHeadphones className="text-purple-600" />
              <span>Meditation Guides</span>
            </h2>

            {isMeditating ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">🧘‍♂️</div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {Math.floor(meditationTime / 60)}:{String(meditationTime % 60).padStart(2, '0')}
                </div>
                <div className="text-gray-600 mb-6">Focus on your breath</div>
                
                {/* Progress Bar */}
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: `${meditationProgress}%` }}
                  ></div>
                </div>

                <button
                  onClick={stopMeditation}
                  className="flex items-center justify-center space-x-2 w-full py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  <FaPauseCircle />
                  <span>End Meditation</span>
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {meditations.map((meditation) => (
                    <div key={meditation.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FaPlayCircle className="text-purple-600" />
                        </div>
                        <div>
                          <div className="font-bold">{meditation.title}</div>
                          <div className="text-sm text-gray-600">
                            {meditation.duration} • {meditation.type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {meditation.completed && (
                          <FaCheckCircle className="text-green-500" />
                        )}
                        <button className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-sm">
                          Play
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={startMeditation}
                  className="flex items-center justify-center space-x-2 w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700"
                >
                  <FaPlayCircle />
                  <span>Start 2-Minute Meditation</span>
                </button>
              </>
            )}
          </div>

          {/* Therapist Matching */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <FaUserMd className="text-teal-600" />
                <span>Therapist Matching</span>
              </h2>
              <button className="text-sm text-teal-600 hover:text-teal-700">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {therapists.map((therapist) => (
                <div key={therapist.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                        {therapist.name.split(' ')[1][0]}
                      </div>
                      <div>
                        <div className="font-bold">{therapist.name}</div>
                        <div className="text-sm text-gray-600">{therapist.specialty}</div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      therapist.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {therapist.available ? 'Available' : 'Busy'}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <FaStar className="text-yellow-500" />
                      <span>{therapist.rating}</span>
                      <span className="text-gray-600">({therapist.sessions} sessions)</span>
                    </div>
                    <button className="px-3 py-1 bg-teal-100 text-teal-600 rounded-lg hover:bg-teal-200">
                      Book Session
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button className="w-full py-3 border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50">
                Find More Therapists
              </button>
            </div>
          </div>

          {/* Wellness Tips */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Daily Wellness Tip</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FaHeart className="text-xl mt-1" />
                <div>
                  <p className="font-medium">Practice gratitude daily</p>
                  <p className="text-sm opacity-90">Write down 3 things you're grateful for each day</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaLeaf className="text-xl mt-1" />
                <div>
                  <p className="font-medium">Take nature breaks</p>
                  <p className="text-sm opacity-90">Spend 15 minutes outside in nature daily</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaUsers className="text-xl mt-1" />
                <div>
                  <p className="font-medium">Social connection</p>
                  <p className="text-sm opacity-90">Connect with loved ones regularly</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Resources */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <FaCommentMedical className="text-red-600" />
              <span>Emergency Resources</span>
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-bold text-red-800 mb-1">Suicide Prevention Helpline</div>
                <div className="text-red-700">1-800-273-8255</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-bold text-blue-800 mb-1">Crisis Text Line</div>
                <div className="text-blue-700">Text HOME to 741741</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-bold text-green-800 mb-1">Mental Health Emergency</div>
                <div className="text-green-700">911 or nearest hospital</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalHealth;