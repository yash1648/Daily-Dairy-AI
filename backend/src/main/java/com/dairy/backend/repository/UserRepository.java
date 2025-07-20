package com.dairy.backend.repository;

import com.dairy.backend.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface UserRepository extends JpaRepository<Users, Integer> {
    public List<Users> findByUsername(String username);

}
