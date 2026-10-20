package com.example.webprog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record StudentCreateRequest(

        @NotBlank(
                message = "ФИО обязательно"
        )
        String fullName,

        @NotBlank(
                message = "Группа обязательна"
        )
        @Pattern(
                regexp = "^[A-Za-z][0-9]{4}$",
                message = "Группа должна иметь формат P3320"
        )
        String group,

        @NotNull(
                message = "ИСУ ID обязателен"
        )
        @Positive(
                message = "ИСУ ID должен быть положительным"
        )
        Long isuId,

        @NotBlank(
                message = "Общежитие обязательно"
        )
        String dormitory,

        @NotNull(
                message = "Номер комнаты обязателен"
        )
        @Positive(
                message = "Номер комнаты должен быть положительным"
        )
        Integer room,

        @NotNull(
                message = "Дата заселения обязательна"
        )
        LocalDate moveInDate,

        @NotNull(
                message = "Необходимо указать foreigner"
        )
        Boolean foreigner,

        String notes

) {
}