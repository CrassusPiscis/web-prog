package com.example.webprog.dto;

import java.time.LocalDate;

public record StudentResponse(
        Long id,
        String fullName,
        String group,
        Long isuId,
        String dormitory,
        Integer room,
        LocalDate moveInDate,
        Boolean foreigner,
        String notes
) {
}