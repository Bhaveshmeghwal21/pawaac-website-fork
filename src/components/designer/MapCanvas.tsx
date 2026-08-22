"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { Circle, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

export type Dock = { id: number; lat: number; lng: number };

// The survey zone is a centre point plus a radius, not a corner-to-corner box.
//
// Site-owner request (current session): "for outer perimeter it uses a square
// so change that concept to a circle". The zone used to be a `Bounds`
// (`{ sw, ne }`) drawn as a dashed `Rectangle`, which is why the old model
// needed the width/height metre conversion in SystemDesigner's `dims()`.
// A circle needs one number instead of four, and it is the honest shape for
// what the zone actually represents: a patrol perimeter measured outward from
// a site, matching the per-dock coverage circles already drawn inside it.
//
// `Bounds` is no longer exported from this module — nothing outside the
// designer directory ever imported it (verified), and the only consumer that
// needed a bounding box was the initial map fit, which now derives one from
// the site via Leaflet's own `LatLng.toBounds()` rather than hand-rolled
// degree maths.
export type Site = { lat: number; lng: number; radiusM: number };

const handle = L.divIcon({
  className: "",
  html: '<span style="display:block;width:14px;height:14px;background:#ffffff;border:2px solid #080808;box-shadow:0 0 0 2px #080808"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const dockIcon = L.divIcon({
  className: "",
  html: '<span style="display:block;width:12px;height:12px;border-radius:9999px;background:#ffffff;border:2px solid #080808;box-shadow:0 0 0 1.5px #080808"></span>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// Keeps the whole coverage circle in view as it grows or shrinks.
//
// Supersedes the previous `FitOnce`, which fit the map exactly once on mount.
// That was sufficient while the zone could only be resized by dragging its
// north-east corner handle (the drag itself kept the corner under the cursor
// and therefore on screen). The zone is now sized by a slider, so a mount-only
// fit would let a 1500 m circle grow straight off the edges of the viewport
// with no way to see what had been drawn.
//
// `lat`/`lng` are deliberately excluded from the dependency list: refitting on
// centre changes would make the map pan and zoom underneath the centre handle
// while it is being dragged, fighting the drag instead of following it. The
// circle moving within a fixed view is the correct behaviour there, and the
// user is already looking at it because they are dragging it. Same
// eslint-disable rationale as the `FitOnce` this replaces.
function FitToSite({ lat, lng, radiusM }: Site) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    map.invalidateSize();
    // `toBounds` takes the full side length of the square to build, so the
    // diameter (2r) produces the tightest box that still encloses the circle.
    map.fitBounds(L.latLng(lat, lng).toBounds(radiusM * 2), {
      padding: [90, 90],
      // No animation on the first fit (there is nothing to animate from), but
      // animate subsequent slider-driven refits so the zoom change reads as
      // the circle growing rather than the map jumping.
      animate: hasFitted.current,
    });
    hasFitted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, radiusM]);

  return null;
}

export default function MapCanvas({
  site,
  docks,
  patrolRadiusM,
  onSiteChange,
  onDockMove,
}: {
  site: Site;
  docks: Dock[];
  patrolRadiusM: number;
  onSiteChange: (site: Site) => void;
  onDockMove: (id: number, lat: number, lng: number) => void;
}) {
  const center: [number, number] = [site.lat, site.lng];

  return (
    <MapContainer
      center={center}
      zoom={12}
      zoomControl={false}
      className="map-dark h-full w-full bg-bg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
        subdomains="abc"
      />

      <FitToSite {...site} />

      {/*
        The survey zone. Drawn before the per-dock coverage circles so the dock
        footprints read as sitting inside it — the reverse order used to put the
        zone's own 4% fill on top of every dock circle, which was tolerable for
        a rectangle outline but muddies concentric circles.
      */}
      <Circle
        center={center}
        radius={site.radiusM}
        pathOptions={{
          color: "#ededed",
          weight: 1.5,
          dashArray: "6 6",
          fillColor: "#ededed",
          fillOpacity: 0.04,
        }}
      />

      {docks.map((d) => (
        <Circle
          key={`c${d.id}`}
          center={[d.lat, d.lng]}
          radius={patrolRadiusM}
          pathOptions={{
            color: "#ffffff",
            weight: 1,
            fillColor: "#ffffff",
            fillOpacity: 0.06,
          }}
        />
      ))}

      {docks.map((d) => (
        <Marker
          key={`d${d.id}`}
          draggable
          position={[d.lat, d.lng]}
          icon={dockIcon}
          eventHandlers={{
            drag: (e) => {
              const p = e.target.getLatLng();
              onDockMove(d.id, p.lat, p.lng);
            },
          }}
        />
      ))}

      {/*
        Centre move handle. The north-east corner resize handle that used to sit
        beside it is gone: the zone is a circle with no corners, and the
        site-owner request put its radius on a slider instead. Sizing lives in
        exactly one control now rather than being split between a slider and a
        drag target that could disagree.
      */}
      <Marker
        draggable
        position={center}
        icon={handle}
        eventHandlers={{
          drag: (e) => {
            const c = e.target.getLatLng();
            onSiteChange({ ...site, lat: c.lat, lng: c.lng });
          },
        }}
      />
    </MapContainer>
  );
}
