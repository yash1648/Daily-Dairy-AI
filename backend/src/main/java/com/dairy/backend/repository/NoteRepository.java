package com.dairy.backend.repository;

import com.dairy.backend.model.Notes;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;


@Repository
public interface NoteRepository extends JpaRepository<Notes, Long> {

    List<Notes> findByUserIdOrderByUpdatedAtDesc(Long userId);
    List<Notes> findByUserIdAndTitleContainingIgnoreCase(Long userId, String title);
    Optional<Notes> findByIdAndUserId(Long id, Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
    long countByUserId(Long userId);

}
