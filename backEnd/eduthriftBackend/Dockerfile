# ---------- BUILD ----------
FROM eclipse-temurin:17-jdk AS builder
WORKDIR /app

COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

COPY src src
RUN ./mvnw clean package -DskipTests

# ---------- RUN ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

RUN mkdir -p /app/uploads/id-documents /app/uploads/proof-of-residence

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
