#!/bin/bash

echo "Importuję adresy z CSV do MongoDB..."

mongoimport \
  --db naprzystanek \
  --collection addresses \
  --type csv \
  --headerline \
  --file /data/csv/pomorskie-addresses.csv

echo "Import zakończony"

mongosh naprzystanek --eval '
  db.addresses.createIndex({ street: 1, housenumber: 1 });
  db.addresses.createIndex({ location: "2dsphere" });
  db.addresses.createIndex({ city: 1 });
  db.addresses.createIndex({ street: "text" });
  print("Indeksy utworzone");
'

echo "Inicjalizacja zakończona!"
