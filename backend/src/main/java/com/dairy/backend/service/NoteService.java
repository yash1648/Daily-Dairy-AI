package com.dairy.backend.service;

import com.dairy.backend.dto.NoteRequest;
import com.dairy.backend.dto.NoteResponse;
import com.dairy.backend.dto.NoteUpdateRequest;
import com.dairy.backend.exception.ResourceNotFoundException;
import com.dairy.backend.exception.UserNotFoundException;
import com.dairy.backend.model.Notes;
import com.dairy.backend.model.User;
import com.dairy.backend.repository.NoteRepository;

import com.dairy.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;
    @Autowired
    private UserRepository userRepository;
    // Create a new note
    public List<NoteResponse> getAllNotesByUser(Long userId) {
        return noteRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(NoteResponse::new)
                .collect(Collectors.toList());
    }

    public Optional<NoteResponse> getNoteById(Long noteId, Long userId) {
        return noteRepository.findByIdAndUserId(noteId, userId)
                .map(NoteResponse::new);
    }

    @Transactional
    public NoteResponse createNote(NoteRequest request, Long userId) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        Notes note = new Notes();
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setUser(user);
        Notes savedNote = noteRepository.save(note);
        return new NoteResponse(savedNote);
    }
    @Transactional
    public Optional<NoteResponse> updateNote(Long noteId, NoteRequest request, Long userId) {
        Optional<Notes> noteOpt = noteRepository.findByIdAndUserId(noteId, userId);
        if (noteOpt.isPresent()) {
            Notes note = noteOpt.get();
            note.setTitle(request.getTitle());
            note.setContent(request.getContent());
            Notes updatedNote = noteRepository.save(note);
            return Optional.of(new NoteResponse(updatedNote));
        }
        return Optional.empty();
    }
    @Transactional
    public boolean deleteNote(Long noteId, Long userId) {
        Optional<Notes> noteOpt = noteRepository.findByIdAndUserId(noteId, userId);
        if (noteOpt.isPresent()) {
            noteRepository.deleteByIdAndUserId(noteId, userId);
            return true;
        }
        return false;
    }

    public List<NoteResponse> searchNotes(Long userId, String title) {
        return noteRepository.findByUserIdAndTitleContainingIgnoreCase(userId, title)
                .stream()
                .map(NoteResponse::new)
                .collect(Collectors.toList());
    }

    public long getNoteCountByUser(Long userId) {
        return noteRepository.countByUserId(userId);
    }


}
