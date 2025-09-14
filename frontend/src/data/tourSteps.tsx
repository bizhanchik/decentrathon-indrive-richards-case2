import { type Step } from 'react-joyride';

// Function to create tour steps with correct targets based on screen size
export const createTourSteps = (): Step[] => {
  // Check if we're on mobile/tablet (lg breakpoint is 1024px in Tailwind)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const taxiSimulationTarget = isMobile ? '#tour-taxi-simulation-mobile' : '#tour-taxi-simulation-desktop';

  return [
    {
      target: 'body',
      content: (
        <div>
          <h3 style={{ color: '#141414', marginBottom: '8px' }}>Welcome to the Taxi Analysis Dashboard! 🚕</h3>
          <p style={{ color: '#141414', opacity: 0.8 }}>
            This interactive dashboard visualizes taxi data to help understand transportation patterns, 
            demand areas, and driver distribution. Let's take a quick tour to show you around!
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: taxiSimulationTarget,
      content: (
        <div>
          <h3 style={{ color: '#141414', marginBottom: '8px' }}>🚕 Taxi Simulation</h3>
          <p style={{ color: '#141414', opacity: 0.8 }}>
            This button will launch a real-time taxi simulation feature (coming soon!). 
            It will show live movement of taxis across the city, helping you understand 
            traffic patterns and route optimization in real-time.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '.tour-data-layers-target',
      content: (
        <div>
          <h3 style={{ color: '#141414', marginBottom: '8px' }}>📊 Data Layers</h3>
          <p style={{ color: '#141414', opacity: 0.8 }}>
            Data layers are different visualizations of taxi data. Each layer shows a specific 
            aspect of transportation patterns. You can toggle them on and off to explore different insights. 
            Let's go through each layer!
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '#tour-layer-routes',
      content: (
        <div>
          <h3 style={{ color: '#141414', marginBottom: '8px' }}>🛣️ Popular Routes</h3>
          <p style={{ color: '#141414', opacity: 0.8 }}>
            This layer shows the most frequently used transportation paths as a heatmap. 
            Bright areas indicate high-traffic routes where taxis travel most often.
          </p>
        </div>
      ),
      placement: 'top',
      floaterProps: {
        disableAnimation: true,
      },
      styles: {
        options: {
          zIndex: 10000,
        }
      },
    },
    {
      target: '#tour-layer-demand',
      content: (
        <div>
          <h3 style={{ color: '#141414', marginBottom: '8px' }}>🔥 Demand Visualization</h3>
          <p style={{ color: '#141414', opacity: 0.8 }}>
            This layer displays high-demand areas using hexagonal grids. Red areas show 
            where taxi requests are most frequent - busy business districts, entertainment areas, and transportation hubs.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '#tour-layer-availability',
      content: (
        <div>
          <h3 style={{ color: '#141414', marginBottom: '8px' }}>🚗 Driver Distribution</h3>
          <p style={{ color: '#141414', opacity: 0.8 }}>
            This layer shows current driver availability across different regions. 
            It helps identify areas with high driver concentration and areas that might need more coverage.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '#tour-layer-violations',
      content: (
        <div>
          <h3 style={{ color: '#141414', marginBottom: '8px' }}>⚡ Speed Violations</h3>
          <p style={{ color: '#141414', opacity: 0.8 }}>
            This layer highlights routes with excessive speed incidents (over 60 km/h). 
            It helps identify potentially dangerous areas and optimize safety measures.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '#tour-layer-anomalies',
      content: (
        <div>
          <h3 style={{ color: '#141414', marginBottom: '8px' }}>⚠️ Unusual Trips</h3>
          <p style={{ color: '#141414', opacity: 0.8 }}>
            This layer shows anomaly detection in travel patterns - trips that are unusually long, 
            short, or follow unexpected routes. Useful for identifying operational issues.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '#tour-layer-traffic_jams',
      content: (
        <div>
          <h3 style={{ color: '#141414', marginBottom: '8px' }}>🚦 Traffic Jams</h3>
          <p style={{ color: '#141414', opacity: 0.8 }}>
            This layer identifies congestion areas where traffic flow is significantly reduced. 
            Helps drivers and dispatchers avoid bottlenecks and optimize route planning.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '#tour-layer-speed_zones',
      content: (
        <div>
          <h3 style={{ color: '#141414', marginBottom: '8px' }}>📈 Speed Zones</h3>
          <p style={{ color: '#141414', opacity: 0.8 }}>
            This layer visualizes speed pattern data across the city as a heatmap. 
            Shows areas with consistently high or low speeds, helping understand traffic flow dynamics.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '#tour-map-area',
      content: (
        <div>
          <h3 style={{ color: '#141414', marginBottom: '8px' }}>🗺️ Interactive Map</h3>
          <p style={{ color: '#141414', opacity: 0.8 }}>
            This is where all your selected data layers are visualized. You can zoom, pan, 
            and interact with the map to explore different areas. Active layers will show 
            their data overlaid on the base map.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 style={{ color: '#141414', marginBottom: '8px' }}>🎉 Tour Complete!</h3>
          <p style={{ color: '#141414', opacity: 0.8 }}>
            You're now ready to explore the taxi analysis dashboard! Try toggling different 
            layers, examining the map visualizations, and discovering insights about transportation 
            patterns. You can restart this tour anytime by clicking the help button.
          </p>
        </div>
      ),
      placement: 'center',
    },
  ];
};

// For backward compatibility, export the tourSteps as well
export const tourSteps = createTourSteps();

export const tourConfig = {
  continuous: true,
  showProgress: true,
  showSkipButton: true,
  scrollToFirstStep: true,
  scrollOffset: 50,
  scrollDuration: 300,
  disableOverlay: false,
  disableOverlayClose: false,
  hideCloseButton: false,
  spotlightClicks: false,
  styles: {
    options: {
      primaryColor: '#C1F21D',
      backgroundColor: '#FFFFFF',
      textColor: '#141414',
      width: 400,
      zIndex: 10000,
    },
    tooltip: {
      borderRadius: '12px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    tooltipContent: {
      padding: '20px',
    },
    buttonNext: {
      backgroundColor: '#C1F21D',
      color: '#141414',
      borderRadius: '8px',
      fontWeight: '600',
      padding: '10px 20px',
      border: 'none',
      fontSize: '14px',
      cursor: 'pointer',
    },
    buttonBack: {
      color: '#141414',
      borderRadius: '8px',
      border: '2px solid #E5E7EB',
      padding: '10px 20px',
      fontSize: '14px',
      cursor: 'pointer',
      backgroundColor: 'transparent',
    },
    buttonSkip: {
      color: '#6B7280',
      fontSize: '14px',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      border: 'none',
    },
    buttonClose: {
      color: '#6B7280',
      fontSize: '20px',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      border: 'none',
    },
  },
  locale: {
    back: 'Back',
    close: 'Close',
    last: 'Finish',
    next: 'Next',
    skip: 'Skip Tour',
  },
};