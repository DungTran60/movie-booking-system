package com.moviebooking.booking.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisSeatLockService {

    private final StringRedisTemplate redisTemplate;

    @Value("${application.booking.seat-lock-ttl-seconds:300}")
    private long lockTtlSeconds;

    private static final String LOCK_KEY_PATTERN = "lock:showtime:%d:seat:%d";

    public String buildLockKey(Long showtimeId, Long seatId) {
        return String.format(LOCK_KEY_PATTERN, showtimeId, seatId);
    }

    /**
     * Atomically acquires locks for all specified seats for a user/session.
     * Uses Redis SET key value NX PX (via setIfAbsent).
     * If any seat fails to be locked, releases all locks acquired in this operation.
     */
    public boolean acquireSeatLocks(Long showtimeId, List<Long> seatIds, Long userId) {
        List<String> acquiredKeys = new ArrayList<>();
        String value = String.valueOf(userId);
        Duration ttl = Duration.ofSeconds(lockTtlSeconds);

        for (Long seatId : seatIds) {
            String key = buildLockKey(showtimeId, seatId);
            Boolean success = redisTemplate.opsForValue().setIfAbsent(key, value, ttl);

            if (Boolean.TRUE.equals(success)) {
                acquiredKeys.add(key);
            } else {
                log.warn("Failed to acquire Redis seat lock for key: {}. Rolling back {} acquired locks.", key, acquiredKeys.size());
                releaseSeatLocksByKeys(acquiredKeys);
                return false;
            }
        }

        log.info("Successfully acquired {} Redis seat locks for showtime: {}, user: {}", acquiredKeys.size(), showtimeId, userId);
        return true;
    }

    /**
     * Releases locks for specified keys.
     */
    public void releaseSeatLocksByKeys(List<String> keys) {
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    /**
     * Releases seat locks for a showtime and list of seat IDs.
     */
    public void releaseSeatLocks(Long showtimeId, List<Long> seatIds) {
        if (seatIds == null || seatIds.isEmpty()) return;
        List<String> keys = seatIds.stream()
                .map(seatId -> buildLockKey(showtimeId, seatId))
                .toList();
        releaseSeatLocksByKeys(keys);
    }

    /**
     * Checks if a seat is currently locked in Redis.
     */
    public boolean isSeatLocked(Long showtimeId, Long seatId) {
        String key = buildLockKey(showtimeId, seatId);
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    public long getLockTtlSeconds() {
        return lockTtlSeconds;
    }
}
