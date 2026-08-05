package gustavo.company.auditoria.api.config.security;

import java.util.ArrayList;
import java.util.UUID;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import gustavo.company.entity.UserDomain;
import gustavo.company.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {

        UUID userIdToUUID = UUID.fromString(userId);
        UserDomain user = userRepository.findById(userIdToUUID)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        return new org.springframework.security.core.userdetails.User(
            user.email(),
            user.password(),
            new ArrayList<>()
        );
    }
}