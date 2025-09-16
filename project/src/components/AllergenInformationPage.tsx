import React from 'react';
import { AlertTriangle, Phone, Mail, Info, Shield, Utensils } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const AllergenInformationPage: React.FC = () => {
  const { t } = useLanguage();

  const allergens = [
    { id: 'A', name: t('allergens.gluten.name'), description: t('allergens.gluten.description'), icon: '🌾' },
    { id: 'B', name: t('allergens.crustaceans.name'), description: t('allergens.crustaceans.description'), icon: '🦐' },
    { id: 'C', name: t('allergens.eggs.name'), description: t('allergens.eggs.description'), icon: '🥚' },
    { id: 'D', name: t('allergens.fish.name'), description: t('allergens.fish.description'), icon: '🐟' },
    { id: 'E', name: t('allergens.peanuts.name'), description: t('allergens.peanuts.description'), icon: '🥜' },
    { id: 'F', name: t('allergens.soy.name'), description: t('allergens.soy.description'), icon: '🫘' },
    { id: 'G', name: t('allergens.milk.name'), description: t('allergens.milk.description'), icon: '🥛' },
    { id: 'H', name: t('allergens.nuts.name'), description: t('allergens.nuts.description'), icon: '🌰' },
    { id: 'I', name: t('allergens.celery.name'), description: t('allergens.celery.description'), icon: '🥬' },
    { id: 'J', name: t('allergens.mustard.name'), description: t('allergens.mustard.description'), icon: '🌭' },
    { id: 'K', name: t('allergens.sesame.name'), description: t('allergens.sesame.description'), icon: '🫘' },
    { id: 'L', name: t('allergens.sulfites.name'), description: t('allergens.sulfites.description'), icon: '🍷' },
    { id: 'M', name: t('allergens.lupin.name'), description: t('allergens.lupin.description'), icon: '🌱' },
    { id: 'N', name: t('allergens.mollusks.name'), description: t('allergens.mollusks.description'), icon: '🦪' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">{t('allergens.title')}</h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              {t('allergens.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Important Notice */}
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-red-300 mb-2">{t('allergens.warning.title')}</h2>
              <p className="text-red-100 mb-4">{t('allergens.warning.text')}</p>
              <p className="text-red-100 font-medium">{t('allergens.warning.responsibility')}</p>
            </div>
          </div>
        </div>

        {/* Legal Basis */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-blue-400 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-blue-300 mb-2">{t('allergens.legal.title')}</h2>
              <p className="text-gray-300 mb-2">{t('allergens.legal.eu_regulation')}</p>
              <p className="text-gray-300">{t('allergens.legal.german_law')}</p>
            </div>
          </div>
        </div>

        {/* Allergen List */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('allergens.list.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allergens.map((allergen) => (
              <div key={allergen.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-3xl">{allergen.icon}</span>
                  <div>
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                      {allergen.id}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{allergen.name}</h3>
                <p className="text-gray-300 text-sm">{allergen.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cross Contamination Info */}
        <div className="bg-orange-900/30 border border-orange-500 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Utensils className="w-6 h-6 text-orange-400 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-orange-300 mb-2">{t('allergens.cross_contamination.title')}</h2>
              <p className="text-orange-100 mb-4">{t('allergens.cross_contamination.warning')}</p>
              <div className="space-y-2">
                <p className="text-orange-100">• {t('allergens.cross_contamination.shared_equipment')}</p>
                <p className="text-orange-100">• {t('allergens.cross_contamination.shared_surfaces')}</p>
                <p className="text-orange-100">• {t('allergens.cross_contamination.storage')}</p>
                <p className="text-orange-100">• {t('allergens.cross_contamination.preparation')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Information */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('allergens.menu.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">{t('allergens.menu.labeling.title')}</h3>
              <p className="text-gray-300 mb-2">{t('allergens.menu.labeling.description')}</p>
              <p className="text-gray-300">{t('allergens.menu.labeling.example')}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">{t('allergens.menu.updates.title')}</h3>
              <p className="text-gray-300 mb-2">{t('allergens.menu.updates.description')}</p>
              <p className="text-gray-300">{t('allergens.menu.updates.recommendation')}</p>
            </div>
          </div>
        </div>

        {/* Special Diets */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('allergens.special_diets.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">{t('allergens.special_diets.halal.title')}</h3>
              <p className="text-gray-300 text-sm">{t('allergens.special_diets.halal.description')}</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🥗</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">{t('allergens.special_diets.vegetarian.title')}</h3>
              <p className="text-gray-300 text-sm">{t('allergens.special_diets.vegetarian.description')}</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌾</span>
              </div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">{t('allergens.special_diets.glutenfree.title')}</h3>
              <p className="text-gray-300 text-sm">{t('allergens.special_diets.glutenfree.description')}</p>
            </div>
          </div>
        </div>

        {/* Customer Responsibilities */}
        <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-yellow-400 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-yellow-300 mb-2">{t('allergens.customer_responsibility.title')}</h2>
              <div className="space-y-2">
                <p className="text-yellow-100">• {t('allergens.customer_responsibility.inform')}</p>
                <p className="text-yellow-100">• {t('allergens.customer_responsibility.verify')}</p>
                <p className="text-yellow-100">• {t('allergens.customer_responsibility.questions')}</p>
                <p className="text-yellow-100">• {t('allergens.customer_responsibility.risk')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-red-900/40 border border-red-400 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-red-300 mb-4">{t('allergens.emergency.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">{t('allergens.emergency.reaction.title')}</h3>
              <p className="text-red-100 mb-2">{t('allergens.emergency.reaction.description')}</p>
              <p className="text-red-100 font-bold">{t('allergens.emergency.reaction.call')} 112</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">{t('allergens.emergency.questions.title')}</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-red-400" />
                  <span className="text-red-100">+49 421 123456</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-red-400" />
                  <span className="text-red-100">allergen@mrhappy-bremen.de</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">{t('allergens.contact.title')}</h2>
          <p className="text-gray-300 mb-4">{t('allergens.contact.description')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">Mr.Happy Döner (Vegesack)</h3>
              <div className="space-y-1 text-gray-300">
                <p>Bremen Vegesack Kaufland</p>
                <p>Zum Alten Speicher 1, 28759 Bremen</p>
                <p>Tel: +49 421 123456</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Mr.Happy Burger (Vegesack)</h3>
              <div className="space-y-1 text-gray-300">
                <p>Bremen Vegesack Kaufland</p>
                <p>Zum Alten Speicher 1, 28759 Bremen</p>
                <p>Tel: +49 421 123457</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Mr.Happy Döner & Pizza</h3>
              <div className="space-y-1 text-gray-300">
                <p>Bremen-Heidkamp 25</p>
                <p>28790 Schwanewede</p>
                <p>Tel: +49 421 123458</p>
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center mt-8 text-gray-400">
          <p>{t('allergens.last_updated')}: August 2025</p>
          <p className="text-sm">{t('allergens.regulation_reference')}: EU-VO 1169/2011 (LMIV)</p>
        </div>
      </div>
    </div>
  );
};

export default AllergenInformationPage;
