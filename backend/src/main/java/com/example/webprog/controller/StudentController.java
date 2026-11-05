package com.example.webprog.controller;

import com.example.webprog.dto.StudentCreateRequest;
import com.example.webprog.dto.StudentResponse;
import com.example.webprog.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.example.webprog.dto.StudentPatchRequest;
import com.example.webprog.dto.PageResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/requests")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<StudentResponse> getStudents(

            @RequestParam(required = false)
            String group,

            @RequestParam(required = false)
            String dormitory,

            @RequestParam(required = false)
            Long isuId,

            @RequestParam(required = false)
            Integer room,

            @RequestParam(required = false)
            Boolean foreigner,

            @RequestParam(required = false)
            String search,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "id")
            String sortBy,

            @RequestParam(defaultValue = "asc")
            String direction
    ) {
        return service.getAllStudents(
                group,
                dormitory,
                isuId,
                room,
                foreigner,
                search,
                page,
                size,
                sortBy,
                direction
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentResponse createStudent(
            @Valid @RequestBody StudentCreateRequest request
    ) {
        return service.createStudent(request);
    }
    @GetMapping("/{id}")
    public StudentResponse getStudentById(
            @PathVariable Long id
    ) {
        return service.getStudentById(id);
    }

    @PutMapping("/{id}")
    public StudentResponse replaceStudent(
            @PathVariable Long id,
            @Valid
            @RequestBody StudentCreateRequest request
    ) {
        return service.replaceStudent(
                id,
                request
        );
    }

    @PatchMapping("/{id}")
    public StudentResponse patchStudent(
            @PathVariable Long id,
            @Valid
            @RequestBody StudentPatchRequest request
    ) {
        return service.patchStudent(
                id,
                request
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStudent(
            @PathVariable Long id
    ) {
        service.deleteStudent(id);
    }
}