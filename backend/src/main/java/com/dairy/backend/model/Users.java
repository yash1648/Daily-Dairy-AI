package com.dairy.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;


@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column( nullable = false, updatable = false)
    private Long id;
    @Column(unique=true, nullable=false)
    private String username;
    @Column(nullable=false)
    private String password;

    private String masterPassword;
}
