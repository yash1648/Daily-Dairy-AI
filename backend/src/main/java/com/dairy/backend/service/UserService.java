package com.dairy.backend.service;


import com.dairy.backend.model.LoginResponse;
import com.dairy.backend.model.Users;
import com.dairy.backend.model.UserDTO;
import com.dairy.backend.repository.UserRepository;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

import static org.springframework.http.ResponseEntity.ok;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public ResponseEntity<LoginResponse> login(UserDTO user) {
        if (user == null || user.getUsername() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Users> optionalUser = userRepository.findByUsername(user.getUsername()).stream().findFirst();

        if (optionalUser.isEmpty()) {
            // User doesn't exist – create a new one
            Users newUser = Users.builder().username(user.getUsername()).password(user.getPassword()).build();
            userRepository.save(newUser);
            // TODO: Generate JWT Token for new user
            String token = "tokebntobe generated";

            return ResponseEntity.ok(LoginResponse.builder().token(token).build());
        }

        Users u = optionalUser.get();

        // If you're not using BCrypt yet, this is a basic match:
        if (!u.getPassword().equals(user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

            // TODO: Replace with real token generation later
            String token = "PlaceholderToken";

            return ResponseEntity.ok(LoginResponse.builder()
                    .token(token)
                    .build());


    }

    public ResponseEntity<UserDTO> getUser(String username) {
        Users u=userRepository.findByUsername(username).stream().findFirst().get();
        UserDTO user=new UserDTO();
        user.setUsername(u.getUsername());
        user.setPassword(u.getPassword());
        return ResponseEntity.ok(user);
    }



}
