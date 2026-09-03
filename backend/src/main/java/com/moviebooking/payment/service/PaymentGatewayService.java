package com.moviebooking.payment.service;

import java.math.BigDecimal;

public interface PaymentGatewayService {
    /**
     * Calls payment gateway to refund money back to the customer.
     * @param transactionId the gateway transaction ID
     * @param amount the refund amount
     * @return true if refund was approved, false otherwise
     */
    boolean refund(String transactionId, BigDecimal amount);
}
