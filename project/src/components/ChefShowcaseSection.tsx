import React from 'react';
import { ChefHat, Award, Clock, Users } from 'lucide-react';

const ChefShowcaseSection: React.FC = () => {
  const chefs = [
    {
      id: 1,
      name: 'Chef Mehmet Özkan',
      role: 'Head Chef & Founder',
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=500&q=80',
      experience: '15+ Years',
      specialty: 'Traditional Turkish Cuisine',
      achievement: 'Master of Döner Arts',
      description: 'Bringing authentic Turkish flavors to Bremen with family recipes passed down through generations.',
      signature: 'Secret Spice Blend Döner'
    },
    {
      id: 2,
      name: 'Chef Emma Schmidt',
      role: 'Burger Master',
      image: 'https://images.unsplash.com/photo-1594736797933-d0cc4e042a8f?auto=format&fit=crop&w=500&q=80',
      experience: '12+ Years',
      specialty: 'American Grill & Fusion',
      achievement: 'Bremen Burger Champion 2023',
      description: 'Creating innovative burger experiences with locally sourced ingredients and creative combinations.',
      signature: 'Hanseat Special Burger'
    },
    {
      id: 3,
      name: 'Chef Marco Benedetti',
      role: 'Fine Dining Chef',
      image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=500&q=80',
      experience: '18+ Years',
      specialty: 'Mediterranean & Modern European',
      achievement: 'Michelin Guide Recognition',
      description: 'Elevating casual dining with sophisticated techniques and seasonal menu creations.',
      signature: 'Truffle Mushroom Risotto'
    }
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="w-8 h-8 text-red-500 mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Meet Our <span className="text-red-500">Master</span> Chefs
            </h2>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Talented culinary artists who bring passion, creativity, and authentic flavors to every dish
          </p>
        </div>

        {/* Chefs Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {chefs.map((chef) => (
            <div 
              key={chef.id}
              className="group relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-red-500 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2"
            >
              {/* Chef Image */}
              <div className="relative h-80 overflow-hidden">
                <img 
                  src={chef.image} 
                  alt={chef.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                
                {/* Achievement Badge */}
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>{chef.achievement}</span>
                </div>

                {/* Chef Name & Role */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-1">{chef.name}</h3>
                  <p className="text-red-400 font-medium">{chef.role}</p>
                </div>
              </div>

              {/* Chef Details */}
              <div className="p-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span className="text-sm">{chef.experience}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Users className="w-4 h-4 text-red-500" />
                    <span className="text-sm">{chef.specialty}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {chef.description}
                </p>

                {/* Signature Dish */}
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                  <div className="flex items-center space-x-2 mb-1">
                    <ChefHat className="w-4 h-4 text-red-500" />
                    <span className="text-red-400 text-sm font-semibold">Signature Dish</span>
                  </div>
                  <p className="text-white font-medium">{chef.signature}</p>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-3">
              Experience Culinary Excellence
            </h3>
            <p className="text-red-100 mb-6">
              Each dish is crafted with passion, using time-honored techniques and the finest ingredients
            </p>
            <button className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-xl font-semibold transition-colors">
              Book a Chef's Table
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChefShowcaseSection;
