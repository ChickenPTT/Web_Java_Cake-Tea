# ===== Build stage =====
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependencies trước để build nhanh hơn ở các lần sau
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Build jar (bỏ qua test cho nhanh)
COPY src ./src
RUN mvn -B clean package -DskipTests

# ===== Run stage =====
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render truyền cổng qua biến PORT; Spring đọc ${PORT} trong application.properties
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
