package com.tcs.nqt.service;

import com.tcs.nqt.dto.ScheduleItemDto;
import com.tcs.nqt.entity.ScheduleItem;
import com.tcs.nqt.repository.ScheduleItemRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ScheduleItemRepository scheduleItemRepository;

    public ScheduleService(ScheduleItemRepository scheduleItemRepository) {
        this.scheduleItemRepository = scheduleItemRepository;
    }

    @PostConstruct
    public void initDefaultSchedule() {
        if (scheduleItemRepository.count() == 0) {
            List<ScheduleItem> defaults = Arrays.asList(
                    new ScheduleItem(null, "7:00 – 7:30 AM", "🌅 Wake up + Freshen up", 1),
                    new ScheduleItem(null, "7:30 – 10:30 AM", "💻 Striver DSA", 2),
                    new ScheduleItem(null, "10:30 AM – 12:00 PM", "🧠 TCS NQT Aptitude", 3),
                    new ScheduleItem(null, "12:00 – 12:30 PM", "🍛 Lunch + Break", 4),
                    new ScheduleItem(null, "12:30 – 2:30 PM", "🚀 Development — Java + Spring Boot", 5),
                    new ScheduleItem(null, "2:30 – 3:30 PM", "🧩 NQT Coding / Coding Practice", 6),
                    new ScheduleItem(null, "3:30 – 4:00 PM", "🗣️ Communication / Spoken English", 7),
                    new ScheduleItem(null, "4:00 – 4:30 PM", "☕ Break + Get Ready", 8),
                    new ScheduleItem(null, "4:30 – 6:30 PM", "🏋️ Gym", 9),
                    new ScheduleItem(null, "6:30 – 7:00 PM", "🚿 Freshen up / Relax", 10),
                    new ScheduleItem(null, "7:00 – 8:00 PM", "⚛️ React", 11),
                    new ScheduleItem(null, "8:00 – 8:30 PM", "🍽️ Dinner", 12),
                    new ScheduleItem(null, "8:30 – 9:30 PM", "🔄 Revision", 13),
                    new ScheduleItem(null, "9:30 – 10:15 PM", "🎯 Interview Preparation", 14),
                    new ScheduleItem(null, "10:15 – 10:30 PM", "☕ Break", 15),
                    new ScheduleItem(null, "10:30 – 11:30 PM", "⚛️ React — Practice / Project", 16),
                    new ScheduleItem(null, "11:30 PM – 12:00 AM", "🏗️ System Design", 17)
            );
            scheduleItemRepository.saveAll(defaults);
        }
    }

    public List<ScheduleItemDto> getAllItems() {
        return scheduleItemRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ScheduleItemDto updateItem(Long id, ScheduleItemDto dto) {
        ScheduleItem item = scheduleItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ScheduleItem not found with id: " + id));
        item.setTimeSlot(dto.getTimeSlot());
        item.setActivity(dto.getActivity());
        item.setSortOrder(dto.getSortOrder());
        return toDto(scheduleItemRepository.save(item));
    }

    public ScheduleItemDto createItem(ScheduleItemDto dto) {
        ScheduleItem item = new ScheduleItem();
        item.setTimeSlot(dto.getTimeSlot());
        item.setActivity(dto.getActivity());
        item.setSortOrder(dto.getSortOrder());
        return toDto(scheduleItemRepository.save(item));
    }

    public void deleteItem(Long id) {
        scheduleItemRepository.deleteById(id);
    }

    private ScheduleItemDto toDto(ScheduleItem item) {
        return new ScheduleItemDto(
                item.getId(),
                item.getTimeSlot(),
                item.getActivity(),
                item.getSortOrder()
        );
    }
}
