# OpenTripPlanner (OTP) Setup

## Uruchomienie
Przed odpaleniem trzeba pobrać pliki lokalnie:

Niżej lista plików jakie potrzeba...

Odpalasz po prostu jara wpisując:

```bash
java -Xmx4G -jar otp-shaded-2.8.1.jar --build --serve ztm
```

Zbudowanie grafu.obj:
```bash
java -Xmx4G -jar otp-shaded-2.8.1.jar --build --save ztm
```

Jak chce się załadować z istniejącego grafu.obj:
```bash
java -Xmx4G -jar otp-shaded-2.8.1.jar --load --serve ztm
```



I wtedy ładują się wszystkie przystanki + trasy tramwajow i autobusow z API OTP.

## Pliki w repozytorium

Następujące pliki są w repozytorium Git:
- `run.sh` - skrypt uruchomieniowy, raczej lepiej odpalać ręcznie komendą powyżej, zeby widziec podglad z mavena.
- `README.MD` - dokumentacja
- `ztm/otp-config.json` - konfiguracja OTP
- `ztm/router-config.json` - konfiguracja routera
- `ztm/*.txt` - pliki GTFS (agency.txt, routes.txt, stops.txt, trips.txt, etc.)

## Pliki do pobrania lokalnie

Następujące pliki są **wykluczone** z repozytorium (duże pliki binarne) i muszą być pobrane lokalnie:

1. **otp-shaded-2.8.1.jar** - plik JAR OTP (wymagany)
   - Pobierz z: https://repo1.maven.org/maven2/org/opentripplanner/otp-shaded/2.8.1/
   - Umieść w: `backend/otp/`

2. **graph.obj** - wygenerowany graf (tworzy się automatycznie przy pierwszym uruchomieniu)
   - Tworzy się automatycznie po uruchomieniu OTP
   - Umieść w: `backend/otp/ztm/`, wygeneruje się automatycznie po wpisaniu :
```bash
java -Xmx4G -jar otp-shaded-2.8.1.jar --build --save ztm
```
(lub zostaw, jeśli już istnieje)

## Pliki opcjonalne

Następujące pliki są **opcjonalne** i nie są wymagane do podstawowego działania:

3. **pomorskie-251130.osm.pbf** - plik mapy OpenStreetMap (opcjonalny)
   - **Nie jest wymagany do samych przystanków, chociaż będziemy raczej go potrzebować do planowania tras** - graf buduje się z danych GTFS
   - Potrzebny tylko jeśli chcesz planować trasy piesze/rowerowe do przystanków, później przydatne do wyznaczania tras pieszych, autobusowych, na razie mamy tylko przystanki na mapie, przez co łatwiej się buduje graf.
   - Pobierz z: https://download.geofabrik.de/europe/poland/pomorskie-latest.osm.pbf
   - Umieść w: `backend/otp/ztm/`

4. **gtfs.zip** - archiwum GTFS (opcjonalne, jeśli używasz plików .txt)
   - Można pobrać z oficjalnego źródła ZTM Gdańsk
   - link: https://ckan.multimediagdansk.pl/dataset/tristar/resource/30e783e4-2bec-4a7d-bb22-ee3e3b26ca96
   - Umieść w: `backend/otp/ztm/`

## Uwagi dla zespołu

- Pliki konfiguracyjne (JSON) i skrypty są w repo - każdy członek zespołu powinien je mieć
- Duże pliki binarne (.jar, .obj) są wykluczone z repo - każdy musi je pobrać lokalnie
- Plik OSM (.pbf) jest **opcjonalny** - graf buduje się bez niego z danych GTFS
- Pliki gfts też trzeba ręcznie pobrać wyżej link.