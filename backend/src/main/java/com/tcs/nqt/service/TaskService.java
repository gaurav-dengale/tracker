package com.tcs.nqt.service;

import com.tcs.nqt.dto.TaskDto;
import com.tcs.nqt.entity.Task;
import com.tcs.nqt.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getTasksByDate(LocalDate date) {
        return taskRepository.findByDate(date).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getTasksByDateRange(LocalDate start, LocalDate end) {
        return taskRepository.findByDateBetweenOrderByDateAscIdAsc(start, end).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public TaskDto createTask(TaskDto dto) {
        Task task = toEntity(dto);
        return toDto(taskRepository.save(task));
    }

    public TaskDto updateTask(Long id, TaskDto dto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        task.setTitle(dto.getTitle());
        task.setSubject(dto.getSubject());
        task.setDate(dto.getDate());
        task.setPlannedDuration(dto.getPlannedDuration());
        task.setCompleted(dto.isCompleted());
        task.setNotes(dto.getNotes());
        return toDto(taskRepository.save(task));
    }

    public TaskDto toggleComplete(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        task.setCompleted(!task.isCompleted());
        return toDto(taskRepository.save(task));
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    private TaskDto toDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setSubject(task.getSubject());
        dto.setDate(task.getDate());
        dto.setPlannedDuration(task.getPlannedDuration());
        dto.setCompleted(task.isCompleted());
        dto.setNotes(task.getNotes());
        return dto;
    }

    private Task toEntity(TaskDto dto) {
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setSubject(dto.getSubject());
        task.setDate(dto.getDate());
        task.setPlannedDuration(dto.getPlannedDuration());
        task.setCompleted(dto.isCompleted());
        task.setNotes(dto.getNotes());
        return task;
    }
}
