package com.dairy.backend.dto;

public class UserInfoResponse {
    private Long id;
    private String username;
    private String role;

    public UserInfoResponse(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
}
