package com.aidocrag.auditoria.api.adapter.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aidocrag.auditoria.api.adapter.dto.request.chatBot.QuestionRequestDTO;
import com.aidocrag.client.ChatBotClient;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/chat-bot")
@RequiredArgsConstructor
@Slf4j
public class ChatBotController {

    private final ChatBotClient chatBotClient;
   

    @PostMapping("/ask/agent")
    public ResponseEntity<Map<String, Object>> ask(@RequestBody @Valid QuestionRequestDTO request) {

        Map<String, Object> answer = chatBotClient.askAgentAI(
                request.message(), request.topK(), request.model(), request.confidenceThreshold());

        return ResponseEntity.status(HttpStatus.OK).body(answer);
    }

    
}
