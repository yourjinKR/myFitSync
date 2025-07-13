package org.fitsync.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class PaymentServiceImple implements PaymentService {
	@Override
	public Object saveBillingKey() {
		// TODO Auto-generated method stub
		return null;
	}
	
	// api key, payment id, billing key, channel key, ordername, amount, currency 
	@Override
	public Object payBillingKey() {
	    try {
	        HttpRequest request = HttpRequest.newBuilder()
	                .uri(URI.create("https://api.portone.io/payments/paymentId/billing-key"))
	                .header("Content-Type", "application/json")
	                .method("POST", HttpRequest.BodyPublishers.ofString("{\"billingKey\":\"billing-key-0197feb4-f199-7120-a93a-e6aef71313c2\",\"orderName\":\"fitsync구독\",\"amount\":3000,\"currency\":KRW}"))
	                .build();

	        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
	        System.out.println(response.body());
	    } catch (IOException | InterruptedException e) {
	        e.printStackTrace();
	    }
	    return null;
	}

	
	@Override
	public Object scheduleBillingKey() {
		// TODO Auto-generated method stub
		return null;
	}
}
