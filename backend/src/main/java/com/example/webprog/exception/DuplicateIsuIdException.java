package com.example.webprog.exception;

public class DuplicateIsuIdException extends RuntimeException {

    public DuplicateIsuIdException(Long isuId) {
        super(
                "Студент с ИСУ ID "
                        + isuId
                        + " уже существует"
        );
    }
}