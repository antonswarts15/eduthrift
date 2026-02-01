@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ❌ Disable all browser-based auth
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())

            // ✅ Let frontend handle auth via API
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/auth/**", "/health").permitAll()
                    .anyRequest().permitAll()
            );

    return http.build();
}
