// ---------------------------------------------------------------------------
//  One entry per 360 photo ("room"). engineering.js reads this to build the
//  floor dots and to know which photo to load when a dot is clicked.
//
//  id        - unique name for this photo, used in the URL hash (#entrance)
//  image     - path to the equirectangular jpg, same as you used before
//  title     - optional, shown if you wire up a heading later
//  hotspots  - the floor dots placed IN this photo:
//      target   - the id of the room to jump to when this dot is clicked
//      label    - accessible name for the dot (read by screen readers)
//      yaw      - compass direction the dot sits in, in degrees
//                   0 = straight ahead when the photo loads, 90 = right,
//                   180 = behind you, -90 (or 270) = left
//      pitch    - how far up/down, in degrees. Floor dots are usually
//                   somewhere around -6 to -15 (negative = looking down)
//      distance - how far away the dot feels; 40-80 works well for a floor
//                   dot a few meters ahead. Leave it out to use the default (60)
//
//  You won't get the yaw/pitch exactly right on the first guess - open the
//  page, see where the dot lands, and nudge the number up or down until it
//  sits on the floor where you want it.
// ---------------------------------------------------------------------------

export const rooms = [
  {
    id: "entrance",
    image: "../E-image/Engineering1.jpg",
    title: "Engineering Entrance",
    hotspots: [
      // Left floor dot
      { target: "hallway", label: "Go left toward the hallway", yaw: -28, pitch: -15, distance: 50 },
      // Right floor dot
    ]
  },
  {
    id: "hallway",
    // TODO: point this at your next 360 photo once you have it.
    image: "../E-image/Engineering2.jpg",
    title: "Main Hallway",
    hotspots: [
      { target: "entrance", label: "Back to the entrance", yaw: 180, pitch: -10, distance: 60 }
    ]
  }
];