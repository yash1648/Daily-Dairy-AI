package com.dairy.backend.controller;


import com.dairy.backend.model.LoginResponse;
import com.dairy.backend.model.UserDTO;
import com.dairy.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoginController {

    @Autowired
    UserService userService;

    @PostMapping("/app/login")
public ResponseEntity<LoginResponse> login(@RequestBody UserDTO user) {
        return userService.login(user);

    }

    @GetMapping("/app/getuser")
    public ResponseEntity<UserDTO> getUser(String username) {
        return userService.getUser(username);
    }
}
