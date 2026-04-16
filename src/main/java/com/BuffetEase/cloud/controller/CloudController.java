package com.BuffetEase.cloud.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CloudController {

	public static class ContactRequest {
		private String name;
		private String email;
		private String message;

		public ContactRequest() {}

		public String getName() { return name; }
		public void setName(String name) { this.name = name; }

		public String getEmail() { return email; }
		public void setEmail(String email) { this.email = email; }

		public String getMessage() { return message; }
		public void setMessage(String message) { this.message = message; }
	}

	@PostMapping("/contact")
	public ResponseEntity<Map<String, String>> receiveContact(@RequestBody ContactRequest req) {
		String user = req.getName() != null && !req.getName().isEmpty() ? req.getName() : "Guest";

		// TODO: persist or forward message as needed. For now, just acknowledge.
		Map<String, String> resp = new HashMap<>();
		resp.put("message", String.format("Thank you, %s. We will reply as soon as possible.", user));

		return ResponseEntity.ok(resp);
	}

}