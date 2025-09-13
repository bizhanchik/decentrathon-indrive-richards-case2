import { Highlight } from './Highlight';

export function HackathonFooter() {
  return (
    <footer className="text-white py-12" style={{ backgroundColor: '#141414' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Team <span style={{ color: '#C1F21D' }}>Richards</span>
            </h3>
            <p className="text-white opacity-80">
              Building <Highlight>privacy-first</Highlight> solutions for geotrack analytics at Decentrathon 2025
            </p>
          </div>

          {/* Project Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ color: '#C1F21D' }}>Project Focus</h4>
            <ul className="space-y-2 text-white opacity-80">
              <li>• Anonymized Geotracks</li>
              <li>• Privacy Protection</li>
              <li>• Data Analytics</li>
              <li>• Urban Mobility</li>
            </ul>
          </div>

          {/* Event Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ color: '#C1F21D' }}>Event</h4>
            <div className="text-white opacity-80">
              <p className="mb-2">
                <Highlight>Decentrathon 2025</Highlight>
              </p>
              <p className="text-sm">
                Developing innovative solutions for decentralized mobility and privacy
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center" style={{ borderColor: '#C1F21D' }}>
          <p className="text-white opacity-60">
            © 2025 Team Richards • Decentrathon • Built with privacy in mind
          </p>
        </div>
      </div>
    </footer>
  );
}