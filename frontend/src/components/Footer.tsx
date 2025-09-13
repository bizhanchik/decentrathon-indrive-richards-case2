import type { FooterProps } from '../types';

export function Footer({ sections, socialLinks, appDownloads, legalLinks }: FooterProps) {
  return (
    <footer className="text-white" style={{ backgroundColor: '#141414' }}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-2xl font-bold">
                in<span style={{ color: '#C1F21D' }}>Drive</span>
              </h3>
              <p className="mt-4 max-w-sm" style={{ color: '#FFFEEB', opacity: 0.8 }}>
                Fair mobility platform connecting millions of riders and drivers worldwide. 
                Set your price, choose your driver, travel safely.
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.href}
                  className="transition-colors text-2xl hover:opacity-75"
                  style={{ color: '#FFFEEB' }}
                  aria-label={social.platform}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-lg font-semibold mb-4" style={{ color: '#C1F21D' }}>{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="transition-colors hover:opacity-75"
                      style={{ color: '#FFFEEB', opacity: 0.8 }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App Download Section */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: '#C1F21D' }}>
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#C1F21D' }}>Download the inDrive app</h3>
            <p className="mb-6" style={{ color: '#FFFEEB', opacity: 0.8 }}>
              Get the app and start earning or riding today
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {appDownloads.map((app) => (
              <a
                key={app.platform}
                href={app.href}
                className="flex items-center space-x-3 px-6 py-3 rounded-lg transition-all hover:opacity-80 border"
                style={{ 
                  backgroundColor: '#C1F21D', 
                  color: '#141414',
                  borderColor: '#C1F21D'
                }}
              >
                <span className="text-2xl">{app.icon}</span>
                <div className="text-left">
                  <div className="text-xs" style={{ opacity: 0.7 }}>
                    {app.platform === 'ios' ? 'Download on the' : 
                     app.platform === 'android' ? 'Get it on' : 
                     'Explore it on'}
                  </div>
                  <div className="text-sm font-semibold">
                    {app.platform === 'ios' ? 'App Store' : 
                     app.platform === 'android' ? 'Google Play' : 
                     'AppGallery'}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t" style={{ borderColor: '#C1F21D' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm" style={{ color: '#FFFEEB', opacity: 0.8 }}>
              © 2024 inDrive. All rights reserved.
            </div>
            
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {legalLinks.map((link, index) => (
                <span key={link.label} className="flex items-center">
                  <a
                    href={link.href}
                    className="transition-colors hover:opacity-75"
                    style={{ color: '#FFFEEB', opacity: 0.8 }}
                  >
                    {link.label}
                  </a>
                  {index < legalLinks.length - 1 && (
                    <span className="ml-6" style={{ color: '#C1F21D' }}>|</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}