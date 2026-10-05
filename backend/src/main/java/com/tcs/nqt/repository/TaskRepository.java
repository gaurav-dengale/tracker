package com.tcs.nqt.repository;

import com.tcs.nqt.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByDate(LocalDate date);
    List<Task> findByDateBetween(LocalDate start, LocalDate end);
    List<Task> findByDateBetweenOrderByDateAscIdAsc(LocalDate start, LocalDate end);
}
