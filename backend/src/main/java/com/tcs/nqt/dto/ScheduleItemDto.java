package com.tcs.nqt.dto;

public class ScheduleItemDto {
    private Long id;
    private String timeSlot;
    private String activity;
    private int sortOrder;

    public ScheduleItemDto() {}

    public ScheduleItemDto(Long id, String timeSlot, String activity, int sortOrder) {
        this.id = id;
        this.timeSlot = timeSlot;
        this.activity = activity;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
    public String getActivity() { return activity; }
    public void setActivity(String activity) { this.activity = activity; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
