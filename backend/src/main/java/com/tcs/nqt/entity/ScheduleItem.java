package com.tcs.nqt.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "schedule_items")
public class ScheduleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "time_slot", nullable = false)
    private String timeSlot;

    @Column(nullable = false)
    private String activity;

    @Column(name = "sort_order")
    private int sortOrder;

    public ScheduleItem() {}

    public ScheduleItem(Long id, String timeSlot, String activity, int sortOrder) {
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
