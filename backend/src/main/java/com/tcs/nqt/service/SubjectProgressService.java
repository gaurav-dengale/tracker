package com.tcs.nqt.service;

import com.tcs.nqt.dto.SubjectProgressDto;
import com.tcs.nqt.entity.SubjectProgress;
import com.tcs.nqt.repository.SubjectProgressRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubjectProgressService {

    private final SubjectProgressRepository subjectProgressRepository;

    public SubjectProgressService(SubjectProgressRepository subjectProgressRepository) {
        this.subjectProgressRepository = subjectProgressRepository;
    }

    private static final List<String> DEFAULT_SUBJECTS = Arrays.asList(
            "DSA / Striver",
            "TCS NQT Aptitude",
            "Coding Practice",
            "Development",
            "Communication",
            "Interview Preparation"
    );

    @PostConstruct
    public void initDefaultSubjects() {
        for (String subject : DEFAULT_SUBJECTS) {
            if (subjectProgressRepository.findBySubject(subject).isEmpty()) {
                SubjectProgress sp = new SubjectProgress();
                sp.setSubject(subject);
                sp.setProgressPercentage(0);
                subjectProgressRepository.save(sp);
            }
        }
    }

    public List<SubjectProgressDto> getAllSubjects() {
        return subjectProgressRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public SubjectProgressDto updateProgress(Long id, int percentage) {
        SubjectProgress sp = subjectProgressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubjectProgress not found with id: " + id));
        sp.setProgressPercentage(Math.max(0, Math.min(100, percentage)));
        return toDto(subjectProgressRepository.save(sp));
    }

    private SubjectProgressDto toDto(SubjectProgress sp) {
        SubjectProgressDto dto = new SubjectProgressDto();
        dto.setId(sp.getId());
        dto.setSubject(sp.getSubject());
        dto.setProgressPercentage(sp.getProgressPercentage());
        return dto;
    }
}
