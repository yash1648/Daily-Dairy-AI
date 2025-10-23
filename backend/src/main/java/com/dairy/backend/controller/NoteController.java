package com.dairy.backend.controller;


import com.dairy.backend.dto.ApiResponse;
import com.dairy.backend.dto.NoteRequest;
import com.dairy.backend.dto.NoteResponse;
import com.dairy.backend.dto.NoteUpdateRequest;
import com.dairy.backend.exception.UnauthorizedException;
import com.dairy.backend.exception.UserNotFoundException;
import com.dairy.backend.security.JwtUtil;
import com.dairy.backend.service.NoteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    @Autowired
    private NoteService noteService;

    @Autowired
    private JwtUtil jwtUtil;

    private Long getUserIdFromToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.trim().startsWith("Bearer ")) {
            String token = authHeader.trim().substring(7).trim();
            Long userId = jwtUtil.extractUserId(token);
            System.out.println("Extracted JWT token: " + token);
            System.out.println("User ID from token: " + userId);
            if (userId == null) {
                throw new UnauthorizedException("User ID could not be extracted from token");
            }
            System.out.println("Extracted JWT token: " + token);
            System.out.println("User ID from token: " + userId);

            return userId;
        }
        throw new UnauthorizedException("No valid token found");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NoteResponse>>> getAllNotes(HttpServletRequest request) {
        try {
            Long userId = getUserIdFromToken(request);
            List<NoteResponse> notes = noteService.getAllNotesByUser(userId);

            return ResponseEntity.ok(new ApiResponse<>(true, "Notes retrieved successfully", notes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoteResponse>> getNoteById(
            @PathVariable Long id,
            HttpServletRequest request) {
        try {
            Long userId = getUserIdFromToken(request);
            Optional<NoteResponse> note = noteService.getNoteById(id, userId);
            if (note.isPresent()) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Note found", note.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Note not found", null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NoteResponse>> createNote(
            @Valid @RequestBody NoteRequest request,
            HttpServletRequest httpRequest) {
        try {
            Long userId = getUserIdFromToken(httpRequest);
            System.out.println(userId);
            NoteResponse note = noteService.createNote(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "Note created successfully", note));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NoteResponse>> updateNote(
            @PathVariable Long id,
            @Valid @RequestBody NoteRequest request,
            HttpServletRequest httpRequest) {
        try {
            Long userId = getUserIdFromToken(httpRequest);
            Optional<NoteResponse> updatedNote = noteService.updateNote(id, request, userId);
            if (updatedNote.isPresent()) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Note updated successfully", updatedNote.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Note not found", null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteNote(
            @PathVariable Long id,
            HttpServletRequest request) {
        try {
            Long userId = getUserIdFromToken(request);
            boolean deleted = noteService.deleteNote(id, userId);
            if (deleted) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Note deleted successfully", "Deleted"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Note not found", null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<NoteResponse>>> searchNotes(
            @RequestParam String title,
            HttpServletRequest request) {
        try {
            Long userId = getUserIdFromToken(request);
            List<NoteResponse> notes = noteService.searchNotes(userId, title);
            return ResponseEntity.ok(new ApiResponse<>(true, "Search completed", notes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getNoteCount(HttpServletRequest request) {
        try {
            Long userId = getUserIdFromToken(request);
            long count = noteService.getNoteCountByUser(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Note count retrieved", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions() {
        System.out.println("🔍 OPTIONS request received");
        return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "http://localhost:8080")
                .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                .header("Access-Control-Allow-Headers", "*")
                .header("Access-Control-Allow-Credentials", "true")
                .build();
    }
}


