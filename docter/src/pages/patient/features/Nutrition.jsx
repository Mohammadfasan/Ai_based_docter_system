// pages/Nutrition.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaAppleAlt, FaTint, FaFire, FaChartPie,
  FaUtensils, FaLeaf, FaFish, FaEgg,
  FaBreadSlice, FaCarrot, FaCoffee, FaWineBottle,
  FaPlus, FaMinus, FaEdit, FaTrash,
  FaClock, FaCheckCircle, FaExclamationTriangle,
  FaHeart, FaWeight, FaRunning, FaCalendarDay, FaStar
} from 'react-icons/fa';

const Nutrition = () => {
  const [calories, setCalories] = useState({
    consumed: 1450,
    target: 2000,
    burned: 350,
    net: 1100
  });

  const [waterIntake, setWaterIntake] = useState({
    consumed: 1500,
    target: 2500,
    percentage: 60
  });

  const [meals, setMeals] = useState([
    { id: 1, name: 'Breakfast', time: '8:00 AM', calories: 350, items: ['Oatmeal', 'Banana', 'Milk'] },
    { id: 2, name: 'Lunch', time: '1:00 PM', calories: 550, items: ['Grilled Chicken', 'Brown Rice', 'Salad'] },
    { id: 3, name: 'Snack', time: '4:00 PM', calories: 200, items: ['Apple', 'Almonds'] },
    { id: 4, name: 'Dinner', time: '7:30 PM', calories: 450, items: ['Salmon', 'Quinoa', 'Broccoli'] }
  ]);

  const [foodAllergies, setFoodAllergies] = useState([
    { id: 1, name: 'Peanuts', severity: 'High', lastReaction: '2023-05-15' },
    { id: 2, name: 'Shellfish', severity: 'Medium', lastReaction: '2024-01-10' },
    { id: 3, name: 'Dairy', severity: 'Low', lastReaction: '2024-06-22' }
  ]);

  const [recipes, setRecipes] = useState([
    { id: 1, name: 'Mediterranean Bowl', calories: 420, prepTime: '20 min', rating: 4.8, tags: ['Healthy', 'Quick'] },
    { id: 2, name: 'Vegetable Stir Fry', calories: 380, prepTime: '25 min', rating: 4.6, tags: ['Vegan', 'Low Cal'] },
    { id: 3, name: 'Protein Smoothie', calories: 320, prepTime: '5 min', rating: 4.9, tags: ['Quick', 'Post-workout'] },
    { id: 4, name: 'Quinoa Salad', calories: 450, prepTime: '15 min', rating: 4.7, tags: ['Gluten-free', 'Salad'] }
  ]);

  const [mealPlan, setMealPlan] = useState({
    monday: ['Oatmeal', 'Chicken Salad', 'Greek Yogurt', 'Fish & Veggies'],
    tuesday: ['Smoothie', 'Quinoa Bowl', 'Nuts', 'Turkey & Rice'],
    wednesday: ['Eggs', 'Tuna Sandwich', 'Fruit', 'Vegetable Curry'],
    thursday: ['Protein Shake', 'Chickpea Salad', 'Protein Bar', 'Salmon & Asparagus'],
    friday: ['Greek Yogurt', 'Burrito Bowl', 'Apple', 'Steak & Sweet Potato']
  });

  const [macros, setMacros] = useState({
    protein: { consumed: 85, target: 120, percentage: 71 },
    carbs: { consumed: 180, target: 250, percentage: 72 },
    fat: { consumed: 45, target: 65, percentage: 69 }
  });

  const [healthConditions, setHealthConditions] = useState(['Diabetes', 'High Cholesterol']);
  const [dietaryPreferences, setDietaryPreferences] = useState(['Low Sugar', 'High Protein', 'Gluten Free']);

  const [newMeal, setNewMeal] = useState({ name: '', calories: '', time: '' });
  const [showAddMeal, setShowAddMeal] = useState(false);

  const addWater = (amount) => {
    setWaterIntake(prev => ({
      ...prev,
      consumed: Math.min(prev.consumed + amount, prev.target),
      percentage: Math.min(((prev.consumed + amount) / prev.target) * 100, 100)
    }));
  };

  const addMeal = () => {
    if (!newMeal.name || !newMeal.calories) return;

    const meal = {
      id: meals.length + 1,
      name: newMeal.name,
      time: newMeal.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calories: parseInt(newMeal.calories),
      items: [newMeal.name]
    };

    setMeals([...meals, meal]);
    setCalories(prev => ({
      ...prev,
      consumed: prev.consumed + parseInt(newMeal.calories),
      net: prev.net + parseInt(newMeal.calories)
    }));
    setNewMeal({ name: '', calories: '', time: '' });
    setShowAddMeal(false);
  };

  const removeMeal = (id) => {
    const meal = meals.find(m => m.id === id);
    setMeals(meals.filter(m => m.id !== id));
    setCalories(prev => ({
      ...prev,
      consumed: prev.consumed - meal.calories,
      net: prev.net - meal.calories
    }));
  };

  const addAllergy = () => {
    const allergy = {
      id: foodAllergies.length + 1,
      name: 'New Allergy',
      severity: 'Medium',
      lastReaction: new Date().toISOString().split('T')[0]
    };
    setFoodAllergies([...foodAllergies, allergy]);
  };

  const removeAllergy = (id) => {
    setFoodAllergies(foodAllergies.filter(a => a.id !== id));
  };

  const getSeverityColor = (severity) => {
    switch(severity.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMealIcon = (mealName) => {
    const name = mealName.toLowerCase();
    if (name.includes('oatmeal') || name.includes('cereal')) return <FaBreadSlice />;
    if (name.includes('chicken') || name.includes('turkey') || name.includes('meat')) return <FaEgg />;
    if (name.includes('fish') || name.includes('salmon') || name.includes('tuna')) return <FaFish />;
    if (name.includes('salad') || name.includes('vegetable')) return <FaCarrot />;
    if (name.includes('smoothie') || name.includes('shake')) return <FaCoffee />;
    return <FaUtensils />;
  };

  const getConditionMealPlan = (conditions) => {
    const plans = {
      diabetes: ['Low GI foods', 'High fiber', 'Lean protein', 'Healthy fats'],
      'high cholesterol': ['Oats', 'Nuts', 'Fatty fish', 'Avocado'],
      hypertension: ['Low sodium', 'Potassium-rich foods', 'Whole grains', 'Leafy greens'],
      default: ['Balanced diet', 'Portion control', 'Regular meals', 'Hydration']
    };

    return conditions.flatMap(cond => plans[cond.toLowerCase()] || []);
  };

  const conditionBasedMeals = getConditionMealPlan(healthConditions);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
            <FaAppleAlt className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nutrition & Diet Planner</h1>
            <p className="text-gray-600">Track your food, calories, and water intake</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <FaFire className="text-orange-500" />
              <span className="font-bold">Calories</span>
            </div>
            <div className={`text-sm px-2 py-1 rounded-full ${
              calories.net < calories.target ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {calories.net < calories.target ? 'Good' : 'Over'}
            </div>
          </div>
          <div className="text-3xl font-bold">{calories.consumed}</div>
          <div className="text-sm text-gray-600">Consumed / {calories.target} target</div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-orange-500 rounded-full"
              style={{ width: `${(calories.consumed / calories.target) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center space-x-2 mb-2">
            <FaTint className="text-blue-500" />
            <span className="font-bold">Water Intake</span>
          </div>
          <div className="text-3xl font-bold">{waterIntake.consumed}ml</div>
          <div className="text-sm text-gray-600">{waterIntake.percentage}% of target</div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${waterIntake.percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center space-x-2 mb-2">
            <FaRunning className="text-purple-500" />
            <span className="font-bold">Calories Burned</span>
          </div>
          <div className="text-3xl font-bold">{calories.burned}</div>
          <div className="text-sm text-gray-600">Through activity</div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-purple-500 rounded-full"
              style={{ width: `${(calories.burned / 500) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center space-x-2 mb-2">
            <FaChartPie className="text-teal-500" />
            <span className="font-bold">Net Calories</span>
          </div>
          <div className="text-3xl font-bold">{calories.net}</div>
          <div className="text-sm text-gray-600">Remaining for the day</div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full rounded-full ${
                calories.net > 0 ? 'bg-teal-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.abs((calories.net / calories.target) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Meals & Water */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Meals */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <FaUtensils className="text-orange-600" />
                <span>Today's Meals</span>
              </h2>
              <button
                onClick={() => setShowAddMeal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700"
              >
                <FaPlus />
                <span>Add Meal</span>
              </button>
            </div>

            {/* Add Meal Modal */}
            {showAddMeal && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-orange-800">Add New Meal</h3>
                  <button onClick={() => setShowAddMeal(false)} className="text-orange-600">✕</button>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Meal name"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Calories"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal({...newMeal, calories: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="time"
                    value={newMeal.time}
                    onChange={(e) => setNewMeal({...newMeal, time: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => setShowAddMeal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addMeal}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700"
                  >
                    Add Meal
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {meals.map((meal) => (
                <div key={meal.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      {getMealIcon(meal.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{meal.name}</h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span className="flex items-center">
                          <FaClock className="mr-1" />
                          {meal.time}
                        </span>
                        <span>{meal.calories} calories</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {meal.items.map((item, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => removeMeal(meal.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Total meals today: {meals.length}</div>
                <div className="font-bold text-gray-900">{calories.consumed} total calories</div>
              </div>
            </div>
          </div>

          {/* Water Intake Tracker */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Water Intake Tracker</h2>
                <p className="opacity-90">Stay hydrated throughout the day</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{waterIntake.consumed}ml</div>
                <div className="text-sm opacity-90">of {waterIntake.target}ml</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span>Hydration Progress</span>
                <span className="font-bold">{waterIntake.percentage}%</span>
              </div>
              <div className="h-4 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${waterIntake.percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[250, 500, 750, 1000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => addWater(amount)}
                  className="py-3 bg-white/20 hover:bg-white/30 rounded-lg flex flex-col items-center transition-all"
                >
                  <FaTint className="text-xl mb-1" />
                  <span className="font-bold">+{amount}ml</span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/30">
              <div className="flex items-center space-x-3">
                <FaExclamationTriangle />
                <span className="text-sm">Recommendation: Drink 8 glasses (250ml each) daily</span>
              </div>
            </div>
          </div>

          {/* Macronutrients */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <FaChartPie className="text-teal-600" />
              <span>Macronutrients</span>
            </h2>

            <div className="space-y-4">
              {Object.entries(macros).map(([macro, data]) => (
                <div key={macro} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${
                        macro === 'protein' ? 'bg-red-100 text-red-600' :
                        macro === 'carbs' ? 'bg-blue-100 text-blue-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {macro === 'protein' ? <FaEgg /> :
                         macro === 'carbs' ? <FaBreadSlice /> : <FaLeaf />}
                      </div>
                      <div>
                        <div className="font-bold capitalize">{macro}</div>
                        <div className="text-sm text-gray-600">
                          {data.consumed}g / {data.target}g target
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{data.percentage}%</div>
                      <div className="text-sm text-gray-600">of target</div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        macro === 'protein' ? 'bg-red-500' :
                        macro === 'carbs' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${data.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Recipes & Planning */}
        <div className="space-y-6">
          {/* Food Allergies */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <FaExclamationTriangle className="text-red-600" />
                <span>Food Allergies</span>
              </h2>
              <button
                onClick={addAllergy}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <FaPlus />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-3">
              {foodAllergies.map((allergy) => (
                <div key={allergy.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-sm ${getSeverityColor(allergy.severity)}`}>
                      {allergy.severity}
                    </div>
                    <div>
                      <div className="font-bold">{allergy.name}</div>
                      <div className="text-sm text-gray-600">Last reaction: {allergy.lastReaction}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeAllergy(allergy.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <FaExclamationTriangle className="text-yellow-600 text-xl mt-1" />
                <div>
                  <h3 className="font-bold text-yellow-800 mb-1">Safety First</h3>
                  <p className="text-yellow-700 text-sm">
                    Always check food labels and inform restaurants about your allergies. 
                    Carry emergency medication if prescribed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recipe Suggestions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <FaLeaf className="text-green-600" />
                <span>Recipe Suggestions</span>
              </h2>
              <button className="text-sm text-teal-600 hover:text-teal-700">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{recipe.name}</h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                        <span>{recipe.calories} cal</span>
                        <span>•</span>
                        <span>{recipe.prepTime}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <FaStar className="text-yellow-500 mr-1" />
                          {recipe.rating}
                        </span>
                      </div>
                    </div>
                    <button className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg">
                      <FaPlus />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Meal Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <FaCalendarDay className="text-purple-600" />
              <span>Weekly Meal Plan</span>
            </h2>

            <div className="space-y-4">
              {Object.entries(mealPlan).map(([day, meals]) => (
                <div key={day} className="p-3 border rounded-lg">
                  <div className="font-bold capitalize text-purple-700 mb-2">{day}</div>
                  <div className="space-y-1">
                    {meals.map((meal, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        <span className="text-gray-700">{meal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Health Conditions & Recommendations */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Personalized Recommendations</h2>
            
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <FaHeart />
                <span className="font-bold">Health Conditions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {healthConditions.map((condition, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {condition}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <FaLeaf />
                <span className="font-bold">Dietary Preferences</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {dietaryPreferences.map((pref, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {pref}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/30">
              <div className="font-bold mb-2">Recommended Foods</div>
              <div className="text-sm opacity-90">
                {conditionBasedMeals.slice(0, 4).join(' • ')}
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nutrition Tips</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FaCheckCircle className="text-green-500 mt-1" />
                <div>
                  <div className="font-medium">Eat protein with every meal</div>
                  <div className="text-sm text-gray-600">Helps maintain muscle mass</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaCheckCircle className="text-green-500 mt-1" />
                <div>
                  <div className="font-medium">Include fiber-rich foods</div>
                  <div className="text-sm text-gray-600">Aids digestion and satiety</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaCheckCircle className="text-green-500 mt-1" />
                <div>
                  <div className="font-medium">Stay hydrated</div>
                  <div className="text-sm text-gray-600">Drink water before meals</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaCheckCircle className="text-green-500 mt-1" />
                <div>
                  <div className="font-medium">Practice portion control</div>
                  <div className="text-sm text-gray-600">Use smaller plates</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;