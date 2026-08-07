package com.aidocrag.auditoria.api.adapter.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.aidocrag.client.ChatBotClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for uploading documents to be indexed by the RAG server.
 */
@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {

    private final ChatBotClient chatBotClient;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        log.info("Uploading document: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

        Map<String, Object> result = chatBotClient.uploadDocument(file.getBytes(), file.getOriginalFilename());

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }
}
