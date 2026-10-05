package com.tcs.nqt.repository;

import com.tcs.nqt.entity.SubjectProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubjectProgressRepository extends JpaRepository<SubjectProgress, Long> {
    Optional<SubjectProgress> findBySubject(String subject);
}
