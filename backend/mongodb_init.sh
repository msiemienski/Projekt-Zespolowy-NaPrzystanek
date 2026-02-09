#!/bin/bash

# Folder where CSV/JSON files are mounted
DATA_DIR="/data/csv"

echo "Waiting for MongoDB to start..."
# No need to wait explicitly, this script is run by the entrypoint which handles db startup

ADDRESSES_FILE="$DATA_DIR/pomorskie-addresses.csv"
DISTRICTS_FILE="$DATA_DIR/gdansk-districts.json"

if [ -f "$ADDRESSES_FILE" ]; then
  echo "Importing addresses from CSV to MongoDB..."
  mongoimport \
    --db naprzystanek \
    --collection addresses \
    --type csv \
    --headerline \
    --file "$ADDRESSES_FILE"
  echo "Address import finished."
else
  echo "Warning: Addresses file not found at $ADDRESSES_FILE"
fi

if [ -f "$DISTRICTS_FILE" ]; then
  echo "Importing districts from GeoJSON to MongoDB..."
  # Note: The file gdansk-districts.json is a JSON array of Features, so --jsonArray is correct
  mongoimport \
    --db naprzystanek \
    --collection districts \
    --file "$DISTRICTS_FILE" \
    --jsonArray
  echo "District import finished."
else
  echo "Warning: Districts file not found at $DISTRICTS_FILE"
fi

echo "Creating indexes..."
mongosh naprzystanek --eval '
  // Addresses
  print("Processing addresses...");
  db.addresses.updateMany(
    {},
    [
      {
        $set: {
          location: {
            type: "Point",
            coordinates: [
              { $toDouble: "$lon" },
              { $toDouble: "$lat" }
            ]
          }
        }
      }
    ]
  );
  db.addresses.createIndex({ location: "2dsphere" });
  db.addresses.createIndex({ street: 1, housenumber: 1 });
  db.addresses.createIndex({ city: 1 });
  db.addresses.createIndex({ street: "text" });

  // Districts
  print("Processing districts...");
  // gdansk-districts.json usually has "properties.name", let"s lift it to top level
  db.districts.updateMany(
    {},
    [{ $set: { name: "$properties.name" } }]
  );
  db.districts.createIndex({ geometry: "2dsphere" });
  db.districts.createIndex({ name: 1 });
  // Some datasets use "miejscowosc" or similar in properties, check if needed
  // db.districts.createIndex({ miejscowosc: 1 });

  print("Indexes created successfully.");
'

echo "Initialization complete!"
