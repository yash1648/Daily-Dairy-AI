package com.dairy.backend.service;


import com.dairy.backend.model.*;
import com.dairy.backend.repository.UserRepository;
import com.dairy.backend.security.CustomUserDetailsService;
import com.dairy.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
public class UserService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;







    public LoginResponse login(LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());
        if (userOptional.isEmpty()) {
            // User doesn't exist, create new user automatically
            User newUser = signup(SignupRequest.builder()
                    .username(loginRequest.getUsername())
                    .password(loginRequest.getPassword())

                    .build());

            // Generate token for new user
            UserDetails userDetails = userDetailsService.loadUserByUsername(newUser.getUsername());
            String token = jwtUtil.generateToken(userDetails);

            return LoginResponse.builder()
                    .token(token)
                    .id(newUser.getId())
                    .username(newUser.getUsername())

                    .role(newUser.getRole().name())
                    .build();
        }

        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword())
            );

            // Load user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getUsername());

            // Generate JWT token
            String token = jwtUtil.generateToken(userDetails);

            // Get user info
            User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();

            return LoginResponse.builder()
                    .token(token)
                    .id(user.getId())
                    .username(user.getUsername())
                    .role(user.getRole().name()).build();

        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid username or password", e);

        }
    }

    public User signup(SignupRequest signupRequest) {
        // Check if username exists
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }


        // Create new user
        User user = User.builder().username(signupRequest.getUsername()).
                password(passwordEncoder.encode(signupRequest.getPassword())).
                role(Role.USER).
                build();



        return userRepository.save(user);
    }
}



