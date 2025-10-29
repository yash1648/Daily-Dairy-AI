FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the Maven configuration files
COPY pom.xml .
COPY .mvn .mvn

# Copy the source code
COPY src src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port the app runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]