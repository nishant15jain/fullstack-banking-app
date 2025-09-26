package com.example.finance.auth;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.context.annotation.Bean;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {
    private final JwtFilter jwtFilter;
    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

   @Bean
   public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
   }

   @Bean
   public CorsConfigurationSource corsConfigurationSource() {
       CorsConfiguration configuration = new CorsConfiguration();
       configuration.setAllowedOriginPatterns(Arrays.asList(
           "http://localhost:*", 
           "https://localhost:*",
           "https://banking-finance-app.netlify.app",
           "https://*.netlify.app"
       ));
       configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
       configuration.setAllowedHeaders(Arrays.asList("*"));
       configuration.setAllowCredentials(true);
       
       UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
       source.registerCorsConfiguration("/**", configuration);
       return source;
   }

   @Bean
   public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
       http.csrf(csrf -> csrf.disable())
           .cors(cors -> cors.configurationSource(corsConfigurationSource()))
           .authorizeHttpRequests(auth -> auth
                   .requestMatchers("/api/auth/**", "/api/users/register").permitAll()
                   .requestMatchers("/swagger-ui/**").permitAll()
                   .requestMatchers("/swagger-ui.html").permitAll()
                   .requestMatchers("/v3/api-docs/**").permitAll()
                   .anyRequest().authenticated()
           )
           .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
           .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

       return http.build();
   }
}
