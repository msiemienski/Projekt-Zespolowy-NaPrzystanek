FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY otp-shaded-2.8.1.jar ./

EXPOSE 8080

# Komenda uruchamiająca OTP w trybie ładowania gotowego grafu
CMD ["java", "-Xmx4G", "-jar", "otp-shaded-2.8.1.jar", "--load", "--serve", "ztm"]
