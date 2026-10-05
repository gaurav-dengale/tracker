package com.tcs.nqt.controller;

import com.tcs.nqt.dto.ScheduleItemDto;
import com.tcs.nqt.service.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedule")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public ResponseEntity<List<ScheduleItemDto>> getAllItems() {
        return ResponseEntity.ok(scheduleService.getAllItems());
    }

    @PostMapping
    public ResponseEntity<ScheduleItemDto> createItem(@RequestBody ScheduleItemDto dto) {
        return ResponseEntity.ok(scheduleService.createItem(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScheduleItemDto> updateItem(@PathVariable Long id, @RequestBody ScheduleItemDto dto) {
        return ResponseEntity.ok(scheduleService.updateItem(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        scheduleService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
