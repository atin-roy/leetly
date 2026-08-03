# ── Stage 1: build the fat JAR ───────────────────────────────────────────────
FROM eclipse-temurin:25-jdk AS builder
WORKDIR /app

# Cache dependencies before copying source
COPY mvnw pom.xml ./
COPY .mvn/ .mvn/
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src ./src
# Tests are not run here: the CI `verify-api` job runs them and image
# publication depends on it, so skipping avoids running the suite twice.
RUN ./mvnw package -Dmaven.test.skip=true -B

# ── Stage 2: minimal runtime ──────────────────────────────────────────────────
FROM eclipse-temurin:25-jre
WORKDIR /app

# curl is here purely so the container healthcheck can probe /actuator/health;
# the base image ships neither curl nor wget.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
    CMD curl -fsS http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1

COPY --from=builder /app/target/leetly-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.profiles.active=prod", \
  "-jar", "app.jar"]
