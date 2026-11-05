package com.example.webprog.exception;

public class StudentNotFoundException extends RuntimeException {

    public StudentNotFoundException(Long id) {
        super("Студент с id " + id + " не найден");
    }
}