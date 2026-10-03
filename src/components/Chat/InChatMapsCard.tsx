import React from 'react';
import { MapPin, Navigation, Compass, ExternalLink, Globe } from 'lucide-react';

interface InChatMapsCardProps {
  locationName?: string;
  query?: string;
  coordinates?: { lat: number; lng: number };
  details?: string;
}

export const InChatMapsCard: React.FC<InChatMapsCardProps> = ({
  locationName = 'Global Coordinates',
  query = 'Selected Location',
  coordinates = { lat: 37.7749, lng: -122.4194 },
  details = 'Geospatial grounding data retrieved via Google Maps engine.',
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-xl max-w-lg my-2 font-sans">
      {/* Top Map Header */}
      <div className="px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-white text-xs">{locationName || query}</span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {coordinates.lat.toFixed(4)}° N, {coordinates.lng.toFixed(4)}° W
            </span>
          </div>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
          Google Maps Grounding
        </span>
      </div>

      {/* Stylized Cyberpunk Dark Map Canvas Preview */}
      <div className="h-32 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-slate-800/80">
        {/* Animated Radar Sweep / Grid Rings */}
        <div className="absolute w-24 h-24 rounded-full border border-emerald-500/20 animate-ping opacity-30 pointer-events-none" />
        <div className="absolute w-44 h-44 rounded-full border border-cyan-500/10 pointer-events-none" />

        {/* Center Target Pin */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30 animate-bounce">
            <MapPin className="w-4 h-4 fill-emerald-400 text-slate-950" />
          </div>
          <span className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-mono text-emerald-300">
            {locationName}
          </span>
        </div>

        {/* Compass Overlay */}
        <div className="absolute top-2 right-2 p-1 rounded bg-slate-900/80 border border-slate-800 text-slate-400 text-[10px] flex items-center gap-1 font-mono">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>N 0°</span>
        </div>
      </div>

      {/* Details Footer */}
      <div className="p-3 bg-slate-900/50 flex items-center justify-between text-xs">
        <p className="text-[11px] text-slate-400 line-clamp-1">{details}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || locationName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors ml-2"
        >
          <span>Open Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
