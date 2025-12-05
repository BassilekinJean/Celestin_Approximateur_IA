# ============================================
# Stage 1: Build
# ============================================
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY celestin_chatbot/mvnw .
COPY celestin_chatbot/.mvn .mvn
COPY celestin_chatbot/pom.xml .

# Make Maven wrapper executable
RUN chmod +x mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY celestin_chatbot/src src

# Build the application
RUN ./mvnw package -DskipTests -B

# ============================================
# Stage 2: Runtime
# ============================================
FROM eclipse-temurin:21-jre

WORKDIR /app

# Create non-root user for security
RUN groupadd -r celestin && useradd -r -g celestin celestin

# Copy the JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Set ownership
RUN chown -R celestin:celestin /app

# Switch to non-root user
USER celestin

# Expose the application port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
