package com.loanlens.repository;

import com.loanlens.model.Report;
import com.loanlens.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReportRepository extends JpaRepository<Report, String> {
    List<Report> findByUserOrderByGeneratedAtDesc(User user);
}
