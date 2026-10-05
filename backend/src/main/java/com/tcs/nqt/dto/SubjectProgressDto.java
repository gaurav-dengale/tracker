package com.tcs.nqt.dto;

public class SubjectProgressDto {
    private Long id;
    private String subject;
    private int progressPercentage;

    public SubjectProgressDto() {}

    public SubjectProgressDto(Long id, String subject, int progressPercentage) {
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
