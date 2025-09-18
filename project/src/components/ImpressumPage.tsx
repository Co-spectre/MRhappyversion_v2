import React from 'react';
import { Building, Mail, Phone, MapPin, Scale, Shield } from 'lucide-react';

const ImpressumPage: React.FC = () => {
  return (
    <div className="bg-gray-900 min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 p-8 border-b border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="w-8 h-8 text-red-400" />
              <h1 className="text-3xl font-bold text-white">Impressum</h1>
            </div>
            <p className="text-gray-300">
              Angaben gemäß § 5 TMG (Telemediengesetz)
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Company Information */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Building className="w-5 h-5 text-red-400" />
                <h2 className="text-xl font-semibold text-white">Firmeninformationen</h2>
              </div>
              <div className="bg-gray-900 rounded-lg p-6 space-y-3">
                <div>
                  <span className="text-gray-400">Firmenname:</span>
                  <span className="text-white ml-2 font-medium">Mr Happy Burger</span>
                </div>
                <div>
                  <span className="text-gray-400">Rechtsform:</span>
                  <span className="text-white ml-2">Einzelunternehmen</span>
                </div>
                <div>
                  <span className="text-gray-400">Registergericht:</span>
                  <span className="text-white ml-2">Nicht zutreffend (Einzelunternehmen)</span>
                </div>
                <div>
                  <span className="text-gray-400">Handelsregisternummer:</span>
                  <span className="text-white ml-2">Nicht zutreffend (Einzelunternehmen)</span>
                </div>
                <div>
                  <span className="text-gray-400">Steuernummer:</span>
                  <span className="text-white ml-2">47926840315</span>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Mail className="w-5 h-5 text-red-400" />
                <h2 className="text-xl font-semibold text-white">Kontaktdaten</h2>
              </div>
              <div className="bg-gray-900 rounded-lg p-6 space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <div>
                    <span className="text-gray-400">Anschrift:</span>
                    <div className="text-white ml-2">
                      Mr Happy Burger<br />
                      Zum alten speicher 2<br />
                      28759 Bremen-Vegesack<br />
                      Deutschland
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-red-400" />
                  <div>
                    <span className="text-gray-400">Telefon:</span>
                    <a href="tel:+4942098989990" className="text-white ml-2 hover:text-red-400 transition-colors">
                      04209/8989990
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-red-400" />
                  <div>
                    <span className="text-gray-400">E-Mail:</span>
                    <a href="mailto:mrhappydoner54@hotmail.com" className="text-white ml-2 hover:text-red-400 transition-colors">
                      mrhappydoner54@hotmail.com
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Legal Representatives */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-red-400" />
                <h2 className="text-xl font-semibold text-white">Vertretungsberechtigte Geschäftsführer</h2>
              </div>
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="text-white">
                  Meryem Tekin
                </div>
              </div>
            </section>

            {/* Responsible for Content */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="text-white">
                  Meryem Tekin<br />
                  Zum alten speicher 2<br />
                  28759 Bremen-Vegesack
                </div>
              </div>
            </section>

            {/* Liability Disclaimer */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Haftungsausschluss</h2>
              <div className="bg-gray-900 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-red-400 mb-2">Haftung für Inhalte</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
                    allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
                    unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach 
                    Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-red-400 mb-2">Haftung für Links</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
                    Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten 
                    Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                  </p>
                </div>
              </div>
            </section>

            {/* Copyright */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Urheberrecht</h2>
              <div className="bg-gray-900 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed">
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen 
                  Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
                  Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                </p>
              </div>
            </section>

            {/* Update Information */}
            <section>
              <div className="text-center pt-8 border-t border-gray-700">
                <p className="text-gray-400 text-sm">
                  Stand: {new Date().toLocaleDateString('de-DE')}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpressumPage;
