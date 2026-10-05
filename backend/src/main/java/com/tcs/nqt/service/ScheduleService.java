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
                    new ScheduleItem(null, "7:00 – 7:30 AM", "Wake up + Freshen up", 1),
                    new ScheduleItem(null, "7:30 – 9:30 AM", "Striver DSA", 2),
                    new ScheduleItem(null, "9:30 – 10:00 AM", "Breakfast / Break", 3),
                    new ScheduleItem(null, "10:00 AM – 12:00 PM", "TCS NQT Aptitude", 4),
                    new ScheduleItem(null, "12:00 – 12:30 PM", "Break", 5),
                    new ScheduleItem(null, "12:30 – 2:30 PM", "Development", 6),
                    new ScheduleItem(null, "2:30 – 3:00 PM", "Lunch", 7),
                    new ScheduleItem(null, "3:00 – 4:00 PM", "Coding / NQT Coding Practice", 8),
                    new ScheduleItem(null, "4:00 – 4:30 PM", "Communication", 9),
                    new ScheduleItem(null, "4:30 – 5:00 PM", "Break / Get Ready", 10),
                    new ScheduleItem(null, "5:00 – 7:30 PM", "Gym", 11),
                    new ScheduleItem(null, "7:30 – 8:00 PM", "Dinner", 12),
                    new ScheduleItem(null, "8:00 – 9:00 PM", "Revision", 13),
                    new ScheduleItem(null, "9:00 – 9:45 PM", "Interview Preparation", 14)
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
