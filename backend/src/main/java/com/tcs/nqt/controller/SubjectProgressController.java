package com.tcs.nqt.controller;

import com.tcs.nqt.dto.SubjectProgressDto;
import com.tcs.nqt.service.SubjectProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subject-progress")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SubjectProgressController {

    private final SubjectProgressService subjectProgressService;

    public SubjectProgressController(SubjectProgressService subjectProgressService) {
        this.subjectProgressService = subjectProgressService;
    }

    @GetMapping
    public ResponseEntity<List<SubjectProgressDto>> getAllSubjects() {
        return ResponseEntity.ok(subjectProgressService.getAllSubjects());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubjectProgressDto> updateProgress(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        int percentage = body.getOrDefault("progressPercentage", 0);
        return ResponseEntity.ok(subjectProgressService.updateProgress(id, percentage));
    }
}
