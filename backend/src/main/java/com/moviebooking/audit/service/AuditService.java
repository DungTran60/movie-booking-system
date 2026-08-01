package com.moviebooking.audit.service;

import com.moviebooking.audit.entity.AuditLog;
import com.moviebooking.audit.repository.AuditLogRepository;
import com.moviebooking.common.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(User user, String action, String entityName, Long entityId, String details) {
        AuditLog auditLog = AuditLog.builder()
                .tenantId(user != null && user.getTenant() != null ? user.getTenant().getId() : null)
                .userId(user != null ? user.getId() : null)
                .userEmail(user != null ? user.getEmail() : "SYSTEM")
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .details(details)
                .build();

        auditLogRepository.save(auditLog);
    }
}
