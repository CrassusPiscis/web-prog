package com.example.webprog.dto;

import java.time.LocalDate;

// Необязательные дополнительные query-параметры; Spring связывает их по именам.
public class StudentFilters {
    private Long id;
    private String fullName;
    private LocalDate moveInDate;
    private String notes;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public LocalDate getMoveInDate() { return moveInDate; }
    @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE)
    public void setMoveInDate(LocalDate moveInDate) { this.moveInDate = moveInDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
