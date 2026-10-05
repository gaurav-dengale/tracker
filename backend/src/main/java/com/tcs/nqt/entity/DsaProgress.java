package com.tcs.nqt.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "dsa_progress")
public class DsaProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "total_hours")
    private double totalHours = 110.0;

    @Column(name = "completed_hours")
    private double completedHours = 0.0;

    public DsaProgress() {}

    public DsaProgress(Long id, double totalHours, double completedHours) {
        this.id = id;
        this.totalHours = totalHours;
        this.completedHours = completedHours;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public double getTotalHours() { return totalHours; }
    public void setTotalHours(double totalHours) { this.totalHours = totalHours; }
    public double getCompletedHours() { return completedHours; }
    public void setCompletedHours(double completedHours) { this.completedHours = completedHours; }
}
