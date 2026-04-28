package com.buffetease.buffet_ease.service;

import com.buffetease.buffet_ease.dto.ContactRequestDTO;
import com.buffetease.buffet_ease.model.ContactMessage;
import com.buffetease.buffet_ease.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactService {
    
    private final ContactMessageRepository contactMessageRepository;
    
    public void saveContactMessage(ContactRequestDTO request) {
        ContactMessage message = new ContactMessage();
        message.setName(request.getName());
        message.setEmail(request.getEmail());
        message.setMessage(request.getMessage());
        message.setIsRead(false);
        
        contactMessageRepository.save(message);
    }
}
