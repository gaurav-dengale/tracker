package com.tcs.nqt.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "planned_duration")
    private String plannedDuration;

    @Column(columnDefinition = "boolean default false")
    private boolean completed = false;

    @Column(columnDefinition = "text")
    private String notes;

    public Task() {}

    public Task(Long id, String title, String subject, LocalDate date, String plannedDuration, boolean completed, String notes) {
        this.id = id;
        this.title = title;
        this.subject = subject;
        this.date = date;
        this.plannedDuration = plannedDuration;
        this.completed = completed;
        this.notes = notes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getPlannedDuration() { return plannedDuration; }
    public void setPlannedDuration(String plannedDuration) { this.plannedDuration = plannedDuration; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
