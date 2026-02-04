package za.co.thrift.eduthrift.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    // CORS is configured in SecurityConfig via CorsConfigurationSource
}
