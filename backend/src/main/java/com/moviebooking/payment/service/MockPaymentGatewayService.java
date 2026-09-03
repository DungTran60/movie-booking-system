package com.moviebooking.payment.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
public class MockPaymentGatewayService implements PaymentGatewayService {

    @Override
    public boolean refund(String transactionId, BigDecimal amount) {
        log.info("Processing refund via payment gateway. Transaction ID: {}, Amount: {}", transactionId, amount);
        // Simulate gateway refund response
        return true;
    }
}
