import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TestimonialsSection: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { t } = useLanguage();

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Mueller',
      role: 'Bremen Local',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      text: 'The best döner in Bremen! Fresh ingredients, perfect seasoning, and the staff is incredibly friendly. I come here at least twice a week.',
      location: 'Vegesack',
      favorite: 'Chicken Döner'
    },
    {
      id: 2,
      name: 'Michael Weber',
      role: 'Food Blogger',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      text: 'As someone who reviews restaurants professionally, Mr.Happy exceeded all expectations. The burger quality rivals high-end establishments.',
      location: 'Bremen Center',
      favorite: 'Hanseat Special Burger'
    },
    {
      id: 3,
      name: 'Anna Hoffmann',
      role: 'Family Mom',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      text: 'Perfect for family dinners! The restaurant has something for everyone - from traditional dishes to modern cuisine. Kids love it too!',
      location: 'Schwanewede',
      favorite: 'Family Platter'
    },
    {
      id: 4,
      name: 'Ahmet Yılmaz',
      role: 'Turkish Community Leader',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      text: 'Authentic Turkish flavors that remind me of home. The halal certification and traditional recipes make this place special for our community.',
      location: 'Bremen',
      favorite: 'Lamb Döner'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentTestimonial];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-red-500 mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              {t('testimonials.title')}
            </h2>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real reviews from real people who love visiting Mr.Happy restaurants across Bremen
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-700 shadow-2xl">
            {/* Quote Icon */}
            <div className="absolute top-6 left-6 text-red-500/20">
              <Quote className="w-16 h-16" />
            </div>

            {/* Rating */}
            <div className="flex items-center justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className="w-6 h-6 text-yellow-400 fill-current" 
                />
              ))}
            </div>

            {/* Testimonial Text */}
            <blockquote className="text-xl md:text-2xl text-gray-100 text-center leading-relaxed mb-8 relative z-10">
              "{current.text}"
            </blockquote>

            {/* Customer Info */}
            <div className="flex items-center justify-center space-x-4">
              <img 
                src={current.avatar} 
                alt={current.name}
                className="w-16 h-16 rounded-full border-2 border-red-500"
              />
              <div className="text-center">
                <h4 className="text-lg font-semibold text-white">{current.name}</h4>
                <p className="text-gray-400">{current.role}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                  <span>📍 {current.location}</span>
                  <span>•</span>
                  <span>❤️ {current.favorite}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button 
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Testimonial Indicators */}
        <div className="flex items-center justify-center space-x-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentTestimonial 
                  ? 'bg-red-500 scale-125' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-red-500 mb-2">500+</div>
            <div className="text-gray-300">{t('testimonials.happyCustomers')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-red-500 mb-2">4.9★</div>
            <div className="text-gray-300">{t('testimonials.averageRating')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-red-500 mb-2">3</div>
            <div className="text-gray-300">{t('testimonials.locations')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-red-500 mb-2">10+</div>
            <div className="text-gray-300">{t('testimonials.yearsExperience')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
