package com.example.webprog.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record StudentPatchRequest(

        @Size(min = 1)
        String fullName,

        @Pattern(regexp = "^[A-Za-z][0-9]{4}$")
        String group,

        @Positive
        Long isuId,

        @Size(min = 1)
        String dormitory,

        @Positive
        Integer room,

        LocalDate moveInDate,

        Boolean foreigner,

        String notes
) {

    public boolean isEmpty() {
        return fullName == null
                && group == null
                && isuId == null
                && dormitory == null
                && room == null
                && moveInDate == null
                && foreigner == null
                && notes == null;
    }
}