package com.example.Backend_Cake_Tea.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"
    );

    private final Path rootLocation;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) throws IOException {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.rootLocation);
    }

    public String store(MultipartFile file, String subFolder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File rỗng");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            // Một số browser gửi application/octet-stream — vẫn cho qua nếu có đuôi ảnh
            String original = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
            if (!original.matches(".*\\.(jpg|jpeg|png|gif|webp)$")) {
                throw new IllegalArgumentException("Chỉ chấp nhận ảnh JPG, PNG, GIF, WEBP");
            }
        }

        Path targetDir = rootLocation.resolve(subFolder).normalize();
        Files.createDirectories(targetDir);

        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
        String safeName = original.replaceAll("[^a-zA-Z0-9._-]", "_");
        String filename = UUID.randomUUID() + "_" + safeName;
        Path destination = targetDir.resolve(filename).normalize();

        if (!destination.startsWith(targetDir)) {
            throw new IllegalArgumentException("Tên file không hợp lệ");
        }

        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + subFolder + "/" + filename;
    }

    public Path getRootLocation() {
        return rootLocation;
    }
}
