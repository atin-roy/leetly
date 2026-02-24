# ── Stage 1: build the fat JAR ───────────────────────────────────────────────
FROM eclipse-temurin:25-jdk AS builder
WORKDIR /app

# Cache dependencies before copying source
COPY mvnw pom.xml ./
COPY .mvn/ .mvn/
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw package -DskipTests -B

# ── Stage 2: minimal runtime ──────────────────────────────────────────────────
FROM eclipse-temurin:25-jre
WORKDIR /app

RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring

COPY --from=builder /app/target/leetly-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.profiles.active=prod", \
  "-jar", "app.jar"]
