package com.aidocrag.auditoria.api.config.swagger;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
@SecurityScheme(name = "cookieAuth", 
        type = SecuritySchemeType.APIKEY, 
        in = SecuritySchemeIn.COOKIE, 
        paramName = "token" 
)
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AI Document RAG API")
                        .version("1.0")
                        .description(
                                """
                                        REST API for AI Document RAG — a document Q&A application built on \
                                        Retrieval-Augmented Generation (Spring Boot + FastAPI/LlamaIndex, Groq LLM, Gemini embeddings).

                                        Upload a document, then ask questions answered strictly from that document.""")
                        .license(new License()
                                .name("MIT License")));
    }
}