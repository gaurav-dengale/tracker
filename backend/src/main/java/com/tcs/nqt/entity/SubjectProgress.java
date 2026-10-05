package com.tcs.nqt.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "subject_progress")
public class SubjectProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String subject;

    @Column(name = "progress_percentage")
    private int progressPercentage = 0;

    public SubjectProgress() {}

    public SubjectProgress(Long id, String subject, int progressPercentage) {
        this.id = id;
        this.subject = subject;
        this.progressPercentage = progressPercentage;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public int getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(int progressPercentage) { this.progressPercentage = progressPercentage; }
}
