import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Cookie, Settings, Shield, Eye, BarChart3, Target, X, Check } from 'lucide-react';

const CookiePolicyPage: React.FC = () => {
  const { t } = useLanguage();
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    functional: false,
    analytics: false,
    marketing: false
  });

  const handleCookieToggle = (type: keyof typeof cookiePreferences) => {
    if (type === 'necessary') return; // Cannot disable necessary cookies
    
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const acceptAllCookies = () => {
    setCookiePreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    });
  };

  const acceptOnlyNecessary = () => {
    setCookiePreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    });
  };

  const saveCookiePreferences = () => {
    // In a real implementation, you would save these preferences
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    alert(t('cookies.preferences.saved'));
  };

  return (
    <div className="bg-gray-900 min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-900/30 to-orange-800/30 p-8 border-b border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Cookie className="w-8 h-8 text-orange-400" />
              <h1 className="text-3xl font-light text-white">{t('cookies.title')}</h1>
            </div>
            <p className="text-orange-200 text-lg">{t('cookies.subtitle')}</p>
            <p className="text-gray-300 text-sm mt-2">{t('cookies.lastUpdated')}: 20. September 2025</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">{t('cookies.intro.title')}</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                {t('cookies.intro.description')}
              </p>
              <p className="text-gray-300 leading-relaxed">
                {t('cookies.intro.purpose')}
              </p>
            </section>

            {/* Cookie Preferences */}
            <section>
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="w-6 h-6 text-orange-400" />
                <h2 className="text-xl font-semibold text-white">{t('cookies.preferences.title')}</h2>
              </div>
              
              <div className="space-y-6">
                {/* Necessary Cookies */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-green-400" />
                      <h3 className="text-lg font-medium text-white">{t('cookies.necessary.title')}</h3>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                        {t('cookies.necessary.required')}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={cookiePreferences.necessary}
                        disabled
                        className="sr-only"
                      />
                      <div className="w-12 h-6 bg-green-500 rounded-full flex items-center cursor-not-allowed">
                        <div className="w-5 h-5 bg-white rounded-full ml-auto mr-0.5 transition-transform duration-200"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{t('cookies.necessary.description')}</p>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">
                      <strong>{t('cookies.examples')}:</strong> session_id, csrf_token, auth_token
                    </div>
                    <div className="text-xs text-gray-400">
                      <strong>{t('cookies.retention')}:</strong> {t('cookies.necessary.retention')}
                    </div>
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Eye className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-medium text-white">{t('cookies.functional.title')}</h3>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={cookiePreferences.functional}
                        onChange={() => handleCookieToggle('functional')}
                        className="sr-only"
                      />
                      <div 
                        onClick={() => handleCookieToggle('functional')}
                        className={`w-12 h-6 rounded-full flex items-center cursor-pointer transition-colors duration-200 ${
                          cookiePreferences.functional ? 'bg-blue-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                          cookiePreferences.functional ? 'ml-auto mr-0.5' : 'ml-0.5'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{t('cookies.functional.description')}</p>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">
                      <strong>{t('cookies.examples')}:</strong> language_preference, theme_preference, cart_items
                    </div>
                    <div className="text-xs text-gray-400">
                      <strong>{t('cookies.retention')}:</strong> {t('cookies.functional.retention')}
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-medium text-white">{t('cookies.analytics.title')}</h3>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={cookiePreferences.analytics}
                        onChange={() => handleCookieToggle('analytics')}
                        className="sr-only"
                      />
                      <div 
                        onClick={() => handleCookieToggle('analytics')}
                        className={`w-12 h-6 rounded-full flex items-center cursor-pointer transition-colors duration-200 ${
                          cookiePreferences.analytics ? 'bg-purple-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                          cookiePreferences.analytics ? 'ml-auto mr-0.5' : 'ml-0.5'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{t('cookies.analytics.description')}</p>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">
                      <strong>{t('cookies.examples')}:</strong> _ga, _gid, _gat
                    </div>
                    <div className="text-xs text-gray-400">
                      <strong>{t('cookies.retention')}:</strong> {t('cookies.analytics.retention')}
                    </div>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-red-400" />
                      <h3 className="text-lg font-medium text-white">{t('cookies.marketing.title')}</h3>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={cookiePreferences.marketing}
                        onChange={() => handleCookieToggle('marketing')}
                        className="sr-only"
                      />
                      <div 
                        onClick={() => handleCookieToggle('marketing')}
                        className={`w-12 h-6 rounded-full flex items-center cursor-pointer transition-colors duration-200 ${
                          cookiePreferences.marketing ? 'bg-red-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                          cookiePreferences.marketing ? 'ml-auto mr-0.5' : 'ml-0.5'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{t('cookies.marketing.description')}</p>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">
                      <strong>{t('cookies.examples')}:</strong> _fbp, _fbc, ads_preferences
                    </div>
                    <div className="text-xs text-gray-400">
                      <strong>{t('cookies.retention')}:</strong> {t('cookies.marketing.retention')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={acceptAllCookies}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('cookies.buttons.acceptAll')}</span>
                </button>
                <button
                  onClick={acceptOnlyNecessary}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>{t('cookies.buttons.onlyNecessary')}</span>
                </button>
                <button
                  onClick={saveCookiePreferences}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>{t('cookies.buttons.savePreferences')}</span>
                </button>
              </div>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">{t('cookies.thirdParty.title')}</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                {t('cookies.thirdParty.description')}
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-white font-medium mb-3">Google Analytics</h3>
                  <p className="text-gray-300 text-sm mb-3">{t('cookies.thirdParty.analytics.description')}</p>
                  <div className="space-y-1 text-xs text-gray-400">
                    <p><strong>{t('cookies.thirdParty.provider')}:</strong> Google LLC</p>
                    <p><strong>{t('cookies.thirdParty.purpose')}:</strong> {t('cookies.thirdParty.analytics.purpose')}</p>
                    <p><strong>{t('cookies.thirdParty.privacy')}:</strong> <a href="https://policies.google.com/privacy" className="text-blue-400 hover:underline">Google Privacy Policy</a></p>
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-white font-medium mb-3">Payment Processors</h3>
                  <p className="text-gray-300 text-sm mb-3">{t('cookies.thirdParty.payments.description')}</p>
                  <div className="space-y-1 text-xs text-gray-400">
                    <p><strong>{t('cookies.thirdParty.provider')}:</strong> PayPal, Stripe</p>
                    <p><strong>{t('cookies.thirdParty.purpose')}:</strong> {t('cookies.thirdParty.payments.purpose')}</p>
                    <p><strong>{t('cookies.thirdParty.privacy')}:</strong> {t('cookies.thirdParty.payments.privacy')}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Managing Cookies */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">{t('cookies.management.title')}</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                {t('cookies.management.description')}
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-white font-medium mb-3">{t('cookies.management.browser.title')}</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• <strong>Chrome:</strong> {t('cookies.management.browser.chrome')}</li>
                    <li>• <strong>Firefox:</strong> {t('cookies.management.browser.firefox')}</li>
                    <li>• <strong>Safari:</strong> {t('cookies.management.browser.safari')}</li>
                    <li>• <strong>Edge:</strong> {t('cookies.management.browser.edge')}</li>
                  </ul>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-white font-medium mb-3">{t('cookies.management.mobile.title')}</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• <strong>iOS:</strong> {t('cookies.management.mobile.ios')}</li>
                    <li>• <strong>Android:</strong> {t('cookies.management.mobile.android')}</li>
                  </ul>
                  <p className="text-yellow-400 text-xs mt-3">
                    {t('cookies.management.warning')}
                  </p>
                </div>
              </div>
            </section>

            {/* Updates */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">{t('cookies.updates.title')}</h2>
              <div className="bg-orange-900/20 rounded-xl p-6 border border-orange-800/30">
                <p className="text-gray-300 leading-relaxed">
                  {t('cookies.updates.description')}
                </p>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">{t('cookies.contact.title')}</h2>
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-300 mb-4">
                  {t('cookies.contact.description')}
                </p>
                <div className="text-orange-300">
                  <p>📧 datenschutz@mrhappy-bremen.de</p>
                  <p>📞 +49 (0) 421 123 456</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
