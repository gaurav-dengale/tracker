package com.tcs.nqt.repository;

import com.tcs.nqt.entity.DsaProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DsaProgressRepository extends JpaRepository<DsaProgress, Long> {
}
