FROM eclipse-temurin:21-jdk as builder

WORKDIR /app

# Copia o Maven Wrapper do módulo 'framework'
COPY framework/.mvn/ .mvn/
COPY framework/mvnw mvnw
RUN chmod +x mvnw

# Copia o pom.xml pai e os pom.xml dos módulos
COPY pom.xml pom.xml
COPY framework/pom.xml framework/pom.xml
COPY domain/pom.xml domain/pom.xml

# Copia os diretórios dos módulos
COPY framework/ framework/
COPY domain/ domain/

# Baixa as dependências
RUN ./mvnw dependency:go-offline

# Compila o módulo 'framework' e suas dependências (como 'domain'), sem rodar testes
RUN ./mvnw clean package -pl framework -am -DskipTests


FROM eclipse-temurin:21-jdk

WORKDIR /app
COPY --from=builder /app/framework/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
