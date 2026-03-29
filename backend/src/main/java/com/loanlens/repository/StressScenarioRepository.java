package com.loanlens.repository;

import com.loanlens.model.StressScenario;
import com.loanlens.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StressScenarioRepository extends JpaRepository<StressScenario, String> {
    List<StressScenario> findByUserOrderByCreatedAtDesc(User user);
}
