package org.fitsync.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PortOneConfig {
    
    @Value("${portone.api.secret}")
    private String apiSecretKey;
    
    @Value("${portone.billing.key}")
    private String billingKey;
    
    @Value("${portone.channel.key}")
    private String channelKey;
    
    @Value("${portone.kakaopay.channel.key}")
    private String kakaopayChannelKey;
    
    @Value("${portone.tosspayments.channel.key}")
    private String tosspaymentsChannelKey;
    
    @Value("${portone.store.id}")
    private String storeId;
    
    public String getApiSecretKey() {
        return apiSecretKey;
    }
    
    public String getBillingKey() {
        return billingKey;
    }
    
    public String getChannelKey() {
        return channelKey;
    }
    
    public String getKakaopayChannelKey() {
        return kakaopayChannelKey;
    }
    
    public String getTosspaymentsChannelKey() {
        return tosspaymentsChannelKey;
    }
    
    public String getStoreId() {
        return storeId;
    }
}
