package com.example.webprog.service;

import com.example.webprog.dto.StudentCreateRequest;
import com.example.webprog.dto.StudentResponse;
import com.example.webprog.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import com.example.webprog.exception.StudentNotFoundException;
import com.example.webprog.dto.StudentPatchRequest;
import com.example.webprog.exception.BadRequestException;
import com.example.webprog.exception.DuplicateIsuIdException;
import com.example.webprog.dto.PageResponse;
import java.util.Set;

@Service
public class StudentService {

    private final StudentRepository repository;

    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }

    public PageResponse<StudentResponse> getAllStudents(
            String group,
            String dormitory,
            Long isuId,
            Integer room,
            Boolean foreigner,
            String search,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        if (page < 0) {
            throw new BadRequestException(
                    "Номер страницы не может быть отрицательным"
            );
        }

        if (size < 1 || size > 100) {
            throw new BadRequestException(
                    "Размер страницы должен быть от 1 до 100"
            );
        }


        Set<String> allowedSortFields = Set.of(
                "id",
                "fullName",
                "group",
                "isuId",
                "dormitory",
                "room",
                "moveInDate"
        );

        if (!allowedSortFields.contains(sortBy)) {
            throw new BadRequestException(
                    "Недопустимое поле сортировки"
            );
        }


        if (
                !direction.equalsIgnoreCase("asc")
                        && !direction.equalsIgnoreCase("desc")
        ) {
            throw new BadRequestException(
                    "Направление сортировки должно быть asc или desc"
            );
        }


        return repository.findAll(
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

    public StudentResponse createStudent(
            StudentCreateRequest request
    ) {
        if (repository.existsByIsuId(request.isuId())) {
            throw new DuplicateIsuIdException(
                    request.isuId()
            );
        }

        return repository.create(request);
    }
    public StudentResponse getStudentById(Long id) {
        StudentResponse student = repository.findById(id);

        if (student == null) {
            throw new StudentNotFoundException(id);
        }

        return student;
    }

    public StudentResponse replaceStudent(
            Long id,
            StudentCreateRequest request
    ) {
        StudentResponse existing =
                repository.findById(id);

        if (existing == null) {
            throw new StudentNotFoundException(id);
        }

        if (
                repository.existsByIsuIdExceptId(
                        request.isuId(),
                        id
                )
        ) {
            throw new DuplicateIsuIdException(
                    request.isuId()
            );
        }

        return repository.update(id, request);
    }

    public StudentResponse patchStudent(
            Long id,
            StudentPatchRequest request
    ) {
        if (request.isEmpty()) {
            throw new BadRequestException(
                    "Не указаны данные для обновления"
            );
        }

        StudentResponse existing =
                repository.findById(id);

        if (existing == null) {
            throw new StudentNotFoundException(id);
        }

        Long newIsuId =
                request.isuId() != null
                        ? request.isuId()
                        : existing.isuId();

        if (
                repository.existsByIsuIdExceptId(
                        newIsuId,
                        id
                )
        ) {
            throw new DuplicateIsuIdException(
                    newIsuId
            );
        }

        StudentCreateRequest updated =
                new StudentCreateRequest(
                        request.fullName() != null
                                ? request.fullName()
                                : existing.fullName(),

                        request.group() != null
                                ? request.group()
                                : existing.group(),

                        newIsuId,

                        request.dormitory() != null
                                ? request.dormitory()
                                : existing.dormitory(),

                        request.room() != null
                                ? request.room()
                                : existing.room(),

                        request.moveInDate() != null
                                ? request.moveInDate()
                                : existing.moveInDate(),

                        request.foreigner() != null
                                ? request.foreigner()
                                : existing.foreigner(),

                        request.notes() != null
                                ? request.notes()
                                : existing.notes()
                );

        return repository.update(id, updated);
    }

    public void deleteStudent(Long id) {
        boolean deleted = repository.deleteById(id);

        if (!deleted) {
            throw new StudentNotFoundException(id);
        }
    }
}