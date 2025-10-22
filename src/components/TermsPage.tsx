import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FileText, ShoppingCart, CreditCard, Truck, RotateCcw, AlertTriangle, Phone, Mail, MapPin } from 'lucide-react';

const TermsPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-900 min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 p-8 border-b border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-8 h-8 text-green-400" />
              <h1 className="text-3xl font-light text-white">{t('terms.title')}</h1>
            </div>
            <p className="text-green-200 text-lg">{t('terms.subtitle')}</p>
            <p className="text-gray-300 text-sm mt-2">{t('terms.lastUpdated')}: 20. September 2025</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Section 1: General */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span>{t('terms.general.title')}</span>
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>{t('terms.general.text1')}</p>
                <p>{t('terms.general.text2')}</p>
                <div className="bg-green-900/20 rounded-xl p-4 border border-green-800/30">
                  <p className="text-sm"><strong>{t('terms.general.company')}:</strong> Mr Happy Burger, Einzelunternehmen</p>
                  <p className="text-sm"><strong>Inhaber:</strong> Meryem Tekin</p>
                  <p className="text-sm"><strong>Adresse:</strong> Zum Alten Speicher 2, 28759 Bremen</p>
                  <p className="text-sm"><strong>{t('terms.general.tax')}:</strong> 47926840315</p>
                  <p className="text-sm"><strong>Lieferando Partner:</strong> 2076138</p>
                </div>
              </div>
            </section>

            {/* Section 2: Orders */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <ShoppingCart className="w-5 h-5 text-green-400" />
                <span>{t('terms.orders.title')}</span>
              </h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">{t('terms.orders.process.title')}</h3>
                  <ol className="space-y-2 list-decimal list-inside">
                    <li>{t('terms.orders.process.step1')}</li>
                    <li>{t('terms.orders.process.step2')}</li>
                    <li>{t('terms.orders.process.step3')}</li>
                    <li>{t('terms.orders.process.step4')}</li>
                    <li>{t('terms.orders.process.step5')}</li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">{t('terms.orders.acceptance.title')}</h3>
                  <p>{t('terms.orders.acceptance.text')}</p>
                </div>
              </div>
            </section>

            {/* Section 3: Prices and Payment */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <CreditCard className="w-5 h-5 text-green-400" />
                <span>{t('terms.payment.title')}</span>
              </h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">{t('terms.payment.prices.title')}</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('terms.payment.prices.text1')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('terms.payment.prices.text2')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('terms.payment.prices.text3')}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">{t('terms.payment.methods.title')}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                      <h4 className="text-white font-medium mb-2">{t('terms.payment.methods.pickup')}</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• {t('terms.payment.methods.cash')}</li>
                        <li>• {t('terms.payment.methods.card')}</li>
                        <li>• {t('terms.payment.methods.contactless')}</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                      <h4 className="text-white font-medium mb-2">{t('terms.payment.methods.delivery')}</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• {t('terms.payment.methods.cash')}</li>
                        <li>• {t('terms.payment.methods.card')}</li>
                        <li>• {t('terms.payment.methods.paypal')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Delivery */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <Truck className="w-5 h-5 text-green-400" />
                <span>{t('terms.delivery.title')}</span>
              </h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">{t('terms.delivery.areas.title')}</h3>
                  <p>{t('terms.delivery.areas.text')}</p>
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 mt-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">{t('terms.delivery.areas.zone1')}</h4>
                        <p className="text-sm">{t('terms.delivery.areas.zone1_desc')}</p>
                        <p className="text-green-400 font-medium text-sm mt-1">{t('terms.delivery.areas.zone1_fee')}</p>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-2">{t('terms.delivery.areas.zone2')}</h4>
                        <p className="text-sm">{t('terms.delivery.areas.zone2_desc')}</p>
                        <p className="text-green-400 font-medium text-sm mt-1">{t('terms.delivery.areas.zone2_fee')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">{t('terms.delivery.times.title')}</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('terms.delivery.times.normal')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('terms.delivery.times.peak')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('terms.delivery.times.weather')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5: Right of Withdrawal */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <RotateCcw className="w-5 h-5 text-green-400" />
                <span>{t('terms.withdrawal.title')}</span>
              </h2>
              <div className="bg-yellow-900/20 rounded-xl p-6 border border-yellow-800/30">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                  <div className="space-y-3 text-gray-300">
                    <p className="font-medium text-yellow-200">{t('terms.withdrawal.important')}</p>
                    <p>{t('terms.withdrawal.text1')}</p>
                    <p>{t('terms.withdrawal.text2')}</p>
                    <div className="bg-yellow-900/30 rounded-lg p-4 mt-4">
                      <h3 className="text-white font-medium mb-2">{t('terms.withdrawal.exceptions.title')}</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• {t('terms.withdrawal.exceptions.perishable')}</li>
                        <li>• {t('terms.withdrawal.exceptions.custom')}</li>
                        <li>• {t('terms.withdrawal.exceptions.hygiene')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Liability */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
                <span>{t('terms.liability.title')}</span>
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>{t('terms.liability.text1')}</p>
                <p>{t('terms.liability.text2')}</p>
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                  <h3 className="text-white font-medium mb-2">{t('terms.liability.limits.title')}</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('terms.liability.limits.intent')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('terms.liability.limits.life')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{t('terms.liability.limits.product')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 7: Data Protection */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">7</span>
                <span>{t('terms.privacy.title')}</span>
              </h2>
              <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-800/30">
                <p className="text-gray-300 mb-4">{t('terms.privacy.text')}</p>
                <button className="text-blue-400 hover:text-blue-300 underline text-sm">
                  {t('terms.privacy.link')}
                </button>
              </div>
            </section>

            {/* Section 8: Dispute Resolution */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">8</span>
                <span>{t('terms.disputes.title')}</span>
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>{t('terms.disputes.text1')}</p>
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                  <h3 className="text-white font-medium mb-2">{t('terms.disputes.odr.title')}</h3>
                  <p className="text-sm mb-2">{t('terms.disputes.odr.text')}</p>
                  <p className="text-blue-400 text-sm">https://ec.europa.eu/consumers/odr/</p>
                </div>
                <p>{t('terms.disputes.text2')}</p>
              </div>
            </section>

            {/* Section 9: Final Provisions */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">9</span>
                <span>{t('terms.final.title')}</span>
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>{t('terms.final.law')}</p>
                <p>{t('terms.final.jurisdiction')}</p>
                <p>{t('terms.final.severability')}</p>
                <p>{t('terms.final.changes')}</p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">{t('terms.contact.title')}</h2>
              <div className="bg-green-900/20 rounded-xl p-6 border border-green-800/30">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-white font-medium mb-3">{t('terms.contact.company')}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-green-300">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">Mr Happy Burger<br />Zum Alten Speicher 2<br />28759 Bremen</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-3">{t('terms.contact.details')}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-green-300">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">04209/8989990</span>
                      </div>
                      <div className="flex items-center space-x-2 text-green-300">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">mrhappydoner54@hotmail.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
