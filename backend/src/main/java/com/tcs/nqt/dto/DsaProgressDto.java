package com.tcs.nqt.dto;

public class DsaProgressDto {
    private Long id;
    private double totalHours;
    private double completedHours;
    private double remainingHours;
    private int percentageCompleted;

    public DsaProgressDto() {}

    public DsaProgressDto(Long id, double totalHours, double completedHours, double remainingHours, int percentageCompleted) {
        this.id = id;
        this.totalHours = totalHours;
        this.completedHours = completedHours;
        this.remainingHours = remainingHours;
        this.percentageCompleted = percentageCompleted;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public double getTotalHours() { return totalHours; }
    public void setTotalHours(double totalHours) { this.totalHours = totalHours; }
    public double getCompletedHours() { return completedHours; }
    public void setCompletedHours(double completedHours) { this.completedHours = completedHours; }
    public double getRemainingHours() { return remainingHours; }
    public void setRemainingHours(double remainingHours) { this.remainingHours = remainingHours; }
    public int getPercentageCompleted() { return percentageCompleted; }
    public void setPercentageCompleted(int percentageCompleted) { this.percentageCompleted = percentageCompleted; }
}
