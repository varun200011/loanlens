package com.loanlens.repository;

import com.loanlens.model.Loan;
import com.loanlens.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface LoanRepository extends JpaRepository<Loan, String> {
    List<Loan> findByUserAndActiveTrue(User user);
    List<Loan> findByUser(User user);

    @Query("SELECT SUM(l.principal) FROM Loan l WHERE l.user = :user AND l.active = true")
    java.math.BigDecimal sumPrincipalByUser(User user);
}
