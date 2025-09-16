import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Eye, Database, Users, Mail, Phone, MapPin, Calendar, Info } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-900 min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 p-8 border-b border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-light text-white">{t('privacy.title')}</h1>
            </div>
            <p className="text-blue-200 text-lg">{t('privacy.subtitle')}</p>
            <p className="text-gray-300 text-sm mt-2">{t('privacy.lastUpdated')}: 21. August 2025</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Introduction */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Info className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">{t('privacy.intro.title')}</h2>
              </div>
              <p className="text-gray-300 leading-relaxed mb-4">
                {t('privacy.intro.text1')}
              </p>
              <p className="text-gray-300 leading-relaxed">
                {t('privacy.intro.text2')}
              </p>
            </section>

            {/* Data Controller */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">{t('privacy.controller.title')}</h2>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-white font-semibold">Mr.Happy GmbH</p>
                    <div className="flex items-center space-x-2 text-gray-300 mt-2">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span>Musterstraße 123, 28199 Bremen</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300 mt-1">
                      <Phone className="w-4 h-4 text-blue-400" />
                      <span>+49 (0) 421 123 456</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300 mt-1">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span>datenschutz@mrhappy-bremen.de</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">
                      {t('privacy.controller.representative')}
                    </p>
                    <p className="text-white font-medium mt-1">Max Mustermann</p>
                    <p className="text-gray-300 text-sm mt-2">
                      {t('privacy.controller.dpo')}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Collection */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Database className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">{t('privacy.collection.title')}</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">{t('privacy.collection.orders.title')}</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('privacy.collection.orders.data1')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('privacy.collection.orders.data2')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('privacy.collection.orders.data3')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('privacy.collection.orders.data4')}</span>
                    </li>
                  </ul>
                  <p className="text-gray-400 text-sm mt-3">
                    <strong>{t('privacy.collection.legal_basis')}:</strong> {t('privacy.collection.orders.basis')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-3">{t('privacy.collection.website.title')}</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('privacy.collection.website.data1')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('privacy.collection.website.data2')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('privacy.collection.website.data3')}</span>
                    </li>
                  </ul>
                  <p className="text-gray-400 text-sm mt-3">
                    <strong>{t('privacy.collection.legal_basis')}:</strong> {t('privacy.collection.website.basis')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-3">{t('privacy.collection.jobs.title')}</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('privacy.collection.jobs.data1')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('privacy.collection.jobs.data2')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('privacy.collection.jobs.data3')}</span>
                    </li>
                  </ul>
                  <p className="text-gray-400 text-sm mt-3">
                    <strong>{t('privacy.collection.legal_basis')}:</strong> {t('privacy.collection.jobs.basis')}
                  </p>
                </div>
              </div>
            </section>

            {/* Data Usage */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">{t('privacy.usage.title')}</h2>
              </div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t('privacy.usage.purpose1')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t('privacy.usage.purpose2')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t('privacy.usage.purpose3')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t('privacy.usage.purpose4')}</span>
                </li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">{t('privacy.cookies.title')}</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                {t('privacy.cookies.description')}
              </p>
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-3">{t('privacy.cookies.types')}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-medium">{t('privacy.cookies.necessary.title')}</h4>
                    <p className="text-gray-300 text-sm mt-1">{t('privacy.cookies.necessary.description')}</p>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{t('privacy.cookies.functional.title')}</h4>
                    <p className="text-gray-300 text-sm mt-1">{t('privacy.cookies.functional.description')}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">{t('privacy.retention.title')}</h2>
              </div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t('privacy.retention.orders')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t('privacy.retention.accounts')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t('privacy.retention.applications')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t('privacy.retention.logs')}</span>
                </li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">{t('privacy.rights.title')}</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                {t('privacy.rights.intro')}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <span className="text-white font-medium">{t('privacy.rights.access.title')}</span>
                      <p className="text-gray-400 text-sm">{t('privacy.rights.access.description')}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <span className="text-white font-medium">{t('privacy.rights.rectification.title')}</span>
                      <p className="text-gray-400 text-sm">{t('privacy.rights.rectification.description')}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <span className="text-white font-medium">{t('privacy.rights.erasure.title')}</span>
                      <p className="text-gray-400 text-sm">{t('privacy.rights.erasure.description')}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <span className="text-white font-medium">{t('privacy.rights.restriction.title')}</span>
                      <p className="text-gray-400 text-sm">{t('privacy.rights.restriction.description')}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <span className="text-white font-medium">{t('privacy.rights.portability.title')}</span>
                      <p className="text-gray-400 text-sm">{t('privacy.rights.portability.description')}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <span className="text-white font-medium">{t('privacy.rights.objection.title')}</span>
                      <p className="text-gray-400 text-sm">{t('privacy.rights.objection.description')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">{t('privacy.security.title')}</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                {t('privacy.security.description')}
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t('privacy.security.measure1')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t('privacy.security.measure2')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{t('privacy.security.measure3')}</span>
                </li>
              </ul>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">{t('privacy.contact.title')}</h2>
              <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-800/30">
                <p className="text-gray-300 mb-4">
                  {t('privacy.contact.description')}
                </p>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 text-blue-300">
                    <Mail className="w-4 h-4" />
                    <span>datenschutz@mrhappy-bremen.de</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-300">
                    <Phone className="w-4 h-4" />
                    <span>+49 (0) 421 123 456</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Supervisory Authority */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">{t('privacy.authority.title')}</h2>
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-300 mb-4">
                  {t('privacy.authority.description')}
                </p>
                <div>
                  <p className="text-white font-medium">Die Landesbeauftragte für Datenschutz und Informationsfreiheit Bremen</p>
                  <p className="text-gray-300 text-sm mt-1">Arndtstraße 1, 27570 Bremerhaven</p>
                  <p className="text-gray-300 text-sm">Tel: +49 (0) 421 361-2010</p>
                  <p className="text-gray-300 text-sm">E-Mail: office@datenschutz.bremen.de</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
