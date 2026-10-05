package com.tcs.nqt.controller;

import com.tcs.nqt.dto.DsaProgressDto;
import com.tcs.nqt.service.DsaProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dsa-progress")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class DsaProgressController {

    private final DsaProgressService dsaProgressService;

    public DsaProgressController(DsaProgressService dsaProgressService) {
        this.dsaProgressService = dsaProgressService;
    }

    @GetMapping
    public ResponseEntity<DsaProgressDto> getProgress() {
        return ResponseEntity.ok(dsaProgressService.getProgress());
    }

    @PutMapping
    public ResponseEntity<DsaProgressDto> updateProgress(@RequestBody Map<String, Double> body) {
        double hours = body.getOrDefault("completedHours", 0.0);
        return ResponseEntity.ok(dsaProgressService.updateCompletedHours(hours));
    }
}
