package com.aidocrag.auditoria.api.config.security;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;


import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.aidocrag.repository.UserRepository;
import com.aidocrag.utils.JWTUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final JWTUtils jwtUtils;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws IOException, ServletException {

        if (shouldNotFilter(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = recoverToken(request);
        if (token != null) {
            try {
                String userId = jwtUtils.validateAndExtractUserId(token);

                if (userId != null) {
                    UUID userIdToUUID = UUID.fromString(userId);
                    userRepository.findById(userIdToUUID); // validate the user still exists

                    var authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
                    // principal = userId string, so controllers can read it via
                    // SecurityContextHolder...getAuthentication().getName()
                    var authentication = new UsernamePasswordAuthenticationToken(userId, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Reads the JWT from the Authorization: Bearer header. Header-based (not
     * cookie) so auth survives a cross-site frontend/API split where browsers
     * block third-party cookies.
     */
    private String recoverToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer "))
            return null;
        return header.substring(7);
    }

}
