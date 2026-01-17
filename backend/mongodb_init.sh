#!/bin/bash

echo "Importuję adresy z CSV do MongoDB..."
mongoimport \
  --host mongo \
  --db naprzystanek \
  --collection addresses \
  --type csv \
  --headerline \
  --file /data/csv/pomorskie-addresses.csv
echo "Import adresów zakończony"

echo "Importuję dzielnice z GeoJSON do MongoDB..."
mongoimport --host mongo \
  --db naprzystanek \
  --collection districts \
  --file /data/csv/gdansk-dzielnice-multipolygon-array.json \
  --jsonArray
echo "Import dzielnic zakończony"

echo "Tworzenie indeksów..."
mongosh --host mongo naprzystanek --eval '
  // Adresy
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

  // Dzielnice
  db.districts.updateMany(
    {},
    [{ $set: { name: "$properties.name" } }]
  );
  db.districts.createIndex({ geometry: "2dsphere" });
  db.districts.createIndex({ name: 1 });
  db.districts.createIndex({ miejscowosc: 1 });

  print("Indeksy utworzone");
'

echo "Inicjalizacja zakończona!"
