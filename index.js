
const express = require('express');
const bodyParser = require('body-parser');
const auth = require('basic-auth');
const { point, lineString, lineIntersect } = require('@turf/turf');

// Define the lines
const lines = [
  { id: 'L01', start: [1, 2], end: [3, 4] },
  { id: 'L02', start: [5, 6], end: [7, 8] },
  // ... add more lines
];

// Create an Express application
const app = express();

// Middleware to parse JSON body
app.use(bodyParser.json());

// Middleware for header-based authentication
app.use((req, res, next) => {
  const credentials = auth(req);
  if (!credentials || credentials.name !== 'username' || credentials.pass !== 'password') {
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    next();
  }
});


// POST /intersect
app.post('/intersect', (req, res) => {
  // Validate the request body
  const linestring = req.body;
  if (!linestring || linestring.type !== 'LineString' || !Array.isArray(linestring.coordinates)) {
    res.status(400).json({ error: 'Invalid linestring' });
    return;
  }

  // Convert the linestring to a Turf.js object
  const turfLinestring = lineString(linestring.coordinates);

  // Find intersecting lines
  const intersections = lines.filter((line) => {
    const turfLine = lineString([line.start, line.end]);
    return lineIntersect(turfLinestring, turfLine);
  });

  // Prepare the response
  const result = intersections.map((line) => ({
    id: line.id,
    intersection: lineIntersect(turfLinestring, lineString([line.start, line.end])).features[0].geometry.coordinates,
  }));

  res.json(result);
});

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});