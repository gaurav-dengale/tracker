package com.tcs.nqt.service;

import com.tcs.nqt.dto.DsaProgressDto;
import com.tcs.nqt.entity.DsaProgress;
import com.tcs.nqt.repository.DsaProgressRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DsaProgressService {

    private final DsaProgressRepository dsaProgressRepository;

    public DsaProgressService(DsaProgressRepository dsaProgressRepository) {
        this.dsaProgressRepository = dsaProgressRepository;
    }

    public DsaProgressDto getProgress() {
        List<DsaProgress> list = dsaProgressRepository.findAll();
        if (list.isEmpty()) {
            DsaProgress defaultProgress = new DsaProgress(null, 110.0, 0.0);
            DsaProgress saved = dsaProgressRepository.save(defaultProgress);
            return toDto(saved);
        }
        return toDto(list.get(0));
    }

    public DsaProgressDto updateCompletedHours(double completedHours) {
        List<DsaProgress> list = dsaProgressRepository.findAll();
        DsaProgress progress;
        if (list.isEmpty()) {
            progress = new DsaProgress(null, 110.0, completedHours);
        } else {
            progress = list.get(0);
            progress.setCompletedHours(completedHours);
        }
        return toDto(dsaProgressRepository.save(progress));
    }

    private DsaProgressDto toDto(DsaProgress p) {
        double remaining = p.getTotalHours() - p.getCompletedHours();
        int percentage = (int) Math.round((p.getCompletedHours() / p.getTotalHours()) * 100);
        return new DsaProgressDto(
                p.getId(),
                p.getTotalHours(),
                p.getCompletedHours(),
                Math.max(0, remaining),
                Math.min(100, percentage)
        );
    }
}
