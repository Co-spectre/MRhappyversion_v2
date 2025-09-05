import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, ChefHat, UtensilsCrossed, Beef, Pizza } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onViewChange?: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onViewChange }) => {
  const { t } = useLanguage();

  const currentYear = new Date().getFullYear();

  const locations = [
    {
      name: 'Mr.Happy Döner',
      address: 'Bremen Vegesack Kaufland - Zum Alten Speicher 1 · 28759 Bremen',
      phone: '+49 421 123456',
      icon: <UtensilsCrossed className="w-4 h-4" />
    },
    {
      name: 'Mr.Happy Burger',
      address: 'Bremen Vegesack Kaufland - Zum Alten Speicher 1 · 28759 Bremen',
      phone: '+49 421 123457',
      icon: <Beef className="w-4 h-4" />
    },
    {
      name: 'Mr.Happy Döner & Pizza',
      address: 'Bremen-Heidkamp 25 · 28790 Schwanewede',
      phone: '+49 421 123458',
      icon: <Pizza className="w-4 h-4" />
    }
  ];

  const quickLinks = [
    { name: t('nav.home'), href: 'home' },
    { name: t('nav.menu'), href: 'menu' },
    { name: t('nav.about'), href: 'about' }
  ];

  const legalLinks = [
    { name: 'Impressum', href: 'impressum' },
    { name: t('nav.privacy'), href: 'privacy' },
    { name: t('nav.terms'), href: 'terms' },
    { name: t('nav.cookies'), href: 'cookies' },
    { name: t('nav.allergens'), href: 'allergens' }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, href: 'https://facebook.com/mrhappy' },
    { name: 'Instagram', icon: <Instagram className="w-5 h-5" />, href: 'https://instagram.com/mrhappy' },
    { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, href: 'https://twitter.com/mrhappy' }
  ];

  const handleNavigation = (href: string) => {
    if (onViewChange) {
      onViewChange(href);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Fallback for custom event
      const event = new CustomEvent('navigate', { detail: href });
      window.dispatchEvent(event);
    }
  };

  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <ChefHat className="w-8 h-8 text-red-500" />
              <h3 className="text-2xl font-bold text-white">
                Mr.<span className="text-red-500">Happy</span>
              </h3>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Three unique restaurant experiences delivering authentic flavors and exceptional service across Bremen.
            </p>
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <Mail className="w-4 h-4 text-red-500" />
              <a href="mailto:info@mrhappy.de" className="hover:text-white transition-colors">
                info@mrhappy.de
              </a>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Phone className="w-4 h-4 text-red-500" />
              <a href="tel:+4942112345" className="hover:text-white transition-colors">
                +49 421 12345
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNavigation(link.href)}
                    className="text-gray-400 hover:text-red-400 transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Our Locations</h4>
            <div className="space-y-4">
              {locations.map((location, index) => (
                <div key={index} className="text-gray-400">
                  <div className="flex items-center space-x-2 mb-1">
                    {location.icon}
                    <span className="font-medium text-white text-sm">{location.name}</span>
                  </div>
                  <div className="flex items-start space-x-2 mb-1">
                    <MapPin className="w-3 h-3 text-red-500 mt-1 flex-shrink-0" />
                    <p className="text-xs leading-relaxed">{location.address}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3 h-3 text-red-500" />
                    <a href={`tel:${location.phone}`} className="text-xs hover:text-white transition-colors">
                      {location.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opening Hours & Social */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Opening Hours</h4>
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-2 text-gray-400">
                <Clock className="w-4 h-4 text-red-500" />
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Mon - Sat:</span>
                    <span className="text-green-400">08:00 - 20:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="text-red-400">Closed</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    *Schwanewede: Daily 11:00-22:00
                  </div>
                </div>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-red-500 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {currentYear} Mr.Happy Restaurants. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center space-x-4 md:space-x-6">
              {legalLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavigation(link.href)}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </div>

            {/* Certification/Quality Badges */}
            <div className="flex items-center space-x-4">
              <div className="text-xs text-gray-500 text-center">
                <div className="w-12 h-8 bg-gray-800 rounded border border-gray-600 flex items-center justify-center mb-1">
                  <span className="text-green-400 font-bold text-xs">HALAL</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 text-center">
                <div className="w-12 h-8 bg-gray-800 rounded border border-gray-600 flex items-center justify-center mb-1">
                  <span className="text-blue-400 font-bold text-xs">FRESH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
